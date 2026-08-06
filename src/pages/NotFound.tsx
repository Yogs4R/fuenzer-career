import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTranslation } from "../lib/i18n";

export default function NotFound() {
  const { t } = useTranslation();
  usePageTitle(t("notfound.subheading"));
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in-up">
        {/* 404 graphic */}
        <div className="mb-6 flex justify-center">
          <svg className="w-28 h-28 text-accent/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 className="font-heading text-6xl sm:text-7xl font-bold text-foreground mb-2">{t("notfound.heading")}</h1>
        <p className="font-heading text-xl font-semibold text-muted-foreground mb-4">
          {t("notfound.subheading")}
        </p>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {t("notfound.message")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="btn-active px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              {t("notfound.dashboard")}
            </span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-active px-6 py-3 rounded-lg border-2 border-border text-muted-foreground hover:text-foreground hover:border-accent font-semibold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              {t("notfound.goBack")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
