<?php

namespace Modules\ERP\Drivers;

use DOMDocument;
use Illuminate\Support\Str;

class KolaySoftUBLGenerator
{
    private $dom;
    private $currencyCode = 'TRY';

    public function generate($invoiceData)
    {
        $this->dom = new DOMDocument('1.0', 'UTF-8');
        $this->dom->formatOutput = true;

        $invoice = $this->dom->createElementNS('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', 'Invoice');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:cac', 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:cbc', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:ext', 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2');
        $this->dom->appendChild($invoice);

        // UBL Extensions - must have content (placeholder for signature)
        $ublExtensions = $this->dom->createElement('ext:UBLExtensions');
        $ublExtension = $this->dom->createElement('ext:UBLExtension');
        $extensionContent = $this->dom->createElement('ext:ExtensionContent');
        $autoElement = $this->dom->createElement('n1:auto', 'NOSIGN');
        $autoElement->setAttribute('xmlns:n1', 'http://tempuri.org');
        $extensionContent->appendChild($autoElement);
        $ublExtension->appendChild($extensionContent);
        $ublExtensions->appendChild($ublExtension);
        $invoice->appendChild($ublExtensions);

        // Standard Fields
        $this->addCbc($invoice, 'UBLVersionID', '2.1');
        $this->addCbc($invoice, 'CustomizationID', 'TR1.2');
        $this->addCbc($invoice, 'ProfileID', $invoiceData['profile_id'] ?? 'EARSIVFATURA');
        $this->addCbc($invoice, 'ID', $invoiceData['invoice_no'] ?? '');
        $this->addCbc($invoice, 'CopyIndicator', 'false');
        $this->addCbc($invoice, 'UUID', $invoiceData['uuid'] ?? Str::uuid()->toString());
        $this->addCbc($invoice, 'IssueDate', $invoiceData['issue_date'] ?? date('Y-m-d'));
        $this->addCbc($invoice, 'IssueTime', $invoiceData['issue_time'] ?? date('H:i:s'));
        $this->addCbc($invoice, 'InvoiceTypeCode', $invoiceData['invoice_type_code'] ?? 'SATIS');
        
        if (isset($invoiceData['note'])) {
            $this->addCbc($invoice, 'Note', $invoiceData['note']);
        }

        $this->addCbc($invoice, 'DocumentCurrencyCode', $this->currencyCode);
        $this->addCbc($invoice, 'LineCountNumeric', count($invoiceData['lines']));

        // Internet Sales Info (AdditionalDocumentReference must be before Parties)
        if (isset($invoiceData['internet_sale'])) {
            $this->addInternetSalesInfo($invoice, $invoiceData['internet_sale']);
        }

        // Signature (required for TR1.2 schema)
        $this->addSignature($invoice, $invoiceData['supplier']);

        // Supplier (Sender)
        $this->addSupplierParty($invoice, $invoiceData['supplier']);

        // Customer (Receiver)
        $this->addCustomerParty($invoice, $invoiceData['customer']);

        // Delivery Info (Must be after Parties and before TaxTotal/PaymentMeans)
        if (isset($invoiceData['delivery'])) {
            $this->addDelivery($invoice, $invoiceData['delivery']);
        }

        // Tax Total
        $this->addTaxTotal($invoice, $invoiceData['tax_total']);

        // Monetary Total
        $this->addLegalMonetaryTotal($invoice, $invoiceData['monetary_total']);

        // Invoice Lines
        foreach ($invoiceData['lines'] as $index => $line) {
            $this->addInvoiceLine($invoice, $line, $index + 1);
        }

