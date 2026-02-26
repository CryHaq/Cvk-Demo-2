<?php
/**
 * Contact Form Endpoint
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
if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
    echo json_encode(['success' => false, 'message' => 'Lütfen tüm zorunlu alanları doldurun']);
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
$stmt = $conn->prepare("INSERT INTO contact_messages (name, email, phone, company, message_type, message) VALUES (?, ?, ?, ?, ?, ?)");

$stmt->bind_param("ssssss",
    sanitize($data['name']),
    sanitize($data['email']),
    sanitize($data['phone'] ?? ''),
    sanitize($data['company'] ?? ''),
    sanitize($data['type'] ?? 'other'),
    sanitize($data['message'])
);

if ($stmt->execute()) {
    $messageId = $stmt->insert_id;
    
    // Send notification email to admin (optional)
    $adminSubject = "Yeni İletişim Formu - " . SITE_NAME;
    $adminMessage = "Yeni bir iletişim formu gönderildi.\n\n";
    $adminMessage .= "Ad: " . $data['name'] . "\n";
    $adminMessage .= "E-posta: " . $data['email'] . "\n";
    $adminMessage .= "Telefon: " . ($data['phone'] ?? 'Belirtilmemiş') . "\n";
    $adminMessage .= "Şirket: " . ($data['company'] ?? 'Belirtilmemiş') . "\n";
    $adminMessage .= "Tür: " . ($data['type'] ?? 'Diğer') . "\n\n";
    $adminMessage .= "Mesaj:\n" . $data['message'];
    
    // Uncomment when mail server is configured
    // mail(ADMIN_EMAIL, $adminSubject, $adminMessage, "From: " . $data['email']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
        'messageId' => $messageId
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Bir hata oluştu. Lütfen tekrar deneyin.']);
}

$stmt->close();
$conn->close();
?>
