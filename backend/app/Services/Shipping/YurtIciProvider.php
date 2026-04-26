<?php

namespace App\Services\Shipping;

use App\Interfaces\ShippingProviderInterface;
use App\Interfaces\ShipmentResult;
use App\Interfaces\TrackingResult;
use App\Models\Order;
use App\Models\Setting;
use App\Models\ShippingLog;
use Illuminate\Support\Facades\Log;
use SoapClient;

/**
 * Yurtiçi Kargo Provider
 */
class YurtIciProvider implements ShippingProviderInterface
{
    protected array $config;
    protected bool $enabled;

    public function __construct()
    {
        $this->config = [
            'username' => Setting::getValue('shipping.yurtici_username', ''),
            'password' => Setting::getValue('shipping.yurtici_password', '', true),
            'customer_id' => Setting::getValue('shipping.yurtici_customer_id', ''),
            'order_link' => 'http://webservices.yurticikargo.com:8080/ShippingOrderDispatcherServices/ShippingOrderDispatcherServices?wsdl',
            'track_link' => 'http://webservices.yurticikargo.com:8080/KargoTakipServis/KargoTakipServices?wsdl',
            'base_tracking_link' => 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=',
        ];
        $this->enabled = Setting::getValue('shipping.yurtici_enabled', false);
    }

    public function getName(): string
    {
        return 'yurtici';
    }

    public function isAvailable(): bool
    {
        return $this->enabled && !empty($this->config['username']) && !empty($this->config['customer_id']);
    }