        return $this->dom->saveXML();
    }

    private function addInternetSalesInfo($parent, $internetSaleData)
    {
        // Internet Sale Info - AdditionalDocumentReference for payment method
        $additionalDocumentReference = $this->dom->createElement('cac:AdditionalDocumentReference');
        $this->addCbc($additionalDocumentReference, 'ID', rand(1000000000000, 9999999999999));
        $this->addCbc($additionalDocumentReference, 'IssueDate', $internetSaleData['payment_date'] ?? date('Y-m-d'));
        $this->addCbc($additionalDocumentReference, 'DocumentTypeCode', 'INTERNETFATURA');
        $this->addCbc($additionalDocumentReference, 'DocumentType', 'ELEKTRONIK');

        // IssuerParty for Internet Sales (UBL TR1.2 compliant structure)
        $issuerParty = $this->dom->createElement('cac:IssuerParty');

        // PartyIdentification is required first
        $partyIdentification = $this->dom->createElement('cac:PartyIdentification');
        $this->addCbc($partyIdentification, 'ID', 'INTSA', ['schemeID' => 'PARTYTYPE']);
        $issuerParty->appendChild($partyIdentification);

        // PartyName with website URL
        if (isset($internetSaleData['url'])) {
            $partyName = $this->dom->createElement('cac:PartyName');
            $this->addCbc($partyName, 'Name', $internetSaleData['url']);
            $issuerParty->appendChild($partyName);
        }

        // PostalAddress (with required fields before Country)
        $postalAddress = $this->dom->createElement('cac:PostalAddress');
        $this->addCbc($postalAddress, 'CitySubdivisionName', 'Merkez');
        $this->addCbc($postalAddress, 'CityName', 'Istanbul');
        $country = $this->dom->createElement('cac:Country');
        $this->addCbc($country, 'Name', 'Turkiye');
        $postalAddress->appendChild($country);
        $issuerParty->appendChild($postalAddress);

        $additionalDocumentReference->appendChild($issuerParty);
        $parent->appendChild($additionalDocumentReference);
    }

    private function addSignature($parent, $supplierData)
    {
        $signature = $this->dom->createElement('cac:Signature');

        $schemeID = strlen($supplierData['tax_id']) === 11 ? 'TCKN' : 'VKN';
        $this->addCbc($signature, 'ID', $supplierData['tax_id'], ['schemeID' => 'VKN_TCKN']);

        // SignatoryParty
        $signatoryParty = $this->dom->createElement('cac:SignatoryParty');

        $partyId = $this->dom->createElement('cac:PartyIdentification');
        $this->addCbc($partyId, 'ID', $supplierData['tax_id'], ['schemeID' => $schemeID]);
        $signatoryParty->appendChild($partyId);

        $postalAddress = $this->dom->createElement('cac:PostalAddress');
        $this->addCbc($postalAddress, 'StreetName', $supplierData['address'] ?? 'Merkez');
        $this->addCbc($postalAddress, 'CitySubdivisionName', $supplierData['district'] ?? '');
        $this->addCbc($postalAddress, 'CityName', $supplierData['city'] ?? '');
        $country = $this->dom->createElement('cac:Country');
        $this->addCbc($country, 'Name', 'Turkiye');
        $postalAddress->appendChild($country);
        $signatoryParty->appendChild($postalAddress);

        $signature->appendChild($signatoryParty);

        // DigitalSignatureAttachment
        $digitalSigAttachment = $this->dom->createElement('cac:DigitalSignatureAttachment');
        $externalRef = $this->dom->createElement('cac:ExternalReference');
        $this->addCbc($externalRef, 'URI', '#Signature');
        $digitalSigAttachment->appendChild($externalRef);
        $signature->appendChild($digitalSigAttachment);

        $parent->appendChild($signature);
    }

    private function addDelivery($parent, $deliveryData)
    {
        $delivery = $this->dom->createElement('cac:Delivery');

        $carrierParty = $this->dom->createElement('cac:CarrierParty');

        $partyIdentification = $this->dom->createElement('cac:PartyIdentification');
        $schemeID = strlen($deliveryData['carrier_vkn']) === 11 ? 'TCKN' : 'VKN';
        $this->addCbc($partyIdentification, 'ID', $deliveryData['carrier_vkn'], ['schemeID' => $schemeID]);
        $carrierParty->appendChild($partyIdentification);

        $partyName = $this->dom->createElement('cac:PartyName');
        $this->addCbc($partyName, 'Name', $deliveryData['carrier_name']);
        $carrierParty->appendChild($partyName);

        // PostalAddress is required for CarrierParty
        $postalAddress = $this->dom->createElement('cac:PostalAddress');
        $this->addCbc($postalAddress, 'CitySubdivisionName', 'Merkez');
        $this->addCbc($postalAddress, 'CityName', 'Istanbul');
        $country = $this->dom->createElement('cac:Country');
        $this->addCbc($country, 'Name', 'Turkiye');
        $postalAddress->appendChild($country);
        $carrierParty->appendChild($postalAddress);

        $delivery->appendChild($carrierParty);

        $despatch = $this->dom->createElement('cac:Despatch');
        $this->addCbc($despatch, 'ActualDespatchDate', $deliveryData['despatch_date'] ?? date('Y-m-d'));
        $this->addCbc($despatch, 'ActualDespatchTime', $deliveryData['despatch_time'] ?? date('H:i:s'));
        $delivery->appendChild($despatch);

        $parent->appendChild($delivery);
    }

    private function addCbc($parent, $name, $value, $attributes = [])
    {
        $element = $this->dom->createElement('cbc:' . $name, htmlspecialchars($value));
        foreach ($attributes as $key => $val) {
            $element->setAttribute($key, $val);
        }
        $parent->appendChild($element);
        return $element;
    }

    private function addSupplierParty($parent, $supplierData)
    {
        $supplier = $this->dom->createElement('cac:AccountingSupplierParty');
        $party = $this->dom->createElement('cac:Party');

        // VKN/TCKN
        $partyId = $this->dom->createElement('cac:PartyIdentification');
        $schemeID = strlen($supplierData['tax_id']) === 11 ? 'TCKN' : 'VKN';
        $this->addCbc($partyId, 'ID', $supplierData['tax_id'], ['schemeID' => $schemeID]);
        $party->appendChild($partyId);

        // Name
        $partyName = $this->dom->createElement('cac:PartyName');
        $this->addCbc($partyName, 'Name', $supplierData['name']);
        $party->appendChild($partyName);

        // Address
        $postalAddress = $this->dom->createElement('cac:PostalAddress');
        $this->addCbc($postalAddress, 'CitySubdivisionName', $supplierData['district'] ?? '');
        $this->addCbc($postalAddress, 'CityName', $supplierData['city'] ?? '');
        
        $country = $this->dom->createElement('cac:Country');
        $this->addCbc($country, 'Name', 'Türkiye');
        $postalAddress->appendChild($country);
        
        $party->appendChild($postalAddress);

        // Tax Scheme
        $partyTaxScheme = $this->dom->createElement('cac:PartyTaxScheme');
        $taxScheme = $this->dom->createElement('cac:TaxScheme');
        $this->addCbc($taxScheme, 'Name', $supplierData['tax_office'] ?? '');
        $partyTaxScheme->appendChild($taxScheme);
        $party->appendChild($partyTaxScheme);

        $supplier->appendChild($party);
        $parent->appendChild($supplier);
    }

    private function addCustomerParty($parent, $customerData)
    {
        $customer = $this->dom->createElement('cac:AccountingCustomerParty');
        $party = $this->dom->createElement('cac:Party');

        // VKN/TCKN - If empty/individual, use 11111111111 for E-Archive usually
        $taxId = $customerData['tax_id'] ?? '11111111111';
        $partyId = $this->dom->createElement('cac:PartyIdentification');
        $schemeID = strlen($taxId) === 10 ? 'VKN' : 'TCKN';
        $this->addCbc($partyId, 'ID', $taxId, ['schemeID' => $schemeID]);
        $party->appendChild($partyId);

        // PartyName - always add for proper schema compliance
        $partyName = $this->dom->createElement('cac:PartyName');
        if (isset($customerData['first_name']) && isset($customerData['last_name'])) {
            $this->addCbc($partyName, 'Name', $customerData['first_name'] . ' ' . $customerData['last_name']);
        } else {
            $this->addCbc($partyName, 'Name', $customerData['name'] ?? 'Nihai Tuketici');
        }
        $party->appendChild($partyName);

        // PostalAddress - must come before Person
        $postalAddress = $this->dom->createElement('cac:PostalAddress');
        $this->addCbc($postalAddress, 'StreetName', $customerData['address'] ?? 'Adres');
        $this->addCbc($postalAddress, 'CitySubdivisionName', $customerData['district'] ?? 'Merkez');
        $this->addCbc($postalAddress, 'CityName', $customerData['city'] ?? 'Istanbul');

        $country = $this->dom->createElement('cac:Country');
        $this->addCbc($country, 'Name', 'Turkiye');
        $postalAddress->appendChild($country);

        $party->appendChild($postalAddress);

        // Person - must come AFTER PostalAddress (important for schema compliance)
        if (isset($customerData['first_name']) && isset($customerData['last_name'])) {
            $person = $this->dom->createElement('cac:Person');
            $this->addCbc($person, 'FirstName', $customerData['first_name']);
            $this->addCbc($person, 'FamilyName', $customerData['last_name']);
            $party->appendChild($person);
        }

        $customer->appendChild($party);
        $parent->appendChild($customer);
    }

    private function addTaxTotal($parent, $taxTotalData)
    {
        $taxTotal = $this->dom->createElement('cac:TaxTotal');
        $this->addCbc($taxTotal, 'TaxAmount', number_format($taxTotalData['amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);

        foreach ($taxTotalData['subtotals'] as $subtotal) {
            $taxSubtotal = $this->dom->createElement('cac:TaxSubtotal');
            $this->addCbc($taxSubtotal, 'TaxableAmount', number_format($subtotal['taxable_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
            $this->addCbc($taxSubtotal, 'TaxAmount', number_format($subtotal['tax_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
            $this->addCbc($taxSubtotal, 'Percent', $subtotal['percent']);

            $taxCategory = $this->dom->createElement('cac:TaxCategory');
            $taxScheme = $this->dom->createElement('cac:TaxScheme');
            $this->addCbc($taxScheme, 'Name', 'KDV');
            $this->addCbc($taxScheme, 'TaxTypeCode', '0015');
            $taxCategory->appendChild($taxScheme);
            $taxSubtotal->appendChild($taxCategory);

            $taxTotal->appendChild($taxSubtotal);
        }

        $parent->appendChild($taxTotal);
    }

    private function addLegalMonetaryTotal($parent, $totalData)
    {
        $monetaryTotal = $this->dom->createElement('cac:LegalMonetaryTotal');
        $this->addCbc($monetaryTotal, 'LineExtensionAmount', number_format($totalData['line_extension_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
        $this->addCbc($monetaryTotal, 'TaxExclusiveAmount', number_format($totalData['tax_exclusive_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
        $this->addCbc($monetaryTotal, 'TaxInclusiveAmount', number_format($totalData['tax_inclusive_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
        $this->addCbc($monetaryTotal, 'AllowanceTotalAmount', number_format($totalData['allowance_total_amount'] ?? 0, 2, '.', ''), ['currencyID' => $this->currencyCode]);
        $this->addCbc($monetaryTotal, 'PayableAmount', number_format($totalData['payable_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
        $parent->appendChild($monetaryTotal);
    }

    private function addInvoiceLine($parent, $lineData, $id)
    {
        $line = $this->dom->createElement('cac:InvoiceLine');
        $this->addCbc($line, 'ID', $id);
        $this->addCbc($line, 'InvoicedQuantity', $lineData['quantity'], ['unitCode' => $lineData['unit_code'] ?? 'NIU']);
        $this->addCbc($line, 'LineExtensionAmount', number_format($lineData['line_extension_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);

        // Tax Total for Line (must come before Item and Price)
        $taxTotal = $this->dom->createElement('cac:TaxTotal');
        $this->addCbc($taxTotal, 'TaxAmount', number_format($lineData['tax_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);

        $taxSubtotal = $this->dom->createElement('cac:TaxSubtotal');
        $this->addCbc($taxSubtotal, 'TaxableAmount', number_format($lineData['line_extension_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
        $this->addCbc($taxSubtotal, 'TaxAmount', number_format($lineData['tax_amount'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
        $this->addCbc($taxSubtotal, 'Percent', $lineData['tax_percent']);

        $taxCategory = $this->dom->createElement('cac:TaxCategory');
        $taxScheme = $this->dom->createElement('cac:TaxScheme');
        $this->addCbc($taxScheme, 'Name', 'KDV');
        $this->addCbc($taxScheme, 'TaxTypeCode', '0015');
        $taxCategory->appendChild($taxScheme);
        $taxSubtotal->appendChild($taxCategory);
        $taxTotal->appendChild($taxSubtotal);
        $line->appendChild($taxTotal);

        // Item (must come after TaxTotal)
        $item = $this->dom->createElement('cac:Item');
        $this->addCbc($item, 'Name', $lineData['name']);
        $line->appendChild($item);

        // Price (must come after Item)
        $price = $this->dom->createElement('cac:Price');
        $this->addCbc($price, 'PriceAmount', number_format($lineData['price'], 2, '.', ''), ['currencyID' => $this->currencyCode]);
        $line->appendChild($price);

        $parent->appendChild($line);
    }
}
