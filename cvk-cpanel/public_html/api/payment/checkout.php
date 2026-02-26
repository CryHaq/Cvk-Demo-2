<?php
/**
 * CVK Dijital - Ödeme Checkout API
 * iyzico Checkout Form oluşturma
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../../config/database.php';
require_once '../../middleware/auth.php';
require_once '../../utils/response.php';
require_once 'iyzico.php';

// Sadece POST istekleri
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Sadece POST isteği kabul edilir', null, 405);
}

// Auth kontrolü
$auth = new AuthMiddleware();
$currentUser = $auth->verifyToken();

if (!$currentUser) {
    jsonResponse(false, 'Yetkisiz erişim', null, 401);
}

// Request body
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['order_id'])) {
    jsonResponse(false, 'Sipariş ID gereklidir', null, 400);
}

try {
    $orderId = (int)$data['order_id'];
    
    // Siparişi getir
    $stmt = $pdo->prepare("
        SELECT o.*, u.first_name, u.last_name, u.email, u.phone, u.created_at as user_created_at
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ? AND o.user_id = ?
    ");
    $stmt->execute([$orderId, $currentUser['id']]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        jsonResponse(false, 'Sipariş bulunamadı', null, 404);
    }
    
    // Zaten ödenmiş mi?
    if ($order['payment_status'] === 'paid') {
        jsonResponse(false, 'Bu sipariş zaten ödenmiş', null, 400);
    }
    
    // Sipariş ürünlerini getir
    $itemsStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemsStmt->execute([$orderId]);
    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $order['items'] = $items;
    $order['shipping_address'] = json_decode($order['shipping_address'], true);
    $order['billing_address'] = json_decode($order['billing_address'], true);
    
    // iyzico ile checkout form oluştur
    $iyzico = new IyzicoPayment($pdo);
    
    $checkoutData = [
        'order_number' => $order['order_number'],
        'subtotal' => $order['subtotal'],
        'total_amount' => $order['total_amount'],
        'shipping_address' => $order['shipping_address'],
        'billing_address' => $order['billing_address'],
        'items' => array_map(function($item) {
            return [
                'id' => $item['id'],
                'product_type' => $item['product_type'],
                'size' => $item['size'],
                'material' => $item['material'],
                'total_price' => $item['total_price']
            ];
        }, $items)
    ];
    
    $userData = [
        'id' => $currentUser['id'],
        'first_name' => $order['first_name'],
        'last_name' => $order['last_name'],
        'email' => $order['email'],
        'phone' => $order['phone'],
        'created_at' => $order['user_created_at']
    ];
    
    $result = $iyzico->createCheckoutForm($checkoutData, $userData);
    
    if ($result['status'] === 'success') {
        // Token'ı siparişe kaydet
        $updateStmt = $pdo->prepare("
            UPDATE orders 
            SET payment_token = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $updateStmt->execute([$result['token'], $orderId]);
        
        jsonResponse(true, 'Ödeme formu oluşturuldu', [
            'order_id' => $orderId,
            'order_number' => $order['order_number'],
            'checkout_form_content' => $result['checkout_form_content'],
            'token' => $result['token']
        ]);
    } else {
        jsonResponse(false, 'Ödeme formu oluşturulamadı', [
            'error' => $result['error_message'] ?? 'Bilinmeyen hata'
        ], 500);
    }
    
} catch (Exception $e) {
    jsonResponse(false, 'Hata: ' . $e->getMessage(), null, 500);
}
