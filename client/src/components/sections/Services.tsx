import { useI18n } from "@/i18n/I18nContext";
import { Snowflake, Mountain, TrendingUp, User, Users, Baby } from "lucide-react";

const servicesConfig = [
  { key: "beginner", icon: Snowflake },
  { key: "intermediate", icon: Mountain },
  { key: "advanced", icon: TrendingUp },
  { key: "private", icon: User },
  { key: "group", icon: Users },
  { key: "kids", icon: Baby },
];

export default function Services() {
  const { t } = useI18n();

  return (
    <section id="services" className="relative py-24 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-sans font-light tracking-[0.3em] uppercase text-[oklch(0.50_0.04_295)] mb-4">
            {t("services.subtitle")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[oklch(0.30_0.05_295)]">
            {t("services.title")}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.06_295/0.4)] to-transparent mx-auto mt-6" />
        </div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {servicesConfig.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="corner-bracket group p-6 md:p-8 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.4)] hover:border-[oklch(0.80_0.04_295/0.4)] transition-all duration-300 hover:shadow-lg hover:shadow-[oklch(0.55_0.06_295/0.08)]"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.88_0.05_295/0.3)] to-[oklch(0.88_0.04_350/0.2)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-[oklch(0.45_0.06_295)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl font-medium text-[oklch(0.30_0.05_295)] mb-1">
                    {t(`services.${key}.title`)}
                  </h3>
                  <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.55_0.06_295)]">
                    {t(`services.${key}.price`)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-sans font-light tracking-wide text-[oklch(0.45_0.04_295)] leading-relaxed">
                {t(`services.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
