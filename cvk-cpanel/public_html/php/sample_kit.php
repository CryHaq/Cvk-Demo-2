<?php
/**
 * Sample Kit Order Endpoint
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
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Required fields
if (empty($data['company']) || empty($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'Lütfen şirket adı ve e-posta adresi girin']);
    exit;
}

// Validate email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Geçerli bir e-posta adresi girin']);
    exit;
}

// Connect to database
$conn = getDBConnection();

// Prepare and execute insert
$stmt = $conn->prepare("INSERT INTO sample_kit_orders (company, market, email, phone) VALUES (?, ?, ?, ?)");

$stmt->bind_param("ssss",
    sanitize($data['company']),
    sanitize($data['market'] ?? ''),
    sanitize($data['email']),
    sanitize($data['phone'] ?? '')
);

if ($stmt->execute()) {
    $orderId = $stmt->insert_id;
    
    // Send confirmation email (optional)
    $subject = "Numune Seti Siparişi - " . SITE_NAME;
    $message = "Merhaba,\n\n";
    $message .= "Numune seti siparişiniz alındı.\n\n";
    $message .= "Şirket: " . $data['company'] . "\n";
    $message .= "E-posta: " . $data['email'] . "\n\n";
    $message .= "Ödeme bilgileri için size en kısa sürede dönüş yapacağız.\n\n";
    $message .= "Teşekkür ederiz,\n" . SITE_NAME;
    
    // Uncomment when mail server is configured
    // mail($data['email'], $subject, $message, "From: " . ADMIN_EMAIL);
    
    echo json_encode([
        'success' => true,
        'message' => 'Numune seti siparişiniz alındı. Size en kısa sürede dönüş yapacağız.',
        'orderId' => $orderId
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Bir hata oluştu. Lütfen tekrar deneyin.']);
}

$stmt->close();
$conn->close();
?>
