<?php

namespace Modules\ERP\Drivers;

use Modules\ERP\Contracts\ERPDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class DopigoDriver implements ERPDriverInterface
{
    protected $username;
    protected $password;
    protected $token;
    protected $baseUrl = 'https://panel.dopigo.com';

    public function __construct($credentials)
    {
        $this->username = $credentials['username'] ?? null;
        $this->password = $credentials['password'] ?? null;
        // Token can be passed directly if already cached
        $this->token = $credentials['token'] ?? null;
    }

    /**
     * Get authentication token from Dopigo
     * Token is long-lived, only need to get once
     */
    protected function getToken()
    {
        // If token is already set, use it
        if ($this->token) {
            return $this->token;
        }

        // Check cache first
        $cacheKey = 'dopigo_token_' . md5($this->username);
        $cachedToken = Cache::get($cacheKey);
        
        if ($cachedToken) {
            $this->token = $cachedToken;
            return $this->token;
        }

        // Get new token
        try {
            $response = Http::asMultipart()->post($this->baseUrl . '/users/get_auth_token/', [
                ['name' => 'username', 'contents' => $this->username],
                ['name' => 'password', 'contents' => $this->password],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->token = $data['token'] ?? null;
                
                if ($this->token) {
                    // Cache token for 30 days (long-lived)
                    Cache::put($cacheKey, $this->token, now()->addDays(30));
                }
                
                return $this->token;
            }

            Log::error('Dopigo Token Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            return null;
        } catch (\Throwable $e) {
            Log::error('Dopigo Token Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get authenticated HTTP client with Token
     */
    protected function getHttpClient()
    {
        $token = $this->getToken();
        
        return Http::withHeaders([
            'Authorization' => 'Token ' . $token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ]);
    }

    /**
     * Test connection by fetching products
     */
    public function testConnection()
    {
        try {
            $token = $this->getToken();
            
            if (!$token) {
                return [
                    'success' => false,
                    'message' => 'Token alınamadı. Kullanıcı adı ve şifrenizi kontrol edin.',
                    'data' => null
                ];
            }

            // Test with products endpoint (limit 1)
            $response = $this->getHttpClient()->get($this->baseUrl . '/api/v1/products/all/', [
                'limit' => 1,
            ]);

            Log::info('Dopigo Test Connection', [
                'status' => $response->status(),
                'body_preview' => substr($response->body(), 0, 500),
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Bağlantı başarılı.',
                    'data' => ['token' => $token]
                ];
            }

            $errorMessage = 'Bağlantı başarısız';
            if ($response->status() === 401) {
                // Clear cached token
                Cache::forget('dopigo_token_' . md5($this->username));
                $errorMessage = 'Kimlik doğrulama başarısız. Token geçersiz olabilir.';
            } else {
                $errorMessage .= ': ' . $response->body();
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Dopigo Connection Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Bağlantı hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Sync products from Dopigo
     * GET /api/v1/products/all/
     * 
     * @param int $page Page number (Dopigo uses next/previous pagination)
     * @param int $perPage Items per page
     * @return array
     */
    public function syncProducts($page = 1, $perPage = 100)
    {
        try {
            // Rate limit: 2 requests per second
            $rateLimitKey = 'dopigo_rate_limit_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 1) {
                usleep(500000); // Wait 500ms
            }

            $response = $this->getHttpClient()->get($this->baseUrl . '/api/v1/products/all/');

            // Update rate limit cache
            Cache::put($rateLimitKey, now()->timestamp, 60);

            Log::info('Dopigo Products Response', [
                'status' => $response->status(),
                'body_preview' => substr($response->body(), 0, 1000),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $products = [];

                // Dopigo returns: {count, next, previous, results[]}
                // Each result has: meta_id, name, description, products[]
                $results = $data['results'] ?? [];

                foreach ($results as $meta) {
                    // Skip archived products
                    if (!empty($meta['archived'])) {
                        continue;
                    }

                    $metaName = $meta['name'] ?? '';
                    $metaDescription = $meta['description'] ?? '';
                    $categoryId = $meta['category'] ?? null;
                    $vat = $meta['vat'] ?? 18;

                    // Each meta can have multiple products (variants)
                    $variants = $meta['products'] ?? [];

                    foreach ($variants as $product) {
                        $images = [];
                        foreach ($product['images'] ?? [] as $img) {
                            $images[] = $img['absolute_url'] ?? $img['source_url'] ?? null;
                        }
                        $images = array_filter($images);

                        // Parse custom attributes
                        $attributes = [];
                        foreach ($product['custom_attributes'] ?? [] as $attr) {
                            $attrName = $attr['attribute']['name'] ?? '';
                            $attrValue = $attr['value']['name'] ?? '';
                            if ($attrName && $attrValue) {
                                $attributes[$attrName] = $attrValue;
                            }
                        }

                        // Fetch category name if available
                        $categoryName = null;
                        if ($categoryId) {
                            $categoryName = $this->getCategoryName($categoryId, $meta['meta_id'] ?? null);
                        }

                        $products[] = [
                            'id' => $product['id'] ?? null,
                            'meta_id' => $product['meta_id'] ?? $meta['meta_id'] ?? null,
                            'sku' => $product['sku'] ?? null,
                            'foreign_sku' => $product['foreign_sku'] ?? null,
                            'barcode' => $product['barcode'] ?? null,
                            'name' => $product['invoice_name'] ?? $metaName,
                            'description' => $metaDescription,
                            'price' => (float) ($product['price'] ?? 0),
                            'listing_price' => (float) ($product['listing_price'] ?? 0),
                            'purchase_price' => (float) ($product['purchase_price'] ?? 0),
                            'stock' => (int) ($product['stock'] ?? 0),
                            'available_stock' => (int) ($product['available_stock'] ?? 0),
                            'weight' => $product['weight'] ?? null,
                            'currency' => $product['price_currency'] ?? 'TRY',
                            'vat_rate' => $vat,
                            'category_id' => $categoryId,
                            'category_name' => $categoryName, // Added category name
                            'images' => $images,
                            'attributes' => $attributes,
                            'is_primary' => $product['is_primary'] ?? false,
                        ];
                    }
                }

                return [
                    'success' => true,
                    'data' => $products,
                    'raw_data' => $data,
                    'message' => 'Ürünler başarıyla alındı.',
                    'pagination' => [
                        'page' => $page,
                        'per_page' => $perPage,
                        'total' => $data['count'] ?? count($products),
                        'has_more' => !empty($data['next']),
                        'next' => $data['next'] ?? null,
                        'previous' => $data['previous'] ?? null,
                    ]
                ];
            }

            $errorMessage = 'Ürünler alınamadı';
            if ($response->status() === 401) {
                // Clear cached token
                Cache::forget('dopigo_token_' . md5($this->username));
                $errorMessage = 'Kimlik doğrulama başarısız. Lütfen tekrar deneyin.';
            } else {
                $errorMessage .= ': ' . $response->body();
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Dopigo Products Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Ürün çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create order in Dopigo (used for invoicing)
     * POST /api/v1/orders/
     * 
     * @param mixed $order Order model
     * @return array
     */
    public function syncOrder($order)
    {
        try {
            // Rate limit: 2 requests per second
            $rateLimitKey = 'dopigo_rate_limit_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 1) {
                usleep(500000); // Wait 500ms
            }

            // Build order data from Order model
            $customer = $order->customer ?? null;
            $user = $customer->user ?? null;
            $address = $order->address ?? null;
            $billingAddress = $order->billing_address ?? $address;

                // Helper to format phone
            $formatPhone = function($phone) {
                if (!$phone) return '+905555555555'; // Fallback
                // Remove non-digit characters
                $phone = preg_replace('/\D/', '', $phone);
                
                // If it starts with 90 and is 12 digits, keep it (or ensure +)
                if (strlen($phone) === 12 && str_starts_with($phone, '90')) {
                    return '+' . $phone;
                }
                
                // If 11 digits starting with 0, strip 0
                if (strlen($phone) === 11 && str_starts_with($phone, '0')) {
                    $phone = substr($phone, 1);
                }
                
                // If 10 digits, add +90
                if (strlen($phone) === 10) {
                    return '+90' . $phone;
                }

                // Fallback invalid lengths to test number
                if (strlen($phone) > 12 || strlen($phone) < 10) {
                     return '+905555555555'; 
                }
                
                return $phone;
            };

            // Build address object
            $addressData = [
                'full_address' => ($address->address_line ?? $address->address ?? '') . ' ' . ($address->address_line2 ?? ''),
                'contact_full_name' => $address->name ?? ($user->name ?? ''),
                'contact_phone_number' => $formatPhone($address->phone ?? ($user->phone ?? '')),
                'city' => $address->city ?? $address->area ?? '', // Fallback to area if city is missing
                'district' => $address->district ?? $address->area ?? '', // Fallback to area if district is missing
                'zip_code' => $address->postal_code ?? $address->post_code ?? '',
            ];

            $billingAddressData = [
                'full_address' => ($billingAddress->address_line ?? $billingAddress->address ?? ($addressData['full_address'] ?? '')),
                'contact_full_name' => $billingAddress->name ?? $addressData['contact_full_name'],
                'contact_phone_number' => $formatPhone($billingAddress->phone ?? $addressData['contact_phone_number']),
                'city' => $billingAddress->city ?? $billingAddress->area ?? $addressData['city'],
                'district' => $billingAddress->district ?? $billingAddress->area ?? $addressData['district'],
                'zip_code' => $billingAddress->postal_code ?? $billingAddress->post_code ?? $addressData['zip_code'],
            ];

            // Determine account type
            $accountType = 'person';
            $taxId = null;
            $taxOffice = null;
            $companyName = '';
            
            if ($customer && !empty($customer->tax_number)) {
                $accountType = 'company';
                $taxId = $customer->tax_number;
                $taxOffice = $customer->tax_office ?? null;
                $companyName = $customer->company_name ?? '';
            }

            // Build order items
            $items = [];
            $orderProducts = $order->products ?? [];
            
            foreach ($orderProducts as $product) {
                $quantity = $product->pivot->quantity ?? 1;
                $unitPrice = $product->pivot->price ?? $product->price ?? 0;
                $totalPrice = $quantity * $unitPrice;
                $vatRate = $product->vat_tax->rate ?? 18;

                $items[] = [
                    'service_item_id' => $order->id . '-' . $product->id . '-' . uniqid(), // Ensure unique ID
                    'service_product_id' => (string) $product->id,
                    'service_shipment_code' => $order->tracking_number ?? null,
                    'sku' => $product->sku ?: ($product->barcode ?: ('PROD-' . $product->id)),
                    'attributes' => '', // Could include variant info
                    'name' => $product->name,
                    'amount' => $quantity,
                    'price' => number_format($totalPrice, 2, '.', ''),
                    'unit_price' => number_format($unitPrice, 2, '.', ''),
                    'shipment_campaign_code' => null,
                    'buyer_pays_shipment' => false,
                    'status' => 'shipped',
                    'vat' => $vatRate,
                    'tax_ratio' => $vatRate,
                    'product' => [
                        'sku' => $product->sku ?: ($product->barcode ?: ('PROD-' . $product->id)),
                    ]
                ];
            }

            // Build order payload
            $orderData = [
                'service' => 1,
                'service_name' => 'i-eczane',
                'sales_channel' => 'i-eczane.com',
                'service_created' => $order->created_at->format('Y-m-d H:i:s'),
                'service_value' => $order->prefix . $order->order_code, // Must be unique
                'service_order_id' => (string) $order->id,
                'customer' => [
                    'account_type' => $accountType,
                    'full_name' => $user->name ?? 'Müşteri',
                    'address' => $addressData,
                    'email' => $user->email ?? '',
                    'phone_number' => $formatPhone($address->phone ?? ($user->phone ?? '')),
                    'tax_id' => $taxId,
                    'tax_office' => $taxOffice,
                    'company_name' => $companyName,
                ],
                'billing_address' => $billingAddressData,
                'shipping_address' => $addressData,
                'shipped_date' => null,
                'payment_type' => 'undefined',
                'status' => 'shipped',
                'total' => number_format($order->payable_amount ?? 0, 2, '.', ''),
                'service_fee' => number_format($order->shipping_charge ?? 0, 2, '.', ''),
                'discount' => null,
                'archived' => false, // Must be false
                'notes' => $order->note ?? '',
                'items' => $items,
            ];

            Log::info('Dopigo Order Request', [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'payload_preview' => json_encode($orderData), // Log full for debug
            ]);

            $response = $this->getHttpClient()->post($this->baseUrl . '/api/v1/orders/', $orderData);

            // Update rate limit cache
            Cache::put($rateLimitKey, now()->timestamp, 60);

            Log::info('Dopigo Order Response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                
                return [
                    'success' => true,
                    'data' => $responseData,
                    'message' => 'Sipariş Dopigo\'ya başarıyla gönderildi.',
                    'order_id' => $responseData['id'] ?? null,
                    'order_number' => $responseData['service_value'] ?? ($order->prefix . $order->order_code),
                    'invoice_number' => $responseData['invoice_number'] ?? null,
                ];
            }

            $errorMessage = 'Sipariş gönderilemedi';
            if ($response->status() === 401) {
                Cache::forget('dopigo_token_' . md5($this->username));
                $errorMessage = 'Kimlik doğrulama başarısız.';
            } elseif ($response->status() === 400) {
                $errorData = $response->json();
                $errorMessage = 'Geçersiz istek: ' . json_encode($errorData);
            } else {
                $errorMessage .= ': ' . $response->body();
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => $response->json() ?? null
            ];
        } catch (\Throwable $e) {
            Log::error('Dopigo Order Error: ' . $e->getMessage(), [
                'order_id' => $order->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Sipariş gönderme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create invoice - wrapper for syncOrder
     * Dopigo uses orders as invoices
     */
    public function createInvoice(array $invoiceData)
    {
        // If order object is passed directly
        if (isset($invoiceData['order']) && is_object($invoiceData['order'])) {
            return $this->syncOrder($invoiceData['order']);
        }

        // Build a minimal order-like object from invoice data
        return [
            'success' => false,
            'message' => 'Dopigo için sipariş nesnesi gerekli. createInvoice yerine syncOrder kullanın.',
            'data' => null
        ];
    }

    /**
     * Clear cached token (useful for re-authentication)
     */
    public function clearToken()
    {
        $this->token = null;
        Cache::forget('dopigo_token_' . md5($this->username));
    }

    /**
     * Get Category Name by ID (using local cache or simple meta fetch)
     */
    protected function getCategoryName($categoryId, $metaId = null)
    {
        if (!$categoryId) return null;

        $cacheKey = 'dopigo_category_name_' . $categoryId;
        $cachedName = Cache::get($cacheKey);

        if ($cachedName) {
            return $cachedName;
        }

        // If not cached, we need to fetch it.
        // Since there is no categories endpoint, we use product_meta via meta_id if available.
        if ($metaId) {
            try {
                // Rate limiter for meta fetch (don't spam)
                // We're already inside a loop often, so be careful.
                // NOTE: This will slow down sync significantly for new categories.
                usleep(200000); // 200ms delay safety

                $response = $this->getHttpClient()->get($this->baseUrl . '/api/v1/products/product_meta/' . $metaId . '/');

                if ($response->successful()) {
                    $data = $response->json();
                    if (isset($data['category']['name'])) {
                        $name = $data['category']['name'];
                        // Cache for 24 hours
                        Cache::put($cacheKey, $name, now()->addHours(24));
                        return $name;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Dopigo Category Fetch Error: ' . $e->getMessage());
            }
        }

        return null;
    }
}
