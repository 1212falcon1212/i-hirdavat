<?php

namespace Modules\ERP\Drivers;

use Modules\ERP\Contracts\ERPDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class StockMountDriver implements ERPDriverInterface
{
    protected $username;
    protected $password;
    protected $apiKey;
    protected $apiPassword;
    protected $apiCode; // Token received from DoLogin
    protected $storeId; // StoreId (UserId) received from DoLogin
    protected $baseUrl = 'https://out.stockmount.com';

    public function __construct($credentials)
    {
        // Support both username/password and ApiKey/ApiPassword methods
        $this->username = $credentials['username'] ?? null;
        $this->password = $credentials['password'] ?? null;
        $this->apiKey = $credentials['api_key'] ?? null;
        $this->apiPassword = $credentials['api_password'] ?? null;
        
        // Check if we have a cached token and storeId
        $cacheKey = 'stockmount_token_' . md5($this->username . $this->apiKey);
        $cachedData = Cache::get($cacheKey);
        
        if (is_array($cachedData)) {
            $this->apiCode = $cachedData['api_code'] ?? null;
            $this->storeId = $cachedData['store_id'] ?? null;
        } else {
            // Legacy cache support (just string)
            $this->apiCode = $cachedData;
        }
    }

    /**
     * Get authenticated HTTP client
     */
    private function getHttpClient()
    {
        return Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ]);
    }

    /**
     * DoLogin - Get API token
     * POST https://out.stockmount.com/api/user/dologin
     */
    public function doLogin()
    {
        try {
            $loginData = [];
            
            // Method 1: Username + Password (sent directly, NOT wrapped in Login object)
            if ($this->username && $this->password) {
                $loginData = [
                    'Username' => $this->username,
                    'Password' => $this->password,
                ];
            }
            // Method 2: ApiKey + ApiPassword
            elseif ($this->apiKey && $this->apiPassword) {
                $loginData = [
                    'ApiKey' => $this->apiKey,
                    'ApiPassword' => $this->apiPassword,
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Giriş bilgileri eksik. Username/Password veya ApiKey/ApiPassword gerekli.',
                    'data' => null
                ];
            }

            Log::info('StockMount DoLogin Request', [
                'url' => $this->baseUrl . '/api/user/dologin',
            ]);

            $response = $this->getHttpClient()->post($this->baseUrl . '/api/user/dologin', $loginData);
            $data = $response->json();

            Log::info('StockMount DoLogin Response', [
                'status' => $response->status(),
                'body' => $response->body(),
                'result' => $data['Result'] ?? null,
                'message' => $data['Message'] ?? null,
                'error_code' => $data['ErrorCode'] ?? null,
                'error_message' => $data['ErrorMessage'] ?? null,
            ]);

            if ($response->successful() && ($data['Result'] ?? false)) {
                $this->apiCode = $data['Response']['ApiCode'] ?? null;
                // StoreId must be fetched separately
                $this->storeId = null;
                
                // Cache the token for 1 hour
                if ($this->apiCode) {
                    $cacheKey = 'stockmount_token_' . md5($this->username . $this->apiKey);
                    // We only cache ApiCode here, StoreId will be cached separately or we can update this later
                    Cache::put($cacheKey, [
                        'api_code' => $this->apiCode,
                        'store_id' => null
                    ], 3600);
                }

                return [
                    'success' => true,
                    'message' => 'Giriş başarılı.',
                    'data' => $data['Response'],
                    'api_code' => $this->apiCode,
                ];
            }

            return [
                'success' => false,
                'message' => $data['ErrorMessage'] ?? $data['Message'] ?? 'Giriş başarısız.',
                'error_code' => $data['ErrorCode'] ?? null,
                'data' => $data
            ];
        } catch (\Throwable $e) {
            Log::error('StockMount DoLogin Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Giriş hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Ensure we have a valid token
     */
    private function ensureAuthenticated()
    {
        if (!$this->apiCode) {
            $loginResult = $this->doLogin();
            if (!$loginResult['success']) {
                return $loginResult;
            }
        }
        return ['success' => true, 'api_code' => $this->apiCode];
    }

    /**
     * Test connection using DoLogin
     */
    public function testConnection()
    {
        $result = $this->doLogin();
        
        if ($result['success']) {
            return [
                'success' => true,
                'message' => 'Bağlantı başarılı. Hoş geldiniz ' . ($result['data']['Name'] ?? '') . ' ' . ($result['data']['Surname'] ?? ''),
                'data' => [
                    'user_id' => $result['data']['UserId'] ?? null,
                    'username' => $result['data']['Username'] ?? null,
                    'email' => $result['data']['Email'] ?? null,
                    'package_end_date' => $result['data']['PackageEndDate'] ?? null,
                ]
            ];
        }

        return $result;
    }



    /**
     * GetStores - Fetch available stores
     */
    public function getStores()
    {
        $authResult = $this->ensureAuthenticated();
        if (!$authResult['success']) {
            return $authResult;
        }

        Log::info('StockMount GetStores Request', ['url' => $this->baseUrl . '/api/Integration/GetStore']);

        // Try direct ApiCode
        $response = $this->getHttpClient()->post($this->baseUrl . '/api/Integration/GetStore', [
            'ApiCode' => $this->apiCode
        ]);
        
        $data = $response->json();

        Log::info('StockMount GetStores Response', [
            'status' => $response->status(),
            'result' => $data['Result'] ?? null,
            'message' => $data['Message'] ?? null,
            'count' => isset($data['Response']) ? count($data['Response']) : 0,
            'data' => $data['Response'] ?? null,
        ]);

        if ($response->successful() && ($data['Result'] ?? false)) {
            return [
                'success' => true,
                'data' => $data['Response'] ?? []
            ];
        }

        return [
            'success' => false,
            'message' => $data['ErrorMessage'] ?? 'Mağaza listesi alınamadı.',
            'data' => $data
        ];
    }

    /**
     * Ensure we have a valid StoreId
     */
    private function ensureStoreId()
    {
        if ($this->storeId) {
            return ['success' => true];
        }

        // Try to get from cache first
        $cacheKey = 'stockmount_store_' . md5($this->username . $this->apiKey);
        $cachedId = Cache::get($cacheKey);
        
        if ($cachedId) {
            $this->storeId = $cachedId;
            return ['success' => true];
        }

        // Fetch from API
        $result = $this->getStores();
        if ($result['success'] && !empty($result['data'])) {
            // Find StockMount store
            foreach ($result['data'] as $store) {
                // Case insensitive check just in case
                if (stripos($store['IntegrationName'] ?? '', 'StockMount') !== false) {
                    $this->storeId = $store['StoreId'];
                    break;
                }
            }
            
            // Fallback to first store if StockMount specific one not found
            if (!$this->storeId && !empty($result['data'])) {
                $this->storeId = $result['data'][0]['StoreId'];
            }

            if ($this->storeId) {
                Cache::put($cacheKey, $this->storeId, 86400); // Cache for 24 hours
                return ['success' => true];
            }
        }

        return [
            'success' => false,
            'message' => 'Geçerli bir Mağaza (Store) bulunamadı. ' . ($result['message'] ?? '')
        ];
    }

    /**
     * Get Product Sources
     */
    public function getProductSources()
    {
        $authResult = $this->ensureAuthenticated();
        if (!$authResult['success']) {
            return $authResult;
        }

        $response = $this->getHttpClient()->post($this->baseUrl . '/api/Product/GetProductSources', [
            'ApiCode' => $this->apiCode
        ]);
        
        $data = $response->json();

        if ($response->successful() && ($data['Result'] ?? false)) {
            return [
                'success' => true,
                'data' => $data['Response'] ?? []
            ];
        }

        return [
            'success' => false,
            'message' => $data['ErrorMessage'] ?? 'Ürün kaynakları alınamadı.',
            'data' => $data
        ];
    }

    /**
     * Get Currencies
     */
    public function getCurrencies()
    {
        $authResult = $this->ensureAuthenticated();
        if (!$authResult['success']) {
            return $authResult;
        }

        $response = $this->getHttpClient()->post($this->baseUrl . '/api/System/GetCurrencies', [
            'ApiCode' => $this->apiCode
        ]);
            
        $data = $response->json();

        if ($response->successful() && ($data['Result'] ?? false)) {
            return [
                'success' => true,
                'data' => $data['Response'] ?? []
            ];
        }

        return [
            'success' => false,
            'message' => $data['ErrorMessage'] ?? 'Para birimleri işlemedi.',
            'data' => $data
        ];
    }

    /**
     * Get Products from specific source
     */
    public function getProducts($sourceId, $page = 1, $limit = 100)
    {
        $authResult = $this->ensureAuthenticated();
        if (!$authResult['success']) {
            return $authResult;
        }

        $criteria = [
            'ApiCode' => $this->apiCode,
            'ProductSourceId' => $sourceId,
            'RowsByPage' => $limit,
            'PageIndex' => $page,
            // 'ProductStatus' => 1, // Optional: Only active products?
        ];

        $response = $this->getHttpClient()->post($this->baseUrl . '/api/Product/GetProducts', $criteria);
            
        $data = $response->json();

        if ($response->successful() && ($data['Result'] ?? false)) {
            return [
                'success' => true,
                'data' => $data['Response'] ?? []
            ];
        }

        return [
            'success' => false,
            'message' => $data['ErrorMessage'] ?? 'Ürünler alınamadı.',
            'data' => $data
        ];
    }

    /**
     * Sync products from ERP (Interface Implementation)
     */
    public function syncProducts($page = 1, $perPage = 100)
    {
        // 1. Get Sources
        $sourcesResult = $this->getProductSources();
        if (!$sourcesResult['success']) {
            return $sourcesResult;
        }

        if (empty($sourcesResult['data'])) {
            return [
                'success' => false,
                'message' => 'Hiç ürün kaynağı bulunamadı.',
                'data' => []
            ];
        }

        // Ideally we should let user choose source, but for now pick the first one 
        // or look for "StockMount" named source if needed.
        // For now: First source.
        $sourceId = $sourcesResult['data'][0]['ProductSourceId'];

        // 2. Get Products
        $productsResult = $this->getProducts($sourceId, $page, $perPage);
        
        if (!$productsResult['success']) {
            return $productsResult;
        }

        $responseData = $productsResult['data'];
        $rawProducts = $responseData['Products'] ?? [];
        $total = $responseData['TotalProductCount'] ?? 0;

        // Map to standardized format
        $products = [];
        foreach ($rawProducts as $item) {
            $products[] = [
                'id' => $item['ProductId'] ?? null,
                'erp_product_id' => $item['ProductId'] ?? null,
                'sku' => $item['Code'] ?? '',
                'barcode' => $item['Barcode'] ?? '',
                'name' => $item['Name'] ?? '',
                'category' => $item['Category'] ?? '',
                'brand' => $item['Brand'] ?? '',
                'stock' => $item['Quantity'] ?? 0,
                'price' => $item['Price'] ?? 0,
                'cost' => $item['BuyPrice'] ?? 0, // Assuming BuyPrice exists or 0
                'vat_rate' => $item['TaxRate'] ?? 0,
                'description' => $item['Description'] ?? ($item['Subtitle'] ?? ''),
                'images' => !empty($item['Image']) ? [$item['Image']] : [],
                'raw_data' => $item
            ];
        }

        return [
            'success' => true,
            'message' => 'Ürünler başarıyla çekildi.',
            'data' => $products,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'has_more' => ($page * $perPage) < $total
            ]
        ];
    }

    /**
     * Add Product to StockMount
     * POST https://out.stockmount.com/api/Product/AddProduct
     */
    public function addProduct(array $productData)
    {
        $authResult = $this->ensureAuthenticated();
        if (!$authResult['success']) {
            return $authResult;
        }

        // Product object fields at root level
        $body = array_merge([
            'ApiCode' => $this->apiCode,
            'ProductSourceId' => 7723, // Default Source from discovery
            'CurrencyId' => 1, // Default TRY
            'Quantity' => 10,
            'TaxRate' => 20,
            'Category' => 'Genel',
            'Images' => [], // Required list
            'Status' => 1, // Active
        ], $productData);

        Log::info('StockMount AddProduct Request', ['body' => $body]);

        $response = $this->getHttpClient()->post($this->baseUrl . '/api/Product/AddProduct', $body);

        $data = $response->json();
        
        Log::info('StockMount AddProduct Response', ['status' => $response->status(), 'data' => $data]);

        if ($response->successful() && ($data['Result'] ?? false)) {
            return [
                'success' => true,
                'data' => $data['Response'] ?? null
            ];
        }

        return [
            'success' => false,
            'message' => $data['ErrorMessage'] ?? 'Ürün eklenemedi.',
            'data' => $data
        ];
    }

    /**
     * SetOrder - Create order in StockMount
     * POST https://out.stockmount.com/api/Integration/SetOrder
     * 
     * @param array $orderData Order data with criteria
     * @return array
     */
    public function createOrder(array $orderData)
    {
        try {
            // Ensure we have a valid token
            $authResult = $this->ensureAuthenticated();
            if (!$authResult['success']) {
                return $authResult;
            }

            // Ensure we have a valid StoreId
            $storeResult = $this->ensureStoreId();
            if (!$storeResult['success']) {
                return $storeResult;
            }

            $criteria = [
                'IntegrationOrderCode' => $orderData['order_code'] ?? null,
                'Nickname' => $orderData['nickname'] ?? $orderData['name'] . ' ' . $orderData['surname'], // Nickname is required
                'Fullname' => $orderData['fullname'] ?? $orderData['name'] . ' ' . $orderData['surname'], // Fullname is required
                'Name' => $orderData['name'] ?? '',
                'Surname' => $orderData['surname'] ?? '',
                'CompanyTitle' => $orderData['company_title'] ?? 'Bireysel', // Required field from Repo
                'OrderDate' => $orderData['order_date'] ?? now()->toIso8601String(),
                'ListingStatus' => $orderData['order_status'] ?? 'New', // Changed from OrderStatus based on Repo
                'OrderStatus' => $orderData['order_status'] ?? 'New', // Keeping legacy just in case
                'PersonalIdentification' => $orderData['personal_id'] ?? '',
                'TaxNumber' => $orderData['tax_number'] ?? '',
                'TaxAuthority' => $orderData['tax_authority'] ?? '',
                'Telephone' => $orderData['telephone'] ?? '',
                'Address' => $orderData['address'] ?? '',
                'District' => $orderData['district'] ?? '',
                'City' => $orderData['city'] ?? '',
                'ZipCode' => '34000', // Added ZipCode
                'Notes' => $orderData['notes'] ?? '',
                'OrderDetails' => [],
            ];

            // Add order details (products)
            if (isset($orderData['items']) && is_array($orderData['items'])) {
                foreach ($orderData['items'] as $item) {
                    
                    // Auto-Add Product (Safeguard)
                    $prodCode = (string)($item['product_code'] ?? $item['sku'] ?? '');
                    if ($prodCode) {
                        try {
                            // Basic product data for auto-creation
                            $this->addProduct([
                                'Code' => $prodCode,
                                'Name' => $item['product_name'] ?? $item['name'] ?? 'Urun ' . $prodCode,
                                'Price' => $item['price'] ?? 10.0,
                                // Category, Currency etc are handled in addProduct defaults
                                'Description' => 'Siparis esnasinda otomatik olusturuldu',
                                'Barcode' => $item['barcode'] ?? '',
                            ]);
                        } catch (\Exception $e) {
                            Log::warning('StockMount Auto-Add Product Failed: ' . $e->getMessage());
                        }
                    }

                    $criteria['OrderDetails'][] = [
                        'IntegrationProductCode' => $prodCode,
                        'ProductName' => $item['product_name'] ?? $item['name'] ?? '',
                        'Quantity' => $item['quantity'] ?? 1,
                        'Price' => $item['price'] ?? 0,
                        'Telephone' => $item['telephone'] ?? $orderData['telephone'] ?? '',
                        'Address' => $item['address'] ?? $orderData['address'] ?? '',
                        'District' => $item['district'] ?? $orderData['district'] ?? '',
                        'City' => $item['city'] ?? $orderData['city'] ?? '',
                        'ZipCode' => '34000', // Added ZipCode to details
                        'DeliveryTitle' => $item['delivery_title'] ?? ($orderData['name'] ?? '') . ' ' . ($orderData['surname'] ?? ''),
                        'TaxRate' => $item['tax_rate'] ?? 20,
                        'Barcode' => $item['barcode'] ?? '',
                        'ProductCode' => (string)($item['product_code'] ?? ''),
                        'CargoPayment' => 'Buyer', // Added CargoPayment
                    ];
                }
            }

            // Construct Payload: ApiCode, StoreId, and Order wrapper
            $payload = [
                'ApiCode' => $this->apiCode,
                'StoreId' => $this->storeId,
                'Order' => $criteria
            ];

            Log::info('StockMount SetOrder Request', [
                'url' => $this->baseUrl . '/api/Integration/SetOrder',
                'order_code' => $criteria['IntegrationOrderCode'],
                'items_count' => count($criteria['OrderDetails']),
                'store_id' => $this->storeId,
                'body' => $payload,
            ]);

            Log::info('StockMount CreateOrder Payload:', $payload);

        $response = $this->getHttpClient()->post($this->baseUrl . '/api/Integration/SetOrder', $payload);
        
        Log::info('StockMount CreateOrder Response:', ['status' => $response->status(), 'body' => $response->body()]);

            $data = $response->json();

            Log::info('StockMount SetOrder Response', [
                'status' => $response->status(),
                'result' => $data['Result'] ?? null,
                'response' => $data['Response'] ?? null,
            ]);

            // Check for session expired error
            if (($data['ErrorCode'] ?? '') === '00006') {
                // Token expired, clear cache and retry
                $cacheKey = 'stockmount_token_' . md5($this->username . $this->apiKey);
                Cache::forget($cacheKey);
                $this->apiCode = null;
                
                // Retry once
                return $this->createOrder($orderData);
            }

            if ($response->successful() && ($data['Result'] ?? false)) {
                return [
                    'success' => true,
                    'message' => 'Sipariş başarıyla oluşturuldu.',
                    'data' => $data['Response'],
                    'order_id' => $data['Response']['OrderId'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => $data['ErrorMessage'] ?? $data['Message'] ?? 'Sipariş oluşturulamadı.',
                'error_code' => $data['ErrorCode'] ?? null,
                'data' => $data
            ];
        } catch (\Throwable $e) {
            Log::error('StockMount SetOrder Error: ' . $e->getMessage(), [
                'order_data' => $orderData,
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Sipariş oluşturma hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Sync order from our system to StockMount
     * This method converts our Order model to StockMount format
     * 
     * @param mixed $order Order model
     * @return array
     */
    public function syncOrder($order)
    {
        // Convert order to StockMount format
        $customer = $order->customer ?? null;
        $user = $customer->user ?? null;
        
        // Try to get invoice address first, then delivery, then generic address
        $addressObj = $order->invoiceAddress ?? $order->deliveryAddress ?? $order->address ?? null;

        // Extract address text robustly
        $addressText = $addressObj->address ?? $addressObj->address_line_1 ?? '';
        if (empty($addressText) && $addressObj) {
            $parts = [];
            if (!empty($addressObj->street)) $parts[] = $addressObj->street;
            if (!empty($addressObj->building_no)) $parts[] = 'No:' . $addressObj->building_no;
            if (!empty($addressObj->apartment_no)) $parts[] = 'D:' . $addressObj->apartment_no;
            if (!empty($addressObj->neighborhood)) $parts[] = $addressObj->neighborhood;
            $addressText = implode(' ', $parts);
        }
        if (empty($addressText)) {
            $addressText = 'Adres Belirtilmemis'; // Fallback to avoid empty validation error
        }

        // Extract city/district
        $city = $addressObj->city ?? $addressObj->province ?? '';
        $district = $addressObj->district ?? $addressObj->area ?? '';
        
        // If city is empty but district looks like a city (e.g. Adana), swap/fallback
        if (empty($city) && !empty($district)) {
            $city = $district;
            $district = 'Merkez';
        }
        if (empty($city)) {
             $city = 'Istanbul'; 
        }

        $orderData = [
            'order_code' => $order->prefix . $order->order_code,
            'nickname' => $user->name ?? 'Müşteri',
            'name' => $this->getFirstName($user->name ?? ''),
            'surname' => $this->getLastName($user->name ?? ''),
            'fullname' => $user->name ?? '',
            // Add CompanyTitle which is required based on repo check
            'company_title' => $addressObj->company_name ?? $user->name ?? 'Bireysel',
            'order_status' => 'New',
            'order_date' => $order->created_at->toIso8601String(),
            'telephone' => $addressObj->phone ?? $addressObj->mobile ?? $user->phone ?? '5550000000',
            'address' => $addressText . ' ' . $district . ' ' . $city, // Append locations to address to be safe
            'district' => $district,
            'city' => $city,
            'notes' => $order->order_note ?? '',
            'items' => [],
        ];

        // Add products
        foreach ($order->products as $product) {
            $orderData['items'][] = [
                'product_code' => $product->sku ?? $product->id,
                'product_name' => $product->name,
                'quantity' => $product->pivot->quantity,
                'price' => $product->pivot->price,
                'tax_rate' => $product->vat_rate ?? $product->tax ?? 20,
                'barcode' => $product->barcode ?? '',
            ];
        }

        return $this->createOrder($orderData);
    }

    /**
     * Create invoice (delegates to createOrder for StockMount)
     */
    public function createInvoice(array $invoiceData)
    {
        // StockMount uses order creation, not separate invoice
        return $this->createOrder($invoiceData);
    }



    /**
     * Helper: Get first name from full name
     */
    private function getFirstName($fullName)
    {
        $parts = explode(' ', trim($fullName));
        return $parts[0] ?? '';
    }

    /**
     * Helper: Get last name from full name
     */
    private function getLastName($fullName)
    {
        $parts = explode(' ', trim($fullName));
        array_shift($parts);
        return implode(' ', $parts) ?: '';
    }
}
