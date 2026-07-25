import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, MessageCircle, Instagram, MapPin } from "lucide-react";
import { useState, useMemo } from "react";

export default function Contact() {
  const { t, lang } = useI18n();
  const submitContact = trpc.contact.submit.useMutation();
  const { data: contactConfig } = trpc.config.getByCategory.useQuery({ category: "contact" });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const contactValues = useMemo(() => {
    if (!contactConfig) return {
      whatsapp: "+34 600 000 000",
      email: "info@skipro.com",
      instagram: "@skipro",
      location: "Andorra — Pyrenees",
    };
    const map: Record<string, string> = {};
    contactConfig.forEach(c => { map[c.configKey] = c.configValue; });
    return {
      whatsapp: map.whatsapp || "+34 600 000 000",
      email: map.email || "info@skipro.com",
      instagram: map.instagram || "@skipro",
      location: map.location || "Andorra — Pyrenees",
    };
  }, [contactConfig]);

  const waNumber = contactValues.whatsapp.replace(/[^0-9]/g, "");

  const contactInfo = [
    { icon: MessageCircle, label: t("contact.info.whatsapp"), value: contactValues.whatsapp, href: `https://wa.me/${waNumber}` },
    { icon: Mail, label: t("contact.info.email"), value: contactValues.email, href: `mailto:${contactValues.email}` },
    { icon: Instagram, label: t("contact.info.instagram"), value: contactValues.instagram, href: `https://instagram.com/${contactValues.instagram.replace("@", "")}` },
    { icon: MapPin, label: t("contact.info.location"), value: contactValues.location, href: null },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContact.mutateAsync({ name, email, message, lang });
      toast.success(t("contact.form.success"));
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error(t("contact.form.error"));
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-sans font-light tracking-[0.3em] uppercase text-[oklch(0.50_0.04_295)] mb-4">
            {t("contact.subtitle")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[oklch(0.30_0.05_295)]">
            {t("contact.title")}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.06_295/0.4)] to-transparent mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-[1fr_1.5fr] gap-8 md:gap-16">
          {/* Contact info */}
          <div className="space-y-6">
            {contactInfo.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="vertical-line">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 hover:opacity-70 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.88_0.05_295/0.3)] to-[oklch(0.88_0.04_350/0.2)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-4 h-4 text-[oklch(0.45_0.06_295)]" />
                    </div>
                    <div>
                      <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)]">{label}</p>
                      <p className="text-sm font-sans font-light tracking-wide text-[oklch(0.35_0.05_295)]">{value}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.88_0.05_295/0.3)] to-[oklch(0.88_0.04_350/0.2)] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[oklch(0.45_0.06_295)]" />
                    </div>
                    <div>
                      <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)]">{label}</p>
                      <p className="text-sm font-sans font-light tracking-wide text-[oklch(0.35_0.05_295)]">{value}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="corner-bracket p-6 md:p-8 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                  {t("contact.form.name")}
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("contact.form.namePlaceholder")}
                  required
                  maxLength={255}
                  className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]"
                />
              </div>
              <div>
                <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                  {t("contact.form.email")}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("contact.form.emailPlaceholder")}
                  required
                  maxLength={320}
                  className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]"
                />
              </div>
              <div>
                <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                  {t("contact.form.message")}
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("contact.form.messagePlaceholder")}
                  required
                  maxLength={5000}
                  rows={5}
                  className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={submitContact.isPending}
                className="w-full rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] font-sans text-sm tracking-wider py-3 transition-all duration-200 active:scale-95 shadow-lg shadow-[oklch(0.55_0.08_295/0.15)]"
              >
                {submitContact.isPending ? "..." : t("contact.form.submit")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