    public function createShipment(Order $order, array $senderInfo): ShipmentResult
    {
        if (!$this->isAvailable()) {
            return ShipmentResult::failure('Yurtiçi Kargo entegrasyonu aktif değil.');
        }

        try {
            $shippingAddress = $order->shipping_address;

            // Calculate total weight/deci from order items
            $totalDeci = 1;
            $totalWeight = 1;

            $requestParams = [
                'wsUserName' => $this->config['username'],
                'wsPassword' => $this->config['password'],
                'wsUserLanguage' => 'TR',
                'shipmentData' => [
                    'ngiDocumentKey' => $order->order_number,
                    'cargoType' => 2,
                    'totalCargoCount' => 1,
                    'totalDesi' => (string) $totalDeci,
                    'totalWeight' => (string) $totalWeight,
                    'personGiver' => $senderInfo['name'] ?? '',
                    'productCode' => 'STA',
                    'docCargoDataArray' => [
                        'ngiCargoKey' => $order->order_number,
                        'cargoType' => 2,
                        'cargoDesi' => (string) $totalDeci,
                        'cargoWeight' => (string) $totalWeight,
                        'cargoCount' => 1,
                    ],
                    'codData' => [
                        'ttInvoiceAmount' => '',
                        'dcSelectedCredit' => '',
                    ],
                ],
                'XSenderCustAddress' => [
                    'senderCustName' => $senderInfo['name'] ?? '',
                    'senderAddress' => $senderInfo['address'] ?? '',
                    'cityId' => $senderInfo['city_id'] ?? '',
                    'townName' => $senderInfo['district'] ?? '',
                    'senderPhone' => $senderInfo['phone'] ?? '',
                ],
                'XConsigneeCustAddress' => [
                    'consigneeCustName' => $shippingAddress['name'] ?? '',
                    'consigneeAddress' => $shippingAddress['address'] ?? '',
                    'cityId' => $shippingAddress['city_id'] ?? '',
                    'townName' => $shippingAddress['district'] ?? '',
                    'consigneeMobilePhone' => $shippingAddress['phone'] ?? '',
                ],
                'payerCustData' => [
                    'invCustId' => $this->config['customer_id'],
                ],
            ];

            $this->logRequest($order, 'create', $requestParams);

            $client = new SoapClient($this->config['order_link'], [
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $response = $client->createNgiShipmentWithAddress($requestParams);

            if (isset($response->XShipmentDataResponse)) {
                $result = $response->XShipmentDataResponse;

                if ((string) $result->outFlag == '0') {
                    $this->logResponse($order, 'create', (array) $result, 200);
                    return ShipmentResult::success(
                        trackingNumber: $order->order_number,
                        message: 'Kargo başarıyla kaydedildi.',
                    );
                } else {
                    $errorMsg = $result->outResult ?? 'Bilinmeyen hata';
                    $this->logResponse($order, 'create', (array) $result, 400, $errorMsg);
                    return ShipmentResult::failure($errorMsg, 400);
                }
            }

            return ShipmentResult::failure('Beklenmedik API yanıtı.', 500);
        } catch (\Throwable $e) {
            $this->logResponse($order, 'create', [], 503, $e->getMessage());
            Log::error('YurtIci createShipment error: ' . $e->getMessage());
            return ShipmentResult::failure($e->getMessage(), 503);
        }
    }

    public function cancelShipment(Order $order): ShipmentResult
    {
        if (!$this->isAvailable()) {
            return ShipmentResult::failure('Yurtiçi Kargo entegrasyonu aktif değil.');
        }

        try {
            $requestParams = [
                'wsUserName' => $this->config['username'],
                'wsPassword' => $this->config['password'],
                'wsUserLanguage' => 'TR',
                'ngiCargoKey' => $order->order_number,
                'ngiDocumentKey' => $order->order_number,
                'cancellationDescription' => 'Sipariş iptali',
            ];

            $this->logRequest($order, 'cancel', $requestParams);

            $client = new SoapClient($this->config['order_link'], [
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $response = $client->cancelNgiShipment($requestParams);

            if (isset($response->XCancelShipmentResponse)) {
                $result = $response->XCancelShipmentResponse;

                if ((string) $result->outFlag == '0') {
                    $this->logResponse($order, 'cancel', (array) $result, 200);
                    return ShipmentResult::success($order->tracking_number ?? '', message: 'Kargo iptal edildi.');
                } else {
                    $this->logResponse($order, 'cancel', (array) $result, 400, 'İptal başarısız');
                    return ShipmentResult::failure('İptal işlemi yapılamadı.', 400);
                }
            }

            return ShipmentResult::failure('Beklenmedik API yanıtı.', 500);
        } catch (\Throwable $e) {
            $this->logResponse($order, 'cancel', [], 503, $e->getMessage());
            return ShipmentResult::failure($e->getMessage(), 503);
        }
    }

    public function trackShipment(Order $order): TrackingResult
    {
        if (!$this->isAvailable()) {
            return TrackingResult::failure('Yurtiçi Kargo entegrasyonu aktif değil.');
        }

        try {
            $client = new SoapClient($this->config['track_link'], [
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $requestParams = [
                'userName' => $this->config['username'],
                'password' => $this->config['password'],
                'language' => 'tr',
                'custParamsVO' => [
                    'invCustIdArray' => $this->config['customer_id'],
                ],
                'fieldName' => 53,
                'fieldValueArray' => $order->tracking_number ?? $order->order_number,
                'withCargoLifecycle' => 1,
            ];

            $response = $client->listInvDocumentInterfaceByReference($requestParams);

            if (isset($response->ShippingDataResponseVO)) {
                $result = $response->ShippingDataResponseVO;

                if ($result->outFlag == '0' && isset($result->shippingDataDetailVOArray)) {
                    $detail = $result->shippingDataDetailVOArray;
                    $trackingNo = $detail->docId ?? $order->order_number;

                    return TrackingResult::fromStatus(
                        status: 'in_transit',
                        statusLabel: 'Kargo yolda',
                        trackingNumber: $trackingNo,
                        trackingUrl: $this->config['base_tracking_link'] . $trackingNo,
                    );
                }
            }

            return TrackingResult::fromStatus('pending', 'Sipariş hazırlanıyor');
        } catch (\Throwable $e) {
            return TrackingResult::failure($e->getMessage());
        }
    }

    public function getLabel(Order $order): ?string
    {
        return null;
    }

    protected function logRequest(Order $order, string $action, array $request): void
    {
        ShippingLog::create([
            'order_id' => $order->id,
            'provider' => $this->getName(),
            'action' => $action,
            'request' => $request,
            'status' => 'pending',
        ]);
    }

    protected function logResponse(Order $order, string $action, array $response, int $code, ?string $error = null): void
    {
        ShippingLog::where('order_id', $order->id)
            ->where('provider', $this->getName())
            ->where('action', $action)
            ->where('status', 'pending')
            ->latest()
            ->first()
                ?->update([
                'response' => $response,
                'response_code' => $code,
                'status' => $error ? 'failed' : 'success',
                'error' => $error,
            ]);
    }
}
