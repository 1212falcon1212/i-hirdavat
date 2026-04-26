"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    Store,
    User,
    Menu,
    X,
    ShoppingBag,
    LayoutDashboard,
    LogOut,
    ChevronDown,
    ChevronRight,
    Pill,
    Heart,
    Stethoscope,
    Syringe,
    Cross,
    Sparkles,
    Baby,
    Leaf,
    Eye,
    Activity,
    Thermometer,
    Droplets,
    ShieldPlus,
    Tablets,
    Phone,
    MapPin,
    Clock,
    Box,
    History,
    Settings,
    MessageCircle,
    ScanLine,
    Zap,
    Wrench,
    Heart as HeartIcon,
    ShoppingCart as ShoppingCartIcon
} from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/mobile/BarcodeScanner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { MiniCart } from "@/components/cart/MiniCart";
import { NotificationDropdown } from "@/components/market/NotificationDropdown";
import { Topbar } from "@/components/market/Topbar";
import { QuickOrderModal } from "@/components/market/QuickOrderModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CategoryItem, cmsApi, productsApi, Product, CmsLayoutResponse } from "@/lib/api";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from "@/lib/search-history";

// Kategori slug → Iconify icon mapping (Industrial Pro — Hırdavat kategorileri)
const categoryIconMap: Record<string, string> = {
    "el-aletleri": "mdi:wrench",
    "elektrikli-aletler": "mdi:drill",
    "baglanti-elemanlari": "mdi:screw-machine-flat-top",
    "insaat-yapi": "mdi:hammer-wrench",
    "tesisat-su": "mdi:pipe",
    "elektrik-malzemeleri": "mdi:lightning-bolt",
    "hirdavat-nalburiye": "mdi:tools",
    "is-guvenligi": "mdi:hard-hat",
    "bahce-orman": "mdi:saw-blade",
    "civata": "mdi:screw-machine-flat-top",
    "somun": "mdi:hexagon-outline",
    "vida": "mdi:screwdriver",
    "matkap": "mdi:drill",
    "taslama": "mdi:saw-blade",
    "kaynak": "mdi:flash",
    "eldiven": "mdi:hand-back-right",
    "baret": "mdi:hard-hat",
    "kabo": "mdi:power-plug",
    "kablo": "mdi:power-plug",
    "boya": "mdi:format-paint",
    "anahtar": "mdi:key-wrench",
    "pense": "mdi:pliers",
    "testere": "mdi:saw-blade",
    "pompa": "mdi:pump",
};

const DEFAULT_CATEGORY_ICON = "mdi:tools";

const getCategoryIcon = (slug: string): string => {
    const lowered = slug.toLowerCase();
    const key = Object.keys(categoryIconMap).find(k => lowered.includes(k));
    return key ? categoryIconMap[key] : DEFAULT_CATEGORY_ICON;
};

// Search placeholder rotation — Industrial Pro, B2B alıcı alışkanlıklarına uygun
const SEARCH_PLACEHOLDERS = [
    "M8x20 DIN 933 civata ara...",
    "Bosch GSB 550 darbeli matkap ara...",
    "İzeltaş alyan takımı ara...",
    "3'lü topraklı priz ara...",
    "Makita akülü matkap 18V ara...",
    "3M iş güvenliği eldiveni ara...",
];

