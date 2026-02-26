<?php
/**
 * CVK Dijital - API Response Helper
 */

function jsonResponse($success, $message = '', $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

function successResponse($data = null, $message = 'İşlem başarılı') {
    jsonResponse(true, $message, $data, 200);
}

function errorResponse($message = 'Bir hata oluştu', $statusCode = 400) {
    jsonResponse(false, $message, null, $statusCode);
}
