<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Bayi (hardware seller) veya Firma — legacy 'pharmacy' da kabul (backward compat)
            'role' => ['required', 'string', 'in:seller,company,pharmacy'],
            'email' => ['required', 'email', 'unique:users,email', 'max:255'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,#^()_+=\-\[\]{}|\\:";\'<>,\/]).+$/',
            ],
            // Firma/bayi unvanı. Legacy API'lerin pharmacy_name göndermesine karşı ikisini de kabul edip
            // controller normalize eder.
            'seller_name' => ['required_without:pharmacy_name', 'nullable', 'string', 'max:255'],
            'pharmacy_name' => ['required_without:seller_name', 'nullable', 'string', 'max:255'],
            'nickname' => ['required', 'string', 'min:3', 'max:100', 'unique:users,nickname'],
            'phone' => ['nullable', 'string', 'max:20'],
            'whatsapp_number' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'string', 'max:255'],
            'sector_type' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],

            // VKN zorunlu — 10 haneli sayısal
            'tax_number' => ['required', 'string', 'regex:/^\d{10}$/', 'unique:users,tax_number'],
            'tax_office' => ['nullable', 'string', 'max:100'],

            // MERSİS opsiyonel (tüzel kişi firmalar zorunlu olabilir) — 16 hane
            'mersis_no' => ['nullable', 'string', 'regex:/^\d{16}$/'],

            // Ticaret Sicil No opsiyonel
            'trade_registry_no' => ['nullable', 'string', 'max:30'],

            'trade_name' => ['nullable', 'string', 'max:255'],
            'kep_address' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role.required' => 'Hesap tipi seçimi gereklidir.',
            'role.in' => 'Geçersiz hesap tipi. Bayi veya Firma seçmelisiniz.',
            'email.required' => 'E-posta adresi gereklidir.',
            'email.email' => 'Geçerli bir e-posta adresi giriniz.',
            'email.unique' => 'Bu e-posta adresi zaten kayıtlı.',
            'password.required' => 'Şifre gereklidir.',
            'password.min' => 'Şifre en az 8 karakter olmalıdır.',
            'password.confirmed' => 'Şifre tekrarı eşleşmiyor.',
            'password.regex' => 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
            'seller_name.required_without' => 'Firma/Bayi adı gereklidir.',
            'pharmacy_name.required_without' => 'Firma/Bayi adı gereklidir.',
            'nickname.required' => 'Rumuz gereklidir.',
            'nickname.min' => 'Rumuz en az 3 karakter olmalıdır.',
            'nickname.max' => 'Rumuz en fazla 100 karakter olmalıdır.',
            'nickname.unique' => 'Bu rumuz zaten kullanılmaktadır.',
            'tax_number.required' => 'Vergi Kimlik Numarası (VKN) gereklidir.',
            'tax_number.regex' => 'VKN 10 haneli sayısal olmalıdır.',
            'tax_number.unique' => 'Bu VKN zaten kayıtlı.',
            'mersis_no.regex' => 'MERSİS numarası 16 haneli sayısal olmalıdır.',
        ];
    }

    /**
     * Prepare data for validation — normalize legacy field names + role values.
     */
    protected function prepareForValidation(): void
    {
        $data = [];

        // role: eski 'pharmacy' → 'seller' normalize
        if ($this->has('role') && $this->input('role') === 'pharmacy') {
            $data['role'] = 'seller';
        }

        // pharmacy_name → seller_name normalize (eski istemciler için)
        if (!$this->filled('seller_name') && $this->filled('pharmacy_name')) {
            $data['seller_name'] = $this->input('pharmacy_name');
        }

        if (!empty($data)) {
            $this->merge($data);
        }
    }
}
