<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;

class SslCommerzService
{
    private const SANDBOX_API = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    private const LIVE_API = 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

    /**
     * Create a payment session and return the gateway redirect URL.
     *
     * @return array{success: bool, gateway_url?: string, message?: string, raw?: array}
     */
    public function initiateSession(Order $order): array
    {
        $config = config('services.sslcommerz');

        if (empty($config['store_id']) || empty($config['store_password'])) {
            return ['success' => false, 'message' => 'SSLCommerz credentials are not configured.'];
        }

        $endpoint = $config['sandbox'] ? self::SANDBOX_API : self::LIVE_API;

        $response = Http::asForm()->post($endpoint, [
            'store_id' => $config['store_id'],
            'store_passwd' => $config['store_password'],
            'total_amount' => (float) $order->total,
            'currency' => 'BDT',
            'tran_id' => $order->order_number, // used to reconcile the IPN
            'success_url' => $config['success_url'],
            'fail_url' => $config['fail_url'],
            'cancel_url' => $config['cancel_url'],
            'ipn_url' => $config['ipn_url'],
            'cus_name' => $order->shipping_name,
            'cus_phone' => $order->shipping_phone,
            'cus_add1' => $order->shipping_address,
            'product_category' => 'general',
            'product_name' => 'Order '.$order->order_number,
            'product_profile' => 'general',
            'shipping_method' => 'YES',
            'num_of_item' => $order->items()->count(),
        ]);

        $body = $response->json() ?? [];

        if (($body['status'] ?? null) === 'SUCCESS' && ! empty($body['GatewayPageURL'])) {
            return ['success' => true, 'gateway_url' => $body['GatewayPageURL'], 'raw' => $body];
        }

        return [
            'success' => false,
            'message' => $body['failedreason'] ?? 'Failed to initiate payment session.',
            'raw' => $body,
        ];
    }

    /**
     * Verify an IPN payload using SSLCommerz's hash scheme:
     * md5 over the verify_key params + md5(store_passwd), sorted by key.
     */
    public function verifyIpnSignature(array $payload): bool
    {
        if (empty($payload['verify_sign']) || empty($payload['verify_key'])) {
            return false;
        }

        $storePassword = (string) config('services.sslcommerz.store_password');
        if ($storePassword === '') {
            return false;
        }

        $keys = explode(',', $payload['verify_key']);
        $data = [];
        foreach ($keys as $key) {
            $data[$key] = $payload[$key] ?? '';
        }
        $data['store_passwd'] = md5($storePassword);

        ksort($data);

        $hashString = '';
        foreach ($data as $key => $value) {
            $hashString .= $key.'='.$value.'&';
        }
        $hashString = rtrim($hashString, '&');

        return hash_equals(md5($hashString), (string) $payload['verify_sign']);
    }
}
