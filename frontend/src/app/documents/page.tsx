"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { documentsApi, contractsApi, SellerDocument } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Upload,
    Download,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    AlertTriangle,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Bayi / satıcı (hardware seller) için gerekli belgeler.
 * Enum key'leri backend `seller_documents.type` sütunundan geliyor — sadece
 * label ve required yapısı hardware B2B'ye göre ayarlanmış.
 */
const SELLER_DOCUMENT_TYPES = [
    { value: "vergi_levhasi", label: "Vergi Levhası", required: true },
    { value: "imza_sirkusu", label: "İmza Sirküleri", required: true },
    { value: "ticaret_sicili", label: "Ticaret Sicil Gazetesi", required: false },
    { value: "oda_kaydi", label: "Oda Kayıt Belgesi (Ticaret / Sanayi)", required: false },
    { value: "ruhsat", label: "Faaliyet Belgesi", required: false },
    { value: "kimlik", label: "Yetkili Kişi Kimlik Fotokopisi", required: false },
];

const COMPANY_DOCUMENT_TYPES = [
    { value: "vergi_levhasi", label: "Vergi Levhası", required: true },
    { value: "kimlik", label: "Yetkili Kişi Kimlik Fotokopisi", required: true },
    { value: "imza_sirkusu", label: "İmza Sirküleri", required: false },
];

const STATUS_CONFIG = {
    pending: { color: "bg-warning-bg text-warning", icon: Clock, label: "Bekliyor" },
    approved: { color: "bg-success-bg text-success", icon: CheckCircle2, label: "Onaylandı" },
    rejected: { color: "bg-danger-bg text-danger", icon: XCircle, label: "Reddedildi" },
};