export function MarketHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchPreview, setShowSearchPreview] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [siteSettings, setSiteSettings] = useState<CmsLayoutResponse['settings'] | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [isScanLookup, setIsScanLookup] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [quickOrderOpen, setQuickOrderOpen] = useState(false);
    const megaMenuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLFormElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Rotate search placeholder every 3s when input is empty & not focused
    useEffect(() => {
        if (isSearchFocused || searchQuery.length > 0) return;
        const id = setInterval(() => {
            setPlaceholderIndex((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(id);
    }, [isSearchFocused, searchQuery.length]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [homepageResponse, layoutResponse] = await Promise.all([
                    cmsApi.getHomepage(),
                    cmsApi.getLayout(),
                ]);

                if (homepageResponse.data?.categories) {
                    setCategories(homepageResponse.data.categories);
                }
                if (layoutResponse.data) {
                    const raw = layoutResponse.data as { data?: CmsLayoutResponse } | CmsLayoutResponse;
                    const layout = (raw as { data?: CmsLayoutResponse }).data ?? (raw as CmsLayoutResponse);
                    if (layout?.settings) {
                        setSiteSettings(layout.settings);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Load recent searches on focus
    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        setRecentSearches(getRecentSearches());
        if (searchQuery.length < 3 && getRecentSearches().length > 0) {
            setShowSearchPreview(true);
        }
        if (searchQuery.length >= 3 && searchResults.length > 0) {
            setShowSearchPreview(true);
        }
    };

    // Search preview - debounced search after 3 characters
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.length >= 3) {
            setIsSearching(true);
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await productsApi.search(searchQuery, 1);
                    const products = response.data?.products || [];
                    const sorted = [...products].sort((a, b) => (b.offers_count || 0) - (a.offers_count || 0));
                    setSearchResults(sorted.slice(0, 6));
                    setShowSearchPreview(true);
                } catch (error) {
                    console.error("Search preview failed:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        } else {
            setSearchResults([]);
            setIsSearching(false);
            // Show recent searches when input is focused but empty/short
            if (isSearchFocused) {
                const recent = getRecentSearches();
                setRecentSearches(recent);
                setShowSearchPreview(recent.length > 0);
            } else {
                setShowSearchPreview(false);
            }
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, isSearchFocused]);

    // Close search preview when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isOutsideDesktop = searchContainerRef.current && !searchContainerRef.current.contains(target);
            const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);
            const isDropdownClick = (event.target as HTMLElement).closest('[data-search-dropdown]');

            if (isOutsideDesktop && isOutsideMobile && !isDropdownClick) {
                setShowSearchPreview(false);
                setIsSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calculate dropdown position when showing
    const updateDropdownPosition = () => {
        const desktopRef = searchInputRef.current;
        const mobileRef = mobileSearchRef.current;
        const isDesktop = window.innerWidth >= 1024;
        const activeRef = isDesktop ? desktopRef : mobileRef;

        if (activeRef) {
            const rect = activeRef.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
        }
    };

    // Update position when showing preview
    useEffect(() => {
        if (showSearchPreview) {
            updateDropdownPosition();
        }
    }, [showSearchPreview, searchResults, recentSearches]);

    // Update position on scroll/resize
    useEffect(() => {
        if (showSearchPreview) {
            const handleUpdate = () => updateDropdownPosition();
            window.addEventListener('scroll', handleUpdate, true);
            window.addEventListener('resize', handleUpdate);
            return () => {
                window.removeEventListener('scroll', handleUpdate, true);
                window.removeEventListener('resize', handleUpdate);
            };
        }
    }, [showSearchPreview]);

    const handleCategoryEnter = (categoryId: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = setTimeout(() => {
            setActiveCategory(categoryId);
        }, 500);
    };

    const handleCategoryLeave = () => {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setActiveCategory(null);
        }, 150);
    };

    const handleMegaMenuEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            addRecentSearch(searchQuery.trim());
            setShowSearchPreview(false);
            setIsSearchFocused(false);
            router.push(`/market/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleBarcodeScan = async (code: string) => {
        if (isScanLookup) return;
        const barcode = code.trim();
        if (!barcode) return;
        setIsScanLookup(true);
        setShowScanner(false);
        try {
            const response = await productsApi.search(barcode, 1);
            const products = response.data?.products || [];
            if (products.length === 1) {
                toast.success(`Ürün bulundu: ${products[0].name}`);
                router.push(`/market/product/${products[0].id}`);
            } else if (products.length > 1) {
                addRecentSearch(barcode);
                setSearchQuery(barcode);
                router.push(`/market/search?q=${encodeURIComponent(barcode)}`);
            } else {
                toast.error(`"${barcode}" barkoduyla eşleşen ürün bulunamadı.`);
            }
        } catch (error) {
            console.error("Barcode search failed:", error);
            toast.error("Barkod aranırken bir hata oluştu.");
        } finally {
            setIsScanLookup(false);
        }
    };

    const handleRecentSearchClick = (term: string) => {
        setSearchQuery(term);
        addRecentSearch(term);
        setShowSearchPreview(false);
        setIsSearchFocused(false);
        router.push(`/market/search?q=${encodeURIComponent(term)}`);
    };

    const handleRemoveRecentSearch = (term: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        removeRecentSearch(term);
        const updated = getRecentSearches();
        setRecentSearches(updated);
        if (updated.length === 0 && searchResults.length === 0) {
            setShowSearchPreview(false);
        }
    };

    const handleClearAllRecent = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        clearRecentSearches();
        setRecentSearches([]);
        if (searchResults.length === 0) {
            setShowSearchPreview(false);
        }
    };

    const activeCategoryData = categories.find(c => c.id === activeCategory);

    return (
        <header className={cn(
            "sticky top-0 z-50 transition-colors duration-150 safe-area-top",
            isScrolled ? "shadow-lg" : "shadow-sm"
        )}>
            {/* Topbar - Announcement */}
            <Topbar
                show={siteSettings?.show_top_bar === true}
                phone={siteSettings?.top_bar_phone}
            />

            {/* Main Header */}
            <div className="bg-white border-b-[2.5px] border-[#1E3A5F] transition-colors duration-300 overflow-x-hidden relative z-50">
                <div className="max-w-[1300px] mx-auto px-3 sm:px-4 lg:px-7 h-16 sm:h-[72px] flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
                    {/* Mobile Menu Button */}
                    {mounted ? (
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden text-[#1a1a1a] w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 hover:bg-[#F0F4FA]">
                                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[320px] p-0 bg-white">
                                <SheetHeader className="p-4 border-b border-[#D9E2EF] bg-[#1E3A5F]">
                                    <SheetTitle className="text-white flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-black text-sm">i</span>
                                        </div>
                                        i-hırdavat Menü
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="overflow-y-auto h-[calc(100vh-80px)]">
                                    {/* Mobile Search */}
                                    <div className="p-4 border-b border-[#f0eceb]">
                                        <form onSubmit={handleSearch}>
                                            <div className="relative">
                                                <Input
                                                    type="search"
                                                    placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full h-10 pl-10 pr-4 bg-[#F0F4FA] border-[#D9E2EF] rounded-[14px] focus:border-[#1E3A5F]"
                                                />
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                                            </div>
                                        </form>
                                    </div>

                                    {/* Mobile Categories */}
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                                            Kategoriler
                                        </div>
                                        {categories.map((category) => (
                                            <div key={category.id}>
                                                <SheetClose asChild>
                                                    <Link
                                                        href={`/market/category/${category.full_slug || category.slug}`}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F0F4FA] transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-[#D9E2EF] flex items-center justify-center text-[#1E3A5F]">
                                                            <Icon icon={getCategoryIcon(category.slug)} className="w-5 h-5" />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-[#1a1a1a]">
                                                            {category.name}
                                                        </span>
                                                        {category.children && category.children.length > 0 && (
                                                            <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                                                        )}
                                                    </Link>
                                                </SheetClose>
                                                {category.children && category.children.length > 0 && (
                                                    <div className="pl-12 pb-2">
                                                        {category.children.slice(0, 5).map((child) => (
                                                            <SheetClose key={child.id} asChild>
                                                                <Link
                                                                    href={`/market/category/${child.full_slug || child.slug}`}
                                                                    className="block py-2 px-4 text-sm text-[#6b7280] hover:text-[#1E3A5F] transition-colors"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            </SheetClose>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mobile Quick Links */}
                                    <div className="border-t border-[#f0eceb] py-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                                            Hizli Erisim
                                        </div>
                                        <SheetClose asChild>
                                            <Link
                                                href="/market/hesabim"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F0F4FA] transition-colors"
                                            >
                                                <User className="w-5 h-5 text-[#1E3A5F]" />
                                                <span className="text-sm font-medium text-[#1a1a1a]">Hesabım</span>
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href="/market/hesabim?tab=siparislerim"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F0F4FA] transition-colors"
                                            >
                                                <ShoppingBag className="w-5 h-5 text-[#1E3A5F]" />
                                                <span className="text-sm font-medium text-[#1a1a1a]">Siparişlerim</span>
                                            </Link>
                                        </SheetClose>
                                    </div>

                                    {/* Mobile User Section */}
                                    {user ? (
                                        <div className="border-t border-[#f0eceb] p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-sm bg-[#1E3A5F] flex items-center justify-center text-white font-medium uppercase">
                                                    {(user.seller_name || user.pharmacy_name)?.[0] || user.email?.[0] || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-900">{user.seller_name || user.pharmacy_name || 'Bayi'}</p>
                                                    <p className="text-xs text-neutral-600">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full text-red-500 border-red-200 hover:bg-red-50"
                                                onClick={() => {
                                                    logout();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Çıkış Yap
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border-t border-[#f0eceb] p-4">
                                            <SheetClose asChild>
                                                <Button
                                                    className="w-full bg-[#1E3A5F] hover:bg-[#0F1F35] text-white"
                                                    onClick={() => router.push("/login")}
                                                >
                                                    Giriş Yap / Kayıt Ol
                                                </Button>
                                            </SheetClose>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    ) : (
                        <Button variant="ghost" size="icon" className="lg:hidden text-[#1a1a1a] w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                        </Button>
                    )}

                    {/* Logo — Industrial Pro: sarı kutu + koyu wrench ikon */}
                    <Link href="/market" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-accent-500 rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-accent-400 transition-colors">
                            <Wrench className="w-6 h-6 sm:w-6.5 sm:h-6.5 text-primary-900" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col min-w-0 leading-none">
                            <span className="font-black text-xl sm:text-[26px] text-neutral-900 tracking-tight leading-none">i-hırdavat</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-primary-700 tracking-[2.5px] uppercase hidden sm:block whitespace-nowrap mt-1">B2B Pazaryeri</span>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop — image-matched: border-primary-900 + solid Ara butonu */}
                    <div ref={searchContainerRef} className="hidden lg:flex flex-1 max-w-[760px] relative">
                        <form onSubmit={handleSearch} className="w-full" ref={searchInputRef}>
                            <div className="flex w-full">
                                <div className="relative flex-1">
                                    <Input
                                        type="search"
                                        placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={handleSearchFocus}
                                        className="w-full h-[52px] pl-5 pr-12 bg-white border-2 border-primary-900 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-700 focus:ring-2 focus:ring-primary-500/20 rounded-l-md rounded-r-none transition-all duration-150 text-[15px]"
                                        title="Barkod / SKU ile ara"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Barkod tara"
                                        onClick={() => setShowScanner(true)}
                                        className="absolute top-1/2 -translate-y-1/2 right-2 h-9 w-9 rounded-sm text-neutral-400 hover:text-primary-700 transition-colors flex items-center justify-center"
                                    >
                                        {isScanLookup ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <ScanLine className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="h-[52px] w-[96px] -ml-[2px] bg-primary-900 hover:bg-primary-700 text-white font-bold text-[15px] rounded-r-md border-2 border-primary-900 transition-colors flex items-center justify-center shrink-0"
                                >
                                    {isSearching ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Ara"
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Search Preview Dropdown - Enhanced */}
                        {showSearchPreview && (
                            <div
                                data-search-dropdown
                                className="hidden lg:block fixed bg-white rounded-xl border border-[#f0eceb] shadow-xl z-[9999] overflow-hidden"
                                style={{
                                    top: dropdownPosition.top,
                                    left: dropdownPosition.left,
                                    width: dropdownPosition.width || 'auto',
                                    minWidth: 400,
                                    maxHeight: 'calc(100vh - 200px)',
                                    overflowY: 'auto'
                                }}
                            >
                                {/* Recent Searches Section */}
                                {searchQuery.length < 3 && recentSearches.length > 0 && (
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                Son Aramalar
                                            </span>
                                            <button
                                                onClick={handleClearAllRecent}
                                                className="text-[10px] text-[#6b7280] hover:text-red-500 font-medium transition-colors"
                                            >
                                                Temizle
                                            </button>
                                        </div>
                                        <div className="space-y-0.5">
                                            {recentSearches.slice(0, 5).map((term) => (
                                                <button
                                                    key={term}
                                                    onClick={() => handleRecentSearchClick(term)}
                                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F0F4FA] transition-colors group text-left"
                                                >
                                                    <Search className="w-3.5 h-3.5 text-[#9ca3af] flex-shrink-0" />
                                                    <span className="text-sm text-[#374151] flex-1 truncate group-hover:text-[#1E3A5F] transition-colors">
                                                        {term}
                                                    </span>
                                                    <span
                                                        onClick={(e) => handleRemoveRecentSearch(term, e)}
                                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#f0eceb] transition-all"
                                                    >
                                                        <X className="w-3 h-3 text-[#9ca3af]" />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Loading indicator */}
                                {isSearching && searchQuery.length >= 3 && (
                                    <div className="flex items-center justify-center gap-2 py-6">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#1E3A5F]" />
                                        <span className="text-sm text-[#6b7280]">Aranıyor...</span>
                                    </div>
                                )}

                                {/* Product Suggestions Grid */}
                                {searchResults.length > 0 && searchQuery.length >= 3 && (
                                    <>
                                        <div className="px-3 pt-3 pb-2">
                                            <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                                                Ürünler
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                                            {searchResults.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/market/product/${product.id}`}
                                                    onClick={() => {
                                                        addRecentSearch(searchQuery);
                                                        setShowSearchPreview(false);
                                                        setIsSearchFocused(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="flex flex-col items-center p-2.5 rounded-xl hover:bg-[#F0F4FA] transition-all group border border-transparent hover:border-[#D9E2EF]"
                                                >
                                                    <div className="relative w-full aspect-square bg-[#faf8f6] rounded-lg mb-2 overflow-hidden">
                                                        {(product.image_url || product.image) ? (
                                                            <Image
                                                                src={(product.image_url || product.image)!}
                                                                alt={product.name}
                                                                fill
                                                                sizes="120px"
                                                                className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Box className="w-8 h-8 text-[#d1d5db]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-[#1a1a1a] line-clamp-2 text-center leading-tight w-full">
                                                        {product.name}
                                                    </p>
                                                    {product.brand && (
                                                        <p className="text-[9px] text-[#6b7280] mt-0.5 uppercase tracking-wide">
                                                            {product.brand}
                                                        </p>
                                                    )}
                                                    {product.lowest_price ? (
                                                        <p className="text-xs font-bold text-[#1E3A5F] mt-1">
                                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.lowest_price)}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-[#9ca3af] mt-1">Fiyat yok</p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="p-2 bg-[#F0F4FA] border-t border-[#f0eceb]">
                                            <Button
                                                variant="ghost"
                                                className="w-full text-sm font-semibold text-[#1E3A5F] hover:text-[#0F1F35] hover:bg-[#D9E2EF]"
                                                onClick={() => {
                                                    addRecentSearch(searchQuery);
                                                    router.push(`/market/search?q=${encodeURIComponent(searchQuery)}`);
                                                    setShowSearchPreview(false);
                                                    setIsSearchFocused(false);
                                                }}
                                            >
                                                Tüm Arama Sonuçlarını Gör
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Actions - Vertical icon+label layout */}
                    <div className="flex items-center gap-1 lg:gap-4 shrink-0">

                        {/* Quick Order — desktop only */}
                        {user && user.role !== 'company' && (
                            <button
                                type="button"
                                onClick={() => setQuickOrderOpen(true)}
                                className="hidden lg:flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-sm text-neutral-800 hover:bg-accent-bg hover:text-accent-600 transition-colors cursor-pointer outline-none"
                                title="Hızlı Sipariş — SKU listesi yapıştırarak toplu sepete ekleyin"
                            >
                                <Zap className="w-[22px] h-[22px]" strokeWidth={2.25} />
                                <span className="text-[11px] font-medium leading-none">Hızlı Sipariş</span>
                            </button>
                        )}

                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* Hesabim with dropdown */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[#374151] hover:bg-[#F0F4FA] hover:text-[#1E3A5F] transition-colors cursor-pointer outline-none">
                                        {/* Mobile: avatar */}
                                        <div className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-[#1E3A5F] flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0 uppercase">
                                            {(user.seller_name || user.pharmacy_name)?.[0] || user.email?.[0] || "U"}
                                        </div>
                                        {/* Desktop: icon + text vertical */}
                                        <User className="w-[22px] h-[22px] hidden lg:block" />
                                        <span className="text-[11px] font-medium hidden lg:inline leading-none">Hesabım</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-72 p-2 bg-white border border-neutral-200 text-neutral-900 shadow-md rounded-md">
                                    <DropdownMenuLabel className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-sm bg-[#1E3A5F] flex items-center justify-center text-white font-bold text-base uppercase">
                                                {(user.seller_name || user.pharmacy_name)?.[0] || user.email?.[0] || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-neutral-900 truncate">{user.seller_name || user.pharmacy_name || 'Bayi'}</p>
                                                <p className="text-xs text-neutral-600 truncate">{user.email}</p>
                                                {user.tax_number && (
                                                    <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                                                        <span className="uppercase tracking-wide">VKN</span>
                                                        <span className="font-mono tabular-num text-neutral-800">{user.tax_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-neutral-200" />
                                    <DropdownMenuItem
                                        onClick={() => router.push('/market/hesabim?tab=satis-panelim')}
                                        className="focus:bg-[#F0F4FA] cursor-pointer py-2.5 rounded-sm"
                                    >
                                        <Store className="mr-3 h-4 w-4 text-[#6b7280]" />
                                        <span>Bayi Panelim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/market/hesabim?tab=ilanlarim')}
                                        className="focus:bg-[#F0F4FA] cursor-pointer py-2.5 rounded-sm"
                                    >
                                        <Box className="mr-3 h-4 w-4 text-[#6b7280]" />
                                        <span>Ürünlerim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/market/hesabim?tab=siparislerim')}
                                        className="focus:bg-[#F0F4FA] cursor-pointer py-2.5 rounded-sm"
                                    >
                                        <ShoppingBag className="mr-3 h-4 w-4 text-[#6b7280]" />
                                        <span>Siparişlerim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/market/hesabim?tab=hesap-hareketlerim')}
                                        className="focus:bg-[#F0F4FA] cursor-pointer py-2.5 rounded-sm"
                                    >
                                        <History className="mr-3 h-4 w-4 text-[#6b7280]" />
                                        <span>Hesap Hareketlerim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/market/hesabim?tab=destek')}
                                        className="focus:bg-[#F0F4FA] cursor-pointer py-2.5 rounded-sm"
                                    >
                                        <MessageCircle className="mr-3 h-4 w-4 text-[#6b7280]" />
                                        <span>Destek</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-neutral-200" />
                                    <DropdownMenuItem
                                        onClick={() => router.push('/market/hesabim?tab=ayarlarim')}
                                        className="focus:bg-[#F0F4FA] cursor-pointer py-2.5 rounded-sm"
                                    >
                                        <Settings className="mr-3 h-4 w-4 text-[#6b7280]" />
                                        <span>Ayarlar</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer py-2.5 rounded-sm"
                                    >
                                        <LogOut className="mr-3 h-4 w-4" />
                                        <span>Çıkış Yap</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={() => router.push("/login")}
                                size="sm"
                                className="bg-[#1E3A5F] hover:bg-[#0F1F35] text-white font-medium ml-1 sm:ml-2 shadow-sm h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm rounded-lg"
                            >
                                <User className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Giriş Yap</span>
                            </Button>
                        )}

                        {/* Favorilerim */}
                        <Link
                            href="/market/hesabim?tab=begendiklerim"
                            className="hidden sm:flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[#374151] hover:bg-[#F0F4FA] hover:text-[#1E3A5F] transition-colors"
                        >
                            <Heart className="w-[22px] h-[22px]" />
                            <span className="text-[11px] font-medium hidden lg:inline leading-none">Favorilerim</span>
                        </Link>

                        {/* Sepetim */}
                        <MiniCart />
                    </div>
                </div>
            </div>

            {/* Category Navigation Bar — Industrial Pro: dark navy + sarı bullet + accent border */}
            <nav className="hidden lg:block relative z-40 bg-primary-900 border-b-2 border-accent-500">
                <div className="max-w-[1300px] mx-auto px-7">
                    <div className="flex items-center gap-6 h-12">
                        {/* "Tüm Kategoriler" trigger — ilk kategorinin mega menusunu açar */}
                        <button
                            type="button"
                            onMouseEnter={() =>
                                categories[0] && handleCategoryEnter(categories[0].id)
                            }
                            onMouseLeave={handleCategoryLeave}
                            onClick={() => router.push("/market")}
                            className="inline-flex items-center gap-2 font-bold text-accent-500 text-[14px] pr-6 border-r border-white/15 h-full"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                            Tüm Kategoriler
                        </button>

                        {/* Top-level category links */}
                        <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
                            {categories.length === 0
                                ? Array(7)
                                      .fill(0)
                                      .map((_, i) => (
                                          <div key={i} className="h-12 flex items-center px-3">
                                              <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                                          </div>
                                      ))
                                : categories.slice(0, 7).map((category) => (
                                      <div
                                          key={category.id}
                                          className="relative h-12 flex items-center"
                                          onMouseEnter={() => handleCategoryEnter(category.id)}
                                          onMouseLeave={handleCategoryLeave}
                                      >
                                          <Link
                                              href={`/market/category/${category.full_slug || category.slug}`}
                                              className={cn(
                                                  "px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors",
                                                  activeCategory === category.id
                                                      ? "text-accent-500"
                                                      : "text-white/90 hover:text-accent-500"
                                              )}
                                          >
                                              {category.name}
                                          </Link>
                                      </div>
                                  ))}
                        </div>
                    </div>
                </div>

                {/* Mega Menu Dropdown */}
                {activeCategory && activeCategoryData && activeCategoryData.children && activeCategoryData.children.length > 0 && (
                    <div
                        key={activeCategory}
                        ref={megaMenuRef}
                        className="absolute left-0 right-0 top-full bg-white shadow-lg border-t border-[#f0eceb] z-50 animate-in fade-in slide-in-from-top-1 duration-200"
                        onMouseEnter={handleMegaMenuEnter}
                        onMouseLeave={handleCategoryLeave}
                    >
                        <div className="max-w-[1300px] mx-auto px-7 py-6">
                            <div className="flex gap-8">
                                {/* Left: Subcategories */}
                                <div className="flex-1">
                                    <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                                        {activeCategoryData.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/market/category/${child.full_slug || child.slug}`}
                                                className="py-2.5 px-3 rounded-lg text-sm text-[#374151] hover:bg-[#F0F4FA] hover:text-[#1E3A5F] transition-colors"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Top Brands */}
                                {activeCategoryData.top_brands && activeCategoryData.top_brands.length > 0 && (
                                    <div className="w-64 flex-shrink-0 border-l border-[#f0eceb] pl-8">
                                        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Markalar</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {activeCategoryData.top_brands.slice(0, 10).map((brand) => (
                                                <Link
                                                    key={brand.slug}
                                                    href={`/market/marka/${brand.slug}`}
                                                    className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#F0F4FA] transition-colors group"
                                                >
                                                    {brand.logo ? (
                                                        <img
                                                            src={brand.logo}
                                                            alt={brand.name}
                                                            className="w-6 h-6 object-contain rounded"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-[#D9E2EF] rounded flex items-center justify-center text-[10px] font-bold text-[#1E3A5F]">
                                                            {brand.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-[#374151] group-hover:text-[#1E3A5F] transition-colors truncate">
                                                        {brand.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </nav>

            {/* Mobile Search Bar */}
            <div ref={mobileSearchRef} className="lg:hidden bg-white border-b border-[#f0eceb] px-3 sm:px-4 py-2 sm:py-3 transition-colors duration-150 relative z-[60]">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Input
                            type="search"
                            placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={handleSearchFocus}
                            className="w-full h-10 sm:h-11 pl-4 pr-[88px] bg-[#F0F4FA] border-2 border-[#D9E2EF] text-[#1a1a1a] rounded-[14px] text-sm focus:border-[#1E3A5F]"
                        />
                        <button
                            type="button"
                            aria-label="Barkod tara"
                            onClick={() => setShowScanner(true)}
                            className="absolute top-1/2 -translate-y-1/2 right-[48px] h-8 w-8 rounded-[10px] bg-white border border-[#D9E2EF] text-[#1E3A5F] flex items-center justify-center"
                        >
                            {isScanLookup ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ScanLine className="w-4 h-4" />
                            )}
                        </button>
                        <div className="absolute inset-y-0 right-0 p-[5px]">
                            <button
                                type="submit"
                                className="h-full w-10 rounded-[10px] bg-[#1E3A5F] text-white flex items-center justify-center"
                            >
                                {isSearching ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Mobile Search Preview Dropdown - Fixed position */}
            {showSearchPreview && (
                <div
                    data-search-dropdown
                    className="lg:hidden fixed bg-white rounded-xl border border-[#f0eceb] shadow-xl z-[9999] overflow-hidden"
                    style={{
                        top: dropdownPosition.top,
                        left: 12,
                        right: 12,
                        maxHeight: 'calc(100vh - 200px)',
                        overflowY: 'auto'
                    }}
                >
                    {/* Recent Searches - Mobile */}
                    {searchQuery.length < 3 && recentSearches.length > 0 && (
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    Son Aramalar
                                </span>
                                <button
                                    onClick={handleClearAllRecent}
                                    className="text-[10px] text-[#6b7280] hover:text-red-500 font-medium"
                                >
                                    Temizle
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {recentSearches.slice(0, 5).map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => handleRecentSearchClick(term)}
                                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F0F4FA] transition-colors group text-left"
                                    >
                                        <Search className="w-3.5 h-3.5 text-[#9ca3af] flex-shrink-0" />
                                        <span className="text-sm text-[#374151] flex-1 truncate">{term}</span>
                                        <span
                                            onClick={(e) => handleRemoveRecentSearch(term, e)}
                                            className="p-0.5 rounded hover:bg-[#f0eceb]"
                                        >
                                            <X className="w-3 h-3 text-[#9ca3af]" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading - Mobile */}
                    {isSearching && searchQuery.length >= 3 && (
                        <div className="flex items-center justify-center gap-2 py-6">
                            <Loader2 className="w-4 h-4 animate-spin text-[#1E3A5F]" />
                            <span className="text-sm text-[#6b7280]">Aranıyor...</span>
                        </div>
                    )}

                    {/* Product Suggestions - Mobile (list format for smaller screens) */}
                    {searchResults.length > 0 && searchQuery.length >= 3 && (
                        <>
                            <div className="p-2 border-b border-[#f0eceb] sticky top-0 bg-white">
                                <span className="text-xs text-[#6b7280] font-semibold">
                                    Urun Onerileri
                                </span>
                            </div>
                            <div className="divide-y divide-[#f0eceb]">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/market/product/${product.id}`}
                                        onClick={() => {
                                            addRecentSearch(searchQuery);
                                            setShowSearchPreview(false);
                                            setIsSearchFocused(false);
                                            setSearchQuery("");
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-[#F0F4FA] transition-colors"
                                    >
                                        <div className="relative w-12 h-12 bg-[#faf8f6] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {(product.image_url || product.image) ? (
                                                <Image
                                                    src={(product.image_url || product.image)!}
                                                    alt={product.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-contain p-1"
                                                />
                                            ) : (
                                                <Box className="w-5 h-5 text-[#6b7280]" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#1a1a1a] line-clamp-1">
                                                {product.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {product.brand && (
                                                    <span className="text-[10px] text-[#6b7280] uppercase">{product.brand}</span>
                                                )}
                                                {product.offers_count && product.offers_count > 0 && (
                                                    <span className="text-[10px] bg-[#D9E2EF] text-[#1E3A5F] px-1.5 py-0.5 rounded font-medium">
                                                        {product.offers_count} teklif
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {product.lowest_price ? (
                                            <p className="text-sm font-bold text-[#1E3A5F] flex-shrink-0">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.lowest_price)}
                                            </p>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>
                            <div className="p-2 bg-[#F0F4FA] border-t border-[#f0eceb] sticky bottom-0">
                                <Button
                                    variant="ghost"
                                    className="w-full text-sm font-semibold text-[#1E3A5F] hover:text-[#0F1F35] hover:bg-[#D9E2EF]"
                                    onClick={() => {
                                        addRecentSearch(searchQuery);
                                        router.push(`/market/search?q=${encodeURIComponent(searchQuery)}`);
                                        setShowSearchPreview(false);
                                        setIsSearchFocused(false);
                                    }}
                                >
                                    Tüm Arama Sonuçlarını Gör
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScan}
                    onClose={() => setShowScanner(false)}
                />
            )}

            <QuickOrderModal open={quickOrderOpen} onClose={() => setQuickOrderOpen(false)} />
        </header>
    );
}
