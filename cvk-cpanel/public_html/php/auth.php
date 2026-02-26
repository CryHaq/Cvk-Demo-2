<?php
/**
 * Authentication API
 *
 * Handles user registration, login, logout, password reset, profile updates,
 * and admin creation.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

$conn = getDBConnection();

$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody, true);
if (!is_array($body)) {
    $body = [];
}

$action = $_GET['action'] ?? ($body['action'] ?? '');

if ($action === '') {
    echo json_encode(['success' => false, 'message' => 'Action is required']);
    $conn->close();
    exit;
}

switch ($action) {
    case 'register':
        handleRegister($conn, $body);
        break;

    case 'login':
        handleLogin($conn, $body);
        break;

    case 'logout':
        handleLogout();
        break;

    case 'forgot_password':
        handleForgotPassword($conn, $body);
        break;

    case 'reset_password':
        handleResetPassword($conn, $body);
        break;

    case 'update_profile':
        handleUpdateProfile($conn, $body);
        break;

    case 'change_password':
        handleChangePassword($conn, $body);
        break;

    case 'me':
        handleGetMe($conn);
        break;

    case 'create_admin':
        handleCreateAdmin($conn, $body);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
}

$conn->close();

function handleRegister($conn, $data) {
    $required = ['email', 'password', 'firstName', 'lastName'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }

    $email = sanitize($data['email']);
    $password = $data['password'];
    $firstName = sanitize($data['firstName']);
    $lastName = sanitize($data['lastName']);
    $phone = sanitize($data['phone'] ?? '');
    $company = sanitize($data['company'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
        return;
    }

    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
        return;
    }

    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email address already registered']);
        $stmt->close();
        return;
    }
    $stmt->close();

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (email, password_hash, first_name, last_name, phone, company, role, created_at) VALUES (?, ?, ?, ?, ?, ?, 'customer', NOW())");
    $stmt->bind_param('ssssss', $email, $passwordHash, $firstName, $lastName, $phone, $company);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'userId' => $stmt->insert_id,
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $stmt->error]);
    }

    $stmt->close();
}

function handleLogin($conn, $data) {
    if (empty($data['email']) || empty($data['password'])) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        return;
    }

    $email = sanitize($data['email']);
    $password = $data['password'];

    $stmt = $conn->prepare('SELECT id, email, password_hash, first_name, last_name, phone, company, role, created_at FROM users WHERE email = ? AND is_active = 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        $stmt->close();
        return;
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        return;
    }

    $token = generateJWT((int) $user['id'], $user['email']);

    $stmt = $conn->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'phone' => $user['phone'],
            'company' => $user['company'],
            'role' => $user['role'],
            'createdAt' => $user['created_at'],
        ],
    ]);
}

function handleLogout() {
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

function handleForgotPassword($conn, $data) {
    if (empty($data['email'])) {
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }

    $email = sanitize($data['email']);

    $stmt = $conn->prepare('SELECT id, first_name FROM users WHERE email = ? AND is_active = 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => true, 'message' => 'If this email exists, a reset link has been sent']);
        $stmt->close();
        return;
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $stmt = $conn->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?');
    $stmt->bind_param('issss', $user['id'], $token, $expires, $token, $expires);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        'success' => true,
        'message' => 'Password reset link has been sent to your email',
        'token' => $token,
    ]);
}

function handleResetPassword($conn, $data) {
    if (empty($data['token']) || empty($data['newPassword'])) {
        echo json_encode(['success' => false, 'message' => 'Token and new password are required']);
        return;
    }

    $token = $data['token'];
    $newPassword = $data['newPassword'];

    if (strlen($newPassword) < 8) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
        return;
    }

    $stmt = $conn->prepare('SELECT user_id FROM password_resets WHERE token = ? AND expires_at > NOW() AND used = 0');
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
        $stmt->close();
        return;
    }

    $reset = $result->fetch_assoc();
    $userId = (int) $reset['user_id'];
    $stmt->close();

    $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);

    $stmt = $conn->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->bind_param('si', $passwordHash, $userId);

    if ($stmt->execute()) {
        $stmt->close();

        $stmt = $conn->prepare('UPDATE password_resets SET used = 1 WHERE token = ?');
        $stmt->bind_param('s', $token);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Password has been reset successfully']);
        return;
    }

    echo json_encode(['success' => false, 'message' => 'Failed to reset password']);
    $stmt->close();
}

function handleUpdateProfile($conn, $data) {
    $userId = verifyJWT();
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }

    $allowedFields = ['firstName', 'lastName', 'phone', 'company'];
    $updates = [];
    $types = '';
    $values = [];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = snakeCase($field) . ' = ?';
            $types .= 's';
            $values[] = sanitize((string) $data[$field]);
        }
    }

    if (!$updates) {
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }

    $types .= 'i';
    $values[] = $userId;

    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);

    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
        $stmt->close();
        return;
    }

    $stmt->close();

    $stmt = $conn->prepare('SELECT id, email, first_name, last_name, phone, company, role, created_at FROM users WHERE id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'phone' => $user['phone'],
            'company' => $user['company'],
            'role' => $user['role'],
            'createdAt' => $user['created_at'],
        ],
    ]);
}

function handleChangePassword($conn, $data) {
    $userId = verifyJWT();
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }

    if (empty($data['oldPassword']) || empty($data['newPassword'])) {
        echo json_encode(['success' => false, 'message' => 'Old and new passwords are required']);
        return;
    }

    $stmt = $conn->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if (!$user || !password_verify($data['oldPassword'], $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        return;
    }

    if (strlen($data['newPassword']) < 8) {
        echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters']);
        return;
    }

    $newHash = password_hash($data['newPassword'], PASSWORD_BCRYPT);
    $stmt = $conn->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->bind_param('si', $newHash, $userId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to change password']);
    }

    $stmt->close();
}

function handleGetMe($conn) {
    $userId = verifyJWT();
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }

    $stmt = $conn->prepare('SELECT id, email, first_name, last_name, phone, company, role, created_at FROM users WHERE id = ? AND is_active = 1');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        $stmt->close();
        return;
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'phone' => $user['phone'],
            'company' => $user['company'],
            'role' => $user['role'],
            'createdAt' => $user['created_at'],
        ],
    ]);
}

function handleCreateAdmin($conn, $data) {
    $adminSecret = $data['admin_secret'] ?? '';
    if ($adminSecret !== ADMIN_CREATION_SECRET) {
        echo json_encode(['success' => false, 'message' => 'Invalid admin secret']);
        return;
    }

    $required = ['email', 'password', 'firstName', 'lastName'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }

    $email = sanitize($data['email']);
    $password = $data['password'];
    $firstName = sanitize($data['firstName']);
    $lastName = sanitize($data['lastName']);
    $phone = sanitize($data['phone'] ?? '');
    $company = sanitize($data['company'] ?? 'CVK Ambalaj');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
        return;
    }

    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
        return;
    }

    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email address already registered']);
        $stmt->close();
        return;
    }
    $stmt->close();

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (email, password_hash, first_name, last_name, phone, company, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 'admin', 1)");
    $stmt->bind_param('ssssss', $email, $passwordHash, $firstName, $lastName, $phone, $company);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Admin user created successfully',
            'user' => [
                'id' => $stmt->insert_id,
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'role' => 'admin',
            ],
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create admin user: ' . $stmt->error]);
    }

    $stmt->close();
}

function generateJWT($userId, $email) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $issuedAt = time();
    $payload = json_encode([
        'iss' => SITE_URL,
        'iat' => $issuedAt,
        'exp' => $issuedAt + (60 * 60 * 24),
        'sub' => $userId,
        'email' => $email,
    ]);

    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET_KEY, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return "$base64Header.$base64Payload.$base64Signature";
}

function verifyJWT() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');

    if (!preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        return false;
    }

    $token = $matches[1];
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    $base64Payload = str_replace(['-', '_'], ['+', '/'], $parts[1]);
    $base64Payload .= str_repeat('=', (4 - strlen($base64Payload) % 4) % 4);
    $payload = json_decode(base64_decode($base64Payload), true);
    if (!is_array($payload) || empty($payload['exp']) || $payload['exp'] < time()) {
        return false;
    }

    $expectedSignature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET_KEY, true);
    $decodedSignature = str_replace(['-', '_'], ['+', '/'], $parts[2]);
    $decodedSignature .= str_repeat('=', (4 - strlen($decodedSignature) % 4) % 4);

    if (!hash_equals($expectedSignature, base64_decode($decodedSignature))) {
        return false;
    }

    return (int) ($payload['sub'] ?? 0);
}

function snakeCase($string) {
    return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $string));
}
?>
