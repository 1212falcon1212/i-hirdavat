"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Phone,
    Mail,
    Shield,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    ChevronDown,
} from "lucide-react";
import { cmsApi, type CmsLayoutResponse, type FooterSettings, type NavigationMenuItem } from "@/lib/api";

const DEFAULT_FOOTER: FooterSettings = {
    description: "Türkiye'nin B2B hırdavat pazaryeri. Bayi fiyatlarıyla el aletleri, elektrikli aletler, bağlantı elemanları, iş güvenliği ekipmanları ve daha fazlası. 14:00'a kadar verilen siparişler aynı gün kargoda. i-hirdavat.com",
    phone: "0850 XXX XX XX",
    phone_raw: "0850XXXXXXX",
    email: "info@i-hirdavat.com",
    copyright: "i-hirdavat.com. Tüm hakları saklıdır.",
    pharmacist_note: "Sadece kayıtlı B2B satıcılar içindir",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
};

const DEFAULT_MENUS: NavigationMenuItem[] = [
    {
        id: 1,
        title: "Kurumsal",
        open_in_new_tab: false,
        children: [
            { id: 11, title: "Hakkımızda", url: "/hakkimizda", open_in_new_tab: false },
            { id: 12, title: "İletişim", url: "/iletisim", open_in_new_tab: false },
            { id: 13, title: "Yardım Merkezi", url: "/yardim", open_in_new_tab: false },
            { id: 14, title: "Blog", url: "/market/blog", open_in_new_tab: false },
            { id: 15, title: "Satıcı Ol", url: "/register", open_in_new_tab: false },
        ],
    },
    {
        id: 2,
        title: "Yardım",
        open_in_new_tab: false,
        children: [
            { id: 21, title: "Sipariş Takibi", url: "/yardim/alici-rehberi/siparis-takibi", open_in_new_tab: false },
            { id: 22, title: "Sepet ve Ödeme", url: "/yardim/alici-rehberi/sepet-odeme", open_in_new_tab: false },
            { id: 23, title: "Başlarken", url: "/yardim/baslarken", open_in_new_tab: false },
            { id: 24, title: "Fiyat Karşılaştırma", url: "/yardim/alici-rehberi/fiyat-karsilastirma", open_in_new_tab: false },
        ],
    },
    {
        id: 3,
        title: "Yasal",
        open_in_new_tab: false,
        children: [
            { id: 31, title: "KVKK Aydınlatma", url: "/legal/kvkk", open_in_new_tab: false },
            { id: 32, title: "Kullanım Koşulları", url: "/legal/terms", open_in_new_tab: false },
            { id: 33, title: "Gizlilik Politikası", url: "/legal/privacy", open_in_new_tab: false },
            { id: 34, title: "Çerez Politikası", url: "/legal/cookies", open_in_new_tab: false },
        ],
    },
    {
        id: 4,
        title: "Kategoriler",
        open_in_new_tab: false,
        children: [
            { id: 41, title: "Aksesuarlar", url: "/market/category/aksesuarlar", open_in_new_tab: false },
            { id: 42, title: "Elektrikli El Aletleri", url: "/market/category/elektrikli-el-aletleri", open_in_new_tab: false },
            { id: 43, title: "Hobi & Bahçe", url: "/market/category/hobi-urunleri-ve-bahce-aletleri", open_in_new_tab: false },
            { id: 44, title: "El Aletleri", url: "/market/category/el-aletleri", open_in_new_tab: false },
            { id: 45, title: "Hırdavat", url: "/market/category/hirdavat", open_in_new_tab: false },
            { id: 46, title: "Ölçme Cihazları", url: "/market/category/dijital-olcme-cihazlari", open_in_new_tab: false },
            { id: 47, title: "Oto Bakım", url: "/market/category/oto-bakim-aletleri", open_in_new_tab: false },
            { id: 48, title: "Havalı El Aletleri", url: "/market/category/havali-el-aletleri", open_in_new_tab: false },
        ],
    },
    {
        id: 5,
        title: "Markalar",
        open_in_new_tab: false,
        children: [
            { id: 51, title: "Bosch Profesyonel", url: "/market/marka/bosch-profesyonel", open_in_new_tab: false },
            { id: 52, title: "Bosch Aksesuarlar", url: "/market/marka/bosch-aksesuarlar", open_in_new_tab: false },
            { id: 53, title: "Dremel", url: "/market/marka/dremel", open_in_new_tab: false },
            { id: 54, title: "Stanley", url: "/market/marka/stanley", open_in_new_tab: false },
            { id: 55, title: "Mitutoyo", url: "/market/marka/mitutoyo", open_in_new_tab: false },
            { id: 56, title: "Bosch Bahçe Aletleri", url: "/market/marka/bosch-bahce-aletleri", open_in_new_tab: false },
            { id: 57, title: "Knipex", url: "/market/marka/knipex", open_in_new_tab: false },
            { id: 58, title: "Proter", url: "/market/marka/proter", open_in_new_tab: false },
        ],
    },
];