export default function DocumentsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contractFileInputRef = useRef<HTMLInputElement>(null);

    const [documents, setDocuments] = useState<SellerDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [contractUploading, setContractUploading] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [allApproved, setAllApproved] = useState(false);
    const [missingTypes, setMissingTypes] = useState<string[]>([]);

    const isCompany = user?.role === "company";
    const DOCUMENT_TYPES = isCompany ? COMPANY_DOCUMENT_TYPES : SELLER_DOCUMENT_TYPES;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            loadDocuments();
        }
    }, [user, authLoading]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentsApi.getAll();
            if (response.data) {
                setDocuments(response.data.documents);
                setAllApproved(response.data.all_approved);
                setMissingTypes(response.data.missing_types);
            }
        } catch (error) {
            console.error("Failed to load documents:", error);
            toast.error("Belgeler yüklenirken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedType) return;

        const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            toast.error("Sadece PDF, JPG ve PNG dosyaları yüklenebilir");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
            return;
        }

        try {
            setUploading(true);
            const response = await documentsApi.upload(selectedType, file);
            if (response.data) {
                toast.success("Belge başarıyla yüklendi");
                loadDocuments();
                setSelectedType("");
            } else {
                toast.error(response.error || "Belge yüklenirken hata oluştu");
            }
        } catch {
            toast.error("Belge yüklenirken hata oluştu");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await documentsApi.delete(id);
            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success("Belge silindi");
                loadDocuments();
            }
        } catch {
            toast.error("Belge silinirken hata oluştu");
        }
    };

    const getDocumentByType = (type: string) => {
        return documents.find((d) => d.type === type);
    };

    const contractDoc = documents.find((d) => d.type === "sozlesme");

    const handleDownloadContract = async () => {
        try {
            const response = await contractsApi.downloadRegistration();
            if (response.blob) {
                const url = window.URL.createObjectURL(response.blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "uyelik-sozlesmesi.pdf";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                toast.error(response.error || "Sözleşme indirilemedi");
            }
        } catch {
            toast.error("Sözleşme indirilemedi");
        }
    };

    const handleContractFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            toast.error("Sadece PDF, JPG ve PNG dosyaları yüklenebilir");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
            return;
        }

        try {
            setContractUploading(true);
            const response = await contractsApi.uploadSigned(file);
            if (response.data?.success) {
                toast.success(response.data.message || "Sözleşme başarıyla yüklendi");
                loadDocuments();
            } else {
                toast.error("Sözleşme yüklenirken hata oluştu");
            }
        } catch {
            toast.error("Sözleşme yüklenirken hata oluştu");
        } finally {
            setContractUploading(false);
            if (contractFileInputRef.current) {
                contractFileInputRef.current.value = "";
            }
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700" />
            </div>
        );
    }

    const rolePitch = isCompany
        ? "Kurumsal alıcı olarak platformda tedarik yapabilmek için gerekli belgeleri yükleyin."
        : "Bayi olarak ürün listeleyebilmeniz için firma belgelerinizi yükleyin ve onay alın.";

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">Evrak Yönetimi</h1>
                    <p className="text-neutral-600 mt-2">{rolePitch}</p>
                </div>

                {/* Status Alert */}
                {allApproved ? (
                    <div className="mb-6 bg-success-bg border border-success/30 rounded-md p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-success">Belgeleriniz Onaylandı</h3>
                            <p className="text-sm text-neutral-800">
                                Tüm gerekli belgeleriniz onaylanmış. Platforma tam erişiminiz var.
                            </p>
                        </div>
                        <Button
                            className="ml-auto bg-primary-700 hover:bg-primary-900 text-white"
                            onClick={() => router.push("/market/hesabim")}
                        >
                            Hesabıma Git
                        </Button>
                    </div>
                ) : (
                    <div className="mb-6 bg-warning-bg border border-warning/30 rounded-md p-4 flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-warning mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-warning">Evrak Onayı Gerekli</h3>
                            <p className="text-sm text-neutral-800">
                                Platformu tam olarak kullanabilmek için gerekli belgeleri yükleyin ve onay bekleyin.
                                {missingTypes.length > 0 && (
                                    <span className="block mt-1">
                                        Eksik belgeler:{" "}
                                        <strong>
                                            {missingTypes
                                                .map((t) => DOCUMENT_TYPES.find((d) => d.value === t)?.label ?? t)
                                                .join(", ")}
                                        </strong>
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Registration Contract Section */}
                <Card className="mb-8 border-primary-100 bg-primary-50/40 rounded-md">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-sm bg-primary-100">
                                <FileText className="h-5 w-5 text-primary-700" />
                            </div>
                            <div>
                                <CardTitle className="text-neutral-900">B2B Üyelik Sözleşmesi</CardTitle>
                                <CardDescription className="text-neutral-600">
                                    Sözleşmeyi indirip imzaladıktan sonra tarayarak ya da fotoğrafını çekerek yükleyin.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                className="gap-2 border-primary-100 text-primary-700 hover:bg-primary-50"
                                onClick={handleDownloadContract}
                            >
                                <Download className="h-4 w-4" />
                                Sözleşmeyi İndir
                            </Button>

                            <input
                                ref={contractFileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleContractFileSelect}
                                className="hidden"
                            />

                            <Button
                                className="gap-2 bg-accent-500 hover:bg-accent-400 text-primary-900 font-bold"
                                onClick={() => contractFileInputRef.current?.click()}
                                disabled={contractUploading}
                            >
                                <Upload className="h-4 w-4" />
                                {contractUploading
                                    ? "Yükleniyor..."
                                    : contractDoc
                                    ? "Yeniden Yükle"
                                    : "İmzalı Sözleşmeyi Yükle"}
                            </Button>
                        </div>

                        {contractDoc && (
                            <div
                                className={`mt-4 p-4 rounded-sm border ${
                                    contractDoc.status === "approved"
                                        ? "bg-success-bg border-success/30"
                                        : contractDoc.status === "rejected"
                                        ? "bg-danger-bg border-danger/30"
                                        : "bg-white border-neutral-200"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-sm bg-primary-50">
                                            <FileText className="h-5 w-5 text-primary-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-neutral-900">
                                                {contractDoc.original_name || "İmzalı Sözleşme"}
                                            </h4>
                                            <p className="text-sm text-neutral-600 tabular-num">
                                                {contractDoc.created_at
                                                    ? new Date(contractDoc.created_at).toLocaleDateString("tr-TR", {
                                                          day: "numeric",
                                                          month: "long",
                                                          year: "numeric",
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      })
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge className={STATUS_CONFIG[contractDoc.status].color}>
                                            {(() => {
                                                const StatusIcon = STATUS_CONFIG[contractDoc.status].icon;
                                                return <StatusIcon className="h-3 w-3 mr-1" />;
                                            })()}
                                            {STATUS_CONFIG[contractDoc.status].label}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(contractDoc.file_url, "_blank")}
                                            title="Görüntüle"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {contractDoc.status === "rejected" && contractDoc.rejection_reason && (
                                    <div className="mt-3 p-3 bg-danger-bg border border-danger/30 rounded-sm">
                                        <p className="text-sm text-danger">
                                            <strong>Ret Sebebi:</strong> {contractDoc.rejection_reason}
                                        </p>
                                    </div>
                                )}

                                {contractDoc.status === "pending" && (
                                    <p className="mt-2 text-sm text-warning">
                                        Sözleşmeniz inceleme aşamasında. Onay sonrası e-posta ile
                                        bilgilendirileceksiniz.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upload Section */}
                <Card className="mb-8 rounded-md border-neutral-200">
                    <CardHeader>
                        <CardTitle className="text-neutral-900">Yeni Belge Yükle</CardTitle>
                        <CardDescription className="text-neutral-600">
                            PDF, JPG veya PNG formatında, maksimum 10 MB boyutunda dosya yükleyebilirsiniz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-full sm:w-72 rounded-sm">
                                    <SelectValue placeholder="Belge tipi seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((type) => {
                                        const existing = getDocumentByType(type.value);
                                        const disabled = existing?.status === "approved";
                                        return (
                                            <SelectItem
                                                key={type.value}
                                                value={type.value}
                                                disabled={disabled}
                                            >
                                                {type.label} {type.required && "*"}
                                                {disabled && " (Onaylı)"}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!selectedType || uploading}
                                className="gap-2 bg-primary-700 hover:bg-primary-900 text-white"
                            >
                                <Upload className="h-4 w-4" />
                                {uploading ? "Yükleniyor..." : "Dosya Seç ve Yükle"}
                            </Button>
                        </div>

                        <p className="text-xs text-neutral-600 mt-3">
                            <span className="text-danger">*</span> işaretli belgeler zorunludur.
                        </p>
                    </CardContent>
                </Card>

                {/* Documents List */}
                <Card className="rounded-md border-neutral-200">
                    <CardHeader>
                        <CardTitle className="text-neutral-900">Yüklenen Belgeler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {DOCUMENT_TYPES.map((type) => {
                                const doc = getDocumentByType(type.value);
                                const StatusIcon = doc ? STATUS_CONFIG[doc.status].icon : null;

                                return (
                                    <div
                                        key={type.value}
                                        className={`p-4 rounded-sm border transition-colors ${
                                            doc ? "bg-white border-neutral-200" : "bg-neutral-50 border-dashed border-neutral-200"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`p-2 rounded-sm shrink-0 ${
                                                        doc ? "bg-primary-50" : "bg-neutral-100"
                                                    }`}
                                                >
                                                    <FileText
                                                        className={`h-5 w-5 ${
                                                            doc ? "text-primary-700" : "text-neutral-400"
                                                        }`}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-neutral-900 truncate">
                                                        {type.label}
                                                        {type.required && (
                                                            <span className="text-danger ml-1">*</span>
                                                        )}
                                                    </h4>
                                                    {doc ? (
                                                        <p className="text-sm text-neutral-600 truncate">
                                                            {doc.original_name}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-neutral-400">Henüz yüklenmedi</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {doc && (
                                                    <>
                                                        <Badge className={STATUS_CONFIG[doc.status].color}>
                                                            {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                                                            {STATUS_CONFIG[doc.status].label}
                                                        </Badge>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(doc.file_url, "_blank")}
                                                            title="Görüntüle"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>

                                                        {doc.status !== "approved" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(doc.id)}
                                                                className="text-danger hover:text-danger hover:bg-danger-bg"
                                                                title="Sil"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {doc?.status === "rejected" && doc.rejection_reason && (
                                            <div className="mt-3 p-3 bg-danger-bg border border-danger/30 rounded-sm">
                                                <p className="text-sm text-danger">
                                                    <strong>Ret Sebebi:</strong> {doc.rejection_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Info */}
                <div className="mt-8 text-center text-sm text-neutral-600">
                    <p>
                        Belgeleriniz en kısa sürede incelenir. Onay sürecinde sorun yaşarsanız{" "}
                        <a
                            href="mailto:destek@i-hirdavat.com"
                            className="text-primary-700 hover:text-primary-500 font-medium underline"
                        >
                            destek@i-hirdavat.com
                        </a>{" "}
                        adresinden iletişime geçebilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
}
