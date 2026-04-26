<?php

namespace Modules\ERP\Drivers;

use Modules\ERP\Contracts\ERPDriverInterface;
use SoapClient;
use SoapHeader;
use SoapFault;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class KolaySoftDriver implements ERPDriverInterface
{
    // Canlı endpoint (varsayılan)
    private const LIVE_WSDL = 'https://servis.smartdonusum.com/EArchiveInvoiceService/EArchiveInvoiceWS?wsdl';
    // Test endpoint
    private const TEST_WSDL = 'https://servis.kolayentegrasyon.net/EArchiveInvoiceService/EArchiveInvoiceWS?wsdl';

    private $wsdlUrl;
    private $username;
    private $password;
    private $client;
    private $testMode;

    public function __construct(array $config)
    {
        $this->username = $config['username'] ?? '';
        $this->password = $config['password'] ?? '';
        $this->testMode = !empty($config['test_mode']);

        // Test modu aktifse test endpoint, değilse canlı endpoint kullan
        $this->wsdlUrl = $this->testMode ? self::TEST_WSDL : self::LIVE_WSDL;

        // Custom WSDL URL varsa onu kullan
        if (isset($config['wsdl_url']) && !empty($config['wsdl_url'])) {
            $this->wsdlUrl = $config['wsdl_url'];
        }

        Log::info('KolaySoft Driver initialized', [
            'test_mode' => $this->testMode,
            'wsdl_url' => $this->wsdlUrl,
        ]);
    }

    private function getClient()
    {
        if (!$this->client) {
            try {
                // KolaySoft HTTP Header Authentication kullanıyor
                // Username ve Password HTTP Request Header olarak gönderilmeli
                $opts = [
                    'http' => [
                        'header' => "Username: {$this->username}\r\nPassword: {$this->password}\r\n"
                    ],
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ]
                ];

                $context = stream_context_create($opts);

                $this->client = new SoapClient($this->wsdlUrl, [
                    'stream_context' => $context,
                    'trace' => 1,
                    'exceptions' => true,
                    'cache_wsdl' => WSDL_CACHE_NONE,
                    'features' => SOAP_SINGLE_ELEMENT_ARRAYS,
                ]);
            } catch (SoapFault $e) {
                Log::error('KolaySoft SOAP Connection Error: ' . $e->getMessage());
                throw $e;
            }
        }
        return $this->client;
    }

    public function createInvoice($invoiceData)
    {
        try {
            $generator = new KolaySoftUBLGenerator();

            // Generate UBL XML
            $xmlContent = $generator->generate($invoiceData);
            $uuid = $invoiceData['uuid'] ?? Str::uuid()->toString();
            $invoiceNo = $invoiceData['invoice_no'] ?? '';

            // Prefix formatı: ABC2026 (3 harf + 4 yıl)
            $prefix = $invoiceData['document_no_prefix'] ?? ('DNM' . date('Y'));

            Log::info('KolaySoft Invoice Request', [
                'uuid' => $uuid,
                'invoice_no' => $invoiceNo,
                'prefix' => $prefix,
                'xml_size' => strlen($xmlContent),
            ]);

            // SOAP Envelope with CDATA (required for KolaySoft)
            $soapEnvelope = '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://earchiveinvoiceservice.entegrator.com/">
<soap:Body>
<ns1:sendInvoice>
<invoiceXMLList>
<documentUUID>' . $uuid . '</documentUUID>
<documentId>' . $invoiceNo . '</documentId>
<xmlContent><![CDATA[' . $xmlContent . ']]></xmlContent>
<sourceUrn>' . ($invoiceData['source_urn'] ?? 'urn:mail:defaultpk') . '</sourceUrn>
<destinationUrn>' . ($invoiceData['destination_urn'] ?? 'urn:mail:defaultgb') . '</destinationUrn>
<documentDate>' . ($invoiceData['issue_date'] ?? date('Y-m-d')) . '</documentDate>
<submitForApproval>' . (($invoiceData['submit_for_approval'] ?? true) ? 'true' : 'false') . '</submitForApproval>
<documentNoPrefix>' . $prefix . '</documentNoPrefix>
</invoiceXMLList>
</ns1:sendInvoice>
</soap:Body>
</soap:Envelope>';

            // Send via CURL (more reliable than SoapClient for CDATA)
            $response = $this->sendSoapRequest($soapEnvelope);

            Log::info('KolaySoft Invoice Response', [
                'http_code' => $response['http_code'],
                'response' => substr($response['body'], 0, 1000)
            ]);

            // Parse response
            $code = null;
            $explanation = null;
            $documentUUID = null;
            $documentID = null;
            $cause = null;

            if (preg_match('/<code>([^<]*)<\/code>/', $response['body'], $m)) $code = $m[1];
            if (preg_match('/<explanation>([^<]*)<\/explanation>/', $response['body'], $m)) $explanation = $m[1];
            if (preg_match('/<documentUUID>([^<]*)<\/documentUUID>/', $response['body'], $m)) $documentUUID = $m[1];
            if (preg_match('/<documentID>([^<]*)<\/documentID>/', $response['body'], $m)) $documentID = $m[1];
            if (preg_match('/<cause>([^<]*)<\/cause>/', $response['body'], $m)) $cause = $m[1];
            if (preg_match('/<faultstring>([^<]*)<\/faultstring>/', $response['body'], $m)) {
                return [
                    'success' => false,
                    'message' => 'SOAP Fault: ' . $m[1],
                    'invoice_id' => $uuid,
                    'data' => $response['body']
                ];
            }

            // Success codes: 000, 200, SUCCESS, 0
            $successCodes = ['000', '200', 'SUCCESS', '0'];
            if (in_array($code, $successCodes)) {
                return [
                    'success' => true,
                    'message' => $explanation ?? 'Fatura başarıyla gönderildi.',
                    'invoice_id' => $documentUUID ?? $uuid,
                    'invoice_no' => $documentID ?? $invoiceNo,
                    'data' => [
                        'code' => $code,
                        'explanation' => $explanation,
                        'documentUUID' => $documentUUID,
                        'documentID' => $documentID
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Fatura gönderimi başarısız: ' . ($explanation ?? $cause ?? 'Bilinmeyen Hata'),
                    'invoice_id' => $documentUUID ?? $uuid,
                    'data' => [
                        'code' => $code,
                        'explanation' => $explanation,
                        'cause' => $cause
                    ]
                ];
            }

        } catch (\Exception $e) {
            Log::error('KolaySoft General Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Sistem Hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Send SOAP request via CURL (supports CDATA properly)
     */
    private function sendSoapRequest($soapXml)
    {
        $endpoint = str_replace('?wsdl', '', $this->wsdlUrl);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $endpoint,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $soapXml,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: text/xml; charset=utf-8',
                'SOAPAction: ""',
                'Username: ' . $this->username,
                'Password: ' . $this->password,
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 60,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception('CURL Error: ' . $error);
        }

        return [
            'http_code' => $httpCode,
            'body' => $response
        ];
    }

    public function syncProducts($page = 1, $perPage = 100)
    {
        // Not implemented for this driver
        return [
            'success' => true,
            'message' => 'Not supported',
            'data' => [],
            'pagination' => ['page' => $page, 'per_page' => $perPage, 'total' => 0, 'has_more' => false]
        ];
    }

    public function syncOrder($order)
    {
        // Not implemented for this driver (Only outgoing invoices)
        return [
            'success' => true,
            'message' => 'Not supported',
            'data' => null
        ];
    }
    
    public function testConnection()
    {
        $envLabel = $this->testMode ? '[TEST ORTAMI]' : '[CANLI ORTAM]';

        try {
            $client = $this->getClient();

            // getPrefixList ile gerçek bir API çağrısı yaparak test et
            $result = $client->getPrefixList();

            if (isset($result->return->stateExplanation)) {
                return [
                    'success' => true,
                    'message' => $envLabel . ' Bağlantı başarılı: ' . $result->return->stateExplanation,
                    'data' => [
                        'prefix_count' => $result->return->documentsCount ?? 0,
                        'state' => $result->return->queryState ?? null,
                        'environment' => $this->testMode ? 'test' : 'live',
                        'wsdl_url' => $this->wsdlUrl,
                    ]
                ];
            }

            return [
                'success' => true,
                'message' => $envLabel . ' SOAP bağlantısı başarıyla sağlandı.',
                'data' => [
                    'environment' => $this->testMode ? 'test' : 'live',
                    'wsdl_url' => $this->wsdlUrl,
                ]
            ];
        } catch (SoapFault $e) {
            Log::error('KolaySoft Connection Test Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $envLabel . ' SOAP Bağlantı hatası: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $envLabel . ' Bağlantı hatası: ' . $e->getMessage()
            ];
        }
    }

    /**
     * XML doğrulama
     */
    public function controlInvoiceXML($xmlContent)
    {
        try {
            $client = $this->getClient();

            // XML string ise base64 encode et
            if (strpos($xmlContent, '<?xml') === 0 || strpos($xmlContent, '<Invoice') !== false) {
                $xmlContent = base64_encode($xmlContent);
            }

            $result = $client->controlInvoiceXML(['invoiceXML' => $xmlContent]);

            $response = $result->return ?? null;

            if ($response && $response->code === '000') {
                return [
                    'success' => true,
                    'message' => $response->explanation ?? 'XML doğrulandı',
                    'data' => $response
                ];
            }

            return [
                'success' => false,
                'message' => $response->explanation ?? 'XML doğrulama başarısız',
                'data' => $response
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'XML doğrulama hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Fatura sorgulama (UUID ile)
     */
    public function queryInvoice($uuid)
    {
        try {
            $client = $this->getClient();

            $result = $client->QueryInvoicesWithGUIDList(['guidList' => [$uuid]]);

            $response = $result->return ?? null;

            if ($response && isset($response->documents)) {
                return [
                    'success' => true,
                    'message' => 'Fatura bulundu',
                    'data' => $response->documents
                ];
            }

            return [
                'success' => false,
                'message' => 'Fatura bulunamadı',
                'data' => $response
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Fatura sorgulama hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Fatura iptal
     */
    public function cancelInvoice($uuid)
    {
        try {
            $client = $this->getClient();

            $inputDocument = new \stdClass();
            $inputDocument->documentUUID = $uuid;

            $result = $client->cancelInvoice(['inputDocumentList' => $inputDocument]);

            $response = $result->return ?? null;

            if (is_array($response)) {
                $response = $response[0] ?? null;
            }

            $successCodes = ['000', '200', 'SUCCESS', '0'];
            if ($response && in_array($response->code ?? '', $successCodes)) {
                return [
                    'success' => true,
                    'message' => $response->explanation ?? 'Fatura iptal edildi',
                    'data' => $response
                ];
            }

            return [
                'success' => false,
                'message' => $response->explanation ?? $response->cause ?? 'Fatura iptal edilemedi',
                'data' => $response
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Fatura iptal hatası: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Prefix listesini al
     */
    public function getPrefixList()
    {
        try {
            $client = $this->getClient();

            $result = $client->getPrefixList();

            return [
                'success' => true,
                'message' => $result->return->stateExplanation ?? 'Başarılı',
                'data' => $result->return ?? null
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Prefix listesi alınamadı: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Yeni UUID oluştur
     */
    public function getNewUUID()
    {
        try {
            $client = $this->getClient();

            $result = $client->getNewUUID();

            return [
                'success' => true,
                'uuid' => $result->return ?? null,
                'message' => 'UUID oluşturuldu'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'uuid' => null,
                'message' => 'UUID oluşturulamadı: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Müşteri kredi sayısını al
     */
    public function getCustomerCreditCount()
    {
        try {
            $client = $this->getClient();

            $result = $client->getCustomerCreditCount();

            return [
                'success' => true,
                'credit_count' => $result->return ?? 0,
                'message' => 'Kredi sayısı alındı'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'credit_count' => 0,
                'message' => 'Kredi sayısı alınamadı: ' . $e->getMessage()
            ];
        }
    }
}
