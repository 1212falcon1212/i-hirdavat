<?php

namespace Modules\ERP\Drivers;

use Modules\ERP\Contracts\ERPDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BizimHesapDriver implements ERPDriverInterface
{
    protected $firmId;
    protected $apiKey;  // Key header
    protected $token;   // Token header
    protected $baseUrl = 'https://bizimhesap.com/api/b2b';

    public function __construct($credentials)
    {
        $this->firmId = $credentials['firm_id'] ?? null;
        // Use provided api_key or default static key from docs
        $this->apiKey = !empty($credentials['api_key']) ? $credentials['api_key'] : 'BZMHB2B724018943908D0B82491F203F';
        $this->token = $credentials['token'] ?? null;
    }

    /**
     * Get authenticated HTTP client
     */
    private function getHttpClient()
    {
        return Http::withHeaders([
            'Key' => $this->apiKey,
            'Token' => $this->token,
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * Test connection to BizimHesap API
     */
    public function testConnection()
    {
        try {
            // Test connection by trying to get products (lightweight endpoint)
            $response = $this->getHttpClient()->get($this->baseUrl . '/products', [
                'limit' => 1, // Get only 1 product for test
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Bağlantı başarılı.',
                    'data' => $response->json()
                ];
            }

            // If products endpoint fails, try a simpler endpoint if available
            // For now, check response status
            $errorMessage = 'Bağlantı başarısız';
            if ($response->status() === 401 || $response->status() === 403) {
                $errorMessage = 'Kimlik doğrulama başarısız. API Key ve Token bilgilerinizi kontrol edin.';
            } elseif ($response->status() === 404) {
                $errorMessage = 'Endpoint bulunamadı. API URL\'ini kontrol edin.';
            } else {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => $response->json() ?? null
            ];
        } catch (\Throwable $e) {
            Log::error('BizimHesap Connection Error: ' . $e->getMessage(), [
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
     * Get products list from BizimHesap
     * API: https://bizimhesap.com/api/b2b/products
     */
    public function getProducts()
    {
        try {
            $response = $this->getHttpClient()->get($this->baseUrl . '/products');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message' => 'Ürünler başarıyla alındı.'
                ];
            }

            return [
                'success' => false,
                'message' => 'Ürünler alınamadı: ' . ($response->json()['message'] ?? $response->body()),
                'data' => $response->json()
            ];
        } catch (\Throwable $e) {
            Log::error('BizimHesap Products API Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'API hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create invoice on BizimHesap
     * API: https://bizimhesap.com/api/b2b/addinvoice
     */
    public function createInvoice(array $invoiceData)
    {
        try {
            $response = $this->getHttpClient()->post($this->baseUrl . '/addinvoice', $invoiceData);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message' => 'Fatura başarıyla oluşturuldu.'
                ];
            }

            return [
                'success' => false,
                'message' => 'Fatura oluşturulamadı: ' . ($response->json()['message'] ?? $response->body()),
                'data' => $response->json()
            ];
        } catch (\Throwable $e) {
            Log::error('BizimHesap API Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'API hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create commission invoice for shop
     * Invoice Types: 3 = Sales, 5 = Purchase
     */
    public function createCommissionInvoice($shop, $period, $commissionData)
    {
        $details = [];
        $totalGross = 0;
        $totalTax = 0;
        $taxRate = 20; // KDV oranı

        // Kargo Bedeli
        if (isset($commissionData['shipping_fee']) && $commissionData['shipping_fee'] > 0) {
            $amount = $commissionData['shipping_fee'];
            $tax = $amount * ($taxRate / 100);
            $details[] = $this->createDetailLine('KARGO', 'Kargo Bedeli', $amount, $taxRate);
            $totalGross += $amount;
            $totalTax += $tax;
        }

        // Platform Komisyonu
        if (isset($commissionData['platform_commission']) && $commissionData['platform_commission'] > 0) {
            $amount = $commissionData['platform_commission'];
            $tax = $amount * ($taxRate / 100);
            $details[] = $this->createDetailLine('KOMISYON', 'Platform Komisyonu', $amount, $taxRate);
            $totalGross += $amount;
            $totalTax += $tax;
        }

        // POS Komisyonu
        if (isset($commissionData['pos_commission']) && $commissionData['pos_commission'] > 0) {
            $amount = $commissionData['pos_commission'];
            $tax = $amount * ($taxRate / 100);
            $details[] = $this->createDetailLine('POS_KOM', 'POS Komisyonu', $amount, $taxRate);
            $totalGross += $amount;
            $totalTax += $tax;
        }

        // Pazarlama Bedeli
        if (isset($commissionData['marketing_fee']) && $commissionData['marketing_fee'] > 0) {
            $amount = $commissionData['marketing_fee'];
            $tax = $amount * ($taxRate / 100);
            $details[] = $this->createDetailLine('PAZARLAMA', 'Pazarlama Bedeli', $amount, $taxRate);
            $totalGross += $amount;
            $totalTax += $tax;
        }

        if (empty($details)) {
            return [
                'success' => false,
                'message' => 'Faturalanacak kalem bulunamadı.',
                'data' => null
            ];
        }

        $totalNet = $totalGross;
        $total = $totalNet + $totalTax;

        $invoiceData = [
            'firmId' => $this->firmId,
            'invoiceNo' => 'KOM-' . $shop->id . '-' . date('Ymd'),
            'invoiceType' => 3, // Satış faturası
            'note' => $period . ' dönemi komisyon faturası',
            'dates' => [
                'invoiceDate' => now()->toIso8601String(),
                'dueDate' => now()->addDays(30)->toIso8601String(),
            ],
            'customer' => [
                'customerId' => (string) $shop->id,
                'title' => $shop->name,
                'taxOffice' => $shop->tax_office ?? '',
                'taxNo' => $shop->tax_number ?? '',
                'email' => $shop->user->email ?? '',
                'phone' => $shop->phone ?? '',
                'address' => $shop->address ?? '',
            ],
            'amounts' => [
                'currency' => 'TL',
                'gross' => number_format($totalGross, 2, '.', ''),
                'discount' => '0.00',
                'net' => number_format($totalNet, 2, '.', ''),
                'tax' => number_format($totalTax, 2, '.', ''),
                'total' => number_format($total, 2, '.', ''),
            ],
            'details' => $details,
        ];

        return $this->createInvoice($invoiceData);
    }

    /**
     * Create a detail line for invoice
     */
    private function createDetailLine($productId, $productName, $amount, $taxRate)
    {
        $tax = $amount * ($taxRate / 100);
        $total = $amount + $tax;

        return [
            'productId' => $productId,
            'productName' => $productName,
            'note' => '',
            'barcode' => '',
            'taxRate' => number_format($taxRate, 2, '.', ''),
            'quantity' => 1,
            'unitPrice' => number_format($amount, 2, '.', ''),
            'grossPrice' => number_format($amount, 2, '.', ''),
            'discount' => '0.00',
            'net' => number_format($amount, 2, '.', ''),
            'tax' => number_format($tax, 2, '.', ''),
            'total' => number_format($total, 2, '.', ''),
        ];
    }

    /**
     * Sync products from BizimHesap
     * Supports pagination
     * 
     * @param int $page Page number
     * @param int $perPage Items per page
     * @return array
     */
    public function syncProducts($page = 1, $perPage = 100)
    {
        try {
            $queryParams = [
                'page' => $page,
                'limit' => $perPage,
            ];

            $response = $this->getHttpClient()->get($this->baseUrl . '/products', $queryParams);

            if ($response->successful()) {
                $data = $response->json();
                
                // Normalize response format
                $products = [];
                if (isset($data['data']['products']) && is_array($data['data']['products'])) {
                    // Correct structure from raw response: {data: {products: [...]}}
                    $products = $data['data']['products'];
                } elseif (isset($data['data']) && is_array($data['data'])) {
                    // Fallback or direct array
                     if (isset($data['data'][0]) && is_array($data['data'][0])) {
                         $products = $data['data'];
                     } else {
                         // Maybe products is directly data in some endpoints
                         $products = $data['data'];
                     }
                } elseif (is_array($data)) {
                     $products = $data;
                }

                // Normalize product data
                $normalizedProducts = [];
                foreach ($products as $product) {
                    $productArray = is_object($product) ? (array) $product : $product;
                    
                    // Decode photo JSON string if present
                    $images = [];
                    if (!empty($productArray['photo']) && is_string($productArray['photo'])) {
                        $decodedPhotos = json_decode($productArray['photo'], true);
                        if (is_array($decodedPhotos)) {
                            foreach ($decodedPhotos as $photo) {
                                if (!empty($photo['PhotoUrl'])) {
                                    $images[] = $photo['PhotoUrl'];
                                }
                            }
                        }
                    }

                    $normalizedProducts[] = [
                        'id' => $productArray['id'] ?? null,
                        'sku' => $productArray['code'] ?? $productArray['sku'] ?? null,
                        'name' => $productArray['title'] ?? $productArray['name'] ?? '',
                        'description' => $productArray['description'] ?? '',
                        'price' => $productArray['price'] ?? 0,
                        'cost' => $productArray['buyingPrice'] ?? $productArray['cost'] ?? 0,
                        'stock' => $productArray['quantity'] ?? $productArray['stock'] ?? 0,
                        'vat_rate' => $productArray['tax'] ?? $productArray['vat_rate'] ?? 20,
                        'barcode' => $productArray['barcode'] ?? null,
                        'category' => $productArray['category'] ?? null,
                        'brand' => $productArray['brand'] ?? null,
                        'images' => $images,
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
                        'total' => isset($data['total']) ? $data['total'] : count($normalizedProducts),
                        'has_more' => count($normalizedProducts) >= $perPage,
                    ]
                ];
            }

            $errorMessage = 'Ürünler alınamadı';
            if ($response->status() === 401 || $response->status() === 403) {
                $errorMessage = 'Kimlik doğrulama başarısız. API Key ve Token bilgilerinizi kontrol edin.';
            } else {
                $errorMessage .= ': ' . ($response->json()['message'] ?? $response->body());
            }

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => $response->json() ?? null
            ];
        } catch (\Throwable $e) {
            Log::error('BizimHesap Sync Products Error: ' . $e->getMessage(), [
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
     * Sync order from Marketplace to BizimHesap
     * Creates an invoice in BizimHesap ERP system
     * 
     * @param mixed $order Order model or order data array
     * @return array
     */
    public function syncOrder($order)
    {
        try {
            // Order model'den veri çıkar
            if (is_object($order)) {
                $customer = $order->customer ?? null;
                $address = $order->address ?? null;
                $taxRate = 20; // Default KDV

                // Build invoice details from order products
                $details = [];
                $totalGross = 0;
                $totalTax = 0;

                foreach ($order->products as $product) {
                    $quantity = $product->pivot->quantity ?? 1;
                    $unitPrice = $product->pivot->price ?? 0;
                    $gross = $quantity * $unitPrice;
                    $tax = $gross * ($taxRate / 100);
                    $total = $gross + $tax;

                    $details[] = [
                        'productId' => (string) ($product->id ?? ''),
                        'productName' => $product->name ?? '',
                        'note' => '',
                        'barcode' => $product->barcode ?? '',
                        'taxRate' => number_format($taxRate, 2, '.', ''),
                        'quantity' => $quantity,
                        'unitPrice' => number_format($unitPrice, 2, '.', ''),
                        'grossPrice' => number_format($gross, 2, '.', ''),
                        'discount' => '0.00',
                        'net' => number_format($gross, 2, '.', ''),
                        'tax' => number_format($tax, 2, '.', ''),
                        'total' => number_format($total, 2, '.', ''),
                    ];

                    $totalGross += $gross;
                    $totalTax += $tax;
                }

                $totalNet = $totalGross;
                $total = $totalNet + $totalTax;

                $invoiceData = [
                    'firmId' => $this->firmId,
                    'invoiceNo' => ($order->prefix ?? '') . ($order->order_code ?? ''),
                    'invoiceType' => 3, // Sales invoice
                    'note' => 'Sipariş #' . ($order->order_code ?? ''),
                    'dates' => [
                        'invoiceDate' => now()->toIso8601String(),
                        'dueDate' => now()->addDays(30)->toIso8601String(),
                    ],
                    'customer' => [
                        'customerId' => (string) ($customer->id ?? 0),
                        'title' => ($customer && isset($customer->user)) ? $customer->user->name : 'Müşteri',
                        'taxOffice' => $customer->tax_office ?? '',
                        'taxNo' => $customer->tax_number ?? '',
                        'email' => ($customer && isset($customer->user)) ? $customer->user->email : '',
                        'phone' => $address->phone ?? ($customer && isset($customer->user) ? $customer->user->phone : ''),
                        'address' => $address->address ?? '',
                    ],
                    'amounts' => [
                        'currency' => 'TL',
                        'gross' => number_format($totalGross, 2, '.', ''),
                        'discount' => '0.00',
                        'net' => number_format($totalNet, 2, '.', ''),
                        'tax' => number_format($totalTax, 2, '.', ''),
                        'total' => number_format($total, 2, '.', ''),
                    ],
                    'details' => $details,
                ];
            } else {
                // Array olarak gelirse direkt kullan
                $invoiceData = $order;
            }

            return $this->createInvoice($invoiceData);
        } catch (\Throwable $e) {
            Log::error('BizimHesap Sync Order Error: ' . $e->getMessage(), [
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
}
