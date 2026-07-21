import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/StarRating";
import { startLogin } from "@/const";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Upload, Trash2, Check, X, MailOpen, Mail, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState("gallery");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.55_0.08_295)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-serif text-3xl text-[oklch(0.30_0.05_295)]">{t("admin.loginRequired")}</h1>
        <Button
          onClick={() => startLogin()}
          className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] px-8 py-3"
        >
          {t("admin.login")}
        </Button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-serif text-3xl text-[oklch(0.30_0.05_295)]">403</h1>
        <p className="text-sm font-sans font-light text-[oklch(0.50_0.03_295)]">Access denied</p>
        <Button asChild variant="ghost" className="rounded-full border border-[oklch(0.70_0.04_295/0.3)]">
          <a href="/">{t("admin.backToSite")}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[oklch(0.30_0.05_295)]">{t("admin.title")}</h1>
            <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mt-1">
              {user.name || user.email}
            </p>
          </div>
          <Button asChild variant="ghost" className="rounded-full border border-[oklch(0.70_0.04_295/0.3)] text-sm">
            <a href="/"><ArrowLeft className="w-4 h-4 mr-2" />{t("admin.backToSite")}</a>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8 rounded-full bg-[oklch(0.94_0.02_300)] p-1">
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-[oklch(0.55_0.08_295)] data-[state=active]:text-[oklch(0.98_0.01_300)] text-sm">
              <ImageIcon className="w-4 h-4 mr-2" />{t("admin.gallery")}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-[oklch(0.55_0.08_295)] data-[state=active]:text-[oklch(0.98_0.01_300)] text-sm">
              {t("admin.reviews")}
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-full data-[state=active]:bg-[oklch(0.55_0.08_295)] data-[state=active]:text-[oklch(0.98_0.01_300)] text-sm">
              {t("admin.messages")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery"><GalleryAdmin /></TabsContent>
          <TabsContent value="reviews"><ReviewsAdmin lang={lang} t={t} /></TabsContent>
          <TabsContent value="messages"><MessagesAdmin lang={lang} t={t} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===== Gallery Admin =====
function GalleryAdmin() {
  const { t } = useI18n();
  const { data: photos, isLoading } = trpc.gallery.list.useQuery();
  const uploadMutation = trpc.gallery.upload.useMutation();
  const deleteMutation = trpc.gallery.delete.useMutation();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileBase64: base64,
          contentType: selectedFile.type || "image/jpeg",
          title: title || undefined,
          description: description || undefined,
          category: category || undefined,
        });
        toast.success(t("admin.uploadSuccess"));
        setSelectedFile(null);
        setTitle("");
        setDescription("");
        setCategory("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        utils.gallery.list.invalidate();
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      toast.error(t("admin.uploadError"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await deleteMutation.mutateAsync({ id });
      utils.gallery.list.invalidate();
      toast.success("OK");
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
        <h3 className="font-serif text-xl text-[oklch(0.30_0.05_295)] mb-4">{t("admin.uploadPhoto")}</h3>
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
              {t("admin.photoFile")}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm font-sans font-light text-[oklch(0.45_0.04_295)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-sans file:bg-[oklch(0.85_0.06_295/0.3)] file:text-[oklch(0.35_0.05_295)] hover:file:bg-[oklch(0.85_0.06_295/0.5)] cursor-pointer"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                {t("admin.photoTitle")}
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]" />
            </div>
            <div>
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                {t("admin.photoCategory")}
              </label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
              {t("admin.photoDescription")}
            </label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] resize-none" />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] px-6"
            >
              {uploadMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("admin.uploading")}</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />{t("admin.upload")}</>
              )}
            </Button>
            {selectedFile && (
              <Button variant="ghost" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="rounded-full">
                {t("admin.cancel")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Photo grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : !photos || photos.length === 0 ? (
        <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noPhotos")}</p>
      ) : (
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden border border-[oklch(0.90_0.02_300/0.3)]">
              <img src={photo.imageUrl} alt={photo.title || ""} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[oklch(0.20_0.03_295/0.7)] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                {photo.title && <p className="text-white text-xs font-serif text-center line-clamp-2">{photo.title}</p>}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(photo.id)}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />{t("admin.delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Reviews Admin =====
function ReviewsAdmin({ lang, t }: { lang: string; t: (key: string) => string }) {
  const { data: reviews, isLoading } = trpc.reviews.listAll.useQuery();
  const approveMutation = trpc.reviews.approve.useMutation();
  const rejectMutation = trpc.reviews.reject.useMutation();
  const deleteMutation = trpc.reviews.delete.useMutation();
  const utils = trpc.useUtils();

  const handleAction = async (action: "approve" | "reject" | "delete", id: number) => {
    if (action === "delete" && !confirm(t("admin.confirmDelete"))) return;
    try {
      if (action === "approve") await approveMutation.mutateAsync({ id });
      if (action === "reject") await rejectMutation.mutateAsync({ id });
      if (action === "delete") await deleteMutation.mutateAsync({ id });
      utils.reviews.listAll.invalidate();
      utils.reviews.listApproved.invalidate();
      toast.success("OK");
    } catch {
      toast.error("Error");
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-[oklch(0.85_0.08_70/0.3)] text-[oklch(0.45_0.08_70)]",
      approved: "bg-[oklch(0.85_0.08_160/0.3)] text-[oklch(0.35_0.08_160)]",
      rejected: "bg-[oklch(0.85_0.08_20/0.3)] text-[oklch(0.45_0.08_20)]",
    };
    const labels: Record<string, string> = {
      pending: t("admin.pending"),
      approved: t("admin.approved"),
      rejected: t("admin.rejected"),
    };
    return <span className={`text-xs px-2 py-1 rounded-full font-sans font-light ${colors[status]}`}>{labels[status]}</span>;
  };

  if (isLoading) return <Skeleton className="h-40 rounded-lg" />;
  if (!reviews || reviews.length === 0)
    return <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noReviews")}</p>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="corner-bracket p-5 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.85_0.06_295/0.4)] to-[oklch(0.88_0.04_350/0.3)] flex items-center justify-center">
                <span className="font-serif text-sm text-[oklch(0.40_0.05_295)]">{review.authorName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-[oklch(0.35_0.05_295)]">{review.authorName}</p>
                <p className="text-xs font-sans font-light text-[oklch(0.50_0.03_295)]">
                  {new Date(review.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : lang === "pt" ? "pt-BR" : "en-US")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} size={14} />
              {statusBadge(review.approved)}
            </div>
          </div>
          <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] italic mb-4">"{review.comment}"</p>
          <div className="flex gap-2">
            {review.approved !== "approved" && (
              <Button size="sm" onClick={() => handleAction("approve", review.id)} className="rounded-full h-8 px-3 text-xs bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)]">
                <Check className="w-3 h-3 mr-1" />{t("admin.approve")}
              </Button>
            )}
            {review.approved !== "rejected" && (
              <Button size="sm" variant="ghost" onClick={() => handleAction("reject", review.id)} className="rounded-full h-8 px-3 text-xs border border-[oklch(0.70_0.04_295/0.3)]">
                <X className="w-3 h-3 mr-1" />{t("admin.reject")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => handleAction("delete", review.id)} className="rounded-full h-8 px-3 text-xs text-[oklch(0.62_0.12_20)] hover:bg-[oklch(0.90_0.05_20/0.2)]">
              <Trash2 className="w-3 h-3 mr-1" />{t("admin.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Messages Admin =====
function MessagesAdmin({ lang, t }: { lang: string; t: (key: string) => string }) {
  const { data: messages, isLoading } = trpc.contact.listAll.useQuery();
  const markReadMutation = trpc.contact.markRead.useMutation();
  const deleteMutation = trpc.contact.delete.useMutation();
  const utils = trpc.useUtils();

  const handleMarkRead = async (id: number) => {
    try {
      await markReadMutation.mutateAsync({ id });
      utils.contact.listAll.invalidate();
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await deleteMutation.mutateAsync({ id });
      utils.contact.listAll.invalidate();
      toast.success("OK");
    } catch {
      toast.error("Error");
    }
  };

  if (isLoading) return <Skeleton className="h-40 rounded-lg" />;
  if (!messages || messages.length === 0)
    return <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noMessages")}</p>;

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`corner-bracket p-5 rounded-lg border transition-colors ${msg.read === "unread" ? "bg-[oklch(0.95_0.03_295/0.4)] border-[oklch(0.80_0.05_295/0.3)]" : "bg-[oklch(0.97_0.012_300/0.3)] border-[oklch(0.90_0.02_300/0.2)]"}`}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              {msg.read === "unread" ? <Mail className="w-5 h-5 text-[oklch(0.55_0.08_295)]" /> : <MailOpen className="w-5 h-5 text-[oklch(0.50_0.03_295)]" />}
              <div>
                <p className="font-sans text-sm font-medium text-[oklch(0.35_0.05_295)]">{msg.name}</p>
                <a href={`mailto:${msg.email}`} className="text-xs font-sans font-light text-[oklch(0.55_0.06_295)] hover:underline">{msg.email}</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-light text-[oklch(0.50_0.03_295)]">
                {new Date(msg.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : lang === "pt" ? "pt-BR" : "en-US")}
              </span>
              {msg.read === "unread" && <span className="w-2 h-2 rounded-full bg-[oklch(0.55_0.08_295)]" />}
            </div>
          </div>
          <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] leading-relaxed mb-4 whitespace-pre-wrap">{msg.message}</p>
          <div className="flex gap-2">
            {msg.read === "unread" && (
              <Button size="sm" variant="ghost" onClick={() => handleMarkRead(msg.id)} className="rounded-full h-8 px-3 text-xs border border-[oklch(0.70_0.04_295/0.3)]">
                <MailOpen className="w-3 h-3 mr-1" />{t("admin.markRead")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => handleDelete(msg.id)} className="rounded-full h-8 px-3 text-xs text-[oklch(0.62_0.12_20)] hover:bg-[oklch(0.90_0.05_20/0.2)]">
              <Trash2 className="w-3 h-3 mr-1" />{t("admin.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