/** Ensure "Blog" link exists in the first menu group (Kurumsal) */
function injectBlogLink(groups: NavigationMenuItem[]): NavigationMenuItem[] {
    if (groups.length === 0) return groups;
    const first = groups[0];
    const hasBlog = first.children?.some((c) => c.url === "/market/blog");
    if (hasBlog) return groups;
    return [
        {
            ...first,
            children: [
                ...(first.children ?? []),
                { id: 999, title: "Blog", url: "/market/blog", open_in_new_tab: false },
            ],
        },
        ...groups.slice(1),
    ];
}

function MenuGroup({ group }: { group: NavigationMenuItem }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10 sm:border-0 pb-3 sm:pb-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between py-3 sm:py-0 sm:mb-5 sm:cursor-default sm:pointer-events-none"
            >
                <h4 className="text-sm font-extrabold text-white">{group.title}</h4>
                <ChevronDown
                    className={`w-4 h-4 text-white/50 sm:hidden transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            <ul
                className={`space-y-2.5 ${open ? "block" : "hidden"} sm:block pt-1 sm:pt-0`}
            >
                {group.children?.map((item) => (
                    <li key={item.id}>
                        <Link
                            href={item.url || "#"}
                            target={item.open_in_new_tab ? "_blank" : undefined}
                            rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                            className="text-[13px] text-neutral-400 hover:text-accent-500 transition-colors"
                        >
                            {item.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function MarketFooter() {
    const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER);
    const [menus, setMenus] = useState<NavigationMenuItem[]>(DEFAULT_MENUS);

    useEffect(() => {
        cmsApi.getLayout().then((res) => {
            if (!res.data) return;
            const raw = res.data as { data?: CmsLayoutResponse };
            const layout = raw.data ?? res.data;
            if (layout.footer_settings) {
                setFooter(layout.footer_settings);
            }
            if (layout.menus?.footer?.length) {
                const footerItems = layout.menus.footer;
                const hasGroups = footerItems.some((item) => item.children && item.children.length > 0);
                if (hasGroups) {
                    setMenus(injectBlogLink(footerItems));
                } else {
                    const chunkSize = Math.ceil(footerItems.length / 3);
                    const groups: NavigationMenuItem[] = [];
                    for (let i = 0; i < footerItems.length; i += chunkSize) {
                        const chunk = footerItems.slice(i, i + chunkSize);
                        groups.push({
                            id: 900 + i,
                            title: i === 0 ? "Kurumsal" : i <= chunkSize ? "Yardim" : "Yasal",
                            open_in_new_tab: false,
                            children: chunk,
                        });
                    }
                    setMenus(injectBlogLink([...groups, ...DEFAULT_MENUS.filter((m) => m.title === "Kategoriler" || m.title === "Markalar")]));
                }
            }
        });
    }, []);

    const socialLinks = [
        { url: footer.facebook_url, icon: Facebook, label: "Facebook" },
        { url: footer.twitter_url, icon: Twitter, label: "Twitter" },
        { url: footer.instagram_url, icon: Instagram, label: "Instagram" },
        { url: footer.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    ].filter((s) => s.url);

    return (
        <footer className="bg-neutral-900 text-white">
            {/* Main Footer */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-7 pt-16 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-8 lg:gap-6">
                    {/* Brand Column */}
                    <div className="sm:col-span-2">
                        <Link href="/market" className="flex items-center gap-2.5 mb-6 group">
                            <div className="w-10 h-10 bg-accent-500 rounded-md flex items-center justify-center group-hover:bg-accent-400 transition-colors">
                                <span className="text-primary-900 font-black text-lg leading-none">i</span>
                            </div>
                            <div>
                                <span className="font-black text-2xl text-white leading-none tracking-tighter block">i-hırdavat</span>
                                <span className="text-[8px] text-accent-500 font-bold tracking-[3px] uppercase whitespace-nowrap">B2B Hırdavat Pazaryeri</span>
                            </div>
                        </Link>
                        <p className="text-[#9ca3af] text-sm leading-relaxed mb-6 max-w-sm">
                            {footer.description}
                        </p>
                        <div className="space-y-3">
                            <a href={`tel:${footer.phone_raw}`} className="flex items-center gap-3 text-neutral-400 hover:text-accent-500 transition-colors group">
                                <div className="w-8 h-8 rounded-md bg-white/5 group-hover:bg-accent-500/15 flex items-center justify-center transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="text-sm">{footer.phone}</span>
                            </a>
                            <a href={`mailto:${footer.email}`} className="flex items-center gap-3 text-neutral-400 hover:text-accent-500 transition-colors group">
                                <div className="w-8 h-8 rounded-md bg-white/5 group-hover:bg-accent-500/15 flex items-center justify-center transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-sm">{footer.email}</span>
                            </a>
                        </div>

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <div className="flex items-center gap-3 mt-6">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-md bg-white/5 hover:bg-accent-500 flex items-center justify-center text-neutral-400 hover:text-primary-900 transition-all"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* All Menu Columns */}
                    {menus.map((group) => (
                        <MenuGroup key={group.id} group={group} />
                    ))}
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-neutral-800">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-7 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-xs text-neutral-600">
                            &copy; 2026 {footer.copyright}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-neutral-600">
                            <Shield className="w-3 h-3 text-accent-500" />
                            <span>{footer.pharmacist_note}</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
