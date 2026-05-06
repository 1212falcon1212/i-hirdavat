'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Eye, EyeOff, Mail, Lock, Phone, User, Building2, MapPin,
  ArrowRight, Check, AlertCircle, Loader2, Hash, ShieldCheck,
  Store, MessageCircle, Globe,
} from 'lucide-react';
import { api, authApi, type RegisterData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type AccountType = 'seller' | 'company' | null;

function Field({
  label,
  children,
  error,
  hint,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-neutral-900">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function InputWrap({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</div>}
      {children}
    </div>
  );
}

const inputCls = (hasIcon = true, error = false) =>
  `w-full h-11 ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 bg-white border rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150 focus:ring-2 ${
    error
      ? 'border-danger focus:border-danger focus:ring-danger/20'
      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20'
  }`;

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();

  const [accountType, setAccountType] = useState<AccountType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    seller_name: '',
    nickname: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    website: '',
    sector_type: '',
    tax_number: '',
    tax_office: '',
    mersis_no: '',
    trade_name: '',
    trade_registry_no: '',
    kep_address: '',
    address: '',
    city: '',
    district: '',
    password: '',
    password_confirmation: '',
  });

  // Pre-fill VKN from query param (landing page Hero CTA passes ?vkn=...)
  useEffect(() => {
    const vkn = params.get('vkn');
    if (vkn && /^\d{10}$/.test(vkn)) {
      setFormData((p) => ({ ...p, tax_number: vkn }));
    }
  }, [params]);

  const set = (key: string, val: string) =>
    setFormData((p) => ({ ...p, [key]: val }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.seller_name.trim()) errs.seller_name = 'Firma / bayi adı gerekli';
    if (!formData.nickname.trim()) errs.nickname = 'Rumuz gerekli';
    else if (formData.nickname.length < 3) errs.nickname = 'En az 3 karakter';
    if (!formData.email) errs.email = 'E-posta gerekli';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Geçerli e-posta girin';
    if (!/^\d{10}$/.test(formData.tax_number)) errs.tax_number = 'VKN 10 haneli olmalı';
    if (formData.mersis_no && !/^\d{16}$/.test(formData.mersis_no)) errs.mersis_no = 'MERSİS 16 haneli olmalı';
    if (!formData.address.trim()) errs.address = 'Adres gerekli';
    if (!formData.city.trim()) errs.city = 'İl gerekli';
    if (formData.password.length < 8) errs.password = 'En az 8 karakter';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,#^()_+=\-\[\]{}|\\:";'<>,\/])/.test(formData.password)) {
      errs.password = 'Büyük + küçük harf + rakam + özel karakter içermeli';
    }
    if (formData.password !== formData.password_confirmation) errs.password_confirmation = 'Şifreler eşleşmiyor';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!accountType) {
      setError('Hesap tipi seçin');
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const registerData: RegisterData = {
        role: accountType,
        seller_name: formData.seller_name,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone || undefined,
        whatsapp_number: formData.whatsapp_number || undefined,
        website: formData.website || undefined,
        sector_type: formData.sector_type || undefined,
        tax_number: formData.tax_number,
        mersis_no: formData.mersis_no || undefined,
        trade_registry_no: formData.trade_registry_no || undefined,
        address: formData.address,
        city: formData.city,
        district: formData.district || undefined,
      };

      const response = await authApi.register(registerData);
      if (response.data?.token && response.data?.user) {
        api.setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Kayıt başarılı! Hoş geldiniz.');
        router.push('/market');
      } else {
        const msg = response.error || 'Kayıt sırasında hata oluştu.';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setError('Sunucu hatası, lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/" className="group mb-6 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-500">
            <span className="text-lg font-black text-primary-900">i</span>
          </div>
          <div>
            <span className="block text-xl font-black leading-none text-neutral-900">i-hırdavat</span>
            <span className="text-[9px] font-bold uppercase tracking-[2px] text-primary-700">B2B Hırdavat Pazaryeri</span>
          </div>
        </Link>

        <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-1 text-2xl font-black text-neutral-900">Bayi / Firma Kaydı</h1>
          <p className="mb-6 text-sm text-neutral-600">
            VKN ve firma bilgilerinizle dakikalar içinde hesabınızı oluşturun.
          </p>

          {/* Account type toggle */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAccountType('seller')}
              className={`rounded-md border-2 p-4 text-left transition-colors ${
                accountType === 'seller'
                  ? 'border-primary-700 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-100'
              }`}
            >
              <Store className="mb-2 h-5 w-5 text-primary-700" />
              <p className="text-sm font-bold text-neutral-900">Bayi / Satıcı</p>
              <p className="mt-0.5 text-[11px] text-neutral-600">Ürün sat ve al</p>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('company')}
              className={`rounded-md border-2 p-4 text-left transition-colors ${
                accountType === 'company'
                  ? 'border-primary-700 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-100'
              }`}
            >
              <Building2 className="mb-2 h-5 w-5 text-primary-700" />
              <p className="text-sm font-bold text-neutral-900">Kurumsal Alıcı</p>
              <p className="mt-0.5 text-[11px] text-neutral-600">Sadece satın al</p>
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-danger/20 bg-danger-bg p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* === Firma Bilgileri === */}
            <section>
              <header className="mb-4 border-b border-neutral-200 pb-2">
                <h2 className="text-sm font-extrabold uppercase tracking-[0.06em] text-primary-900">
                  Firma Bilgileri
                </h2>
                <p className="mt-1 text-xs text-neutral-500">Vergi kimlik bilgileriniz ile resmi sicil bilgileriniz</p>
              </header>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Firma / Bayi Adı" error={fieldErrors.seller_name} required>
                  <InputWrap icon={<Store className="h-4 w-4" />}>
                    <input
                      type="text"
                      value={formData.seller_name}
                      onChange={(e) => set('seller_name', e.target.value)}
                      placeholder="Anadolu Hırdavat Ltd."
                      className={inputCls(true, !!fieldErrors.seller_name)}
                    />
                  </InputWrap>
                </Field>

                <Field label="Rumuz (sitede görünecek)" error={fieldErrors.nickname} required>
                  <InputWrap icon={<User className="h-4 w-4" />}>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => set('nickname', e.target.value)}
                      placeholder="anadolu-hirdavat"
                      className={inputCls(true, !!fieldErrors.nickname)}
                    />
                  </InputWrap>
                </Field>

                <Field label="VKN (Vergi Kimlik No)" error={fieldErrors.tax_number} hint="10 haneli" required>
                  <InputWrap icon={<ShieldCheck className="h-4 w-4" />}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.tax_number}
                      onChange={(e) => set('tax_number', e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567890"
                      className={`${inputCls(true, !!fieldErrors.tax_number)} font-mono tabular-num`}
                    />
                  </InputWrap>
                </Field>

                <Field label="MERSİS No" error={fieldErrors.mersis_no} hint="16 haneli (opsiyonel)">
                  <InputWrap icon={<Hash className="h-4 w-4" />}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      value={formData.mersis_no}
                      onChange={(e) => set('mersis_no', e.target.value.replace(/\D/g, ''))}
                      placeholder="0123456789012345"
                      className={`${inputCls(true, !!fieldErrors.mersis_no)} font-mono tabular-num`}
                    />
                  </InputWrap>
                </Field>

                <Field label="Vergi Dairesi" hint="Opsiyonel">
                  <InputWrap>
                    <input
                      type="text"
                      value={formData.tax_office}
                      onChange={(e) => set('tax_office', e.target.value)}
                      placeholder="Bayrampaşa V.D."
                      className={inputCls(false)}
                    />
                  </InputWrap>
                </Field>

                <Field label="Ticaret Sicil No" hint="Opsiyonel">
                  <InputWrap icon={<Hash className="h-4 w-4" />}>
                    <input
                      type="text"
                      value={formData.trade_registry_no}
                      onChange={(e) => set('trade_registry_no', e.target.value)}
                      placeholder="123456"
                      className={inputCls(true)}
                    />
                  </InputWrap>
                </Field>

                {accountType === 'seller' && (
                  <Field label="Sektör" hint="Opsiyonel">
                    <select
                      value={formData.sector_type}
                      onChange={(e) => set('sector_type', e.target.value)}
                      className={inputCls(false)}
                    >
                      <option value="">Seçin...</option>
                      <option value="wholesaler">Toptancı / Distribütör</option>
                      <option value="manufacturer">Üretici</option>
                      <option value="importer">İthalatçı</option>
                      <option value="retailer">Perakendeci / Bayi</option>
                    </select>
                  </Field>
                )}
              </div>
            </section>

            {/* === İletişim === */}
            <section>
              <header className="mb-4 border-b border-neutral-200 pb-2">
                <h2 className="text-sm font-extrabold uppercase tracking-[0.06em] text-primary-900">
                  İletişim
                </h2>
                <p className="mt-1 text-xs text-neutral-500">Sipariş bildirimleri ve bayi destek için kullanılacak iletişim kanalları</p>
              </header>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="E-posta" error={fieldErrors.email} required>
                  <InputWrap icon={<Mail className="h-4 w-4" />}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="info@firmaniz.com"
                      className={inputCls(true, !!fieldErrors.email)}
                    />
                  </InputWrap>
                </Field>

                <Field label="Telefon" hint="Opsiyonel">
                  <InputWrap icon={<Phone className="h-4 w-4" />}>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="0212 XXX XX XX"
                      className={inputCls(true)}
                    />
                  </InputWrap>
                </Field>

                <Field label="WhatsApp Hattı" hint="Opsiyonel">
                  <InputWrap icon={<MessageCircle className="h-4 w-4" />}>
                    <input
                      type="tel"
                      value={formData.whatsapp_number}
                      onChange={(e) => set('whatsapp_number', e.target.value)}
                      placeholder="0532 XXX XX XX"
                      className={inputCls(true)}
                    />
                  </InputWrap>
                </Field>

                <Field label="Web Sitesi" hint="Opsiyonel">
                  <InputWrap icon={<Globe className="h-4 w-4" />}>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => set('website', e.target.value)}
                      placeholder="https://firmaniz.com"
                      className={inputCls(true)}
                    />
                  </InputWrap>
                </Field>
              </div>
            </section>

            {/* === Adres === */}
            <section>
              <header className="mb-4 border-b border-neutral-200 pb-2">
                <h2 className="text-sm font-extrabold uppercase tracking-[0.06em] text-primary-900">
                  Adres
                </h2>
                <p className="mt-1 text-xs text-neutral-500">Faturalama ve sevkiyat planlaması için kullanılacak resmi adres</p>
              </header>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Adres" error={fieldErrors.address} required>
                    <InputWrap icon={<MapPin className="h-4 w-4" />}>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => set('address', e.target.value)}
                        placeholder="Sanayi Mah. Hırdavatçılar Çarşısı No:12"
                        className={inputCls(true, !!fieldErrors.address)}
                      />
                    </InputWrap>
                  </Field>
                </div>

                <Field label="İl" error={fieldErrors.city} required>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => set('city', e.target.value)}
                    placeholder="İstanbul"
                    className={inputCls(false, !!fieldErrors.city)}
                  />
                </Field>

                <Field label="İlçe">
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => set('district', e.target.value)}
                    placeholder="Bayrampaşa"
                    className={inputCls(false)}
                  />
                </Field>
              </div>
            </section>

            {/* === Hesap Güvenliği === */}
            <section>
              <header className="mb-4 border-b border-neutral-200 pb-2">
                <h2 className="text-sm font-extrabold uppercase tracking-[0.06em] text-primary-900">
                  Hesap Güvenliği
                </h2>
                <p className="mt-1 text-xs text-neutral-500">Şifreniz büyük/küçük harf, rakam ve özel karakter içermeli</p>
              </header>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Şifre" error={fieldErrors.password} hint="8+ karakter, büyük/küçük/rakam/özel" required>
                  <InputWrap icon={<Lock className="h-4 w-4" />}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => set('password', e.target.value)}
                      className={`${inputCls(true, !!fieldErrors.password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </InputWrap>
                </Field>

                <Field label="Şifre Tekrar" error={fieldErrors.password_confirmation} required>
                  <InputWrap icon={<Lock className="h-4 w-4" />}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password_confirmation}
                      onChange={(e) => set('password_confirmation', e.target.value)}
                      className={inputCls(true, !!fieldErrors.password_confirmation)}
                    />
                  </InputWrap>
                </Field>
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting || !accountType}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent-500 text-base font-bold text-primary-900 shadow-sm transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kayıt Yapılıyor...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Kaydı Tamamla
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-semibold text-primary-700 hover:text-primary-500">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
