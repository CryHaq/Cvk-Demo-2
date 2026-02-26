<?php
/**
 * CVK Dijital - iyzico Ödeme Entegrasyonu
 * Aşama 1: Ödeme Altyapısı
 */

require_once '../../vendor/autoload.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';

use Iyzipay\Options;
use Iyzipay\Request;
use Iyzipay\Model\CheckoutFormInitialize;
use Iyzipay\Model\CheckoutForm;
use Iyzipay\Request\CreateCheckoutFormInitializeRequest;
use Iyzipay\Request\RetrieveCheckoutFormRequest;
use Iyzipay\Model\Locale;
use Iyzipay\Model\Currency;
use Iyzipay\Model\Buyer;
use Iyzipay\Model\Address;
use Iyzipay\Model\BasketItem;
use Iyzipay\Model\BasketItemType;

class IyzicoPayment {
    private $options;
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        
        // iyzico Ayarları - SANDBOX
        $this->options = new Options();
        $this->options->setApiKey('sandbox-jZDar3fm9xMhVeEBnbNGwXu0xeT9kP0u');
        $this->options->setSecretKey('sandbox-82whaNaIAgRPNwLEQo2J9YAfH3kRiqdw');
        $this->options->setBaseUrl('https://sandbox-api.iyzipay.com');
    }
    
    /**
     * Checkout Form oluştur
     */
    public function createCheckoutForm($orderData, $userData) {
        $request = new CreateCheckoutFormInitializeRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId($orderData['order_number']);
        $request->setPrice($orderData['subtotal']);
        $request->setPaidPrice($orderData['total_amount']);
        $request->setCurrency(Currency::TL);
        $request->setBasketId($orderData['order_number']);
        $request->setPaymentGroup(\Iyzipay\Model\PaymentGroup::PRODUCT);
        $request->setCallbackUrl("https://cvkdijital.com/api/payment/callback.php");
        $request->setEnabledInstallments([2, 3, 6, 9]);
        
        // Alıcı bilgileri
        $buyer = new Buyer();
        $buyer->setId($userData['id']);
        $buyer->setName($userData['first_name']);
        $buyer->setSurname($userData['last_name']);
        $buyer->setGsmNumber($userData['phone'] ?? '+905350000000');
        $buyer->setEmail($userData['email']);
        $buyer->setIdentityNumber('11111111111'); // TC No gerekiyor
        $buyer->setLastLoginDate(date('Y-m-d H:i:s'));
        $buyer->setRegistrationDate($userData['created_at'] ?? date('Y-m-d H:i:s'));
        $buyer->setRegistrationAddress($orderData['shipping_address']['full_address'] ?? 'İstanbul');
        $buyer->setIp($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
        $buyer->setCity($orderData['shipping_address']['city'] ?? 'İstanbul');
        $buyer->setCountry('Turkey');
        $buyer->setZipCode($orderData['shipping_address']['zip'] ?? '34000');
        $request->setBuyer($buyer);
        
        // Teslimat adresi
        $shippingAddress = new Address();
        $shippingAddress->setContactName($userData['first_name'] . ' ' . $userData['last_name']);
        $shippingAddress->setCity($orderData['shipping_address']['city'] ?? 'İstanbul');
        $shippingAddress->setCountry('Turkey');
        $shippingAddress->setAddress($orderData['shipping_address']['full_address'] ?? 'İstanbul');
        $shippingAddress->setZipCode($orderData['shipping_address']['zip'] ?? '34000');
        $request->setShippingAddress($shippingAddress);
        
        // Fatura adresi
        $billingAddress = new Address();
        $billingAddress->setContactName($userData['first_name'] . ' ' . $userData['last_name']);
        $billingAddress->setCity($orderData['billing_address']['city'] ?? 'İstanbul');
        $billingAddress->setCountry('Turkey');
        $billingAddress->setAddress($orderData['billing_address']['full_address'] ?? 'İstanbul');
        $billingAddress->setZipCode($orderData['billing_address']['zip'] ?? '34000');
        $request->setBillingAddress($billingAddress);
        
        // Sepet ürünleri
        $basketItems = [];
        foreach ($orderData['items'] as $item) {
            $basketItem = new BasketItem();
            $basketItem->setId($item['id'] ?? uniqid());
            $basketItem->setName($item['product_type'] . ' - ' . $item['size']);
            $basketItem->setCategory1('Ambalaj');
            $basketItem->setCategory2($item['material']);
            $basketItem->setItemType(BasketItemType::PHYSICAL);
            $basketItem->setPrice($item['total_price']);
            $basketItems[] = $basketItem;
        }
        $request->setBasketItems($basketItems);
        
        // Checkout form oluştur
        $checkoutFormInitialize = CheckoutFormInitialize::create($request, $this->options);
        
        return [
            'status' => $checkoutFormInitialize->getStatus(),
            'checkout_form_content' => $checkoutFormInitialize->getCheckoutFormContent(),
            'token' => $checkoutFormInitialize->getToken(),
            'conversation_id' => $orderData['order_number']
        ];
    }
    
    /**
     * Ödeme sonucunu kontrol et (Callback)
     */
    public function verifyPayment($token) {
        $request = new RetrieveCheckoutFormRequest();
        $request->setLocale(Locale::TR);
        $request->setConversationId(uniqid());
        $request->setToken($token);
        
        $checkoutForm = CheckoutForm::retrieve($request, $this->options);
        
        return [
            'status' => $checkoutForm->getStatus(),
            'payment_status' => $checkoutForm->getPaymentStatus(),
            'conversation_id' => $checkoutForm->getConversationId(),
            'payment_id' => $checkoutForm->getPaymentId(),
            'paid_price' => $checkoutForm->getPaidPrice(),
            'basket_id' => $checkoutForm->getBasketId(),
            'bin_number' => $checkoutForm->getBinNumber(),
            'last_four_digits' => $checkoutForm->getLastFourDigits(),
            'card_type' => $checkoutForm->getCardType(),
            'installment' => $checkoutForm->getInstallment(),
            'error_message' => $checkoutForm->getErrorMessage(),
            'error_code' => $checkoutForm->getErrorCode()
        ];
    }
}
