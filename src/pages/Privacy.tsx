import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTranslation } from "../lib/i18n";

export default function Privacy() {
  const { t } = useTranslation();
  usePageTitle(t("privacy.title"));
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-border shadow-md p-6 sm:p-10 animate-fade-in-up">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t("privacy.back")}
          </Link>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-2">{t("privacy.title")}</h1>
          <p className="text-sm text-muted-foreground mb-8">{t("privacy.lastUpdated")}</p>

          <div className="space-y-6 text-sm sm:text-base text-foreground leading-relaxed">
            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t("privacy.section.1")}</h2>
              <p className="text-muted-foreground">
                When you use Fuenzer Career, we may collect the following types of information:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li><strong className="text-foreground">Account data:</strong> Email address and password (if you choose to sign up).</li>
                <li><strong className="text-foreground">Voice recordings:</strong> Audio of your mock interview answers, processed in real-time for AI feedback. Recordings are not stored permanently.</li>
                <li><strong className="text-foreground">Usage data:</strong> Which roles you search for, practice session frequency, and skill trends you view.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t("privacy.section.2")}</h2>
              <p className="text-muted-foreground">
                Your data is used solely to provide and improve Fuenzer Career. We do not sell your personal information to third parties. Specifically:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>To generate personalised interview questions and feedback.</li>
                <li>To track your practice history and show score trends.</li>
                <li>To improve our AI models (anonymised, aggregated data only).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t("privacy.section.3")}</h2>
              <p className="text-muted-foreground">
                We implement industry-standard encryption and security measures. Voice data is processed ephemerally and not stored on our servers after analysis is complete.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t("privacy.section.4")}</h2>
              <p className="text-muted-foreground">
                You may request access to, correction of, or deletion of your personal data at any time by contacting us at the email below.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t("privacy.section.5")}</h2>
              <p className="text-muted-foreground">
                Fuenzer Career uses Google Analytics (<strong>G-MKSPXBHK42</strong>) to collect anonymous usage
                data — which features you use, how long you practise, and general session behaviour. This helps
                us improve the platform. We do not track you across other sites, and IP addresses are anonymised.
              </p>
              <p className="text-muted-foreground mt-2">
                When you first visit, a cookie consent banner asks you to Accept or Reject analytics cookies.
                If you <strong>Accept</strong>, Google Analytics is loaded for that session. If you{" "}
                <strong>Reject</strong>, no analytics scripts run. Your choice is stored in your browser and
                can be changed at any time by clearing your browser's local storage for this site.
              </p>
              <p className="text-muted-foreground mt-2">
                Google Analytics may set its own cookies (<em>_ga</em>, <em>_ga_&lt;container-id&gt;</em>)
                to distinguish unique users. These cookies contain no personal data. You can learn more at{" "}
                <a
                  href="https://policies.google.com/technologies/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                >
                  Google's Cookie Policy
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t("privacy.section.6")}</h2>
              <p className="text-muted-foreground">
                If you have questions about this privacy policy, reach out to{" "}
                <a href="mailto:fuenzerofficial@gmail.com" className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors">
                  fuenzerofficial@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
