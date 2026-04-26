<?php

namespace Modules\ERP\Drivers;

use Modules\ERP\Contracts\ERPDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class EntegraDriver implements ERPDriverInterface
{
    protected $email;
    protected $password;
    protected $companyId;
    protected $baseUrl = 'https://apiv2.entegrabilisim.com';
    protected $accessToken;
    protected $refreshToken;
    protected $cacheKey;
    protected $rateLimitKey;

    public function __construct($credentials)
    {
        $this->email = $credentials['email'] ?? $credentials['username'] ?? null;
        $this->password = $credentials['password'] ?? null;
        $this->companyId = $credentials['company_id'] ?? null;
        
        $shopId = $credentials['shop_id'] ?? 'default';
        $this->cacheKey = 'entegra_token_' . $shopId;
        $this->rateLimitKey = 'entegra_rate_limit_' . $shopId;
        
        $this->loadCachedToken();
    }

    /**
     * Load cached access token
     */
    private function loadCachedToken()
    {
        $cached = Cache::get($this->cacheKey);
        if ($cached) {
            $this->accessToken = $cached['access'] ?? null;
            $this->refreshToken = $cached['refresh'] ?? null;
        }
    }

    /**
     * Save token to cache
     * Access token süresi: 1 hafta (604800 saniye)
     * Refresh token süresi: 1 ay (2592000 saniye)
     */
    private function cacheToken($tokenData)
    {
        $tokenCache = [
            'access' => $tokenData['access'] ?? null,
            'refresh' => $tokenData['refresh'] ?? null,
        ];
        
        // Access token için 1 hafta cache (604800 saniye)
        Cache::put($this->cacheKey, $tokenCache, now()->addSeconds(604800 - 60)); // 1 min buffer
        
        $this->accessToken = $tokenCache['access'];
        $this->refreshToken = $tokenCache['refresh'];
    }

    /**
     * Check rate limit
     * Rate limit: 7200 requests/hour
     */
    private function checkRateLimit()
    {
        $hourKey = $this->rateLimitKey . '_' . date('Y-m-d-H');
        $requestCount = Cache::get($hourKey, 0);
        
        if ($requestCount >= 7200) {
            Log::warning('Entegra Rate Limit: 7200/saat limiti aşıldı', [
                'shop_id' => $this->cacheKey,
                'hour' => date('Y-m-d-H')
            ]);
            return false;
        }
        
        Cache::put($hourKey, $requestCount + 1, 3600); // 1 saat cache
        return true;
    }

    /**
     * Authenticate and get token
     * Endpoint: POST /api/user/token/obtain/
     */
    private function authenticate()
    {
        try {
            if (!$this->checkRateLimit()) {
                return null;
            }

            $response = Http::asJson()->post($this->baseUrl . '/api/user/token/obtain/', [
                'email' => $this->email,
                'password' => $this->password,
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                
                // Response formatı: { "access": "...", "refresh": "..." }
                if (isset($responseData['access']) && isset($responseData['refresh'])) {
                    $this->cacheToken($responseData);
                    return $responseData['access'];
                }
            }

            Log::error('Entegra Auth Failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return null;
        } catch (\Throwable $e) {
            Log::error('Entegra Auth Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Refresh access token
     * Endpoint: POST /api/user/token/refresh/
     */
    private function refreshAccessToken()
    {
        try {
            if (!$this->refreshToken) {
                Log::warning('Entegra: Refresh token bulunamadı, yeniden authenticate ediliyor');
                return $this->authenticate();
            }

            if (!$this->checkRateLimit()) {
                return null;
            }

            $response = Http::asJson()->post($this->baseUrl . '/api/user/token/refresh/', [
                'refresh' => $this->refreshToken,
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['access']) && isset($responseData['refresh'])) {
                    $this->cacheToken($responseData);
                    return $responseData['access'];
                }
            }

            // Refresh token geçersizse yeniden authenticate et
            Log::warning('Entegra: Refresh token geçersiz, yeniden authenticate ediliyor');
            Cache::forget($this->cacheKey);
            $this->accessToken = null;
            $this->refreshToken = null;
            return $this->authenticate();
        } catch (\Throwable $e) {
            Log::error('Entegra Refresh Token Error: ' . $e->getMessage());
            return $this->authenticate();
        }
    }

    /**
     * Check if token is valid, refresh if needed
     */
    private function ensureAuthenticated()
    {
        if (!$this->accessToken) {
            return $this->authenticate();
        }
        
        // Token'ın cache'de olup olmadığını kontrol et
        $cached = Cache::get($this->cacheKey);
        if (!$cached || !isset($cached['access'])) {
            return $this->authenticate();
        }
        
        return $this->accessToken;
    }

    /**
     * Get authenticated HTTP client
     * Authorization header formatı: JWT {token}
     */
    private function getHttpClient()
    {
        $token = $this->ensureAuthenticated();
        
        if (!$token) {
            Log::error('Entegra: Token alınamadı');
            throw new \Exception('Entegra API token alınamadı');
        }
        
        return Http::withHeaders([
            'Authorization' => 'JWT ' . $token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ]);
    }

    /**
     * Make HTTP request with retry on 401
     */
    private function makeRequest($method, $url, $data = null)
    {
        if (!$this->checkRateLimit()) {
            return null;
        }

        try {
            $client = $this->getHttpClient();
            
            if ($method === 'GET') {
                $response = $client->get($url, $data);
            } else {
                $response = $client->post($url, $data);
            }

            // 401 durumunda token yenile ve tekrar dene
            if ($response->status() === 401) {
                Log::info('Entegra: 401 hatası, token yenileniyor');
                $newToken = $this->refreshAccessToken();
                
                if ($newToken) {
                    $client = Http::withHeaders([
                        'Authorization' => 'JWT ' . $newToken,
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                    ]);
                    
                    if ($method === 'GET') {
                        $response = $client->get($url, $data);
                    } else {
                        $response = $client->post($url, $data);
                    }
                }
            }

            return $response;
        } catch (\Throwable $e) {
            Log::error('Entegra Request Error: ' . $e->getMessage(), [
                'url' => $url,
                'method' => $method,
            ]);
            return null;
        }
    }

    /**
     * Test connection
     * Endpoint: GET /store/getMarketplaceQuantitySettings
     */
    public function testConnection()
    {
        try {
            $response = $this->makeRequest('GET', $this->baseUrl . '/store/getMarketplaceQuantitySettings');
            
            if ($response && $response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Bağlantı başarılı.',
                    'data' => $response->json()
                ];
            }

            // Alternatif endpoint dene
            $response = $this->makeRequest('GET', $this->baseUrl . '/store/getStores');
            
            if ($response && $response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Bağlantı başarılı.',
                    'data' => $response->json()
                ];
            }

            $errorMessage = 'Bağlantı başarısız';
            if ($response) {
                if ($response->status() === 401) {
                    $errorMessage = 'Kimlik doğrulama başarısız. E-posta ve şifrenizi kontrol edin.';
                } else {
                    $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
                }
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => $response ? $response->json() : null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Connection Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Bağlantı hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create an invoice in Entegra
     * Not: Entegra API'de fatura endpoint'i yok, sipariş oluşturma kullanılacak
     */
    public function createInvoice(array $invoiceData)
    {
        // Fatura endpoint'i olmadığı için sipariş oluşturma kullan
        return $this->syncOrder($invoiceData);
    }

    /**
     * Sync products from Entegra
     * Endpoint: GET /product/page={page}/
     */
    public function syncProducts($page = 1, $perPage = 100)
    {
        try {
            // URL'de sayfa numarası: /product/page=1/
            $url = $this->baseUrl . '/product/page=' . $page . '/';
            
            // Query parametreleri
            $queryParams = [];
            
            $response = $this->makeRequest('GET', $url, $queryParams);
            
            if ($response && $response->successful()) {
                $data = $response->json();
                
                // Response formatı: { "totalProduct": ..., "porductList": [...] }
                $products = $data['porductList'] ?? [];
                $totalProduct = $data['totalProduct'] ?? count($products);
                
                // Ürün verilerini normalize et
                $normalizedProducts = [];
                foreach ($products as $product) {
                    $normalizedProducts[] = [
                        'id' => $product['id'] ?? null,
                        'sku' => $product['productCode'] ?? null,
                        'name' => $product['name'] ?? '',
                        'description' => $product['description'] ?? '',
                        'price' => $product['price2'] ?? $product['price1'] ?? 0,
                        'cost' => $product['buying_price'] ?? 0,
                        'stock' => $product['quantity'] ?? 0,
                        'vat_rate' => $this->getKdvRate($product['kdv_id'] ?? 18),
                        'barcode' => $product['barcode'] ?? null,
                        'category' => $product['group'] ?? null,
                        'brand' => $product['brand'] ?? null,
                        'variations' => $product['variatios'] ?? [], // Typo in API: variatios
                    ];
                }
                
                return [
                    'success' => true,
                    'data' => $normalizedProducts,
                    'raw_data' => $data,
                    'message' => 'Ürünler başarıyla alındı.',
                    'pagination' => [
                        'page' => $page,
                        'per_page' => $perPage,
                        'total' => $totalProduct,
                        'has_more' => count($products) >= $perPage,
                    ]
                ];
            }

            $errorMessage = 'Ürünler alınamadı';
            if ($response) {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Products Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Ürün çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create product in Entegra
     * Endpoint: POST /product/
     * 
     * Zorunlu Alanlar:
     * - status (0 veya 1)
     * - quantity (integer)
     * - group (kategori ID)
     * - productName
     * - productCode
     * - barcode
     * - price1 (KDV hariç)
     * - kdv_id (0, 8, 10, 18)
     * - currencyType (TRL, USD, EUR, vb.)
     * - description
     * - supplier (Entegrator firma ismi)
     * - supplier_id (Unique code/SKU)
     */
    public function createProduct(array $productData)
    {
        try {
            $url = $this->baseUrl . '/product/';
            
            // Zorunlu alanları kontrol et (description opsiyonel)
            $requiredFields = ['status', 'quantity', 'group', 'productName', 'productCode', 'barcode', 'price1', 'kdv_id', 'currencyType'];
            foreach ($requiredFields as $field) {
                if (!isset($productData[$field])) {
                    return [
                        'success' => false,
                        'message' => "Zorunlu alan eksik: {$field}",
                        'data' => null
                    ];
                }
            }
            
            // Supplier ve supplier_id kontrolü (zorunlu ama default değerlerle sağlanabilir)
            if (empty($productData['supplier'])) {
                $productData['supplier'] = 'Manual'; // Default değer
            }
            if (empty($productData['supplier_id'])) {
                $productData['supplier_id'] = $productData['productCode'] ?? ''; // Default: productCode kullan
            }
            
            // Ana ürün payload'ı
            $productPayload = [
                // Zorunlu alanlar
                'status' => (int)($productData['status'] ?? 1),
                'quantity' => (int)($productData['quantity'] ?? 0),
                'group' => (int)($productData['group'] ?? 1),
                'productCode' => $productData['productCode'] ?? '',
                'productName' => $productData['productName'] ?? '',
                'barcode' => $productData['barcode'] ?? '',
                'price1' => (float)($productData['price1'] ?? 0),
                'kdv_id' => (int)($productData['kdv_id'] ?? 18),
                'currencyType' => $productData['currencyType'] ?? 'TRL',
                'description' => $productData['description'] ?? '',
                
                // Opsiyonel alanlar
                'brand' => $productData['brand'] ?? '',
                'product_pictures' => $productData['product_pictures'] ?? [],
                'variations' => [],
                
                // Opsiyonel fiyatlar
                'price2' => isset($productData['price2']) ? (float)$productData['price2'] : null,
                'price3' => isset($productData['price3']) ? (float)$productData['price3'] : null,
                'price4' => isset($productData['price4']) ? (float)$productData['price4'] : null,
                'price5' => isset($productData['price5']) ? (float)$productData['price5'] : null,
                'price6' => isset($productData['price6']) ? (float)$productData['price6'] : null,
                'price7' => isset($productData['price7']) ? (float)$productData['price7'] : null,
                'price8' => isset($productData['price8']) ? (float)$productData['price8'] : null,
                
                // Pazaryeri fiyatları
                'n11_price' => isset($productData['n11_price']) ? (float)$productData['n11_price'] : null,
                'n11_discountValue' => isset($productData['n11_discountValue']) ? (float)$productData['n11_discountValue'] : null,
                'n11pro_price' => isset($productData['n11pro_price']) ? (float)$productData['n11pro_price'] : null,
                'n11pro_discountValue' => isset($productData['n11pro_discountValue']) ? (float)$productData['n11pro_discountValue'] : null,
                'gg_buyNowPrice' => isset($productData['gg_buyNowPrice']) ? (float)$productData['gg_buyNowPrice'] : null,
                'gg_marketPrice' => isset($productData['gg_marketPrice']) ? (float)$productData['gg_marketPrice'] : null,
                'amazon_price' => isset($productData['amazon_price']) ? (float)$productData['amazon_price'] : null,
                'amazon_salePrice' => isset($productData['amazon_salePrice']) ? (float)$productData['amazon_salePrice'] : null,
                'sp_price' => isset($productData['sp_price']) ? (float)$productData['sp_price'] : null,
                'hb_price' => isset($productData['hb_price']) ? (float)$productData['hb_price'] : null,
                'eptt_price' => isset($productData['eptt_price']) ? (float)$productData['eptt_price'] : null,
                'eptt_iskonto' => isset($productData['eptt_iskonto']) ? (float)$productData['eptt_iskonto'] : null,
                'trendyol_listPrice' => isset($productData['trendyol_listPrice']) ? (float)$productData['trendyol_listPrice'] : null,
                'trendyol_salePrice' => isset($productData['trendyol_salePrice']) ? (float)$productData['trendyol_salePrice'] : null,
                'flo_listPrice' => isset($productData['flo_listPrice']) ? (float)$productData['flo_listPrice'] : null,
                'flo_salePrice' => isset($productData['flo_salePrice']) ? (float)$productData['flo_salePrice'] : null,
                'birvbiry_price1' => isset($productData['birvbiry_price1']) ? (float)$productData['birvbiry_price1'] : null,
                'birvbiry_price2' => isset($productData['birvbiry_price2']) ? (float)$productData['birvbiry_price2'] : null,
                'morhipo_listPrice' => isset($productData['morhipo_listPrice']) ? (float)$productData['morhipo_listPrice'] : null,
                'morhipo_salePrice' => isset($productData['morhipo_salePrice']) ? (float)$productData['morhipo_salePrice'] : null,
                'farmazon_price' => isset($productData['farmazon_price']) ? (float)$productData['farmazon_price'] : null,
                'farmazon_market_price' => isset($productData['farmazon_market_price']) ? (float)$productData['farmazon_market_price'] : null,
                'mizu_price1' => isset($productData['mizu_price1']) ? (float)$productData['mizu_price1'] : null,
                'mizu_price2' => isset($productData['mizu_price2']) ? (float)$productData['mizu_price2'] : null,
                'zebramo_listPrice' => isset($productData['zebramo_listPrice']) ? (float)$productData['zebramo_listPrice'] : null,
                'zebramo_salePrice' => isset($productData['zebramo_salePrice']) ? (float)$productData['zebramo_salePrice'] : null,
                'novadan_price' => isset($productData['novadan_price']) ? (float)$productData['novadan_price'] : null,
                'lidyana_listPrice' => isset($productData['lidyana_listPrice']) ? (float)$productData['lidyana_listPrice'] : null,
                'lidyana_salePrice' => isset($productData['lidyana_salePrice']) ? (float)$productData['lidyana_salePrice'] : null,
                'modanisa_listPrice' => isset($productData['modanisa_listPrice']) ? (float)$productData['modanisa_listPrice'] : null,
                'modanisa_salePrice' => isset($productData['modanisa_salePrice']) ? (float)$productData['modanisa_salePrice'] : null,
                'aliexpress_price' => isset($productData['aliexpress_price']) ? (float)$productData['aliexpress_price'] : null,
                'amazonEu_price' => isset($productData['amazonEu_price']) ? (float)$productData['amazonEu_price'] : null,
                'amazonFr_price' => isset($productData['amazonFr_price']) ? (float)$productData['amazonFr_price'] : null,
                'joom_price' => isset($productData['joom_price']) ? (float)$productData['joom_price'] : null,
                
                // Fiziksel özellikler
                'depth' => isset($productData['depth']) ? (float)$productData['depth'] : null,
                'width' => isset($productData['width']) ? (float)$productData['width'] : null,
                'height' => isset($productData['height']) ? (float)$productData['height'] : null,
                'desi' => isset($productData['desi']) ? (float)$productData['desi'] : null,
                'agirlik' => isset($productData['agirlik']) ? (float)$productData['agirlik'] : null,
                
                // Diğer opsiyonel alanlar
                'country_of_origin' => $productData['country_of_origin'] ?? null,
                'miad' => $productData['miad'] ?? null,
                'sub_name' => $productData['sub_name'] ?? null,
                'invoice_name' => $productData['invoice_name'] ?? null,
                'warehouse_rack_number' => $productData['warehouse_rack_number'] ?? null,
                
                // Supplier bilgileri (zorunlu)
                'supplier' => $productData['supplier'] ?? 'Manual',
                'supplier_id' => $productData['supplier_id'] ?? $productData['productCode'] ?? '',
            ];
            
            // Null değerleri temizle (sadece set edilmiş değerleri gönder)
            $productPayload = array_filter($productPayload, function($value) {
                return $value !== null;
            });
            
            // Varyasyonları işle
            if (isset($productData['variations']) && is_array($productData['variations'])) {
                $variations = [];
                foreach ($productData['variations'] as $variation) {
                    // Varyasyon zorunlu alanları kontrol et
                    if (!isset($variation['barcode']) || !isset($variation['productCode']) || !isset($variation['quantity'])) {
                        continue; // Varyasyonu atla
                    }
                    
                    $variationPayload = [
                        'barcode' => $variation['barcode'],
                        'productCode' => $variation['productCode'],
                        'quantity' => (int)$variation['quantity'],
                        'subtract' => isset($variation['subtract']) ? (int)$variation['subtract'] : null,
                        'price' => isset($variation['price']) ? (float)$variation['price'] : null,
                        'price_prefix' => $variation['price_prefix'] ?? '+',
                        'points' => isset($variation['points']) ? (int)$variation['points'] : null,
                        'points_prefix' => $variation['points_prefix'] ?? '+',
                        'width' => isset($variation['width']) ? (float)$variation['width'] : null,
                        'weight_prefix' => $variation['weight_prefix'] ?? '+',
                        'variation_specs' => $variation['variation_specs'] ?? [],
                        'variation_pictures' => $variation['variation_pictures'] ?? [],
                        'itemdim1code' => $variation['itemdim1code'] ?? null,
                        'itemdim2code' => $variation['itemdim2code'] ?? null,
                    ];
                    
                    // Varyasyon için renk kontrolü (eğer varyasyon varsa ve resim varsa renk zorunlu)
                    if (!empty($variationPayload['variation_pictures'])) {
                        $hasColor = false;
                        foreach ($variationPayload['variation_specs'] as $spec) {
                            if (isset($spec['name']) && strtolower($spec['name']) === 'renk') {
                                $hasColor = true;
                                break;
                            }
                        }
                        if (!$hasColor) {
                            Log::warning('Entegra: Varyasyon resmi var ama renk bilgisi yok', [
                                'productCode' => $variationPayload['productCode']
                            ]);
                        }
                    }
                    
                    // Null değerleri temizle
                    $variationPayload = array_filter($variationPayload, function($value) {
                        return $value !== null;
                    });
                    
                    $variations[] = $variationPayload;
                }
                
                $productPayload['variations'] = $variations;
            }
            
            // Request formatı: { "list": [{ ... }] }
            $payload = [
                'list' => [$productPayload]
            ];
            
            $response = $this->makeRequest('POST', $url, $payload);
            
            if ($response && $response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => true,
                    'data' => $responseData,
                    'message' => 'Ürün başarıyla oluşturuldu.',
                    'product_id' => $responseData['id'] ?? ($responseData['list'][0]['id'] ?? null),
                ];
            }

            $errorMessage = 'Ürün oluşturulamadı';
            if ($response) {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => $response ? $response->json() : null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Create Product Error: ' . $e->getMessage(), [
                'product_data' => $productData,
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Ürün oluşturma hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create order in Entegra
     * Endpoint: POST /order/ (tahmin edilen)
     */
    public function createOrder(array $orderData)
    {
        try {
            $url = $this->baseUrl . '/order/';
            
            // Sipariş payload'ı oluştur
            $payload = [
                'customer_id' => $orderData['customer_id'] ?? null,
                'firstname' => $orderData['firstname'] ?? '',
                'lastname' => $orderData['lastname'] ?? '',
                'email' => $orderData['email'] ?? '',
                'mobil_phone' => $orderData['mobil_phone'] ?? $orderData['phone'] ?? '',
                'telephone' => $orderData['telephone'] ?? '',
                'invoice_address' => $orderData['invoice_address'] ?? '',
                'invoice_city' => $orderData['invoice_city'] ?? '',
                'invoice_district' => $orderData['invoice_district'] ?? '',
                'invoice_postcode' => $orderData['invoice_postcode'] ?? '',
                'ship_address' => $orderData['ship_address'] ?? $orderData['invoice_address'] ?? '',
                'ship_city' => $orderData['ship_city'] ?? $orderData['invoice_city'] ?? '',
                'ship_district' => $orderData['ship_district'] ?? $orderData['invoice_district'] ?? '',
                'ship_postcode' => $orderData['ship_postcode'] ?? $orderData['invoice_postcode'] ?? '',
                'total' => $orderData['total'] ?? 0,
                'grand_total' => $orderData['grand_total'] ?? $orderData['total'] ?? 0,
                'order_product' => $orderData['order_product'] ?? [],
            ];
            
            $response = $this->makeRequest('POST', $url, $payload);
            
            if ($response && $response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => true,
                    'data' => $responseData,
                    'message' => 'Sipariş başarıyla oluşturuldu.',
                    'order_id' => $responseData['id'] ?? null,
                    'order_number' => $responseData['no'] ?? $responseData['order_number'] ?? null,
                ];
            }

            $errorMessage = 'Sipariş oluşturulamadı';
            if ($response) {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => $response ? $response->json() : null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Create Order Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Sipariş oluşturma hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Sync order from Marketplace to Entegra
     */
    public function syncOrder($order)
    {
        try {
            // Order model'den veri çıkar
            $orderData = [];
            
            if (is_object($order)) {
                $customer = $order->customer ?? null;
                $address = $order->address ?? null;
                
                // Sipariş ürünleri
                $orderProducts = [];
                if (isset($order->products)) {
                    foreach ($order->products as $product) {
                        $orderProducts[] = [
                            'product_id' => $product->id ?? null,
                            'name' => $product->name ?? '',
                            'model' => $product->sku ?? '',
                            'quantity' => $product->pivot->quantity ?? 1,
                            'price' => $product->pivot->price ?? 0,
                            'total' => ($product->pivot->quantity ?? 1) * ($product->pivot->price ?? 0),
                        ];
                    }
                }
                
                $orderData = [
                    'customer_id' => $customer->id ?? null,
                    'firstname' => ($customer && isset($customer->user)) ? explode(' ', $customer->user->name ?? 'Müşteri')[0] : 'Müşteri',
                    'lastname' => ($customer && isset($customer->user)) ? (count(explode(' ', $customer->user->name ?? '')) > 1 ? implode(' ', array_slice(explode(' ', $customer->user->name), 1)) : '') : '',
                    'email' => ($customer && isset($customer->user)) ? $customer->user->email : '',
                    'mobil_phone' => $address->phone ?? '',
                    'telephone' => $address->phone ?? '',
                    'invoice_address' => $address->address ?? '',
                    'invoice_city' => $address->city ?? '',
                    'invoice_district' => $address->district ?? '',
                    'invoice_postcode' => $address->postal_code ?? '',
                    'ship_address' => $address->address ?? '',
                    'ship_city' => $address->city ?? '',
                    'ship_district' => $address->district ?? '',
                    'ship_postcode' => $address->postal_code ?? '',
                    'total' => $order->payable_amount ?? 0,
                    'grand_total' => $order->payable_amount ?? 0,
                    'order_product' => $orderProducts,
                ];
            } else {
                // Array olarak gelirse direkt kullan
                $orderData = $order;
            }
            
            return $this->createOrder($orderData);
        } catch (\Throwable $e) {
            Log::error('Entegra Sync Order Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Sipariş senkronizasyonu hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get categories
     * Endpoint: GET /category/page={page}/
     */
    public function getCategories($page = 1, $filters = [])
    {
        try {
            $url = $this->baseUrl . '/category/page=' . $page . '/';
            
            $queryParams = [];
            if (isset($filters['id'])) {
                $queryParams['id'] = $filters['id'];
            }
            if (isset($filters['name'])) {
                // Özel karakter dönüşümü (& → UTF-8)
                $queryParams['name'] = mb_convert_encoding($filters['name'], 'UTF-8', 'UTF-8');
            }
            
            $response = $this->makeRequest('GET', $url, $queryParams);
            
            if ($response && $response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data['categories'] ?? [],
                    'message' => 'Kategoriler başarıyla alındı.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Kategoriler alınamadı',
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Get Categories Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Kategori çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get stores
     * Endpoint: GET /store/getStores
     */
    public function getStores()
    {
        try {
            $url = $this->baseUrl . '/store/getStores';
            $response = $this->makeRequest('GET', $url);
            
            if ($response && $response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data['stores'] ?? [],
                    'message' => 'Depolar başarıyla alındı.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Depolar alınamadı',
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Get Stores Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Depo çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get marketplace quantity settings
     * Endpoint: GET /store/getMarketplaceQuantitySettings
     */
    public function getMarketplaceQuantitySettings()
    {
        try {
            $url = $this->baseUrl . '/store/getMarketplaceQuantitySettings';
            $response = $this->makeRequest('GET', $url);
            
            if ($response && $response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data,
                    'message' => 'Pazaryeri depo ayarları başarıyla alındı.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Pazaryeri depo ayarları alınamadı',
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Get Marketplace Quantity Settings Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Pazaryeri depo ayarları çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get customers
     * Endpoint: GET /customer/page={page}/
     */
    public function getCustomers($page = 1, $filters = [])
    {
        try {
            $url = $this->baseUrl . '/customer/page=' . $page . '/';
            
            $queryParams = [];
            if (isset($filters['cariCode'])) {
                $queryParams['cariCode'] = $filters['cariCode'];
            }
            if (isset($filters['orderId'])) {
                $queryParams['orderId'] = $filters['orderId'];
            }
            if (isset($filters['email'])) {
                // Email şifreleme desteği (UTF-8 dönüşümü)
                $queryParams['email'] = mb_convert_encoding($filters['email'], 'UTF-8', 'UTF-8');
            }
            
            $response = $this->makeRequest('GET', $url, $queryParams);
            
            if ($response && $response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data['customers'] ?? $data,
                    'message' => 'Müşteriler başarıyla alındı.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Müşteriler alınamadı',
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Get Customers Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Müşteri çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get prices
     * Endpoint: GET /price/getPrices
     */
    public function getPrices()
    {
        try {
            $url = $this->baseUrl . '/price/getPrices';
            $response = $this->makeRequest('GET', $url);
            
            if ($response && $response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data['prices'] ?? [],
                    'message' => 'Fiyatlar başarıyla alındı.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Fiyatlar alınamadı',
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Get Prices Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Fiyat çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get orders
     * Endpoint: GET /order/page={page}/
     */
    public function getOrders($page = 1, $filters = [])
    {
        try {
            $url = $this->baseUrl . '/order/page=' . $page . '/';
            
            $queryParams = [];
            if (isset($filters['limit'])) {
                $queryParams['limit'] = min($filters['limit'], 200); // Max 200
            }
            if (isset($filters['id'])) {
                $queryParams['id'] = $filters['id'];
            }
            if (isset($filters['order_number'])) {
                $queryParams['order_number'] = $filters['order_number'];
            }
            if (isset($filters['supplier'])) {
                $queryParams['supplier'] = $filters['supplier'];
            }
            if (isset($filters['status'])) {
                $queryParams['status'] = $filters['status'];
            }
            if (isset($filters['start_date'])) {
                $queryParams['start_date'] = $filters['start_date'];
            }
            if (isset($filters['end_date'])) {
                $queryParams['end_date'] = $filters['end_date'];
            }
            
            $response = $this->makeRequest('GET', $url, $queryParams);
            
            if ($response && $response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data['orders'] ?? [],
                    'total' => $data['totalOrder'] ?? 0,
                    'message' => 'Siparişler başarıyla alındı.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Siparişler alınamadı',
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Get Orders Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Sipariş çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get single order
     * Endpoint: GET /order/page=1/?id={orderId}
     */
    public function getOrder($orderId)
    {
        try {
            $result = $this->getOrders(1, ['id' => $orderId]);
            
            if ($result['success'] && !empty($result['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data'][0] ?? null,
                    'message' => 'Sipariş başarıyla alındı.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Sipariş bulunamadı',
                'data' => null
            ];
        } catch (\Throwable $e) {
            Log::error('Entegra Get Order Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Sipariş çekme hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get KDV rate from kdv_id
     */
    private function getKdvRate($kdvId)
    {
        $rates = [
            0 => 0,
            8 => 8,
            10 => 10,
            18 => 18,
        ];
        
        return $rates[$kdvId] ?? 18;
    }
}
