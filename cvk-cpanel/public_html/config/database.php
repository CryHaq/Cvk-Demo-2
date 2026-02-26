<?php
/**
 * CVK Dijital - PDO Database Config
 * Shared by /api endpoints.
 */

function envConfig(string $key, string $default = ''): string {
    $value = $_SERVER[$key] ?? $_ENV[$key] ?? getenv($key);
    if ($value === false || $value === null || $value === '') {
        return $default;
    }
    return (string)$value;
}

$host = envConfig('DB_HOST', 'localhost');
$dbname = envConfig('DB_NAME', 'cvkdijital_db');
$username = envConfig('DB_USERNAME', 'cvkdijital_user');
$password = envConfig('DB_PASSWORD', 'your_strong_password_here');

$pdo = null;

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());

    if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Veritabanı bağlantı hatası'
        ]);
        exit;
    }
}
