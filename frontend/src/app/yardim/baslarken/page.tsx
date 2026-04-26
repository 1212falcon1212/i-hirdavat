import { Metadata } from 'next';
import { CheckCircle, AlertCircle, ArrowRight, BadgeCheck, Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Bayi Kaydı ve Doğrulama — i-hırdavat Yardım',
    description: 'i-hırdavat\'a nasıl bayi kaydı yapılır? VKN, MERSİS ve Ticaret Sicil No ile doğrulama adımları.',
};

export default function BaslarkenPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-6 pb-4 border-b border-neutral-200">
                Bayi Kaydı ve Doğrulama
            </h1>

            <p className="text-neutral-600 leading-relaxed mb-8">
                i-hırdavat, kurumsal alıcı ve satıcıların tek platformda buluştuğu B2B hırdavat pazaryeridir.
                Platforma kayıt olmak için firma bilgilerinizi (<strong className="text-neutral-900">VKN + MERSİS</strong>)
                ile doğrulamanız gerekir.
            </p>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4" id="vkn">
                VKN (Vergi Kimlik Numarası) Nedir?
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
                VKN, Türkiye&apos;de tüzel kişilere verilen
                <strong className="text-neutral-900"> 10 haneli vergi kimlik numarasıdır</strong>.
                Şahıs şirketleri için TCKN kullanılırken, limited ve anonim şirketler için VKN zorunludur.
            </p>

            <div className="bg-primary-50 border border-primary-100 rounded-md p-6 my-6">
                <h4 className="font-semibold text-primary-700 mb-2 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5" />
                    VKN&apos;nizi Nereden Bulabilirsiniz?
                </h4>
                <ul className="text-primary-700 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        İmza sirküleriniz ve vergi levhanız üzerinde
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        e-Devlet üzerinden &quot;Vergi Levhası Sorgulama&quot; servisinde
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Mali müşavirinizden talep edebilirsiniz
                    </li>
                </ul>
            </div>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4" id="mersis">
                MERSİS No Nedir?
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
                MERSİS (Merkezi Sicil Kayıt Sistemi), Gümrük ve Ticaret Bakanlığı tarafından işletilen ve
                tüm tüzel kişilere verilen <strong className="text-neutral-900">16 haneli benzersiz kimlik numarasıdır</strong>.
                Ticaret sicil kaydınızla otomatik olarak üretilir.
            </p>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4" id="kayit-adimlari">
                Kayıt Adımları
            </h2>

            <div className="space-y-5 my-6">
                <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary-700 text-white rounded-sm flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        1
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">Hesap Tipinizi Seçin</h3>
                        <p className="text-sm text-neutral-600">
                            <strong>Bayi / Satıcı</strong> — ürün satmak ve satın almak için.
                            <strong className="ml-2">Kurumsal Alıcı</strong> — sadece satın almak için.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary-700 text-white rounded-sm flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        2
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">Firma Bilgilerinizi Girin</h3>
                        <p className="text-sm text-neutral-600">
                            Firma ünvanı, VKN (10 hane), MERSİS (16 hane), Ticaret Sicil No ve vergi dairesi bilgilerinizi girin.
                            Sistem bu bilgileri otomatik olarak doğrular.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary-700 text-white rounded-sm flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        3
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">İletişim ve Adres</h3>
                        <p className="text-sm text-neutral-600">
                            Firma adresi (ticari sicil kaydınızla uyumlu), telefon, WhatsApp hattı ve web sitesi gibi
                            iletişim bilgilerinizi ekleyin.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary-700 text-white rounded-sm flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        4
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">Sözleşme Onayı</h3>
                        <p className="text-sm text-neutral-600">
                            B2B bayi sözleşmesini onaylayın. Dijital imzanızla sözleşme aktifleşir.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 bg-accent-500 text-primary-900 rounded-sm flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        ✓
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">Hesabınız Aktif!</h3>
                        <p className="text-sm text-neutral-600">
                            Ürün listelemeye, sipariş vermeye ve B2B pazar yerinin avantajlarından yararlanmaya başlayın.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-accent-bg border border-accent-500/40 rounded-md p-5 my-6">
                <h4 className="font-semibold text-accent-600 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Güvenlik ve Doğrulama
                </h4>
                <p className="text-sm text-neutral-800">
                    Sadece doğrulanmış firma hesapları ürün listeleyebilir ve sipariş verebilir. Bu, platformun
                    kurumsal güvenilirliğini korur.
                </p>
            </div>

            <div className="bg-danger-bg border border-danger/30 rounded-md p-5 my-6">
                <h4 className="font-semibold text-danger mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Kayıt Sırasında Sorun mu Yaşıyorsunuz?
                </h4>
                <p className="text-sm text-neutral-800">
                    VKN veya MERSİS doğrulaması başarısız oluyorsa{' '}
                    <Link href="/iletisim" className="text-primary-700 underline font-medium">
                        destek ekibimizle iletişime geçin
                    </Link>
                    . 24 saat içinde yanıt veriyoruz.
                </p>
            </div>

            <div className="flex gap-3 mt-10">
                <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-accent-500 hover:bg-accent-400 text-primary-900 font-bold rounded-sm transition-colors"
                >
                    Hemen Kayıt Ol
                    <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 font-medium rounded-sm transition-colors"
                >
                    Zaten hesabım var
                </Link>
            </div>
        </div>
    );
}
