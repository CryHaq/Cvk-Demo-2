<?php
/**
 * CVK Dijital - iyzico Ödeme Callback
 * Ödeme sonucu işleme
 */

require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once 'iyzico.php';
require_once '../../utils/email.php';

// iyzico token'ı POST ile gelir
$token = $_POST['token'] ?? $_GET['token'] ?? null;

if (!$token) {
    die('Geçersiz istek');
}

try {
    $iyzico = new IyzicoPayment($pdo);
    $result = $iyzico->verifyPayment($token);
    
    // Siparişi bul
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE payment_token = ?");
    $stmt->execute([$token]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        // Manuel kontrol - conversation_id ile dene
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE order_number = ?");
        $stmt->execute([$result['conversation_id']]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if ($order) {
        $pdo->beginTransaction();
        
        // Ödeme işlemini kaydet
        $paymentStmt = $pdo->prepare("
            INSERT INTO payment_transactions 
            (order_id, payment_id, conversation_id, transaction_type, amount, currency, status, 
             card_first_six, card_last_four, installment_count, gateway_response)
            VALUES (?, ?, ?, 'auth', ?, 'TRY', ?, ?, ?, ?, ?)
        ");
        
        $paymentStmt->execute([
            $order['id'],
            $result['payment_id'],
            $result['conversation_id'],
            $result['paid_price'],
            $result['status'],
            $result['bin_number'] ? substr($result['bin_number'], 0, 6) : null,
            $result['last_four_digits'],
            $result['installment'] ?? 1,
            json_encode($result)
        ]);
        
        if ($result['status'] === 'success' && $result['payment_status'] === 'SUCCESS') {
            // Ödeme başarılı
            $updateStmt = $pdo->prepare("
                UPDATE orders 
                SET payment_status = 'paid', 
                    status = 'confirmed',
                    updated_at = NOW()
                WHERE id = ?
            ");
            $updateStmt->execute([$order['id']]);
            
            // Durum geçmişi
            $historyStmt = $pdo->prepare("
                INSERT INTO order_status_history 
                (order_id, old_status, new_status, changed_by, changed_by_type, note)
                VALUES (?, 'pending', 'confirmed', 0, 'system', 'Ödeme başarılı - iyzico')
            ");
            $historyStmt->execute([$order['id']]);
            
            // Kullanıcı bilgilerini al
            $userStmt = $pdo->prepare("SELECT email, first_name FROM users WHERE id = ?");
            $userStmt->execute([$order['user_id']]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            // E-posta bildirimi
            queueEmailNotification($order['id'], $order['user_id'], 'payment_received', $user['email']);
            
            $pdo->commit();
            
            // Başarılı sayfaya yönlendir
            header('Location: /payment-success?order=' . $order['order_number']);
            exit;
            
        } else {
            // Ödeme başarısız
            $updateStmt = $pdo->prepare("
                UPDATE orders 
                SET payment_status = 'failed', 
                    updated_at = NOW()
                WHERE id = ?
            ");
            $updateStmt->execute([$order['id']]);
            
            $pdo->commit();
            
            // Başarısız sayfaya yönlendir
            $errorMsg = urlencode($result['error_message'] ?? 'Ödeme işlemi başarısız');
            header('Location: /payment-failed?order=' . $order['order_number'] . '&error=' . $errorMsg);
            exit;
        }
    } else {
        // Sipariş bulunamadı
        header('Location: /payment-failed?error=Sipariş bulunamadı');
        exit;
    }
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    header('Location: /payment-failed?error=Sistem hatası: ' . urlencode($e->getMessage()));
    exit;
}

function queueEmailNotification($orderId, $userId, $type, $email) {
    global $pdo;
    
    $subjects = [
        'payment_received' => 'Ödemeniz Onaylandı - CVK Dijital'
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO email_notifications (order_id, user_id, email_type, recipient_email, subject)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$orderId, $userId, $type, $email, $subjects[$type] ?? 'CVK Dijital Bildirim']);
}
