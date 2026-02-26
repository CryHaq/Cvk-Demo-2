<?php
/*
 * CVK Dijital - Runtime Configuration
 *
 * cPanel production setup:
 * - Prefer environment vars from cPanel "MultiPHP INI Editor" or Apache SetEnv.
 * - Fallback values below are for local/dev only.
 */

function envValue(string $key, $default = '') {
    $serverValue = $_SERVER[$key] ?? null;
    if ($serverValue !== null && $serverValue !== '') {
        return $serverValue;
    }

    $envValue = $_ENV[$key] ?? null;
    if ($envValue !== null && $envValue !== '') {
        return $envValue;
    }

    $getenvValue = getenv($key);
    if ($getenvValue !== false && $getenvValue !== '') {
        return $getenvValue;
    }

    return $default;
}

function isPlaceholder(string $value): bool {
    $normalized = strtolower(trim($value));
    return $normalized === ''
        || str_contains($normalized, 'your_')
        || str_contains($normalized, 'change-in-production')
        || str_contains($normalized, 'yourdomain.com');
}

$detectedScheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$detectedHost = $_SERVER['HTTP_HOST'] ?? 'localhost';

// Database
if (!defined('DB_HOST')) define('DB_HOST', envValue('DB_HOST', 'localhost'));
if (!defined('DB_USERNAME')) define('DB_USERNAME', envValue('DB_USERNAME', 'your_database_username'));
if (!defined('DB_PASSWORD')) define('DB_PASSWORD', envValue('DB_PASSWORD', 'your_database_password'));
if (!defined('DB_NAME')) define('DB_NAME', envValue('DB_NAME', 'your_database_name'));

// Site
if (!defined('SITE_URL')) define('SITE_URL', envValue('SITE_URL', $detectedScheme . '://' . $detectedHost));
if (!defined('SITE_NAME')) define('SITE_NAME', envValue('SITE_NAME', 'CVK Dijital'));
if (!defined('ADMIN_EMAIL')) define('ADMIN_EMAIL', envValue('ADMIN_EMAIL', 'admin@' . $detectedHost));

// Business
if (!defined('VAT_RATE')) define('VAT_RATE', (float)envValue('VAT_RATE', '0.22'));
if (!defined('SHIPPING_STANDARD')) define('SHIPPING_STANDARD', (float)envValue('SHIPPING_STANDARD', '25.00'));
if (!defined('SHIPPING_EXPRESS')) define('SHIPPING_EXPRESS', (float)envValue('SHIPPING_EXPRESS', '35.00'));
if (!defined('FREE_SHIPPING_THRESHOLD')) define('FREE_SHIPPING_THRESHOLD', (float)envValue('FREE_SHIPPING_THRESHOLD', '500.00'));

// Security
if (!defined('JWT_SECRET_KEY')) define('JWT_SECRET_KEY', envValue('JWT_SECRET', envValue('JWT_SECRET_KEY', 'cvk-jwt-secret-key-change-in-production-2024')));
if (!defined('ADMIN_CREATION_SECRET')) define('ADMIN_CREATION_SECRET', envValue('ADMIN_CREATION_SECRET', 'cvk-admin-2024-secret'));

@date_default_timezone_set((string)envValue('APP_TIMEZONE', 'Europe/Istanbul'));

function getDBConnection() {
    if (isPlaceholder(DB_USERNAME) || isPlaceholder(DB_NAME)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Sunucu yapılandırması tamamlanmadı. DB ayarlarını güncelleyin.'
        ]);
        exit;
    }

    $conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

    if ($conn->connect_error) {
        error_log('DB connection failed: ' . $conn->connect_error);
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Veritabanı bağlantı hatası'
        ]);
        exit;
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}

function sanitize($data) {
    $data = trim((string)$data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function generateOrderNumber() {
    return 'CVK-' . date('Y') . strtoupper(substr(uniqid('', true), -5));
}

function calculateVAT($amount) {
    return (float)$amount * VAT_RATE;
}
?>
