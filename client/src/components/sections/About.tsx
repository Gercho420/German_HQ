import { useI18n } from "@/i18n/I18nContext";

export default function About() {
  const { t } = useI18n();

  return (
    <section className="relative py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
          {/* Label */}
          <div className="vertical-line">
            <p className="text-xs font-sans font-light tracking-[0.3em] uppercase text-[oklch(0.50_0.04_295)]">
              {t("about.title")}
            </p>
          </div>

          {/* Content */}
          <div className="corner-bracket p-6 md:p-8">
            <p className="font-serif text-2xl md:text-3xl font-light leading-relaxed text-[oklch(0.35_0.05_295)] tracking-wide">
              {t("about.text")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
