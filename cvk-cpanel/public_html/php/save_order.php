<?php
/**
 * Save Order Endpoint
 * 
 * This file handles order submissions from the checkout page
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
$required = ['shippingInfo', 'cart', 'paymentMethod', 'shippingMethod'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

$shipping = $data['shippingInfo'];
$billing = $data['billingInfo'] ?? $shipping;
$cart = $data['cart'];
$paymentMethod = sanitize($data['paymentMethod']);
$shippingMethod = sanitize($data['shippingMethod']);
$sameAddress = $data['sameAddress'] ?? true;

// Validate shipping info
if (empty($shipping['firstName']) || empty($shipping['lastName']) || 
    empty($shipping['address']) || empty($shipping['city']) || 
    empty($shipping['postalCode']) || empty($shipping['phone']) || 
    empty($shipping['email'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required shipping information']);
    exit;
}

// Calculate totals
$subtotal = 0;
foreach ($cart as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

$shippingCost = ($shippingMethod === 'express') ? SHIPPING_EXPRESS : 
                (($subtotal > FREE_SHIPPING_THRESHOLD) ? 0 : SHIPPING_STANDARD);
$vatAmount = calculateVAT($subtotal);
$total = $subtotal + $shippingCost + $vatAmount;

// Generate order number
$orderNumber = generateOrderNumber();

// Connect to database
$conn = getDBConnection();

// Prepare and execute order insert
$stmt = $conn->prepare("INSERT INTO orders (
    order_number, customer_email, customer_phone,
    shipping_first_name, shipping_last_name, shipping_company, shipping_vat, shipping_sdi,
    shipping_address, shipping_city, shipping_postal_code, shipping_province, shipping_country,
    billing_first_name, billing_last_name, billing_company, billing_vat,
    billing_address, billing_city, billing_postal_code, billing_province, billing_country,
    subtotal, shipping_cost, vat_amount, total, payment_method, shipping_method, status, payment_status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')");

$stmt->bind_param("ssssssssssssssssssssssddddss",
    $orderNumber,
    sanitize($shipping['email']),
    sanitize($shipping['phone']),
    sanitize($shipping['firstName']),
    sanitize($shipping['lastName']),
    sanitize($shipping['company'] ?? ''),
    sanitize($shipping['vatNumber'] ?? ''),
    sanitize($shipping['sdi'] ?? ''),
    sanitize($shipping['address']),
    sanitize($shipping['city']),
    sanitize($shipping['postalCode']),
    sanitize($shipping['province'] ?? ''),
    sanitize($shipping['country']),
    sanitize($billing['firstName'] ?? $shipping['firstName']),
    sanitize($billing['lastName'] ?? $shipping['lastName']),
    sanitize($billing['company'] ?? ''),
    sanitize($billing['vatNumber'] ?? ''),
    sanitize($billing['address'] ?? $shipping['address']),
    sanitize($billing['city'] ?? $shipping['city']),
    sanitize($billing['postalCode'] ?? $shipping['postalCode']),
    sanitize($billing['province'] ?? $shipping['province'] ?? ''),
    sanitize($billing['country'] ?? $shipping['country']),
    $subtotal,
    $shippingCost,
    $vatAmount,
    $total,
    $paymentMethod,
    $shippingMethod
);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    $stmt->close();
    $conn->close();
    exit;
}

$orderId = $stmt->insert_id;
$stmt->close();

// Insert order items
$itemStmt = $conn->prepare("INSERT INTO order_items (order_id, product_name, product_options, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)");

foreach ($cart as $item) {
    $itemTotal = $item['price'] * $item['quantity'];
    $itemStmt->bind_param("issidd",
        $orderId,
        sanitize($item['name']),
        sanitize($item['options'] ?? ''),
        $item['quantity'],
        $item['price'],
        $itemTotal
    );
    $itemStmt->execute();
}

$itemStmt->close();
$conn->close();

// Send confirmation email (optional - requires mail server configuration)
$to = $shipping['email'];
$subject = "Sipariş Onayı - " . $orderNumber;
$message = "Merhaba {$shipping['firstName']},\n\n";
$message .= "Siparişiniz başarıyla alındı.\n\n";
$message .= "Sipariş Numarası: $orderNumber\n";
$message .= "Toplam: € " . number_format($total, 2) . "\n\n";
$message .= "Sipariş detaylarınızı görüntülemek için hesabınıza giriş yapabilirsiniz.\n\n";
$message .= "Teşekkür ederiz,\n" . SITE_NAME;

// Uncomment when mail server is configured
// mail($to, $subject, $message, "From: " . ADMIN_EMAIL);

// Return success response
echo json_encode([
    'success' => true,
    'orderNumber' => $orderNumber,
    'message' => 'Order saved successfully',
    'order' => [
        'id' => $orderId,
        'orderNumber' => $orderNumber,
        'subtotal' => $subtotal,
        'shipping' => $shippingCost,
        'vat' => $vatAmount,
        'total' => $total,
        'paymentMethod' => $paymentMethod,
        'shippingMethod' => $shippingMethod
    ]
]);
?>
