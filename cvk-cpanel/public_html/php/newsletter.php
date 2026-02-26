<?php
/**
 * Newsletter Subscription Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (!$data || empty($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'E-posta adresi gereklidir']);
    exit;
}

// Validate email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Geçerli bir e-posta adresi girin']);
    exit;
}

// Connect to database
$conn = getDBConnection();

// Check if email already exists
$checkStmt = $conn->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
$checkStmt->bind_param("s", sanitize($data['email']));
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    $checkStmt->close();
    $conn->close();
    echo json_encode(['success' => false, 'message' => 'Bu e-posta adresi zaten kayıtlı']);
    exit;
}

$checkStmt->close();

// Insert new subscriber
$stmt = $conn->prepare("INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?)");
$stmt->bind_param("ss",
    sanitize($data['email']),
    sanitize($data['name'] ?? '')
);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Bültene başarıyla abone oldunuz!'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Bir hata oluştu. Lütfen tekrar deneyin.']);
}

$stmt->close();
$conn->close();
?>
