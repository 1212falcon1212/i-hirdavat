<?php

namespace Modules\ERP\Drivers;

use Modules\ERP\Contracts\ERPDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SentosDriver implements ERPDriverInterface
{
    protected $username;
    protected $password;
    protected $panelUrl; // Panel URL (e.g. https://sahin.sentos.com.tr/)
    protected $baseUrl;

    public function __construct($credentials)
    {
        // Backward compatibility: api_key ve api_secret varsa username ve password olarak kullan
        $this->username = $credentials['username'] ?? $credentials['api_key'] ?? null;
        $this->password = $credentials['password'] ?? $credentials['api_secret'] ?? null;
        
        // Panel URL: kullanıcı tam URL girer, biz /api ekleriz
        $panelUrl = $credentials['panel_url'] ?? $credentials['firm_name'] ?? $credentials['subdomain'] ?? null;
        
        if ($panelUrl) {
            // URL'yi normalize et
            $panelUrl = rtrim($panelUrl, '/'); // Sondaki / kaldır
            
            // Eğer zaten tam URL ise (https:// ile başlıyorsa) direkt kullan
            if (preg_match('/^https?:\/\//i', $panelUrl)) {
                $this->baseUrl = $panelUrl . '/api';
            } else {
                // Sadece subdomain girilmişse (backward compatibility)
                $this->baseUrl = 'https://' . $panelUrl . '.sentos.com.tr/api';
            }
        } else {
            $this->baseUrl = 'https://api.sentos.com.tr/api'; // Fallback
        }
        
        $this->panelUrl = $panelUrl;
    }

    /**
     * Get authenticated HTTP client with Basic Auth
     */
    private function getHttpClient()
    {
        // Basic Auth: base64(username:password)
        $auth = base64_encode($this->username . ':' . $this->password);
        
        return Http::withHeaders([
            'Authorization' => 'Basic ' . $auth,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ]);
    }

    /**
     * Test connection
     * Uses GET /warehouses endpoint to test connection
     */
    public function testConnection()
    {
        try {
            // Rate limit kontrolü için cache key
            $rateLimitKey = 'sentos_rate_limit_get_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            // GET rate limit: 2/dk
            if ($lastRequest && (now()->timestamp - $lastRequest) < 30) {
                return [
                    'success' => false,
                    'message' => 'Rate limit: GET istekleri için 2/dk limiti var. Lütfen bekleyin.',
                    'data' => null
                ];
            }
            
            $url = $this->baseUrl . '/warehouses';
            Log::info('Sentos API Test', [
                'url' => $url,
                'username' => $this->username,
                'baseUrl' => $this->baseUrl,
            ]);
            
            $response = $this->getHttpClient()->get($url);
            
            Log::info('Sentos API Response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            // Rate limit cache güncelle
            Cache::put($rateLimitKey, now()->timestamp, 60);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Bağlantı başarılı.',
                    'data' => $response->json()
                ];
            }

            $errorMessage = 'Bağlantı başarısız';
            if ($response->status() === 401) {
                $errorMessage = 'Kimlik doğrulama başarısız. Kullanıcı adı ve şifrenizi kontrol edin.';
            } elseif ($response->status() === 404) {
                $errorMessage = 'Firma adı (subdomain) bulunamadı. Firma adınızı kontrol edin.';
            } else {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => $response->json() ?? null
            ];
        } catch (\Throwable $e) {
            Log::error('Sentos Connection Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Bağlantı hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create an invoice in Sentos
     * POST /orders/invoice/{id}
     * 
     * @param array $invoiceData Must contain: order_id, invoice_type, invoice_number, invoice_url
     * @return array
     */
    public function createInvoice(array $invoiceData)
    {
        try {
            // Order ID kontrolü
            $orderId = $invoiceData['order_id'] ?? $invoiceData['id'] ?? null;
            if (!$orderId) {
                return [
                    'success' => false,
                    'message' => 'Sipariş ID gerekli.',
                    'data' => null
                ];
            }
            
            // Rate limit kontrolü (POST 12/dk)
            $rateLimitKey = 'sentos_rate_limit_post_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 5) {
                return [
                    'success' => false,
                    'message' => 'Rate limit: POST istekleri için 12/dk limiti var. Lütfen bekleyin.',
                    'data' => null
                ];
            }
            
            // Request body: {invoice_type, invoice_number, invoice_url}
            $payload = [
                'invoice_type' => $invoiceData['invoice_type'] ?? 'EARSIV',
                'invoice_number' => $invoiceData['invoice_number'] ?? $invoiceData['invoice_no'] ?? null,
                'invoice_url' => $invoiceData['invoice_url'] ?? null,
            ];
            
            // invoice_number zorunlu
            if (!$payload['invoice_number']) {
                return [
                    'success' => false,
                    'message' => 'Fatura numarası gerekli.',
                    'data' => null
                ];
            }
            
            $response = $this->getHttpClient()->post($this->baseUrl . '/orders/invoice/' . $orderId, $payload);
            
            // Rate limit cache güncelle
            Cache::put($rateLimitKey, now()->timestamp, 60);
            
            if ($response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => true,
                    'data' => $responseData,
                    'message' => 'Fatura başarıyla oluşturuldu.',
                    'invoice_id' => $responseData['id'] ?? null,
                    'invoice_number' => $responseData['invoice_number'] ?? null,
                    'invoice_url' => $responseData['invoice_url'] ?? null,
                ];
            }

            $errorMessage = 'Fatura oluşturulamadı';
            if ($response->status() === 401) {
                $errorMessage = 'Kimlik doğrulama başarısız.';
            } elseif ($response->status() === 400) {
                $errorMessage = 'Geçersiz istek: ' . ($response->json()['message'] ?? 'Fatura bilgileri eksik veya hatalı.');
            } elseif ($response->status() === 404) {
                $errorMessage = 'Sipariş bulunamadı.';
            } elseif ($response->status() === 405) {
                $errorMessage = 'Geçersiz giriş.';
            } else {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => $response->json() ?? null
            ];
        } catch (\Throwable $e) {
            Log::error('Sentos Invoice Error: ' . $e->getMessage(), [
                'invoice_data' => $invoiceData,
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Fatura oluşturma hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Sync products from Sentos
     * GET /products endpoint with pagination support
     * 
     * @param int $page Page number
     * @param int $perPage Items per page (aliased as $size for backward compatibility)
     * @param string|null $sku Optional SKU filter
     * @return array
     */
    public function syncProducts($page = 1, $perPage = 100, $sku = null)
    {
        try {
            // 1. Rate Limit Kontrolü
            $rateLimitKey = 'sentos_rate_limit_get_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 30) {
                Log::warning('Sentos Rate Limit Triggered', ['user' => $this->username, 'page' => $page]);
                return [
                    'success' => false,
                    'message' => 'Rate limit: GET istekleri için 2/dk limiti var. Lütfen bekleyin.',
                    'data' => null
                ];
            }
            
            // 2. Parametre Hazırlığı (Backward compatibility dahil)
            $size = is_numeric($sku) ? (int)$sku : $perPage;
            if (is_numeric($sku)) {
                $sku = null;
            }
            
            $queryParams = [
                'page' => $page,
                'size' => $size,
                'include' => 'category', // Request category info with products
            ];
            
            if ($sku) {
                $queryParams['sku'] = $sku;
            }

            // 3. İstek Detaylarını Logla
            Log::info('Sentos API Request Started', [
                'endpoint' => $this->baseUrl . '/products',
                'params'   => $queryParams,
                'method'   => 'GET'
            ]);
            
            // 4. API İsteğini At
            $response = $this->getHttpClient()->get($this->baseUrl . '/products', $queryParams);
            
            // 5. Response Özetini Logla
            Log::info('Sentos API Response Received', [
                'status' => $response->status(),
                'body_preview' => substr($response->body(), 0, 1000), // İlk 1000 karakteri görmek yeterlidir
            ]);

            // Rate limit cache güncelle
            Cache::put($rateLimitKey, now()->timestamp, 60);
            
            // 6. Başarılı Senaryo
            if ($response->successful()) {
                $data = $response->json();
                $products = [];
                
                // Category cache to avoid duplicate API calls
                $categoryCache = [];

                $items = isset($data['data']) && is_array($data['data']) ? $data['data'] : [];
    
                foreach ($items as $product) {
                    $categoryId = $product['category_id'] ?? null;
                    $categoryName = null;
                    
                    // Resolve category name from ID
                    if ($categoryId) {
                        if (isset($categoryCache[$categoryId])) {
                            $categoryName = $categoryCache[$categoryId];
                        } else {
                            // Fetch category by ID
                            $catResult = $this->getCategory($categoryId);
                            // Response is array: data[0]['name']
                            $catData = $catResult['data'][0] ?? $catResult['data'] ?? null;
                            if ($catResult['success'] && isset($catData['name'])) {
                                $categoryName = $catData['name'];
                                $categoryCache[$categoryId] = $categoryName;
                            }
                        }
                    }
                    
                    $products[] = [
                        'id'           => $product['id'] ?? null,
                        'sku'          => $product['sku'] ?? null,
                        'name'         => is_array($product['name'] ?? null) ? json_encode($product['name']) : ($product['name'] ?? null),
                        'invoice_name' => $product['invoice_name'] ?? null,
                        'brand'        => $product['brand'] ?? null,
                        'description'  => is_array($product['description'] ?? null) ? json_encode($product['description']) : ($product['description'] ?? null),
                        // Sentos'tan gelen fiyatlarda virgül (,) varsa float'a çevirmek gerekebilir:
                        'price'        => isset($product['sale_price']) ? (float)str_replace(',', '.', $product['sale_price']) : 0,
                        'cost'         => isset($product['purchase_price']) ? (float)str_replace(',', '.', $product['purchase_price']) : 0,
                        'currency'     => $product['currency'] ?? 'TL',
                        'vat_rate'     => $product['vat_rate'] ?? 20,
                        'barcode'      => $product['barcode'] ?? null,
                        'stock'        => isset($product['stocks']) && is_array($product['stocks']) 
                                        ? array_sum(array_column($product['stocks'], 'stock')) // 'quantity' yerine 'stock' gelmiş logda
                                        : 0,
                        'stocks'       => $product['stocks'] ?? [],
                        'variants'     => $product['variants'] ?? [],
                        'images'       => $product['images'] ?? [],
                        // Category fields
                        'category_id'   => $categoryId,
                        'category_name' => $categoryName,
                    ];
                
                }
                
                Log::info('Sentos Products Parsed Successfully', [
                    'count' => count($products),
                    'page'  => $page
                ]);

                return [
                    'success'    => true,
                    'data'       => $products,
                    'raw_data'   => $data,
                    'message'    => 'Ürünler başarıyla alındı.',
                    'pagination' => [
                        'page'     => $page,
                        'per_page' => $size,
                        'total'    => count($products),
                        'has_more' => count($products) >= $size,
                    ]
                ];
            }

            // 7. API Hata Senaryosu (4xx, 5xx)
            $errorMessage = 'Ürünler alınamadı';
            Log::error('Sentos API Error Response', [
                'status'   => $response->status(),
                'response' => $response->json() ?? $response->body()
            ]);

            if ($response->status() === 401) {
                $errorMessage = 'Kimlik doğrulama başarısız.';
            } elseif ($response->status() === 404) {
                $errorMessage = 'Endpoint bulunamadı.';
            } else {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data'    => null
            ];

        } catch (\Throwable $e) {
            // 8. Kritik Hata Logu (Kod hatası veya bağlantı kopması)
            Log::error('Sentos Products Sync Exception', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => substr($e->getTraceAsString(), 0, 500)
            ]);

            return [
                'success' => false,
                'message' => 'Ürün çekme hatası: ' . $e->getMessage(),
                'data'    => null
            ];
        }
    }
    /**
     * Sync order from Marketplace to Sentos
     * GET /orders endpoint ile sipariş bilgilerini çekme
     * 
     * @param mixed $order Order model or order_code/order_id
     * @return array
     */
    public function syncOrder($order)
    {
        try {
            // Rate limit kontrolü
            $rateLimitKey = 'sentos_rate_limit_get_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 30) {
                return [
                    'success' => false,
                    'message' => 'Rate limit: GET istekleri için 2/dk limiti var. Lütfen bekleyin.',
                    'data' => null
                ];
            }
            
            // Order code veya order_id belirleme
            $orderCode = null;
            $orderId = null;
            
            if (is_object($order) && isset($order->order_code)) {
                $orderCode = $order->prefix . $order->order_code;
            } elseif (is_string($order)) {
                $orderCode = $order;
            } elseif (is_numeric($order)) {
                $orderId = $order;
            }
            
            // Query parametreleri
            $queryParams = [];
            if ($orderCode) {
                $queryParams['order_code'] = $orderCode;
            }
            if ($orderId) {
                $queryParams['order_id'] = $orderId;
            }
            
            if (empty($queryParams)) {
                return [
                    'success' => false,
                    'message' => 'Sipariş kodu veya ID gerekli.',
                    'data' => null
                ];
            }
            
            $response = $this->getHttpClient()->get($this->baseUrl . '/orders', $queryParams);
            
            // Rate limit cache güncelle
            Cache::put($rateLimitKey, now()->timestamp, 60);
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Response array veya single object olabilir
                $orders = is_array($data) && isset($data[0]) ? $data : [$data];
                
                if (empty($orders) || (isset($orders[0]) && empty($orders[0]))) {
                    return [
                        'success' => false,
                        'message' => 'Sipariş bulunamadı.',
                        'data' => null
                    ];
                }
                
                $orderData = $orders[0];
                
                return [
                    'success' => true,
                    'data' => $orderData,
                    'message' => 'Sipariş başarıyla alındı.',
                    'order_id' => $orderData['id'] ?? null,
                    'order_code' => $orderData['order_code'] ?? null,
                    'status' => $orderData['status'] ?? null,
                    'total' => $orderData['total'] ?? null,
                ];
            }

            $errorMessage = 'Sipariş alınamadı';
            if ($response->status() === 401) {
                $errorMessage = 'Kimlik doğrulama başarısız.';
            } elseif ($response->status() === 404) {
                $errorMessage = 'Sipariş bulunamadı.';
            } else {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Sentos Sync Order Error: ' . $e->getMessage(), [
                'order' => is_object($order) ? $order->id : $order,
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Sipariş senkronizasyonu hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
    
    /**
     * Get categories from Sentos
     * GET /categories
     * 
     * @return array
     */
    public function getCategories()
    {
        try {
            // Rate limit kontrolü
            $rateLimitKey = 'sentos_rate_limit_get_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 30) {
                return [
                    'success' => false,
                    'message' => 'Rate limit: GET istekleri için 2/dk limiti var. Lütfen bekleyin.',
                    'data' => null
                ];
            }
            
            $response = $this->getHttpClient()->get($this->baseUrl . '/categories');
            
            // Rate limit cache güncelle
            Cache::put($rateLimitKey, now()->timestamp, 60);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message' => 'Kategoriler başarıyla alındı.'
                ];
            }

            return [
                'success' => false,
                'message' => 'Kategoriler alınamadı: ' . ($response->json()['message'] ?? $response->body()),
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Sentos Categories Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Kategori çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
    
    /**
     * Get single category by ID
     * GET /categories/{id}
     * 
     * @param int $categoryId
     * @return array
     */
    public function getCategory($categoryId)
    {
        try {
            $response = $this->getHttpClient()->get($this->baseUrl . '/categories/' . $categoryId);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message' => 'Kategori başarıyla alındı.'
                ];
            }

            return [
                'success' => false,
                'message' => 'Kategori alınamadı: ' . ($response->json()['message'] ?? $response->body()),
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Sentos Get Category Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Kategori çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
    
    /**
     * Get warehouses from Sentos
     * GET /warehouses
     * 
     * @return array
     */
    public function getWarehouses()
    {
        try {
            // Rate limit kontrolü
            $rateLimitKey = 'sentos_rate_limit_get_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 30) {
                return [
                    'success' => false,
                    'message' => 'Rate limit: GET istekleri için 2/dk limiti var. Lütfen bekleyin.',
                    'data' => null
                ];
            }
            
            $response = $this->getHttpClient()->get($this->baseUrl . '/warehouses');
            
            // Rate limit cache güncelle
            Cache::put($rateLimitKey, now()->timestamp, 60);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message' => 'Depolar başarıyla alındı.'
                ];
            }

            return [
                'success' => false,
                'message' => 'Depolar alınamadı: ' . ($response->json()['message'] ?? $response->body()),
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Sentos Warehouses Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Depo çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
    
    /**
     * Update invoice in Sentos
     * PUT /orders/invoice/{id}
     * 
     * @param int $invoiceId
     * @param array $invoiceData
     * @return array
     */
    public function updateInvoice($invoiceId, array $invoiceData)
    {
        try {
            // Rate limit kontrolü
            $rateLimitKey = 'sentos_rate_limit_post_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 5) {
                return [
                    'success' => false,
                    'message' => 'Rate limit: POST istekleri için 12/dk limiti var. Lütfen bekleyin.',
                    'data' => null
                ];
            }
            
            $payload = [
                'invoice_type' => $invoiceData['invoice_type'] ?? 'EARSIV',
                'invoice_number' => $invoiceData['invoice_number'] ?? null,
                'invoice_url' => $invoiceData['invoice_url'] ?? null,
            ];
            
            $response = $this->getHttpClient()->put($this->baseUrl . '/orders/invoice/' . $invoiceId, $payload);
            
            // Rate limit cache güncelle
            Cache::put($rateLimitKey, now()->timestamp, 60);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message' => 'Fatura başarıyla güncellendi.'
                ];
            }

            return [
                'success' => false,
                'message' => 'Fatura güncellenemedi: ' . ($response->json()['message'] ?? $response->body()),
                'data' => $response->json() ?? null
            ];
        } catch (\Throwable $e) {
            Log::error('Sentos Update Invoice Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Fatura güncelleme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
    
    /**
     * Delete invoice in Sentos
     * DELETE /orders/invoice/{id}
     * 
     * @param int $invoiceId
     * @return array
     */
    public function deleteInvoice($invoiceId)
    {
        try {
            // Rate limit kontrolü
            $rateLimitKey = 'sentos_rate_limit_post_' . md5($this->username);
            $lastRequest = Cache::get($rateLimitKey);
            
            if ($lastRequest && (now()->timestamp - $lastRequest) < 5) {
                return [
                    'success' => false,
                    'message' => 'Rate limit: POST istekleri için 12/dk limiti var. Lütfen bekleyin.',
                    'data' => null
                ];
            }
            
            $response = $this->getHttpClient()->delete($this->baseUrl . '/orders/invoice/' . $invoiceId);
            
            // Rate limit cache güncelle
            Cache::put($rateLimitKey, now()->timestamp, 60);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Fatura başarıyla silindi.',
                    'data' => $response->json() ?? null
                ];
            }

            return [
                'success' => false,
                'message' => 'Fatura silinemedi: ' . ($response->json()['message'] ?? $response->body()),
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Sentos Delete Invoice Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Fatura silme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
}

