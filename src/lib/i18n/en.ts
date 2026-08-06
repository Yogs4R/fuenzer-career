/**
 * English translation dictionary — source of truth for all i18n keys.
 * Every key that exists in any language must be defined here first.
 */

const en: Record<string, string> = {
  /* ── NavBar ── */
  "nav.trending": "Trending",
  "nav.howItWorks": "How It Works",
  "nav.testimonials": "Testimonials",
  "nav.faq": "FAQ",
  "nav.signIn": "Sign In",
  "nav.signUp": "Sign Up",
  "nav.history": "History",
  "nav.notifications": "Notifications",
  "nav.practiceHistory": "Practice History",
  "nav.noHistory": "No History",
  "nav.noHistoryDesc":
    "Complete an interview and your practice sessions will show up here.",
  "nav.noNotifications": "No notifications yet.",
  "nav.showMore": "Show more",
  "nav.showLess": "Show less",
  "nav.signOut": "Sign Out",
  "nav.deleteAccount": "Delete Account",
  "nav.deleting": "Deleting…",
  "nav.guest": "Guest",
  "nav.confirmDeleteAccount":
    "Are you sure you want to delete your account? This action cannot be undone.",
  "nav.deleteFailed":
    "Failed to delete account. Please try again.",
  "nav.userFallback": "User",
  "nav.aria.logo": "Fuenzer Career",
  "nav.aria.langSelect": "Select language",
  "nav.aria.notifications": "Notifications",
  "nav.aria.history": "History",
  "nav.aria.userProfile": "User profile",
  "nav.aria.close": "Close",
  "nav.aria.openMenu": "Open navigation menu",
  "nav.aria.closeMenu": "Close navigation menu",
  "nav.aria.prevPage": "Previous page",
  "nav.aria.nextPage": "Next page",
  "nav.aria.deleteSession": "Delete {role} session",
  "nav.notif.alphaTitle": "🚀 What's New — Database Live!",
  "nav.notif.alphaDesc":
    "Practice history and score tracking are now LIVE! Sign in with Google to save your sessions, revisit past evaluation reports, and watch your scores improve over time. Notifications are also active — we'll keep you posted on new features and updates right here. Thanks for being part of the journey!",

  /* ── Dashboard ── */
  "dashboard.hero.heading": "Nail Your Next Interview",
  "dashboard.hero.subtitle":
    "Discover trending skills for your target role, practise with voice-driven mock interviews, track your progress over time, and get AI-powered feedback — all from one dashboard.",
  "dashboard.trending.heading": "Trending Skills",
  "dashboard.trending.live": "Live market data",
  "dashboard.trending.general": "General trends",
  "dashboard.trending.basedOn": "Based on current job listings for \"{role}\"",
  "dashboard.trending.genericBasedOn":
    "Start by typing a role above to fetch live data.",
  "dashboard.trending.searchPlaceholder": "Search skills…",
  "dashboard.trending.filter.all": "All levels",
  "dashboard.trending.filter.high": "High demand (>70)",
  "dashboard.trending.filter.mid": "Medium (40–70)",
  "dashboard.trending.filter.low": "Low (<40)",
  "dashboard.trending.sort.highest": "Highest first",
  "dashboard.trending.sort.lowest": "Lowest first",
  "dashboard.trending.sort.alpha": "Alphabetical",
  "dashboard.trending.noMatch": "No skills match your search criteria.",
  "dashboard.keywords.title":
    "Select the skills you want to practise in your interview",
  "dashboard.keywords.subtitle":
    "Choose the most relevant skills for your target role. Top 5 are pre-selected.",
  "dashboard.keywords.nextBtn": "Next: Generate Questions ({count} skills)",
  "dashboard.keywords.skipBtn": "Skip → Auto-pick top 5",
  "dashboard.keywords.minError": "Select at least 3 skills to continue.",
  "dashboard.keywords.prepErrorTitle": "Couldn't generate questions",
  "dashboard.keywords.tryAgain": "Try Again",
  "dashboard.idle.title": "Practise makes progress",
  "dashboard.idle.subtitle":
    "Type or select your target role above and click \"Start Target Research\" to begin an interview simulation.",
  "dashboard.howItWorks.heading": "How It Works",
  "dashboard.howItWorks.subtitle":
    "Three intelligent agents work together to give you an edge.",
  "dashboard.howItWorks.agents.market.title": "Market Job Agent",
  "dashboard.howItWorks.agents.market.desc":
    "Scrapes live job listings to identify trending skills, salary ranges, and role requirements in real time.",
  "dashboard.howItWorks.agents.interviewer.title": "Interviewer Agent",
  "dashboard.howItWorks.agents.interviewer.desc":
    "Generates contextual interview questions based on the role and guides you through STAR-method responses.",
  "dashboard.howItWorks.agents.evaluation.title": "Evaluation Agent",
  "dashboard.howItWorks.agents.evaluation.desc":
    "Analyses your voice responses for clarity, confidence, skill alignment, and actionable improvement tips.",
  "dashboard.why.heading": "Why Fuenzer Career",
  "dashboard.why.subtitle":
    "Built to give you an edge before you step into the room.",
  "dashboard.why.features.market.title": "Market-Driven Research",
  "dashboard.why.features.market.desc":
    "Know which skills employers are looking for in your target role before you walk into the interview.",
  "dashboard.why.features.voice.title": "Voice Interview Practice",
  "dashboard.why.features.voice.desc":
    "Practice aloud with realistic questions. Build muscle memory for your actual interview.",
  "dashboard.why.features.ai.title": "AI-Powered Insights",
  "dashboard.why.features.ai.desc":
    "Get instant feedback on your confidence, hesitation patterns, and skill alignment.",
  "dashboard.testimonials.heading": "What Users Say",
  "dashboard.testimonials.subtitle":
    "Hear from people who have used Fuenzer Career.",
  "dashboard.testimonials.aria.next": "Next testimonial",
  "dashboard.testimonials.aria.prev": "Previous testimonial",
  "dashboard.testimonials.aria.goTo": "Go to testimonial {index}",
  "dashboard.testimonials.quote1": "I felt so much more confident after just three practice sessions. The feedback on my filler words was eye-opening.",
  "dashboard.testimonials.author1": "Sarah K.",
  "dashboard.testimonials.role1": "Fresh Graduate",
  "dashboard.testimonials.quote2": "The trending skills section helped me tailor my resume. Landed my first dev role in 3 weeks.",
  "dashboard.testimonials.author2": "Alex M.",
  "dashboard.testimonials.role2": "Frontend Developer",
  "dashboard.testimonials.quote3": "Finally, a tool that lets me practice speaking, not just typing answers. Game changer.",
  "dashboard.testimonials.author3": "Priya R.",
  "dashboard.testimonials.role3": "Product Manager",
  "dashboard.testimonials.quote4": "The AI feedback pinpointed exactly where I was hesitating. Fixed it in two sessions.",
  "dashboard.testimonials.author4": "James L.",
  "dashboard.testimonials.role4": "Backend Developer",
  "dashboard.testimonials.quote5": "I used to freeze in interviews. Now I walk in knowing exactly what to say. Unreal tool.",
  "dashboard.testimonials.author5": "Maya T.",
  "dashboard.testimonials.role5": "UX Designer",
  "dashboard.testimonials.quote6": "The history feature is a lifesaver — I can track my improvement across every single practice session.",
  "dashboard.testimonials.author6": "David C.",
  "dashboard.testimonials.role6": "Data Analyst",
  "dashboard.testimonials.quote7": "I love that I can practise as a guest and still get full AI feedback. No barriers, just results.",
  "dashboard.testimonials.author7": "Emma W.",
  "dashboard.testimonials.role7": "Marketing Manager",
  "dashboard.testimonials.quote8": "The STAR-method guidance reshaped how I answer behavioural questions. Huge confidence boost.",
  "dashboard.testimonials.author8": "Carlos G.",
  "dashboard.testimonials.role8": "Engineering Manager",
  "dashboard.faq.heading": "Frequently Asked Questions",
  "dashboard.faq.subtitle":
    "Everything you need to know before getting started.",
  /* FAQ Q&A — keys match exact question text */
  "dashboard.faq.q1": "Is this free?",
  "dashboard.faq.a1":
    "Yes! Phase 1 is completely free. No account or credit card needed — just type a role and start practising.",
  "dashboard.faq.q2": "Do I need a microphone?",
  "dashboard.faq.a2":
    "For the best experience, yes. You can still explore the platform without one, but voice practice is where the real magic happens.",
  "dashboard.faq.q3": "How does the AI feedback work?",
  "dashboard.faq.a3":
    "Our AI analyses your speech patterns, filler word usage, and how well your answers match the target role's required skills.",
  "dashboard.faq.q4": "Can I save my progress?",
  "dashboard.faq.a4":
    "Yes! Create a free account and your interview history, scores, and feedback are automatically saved. You can review past sessions anytime from the history panel.",
  "dashboard.faq.q5": "Do I need an account to use Fuenzer Career?",
  "dashboard.faq.a5":
    "Nope! You can practise as a guest with no sign-up required. Creating an account just unlocks history tracking, saved reports, and personalised notifications.",
  "dashboard.cta.heading": "Ready to Nail Your Interview?",
  "dashboard.cta.subtitle":
    "Start your interview practice today and get AI-powered feedback instantly.",
  "dashboard.cta.button": "Get Started Now",
  "dashboard.footer.tagline":
    "Nail Your Next Interview — practise with voice, get AI feedback, and land the role.",
  "dashboard.footer.quickLinks": "Quick Links",
  "dashboard.footer.legal": "Legal",
  "dashboard.footer.connect": "Connect",
  "dashboard.footer.privacy": "Privacy Policy",
  "dashboard.footer.terms": "Terms of Service",
  "dashboard.footer.copyright":
    "© {year} Fuenzer Career. All rights reserved.",
  "dashboard.loading.market": "Agent is fetching live market data…",
  "dashboard.loading.prep": "Agent is generating interview questions…",
  "dashboard.loading.seconds": "second(s)",
  "dashboard.loading.searching": "Searching the market…",
  "dashboard.loading.working": "Still working — fetching live data.",
  "dashboard.loading.patience":
    "This is taking a while — thanks for your patience.",
  "dashboard.loading.powered": "Powered by",
  "dashboard.error.timeout":
    "This search is taking longer than expected. Try a different role or check back later.",
  "dashboard.error.liveUnavailable":
    "Live data temporarily unavailable. Using general skills.",
  "dashboard.error.prepTimeout":
    "The question generation is taking too long. Try again with fewer skills selected.",
  "dashboard.error.rateLimit":
    "Please wait {seconds} second(s) before searching again.",
  "dashboard.error.prepRateLimit":
    "Please wait {seconds} second(s) before generating again.",
  "dashboard.error.marketTimeout":
    "Failed to fetch market data. Using general skills.",

  /* ── Interview Room ── */
  "interview.topBar.label": "Interview Practice",
  "interview.topBar.questionCount": "Question {current} of {total}",
  "interview.questionCard.interviewer": "Interviewer",
  "interview.questionCard.instructionVoice":
    "Take a moment to gather your thoughts, then press the microphone and speak your answer clearly.",
  "interview.questionCard.instructionText":
    "Take a moment to gather your thoughts, then type your answer below.",
  "interview.questionCard.liveTranscript": "Live transcription",
  "interview.questionCard.yourAnswer": "Your answer",
  "interview.questionCard.fillerWords": "{count} filler word(s)",
  "interview.hint.button": "Need a Hint?",
  "interview.hint.hide": "Hide Hint",
  "interview.hint.title": "STAR Method Hint",
  "interview.hint.star.situation": "Situation",
  "interview.hint.star.task": "Task",
  "interview.hint.star.action": "Action",
  "interview.hint.star.result": "Result",
  "interview.hint.star.situationDesc":
    "Describe the context — the project, team, and what made it complex.",
  "interview.hint.star.taskDesc":
    "Explain your specific responsibility and what needed to be achieved.",
  "interview.hint.star.actionDesc":
    "Walk through the steps you took — tools, techniques, decisions.",
  "interview.hint.star.resultDesc":
    "Share the measurable outcome — faster load times, happier users, etc.",
  "interview.hint.loading": "Generating personalised hint…",
  "interview.hint.error": "Couldn't generate a hint right now.",
  "interview.hint.retry": "Retry",
  "interview.hint.suggestionLabel": "Interviewer Agent Suggestion:",
  "interview.tip": "Tip: Answer in {language} for best evaluation accuracy.",
  "interview.status.typeAnswer": "Type your answer below",
  "interview.status.recording": "Recording… Tap to stop",
  "interview.status.processing": "Processing Audio…",
  "interview.status.recorded": "Answer recorded",
  "interview.status.tapToStart": "Tap to start recording",
  "interview.textarea.label": "Type your answer",
  "interview.textarea.placeholder": "Type your answer here…",
  "interview.textarea.emptyHint":
    "Type your answer above to continue.",
  "interview.textarea.words": "{count} words",
  "interview.mic.toggleToText": "Type instead",
  "interview.mic.toggleToMic": "Use microphone",
  "interview.mic.aria.start": "Start recording",
  "interview.mic.aria.stop": "Stop recording",
  "interview.mic.aria.processing": "Processing audio",
  "interview.mic.error.denied":
    "Microphone access was denied. Type your answer instead.",
  "interview.mic.error.notFound":
    "No microphone found. Type your answer instead.",
  "interview.mic.error.general":
    "Voice service temporarily unavailable — {message}. Type your answer instead.",
  "interview.mic.fillerBadge": "{count} filler word(s)",
  "interview.button.skip": "Skip Question",
  "interview.button.retry": "Retry",
  "interview.button.next": "Next Question",
  "interview.button.finish": "Finish & Get Result",
  "interview.button.evaluating": "Evaluating…",
  "interview.evaluation.overlay.title": "Analysing your answers…",
  "interview.evaluation.overlay.subtitle":
    "The AI is evaluating your responses and preparing feedback.",
  "interview.answer.skipped": "[Skipped]",
  "interview.answer.noAnswer": "[No answer provided]",

  /* ── Evaluation Report ── */
  "report.titleBadge": "Evaluation Complete",
  "report.heading": "Your Interview Dashboard",
  "report.subtitle":
    "Detailed breakdown of your{role} mock interview performance.",
  "report.score.excellent": "Excellent!",
  "report.score.great": "Great performance!",
  "report.score.good": "Good effort — room to grow",
  "report.score.needsWork": "Needs work — keep practising",
  "report.summary.high":
    "You demonstrated strong technical knowledge and clear communication. Focus on deepening your answers for an even stronger impact.",
  "report.summary.low":
    "Keep practising! Focus on structuring your answers clearly and backing them with specific examples.",
  "report.skillMatch.heading": "Skill Match",
  "report.skillMatch.demonstrated": "Demonstrated ✓",
  "report.skillMatch.focusAreas": "Focus Areas",
  "report.skillMatch.noMatch": "No skills matched yet.",
  "report.skillMatch.noMissing": "No missing skills — great alignment!",
  "report.breakdown.heading": "Per-Question Breakdown",
  "report.transcript.heading": "Transcript",
  "report.transcript.noData": "No transcript data available.",
  "report.transcript.prev": "Previous question",
  "report.transcript.next": "Next question",
  "report.transcript.questionCount": "Question {current} of {total}",
  "report.transcript.fillerDetected":
    "{count} filler word(s) detected: {words}",
  "report.transcript.aria.question": "Question {index}",
  "report.recommendations.heading": "Recommendations",
  "report.recommendations.skillMatch": "Skill match:",
  "report.recommendations.skillMatchYou":
    "You demonstrated {matched}.",
  "report.recommendations.skillMatchMissing":
    " Focus on developing {missing}.",
  "report.recommendations.delivery": "Delivery",
  "report.recommendations.fillerAnalysis": "Filler Word Analysis",
  "report.recommendations.fillerTotal": "{count} total",
  "report.recommendations.noFiller":
    "No filler word data available. Speak your answers with the microphone to get filler word analysis.",
  "report.recommendations.tips": "Actionable Tips",
  "report.recommendations.noTips": "No specific tips available.",
  "report.recommendations.suggestion": "Suggestion",
  "report.recommendations.outstanding": "Outstanding performance",
  "report.recommendations.skillsToDevelop":
    "{count} skill(s) to develop",
  "report.cta.button": "Try Another Role",
  "report.cta.subtitle": "Ready for another round? Practise makes progress.",
  "report.error.notFound": "Report Not Found",
  "report.error.notFoundDesc":
    "We couldn't find that report. It may have been removed or you may not have permission to view it.",
  "report.error.goToDashboard": "Go to Dashboard",
  "report.loading": "Loading report…",

  /* ── Login ── */
  "login.heading": "Welcome Back",
  "login.subtitle": "Sign in to continue or explore as a guest.",
  "login.googleBtn": "Sign in with Google",
  "login.redirecting": "Redirecting…",
  "login.guestBtn": "Continue as Guest",
  "login.termsNote":
    "By continuing, you agree to our Terms of Service and Privacy Policy.",
  "login.error.googleFailed": "Failed to sign in with Google",

  /* ── Sign Up ── */
  "signup.heading": "Create Your Account",
  "signup.subtitle":
    "Sign up to track your progress and get personalised feedback.",
  "signup.googleBtn": "Sign up with Google",
  "signup.redirecting": "Redirecting…",
  "signup.guestBtn": "Continue as Guest",
  "signup.existingAccount": "Already have an account?",
  "signup.signInLink": "Sign In",
  "signup.error.googleFailed": "Failed to sign up with Google",

  /* ── Not Found ── */
  "notfound.heading": "404",
  "notfound.subheading": "Page not found",
  "notfound.message":
    "The page you're looking for doesn't exist or has been moved. Let's get you back on track.",
  "notfound.dashboard": "Go to Dashboard",
  "notfound.goBack": "Go Back",

  /* ── Cookie Consent ── */
  "cookie.title": "We value your privacy",
  "cookie.description":
    "We use Google Analytics to understand how you use Fuenzer Career so we can improve it. Your data is anonymised and never sold.",
  "cookie.learnMore": "Learn more",
  "cookie.reject": "Reject",
  "cookie.accept": "Accept",

  /* ── Interview Config Modal ── */
  "config.title": "Configure Your Interview",
  "config.subtitle": "Customise how the AI generates your questions.",
  "config.language": "Language",
  "config.languageHint": "Questions will be generated in {language}.",
  "config.difficulty": "Difficulty Level",
  "config.difficultyCustomLabel": "Describe your difficulty level",
  "config.difficultyCustomPlaceholder":
    "e.g. \"Mid-level with AWS focus\"",
  "config.questions": "Number of Questions",
  "config.questionsLabel": "{count} question(s)",
  "config.summary.title": "Summary",
  "config.summary.role": "Role:",
  "config.summary.skills": "Skills:",
  "config.summary.notSelected": "Not selected",
  "config.summary.noneSelected": "None selected",
  "config.summary.desc":
    "The AI will generate {count} in {language} at {difficulty} level, focused on your selected skills.",
  "config.cancel": "Cancel",
  "config.generate": "Generate Questions",

  /* ── Terms of Service ── */
  "terms.back": "Back to Home",
  "terms.title": "Terms of Service",
  "terms.lastUpdated": "Last updated: June 2025",
  "terms.sections._body":
    "By using Fuenzer Career, you agree to these Terms of Service. If you do not agree, please do not use the platform. Fuenzer Career provides AI-powered mock interview practice. You agree to use the service only for lawful purposes and not to: Upload harmful, obscene, or illegal content. Attempt to reverse-engineer or abuse the AI systems. Use the platform to impersonate others. If you create an account, you are responsible for maintaining the confidentiality of your password and for all activity under your account. Fuenzer Career is a practice tool and does not guarantee job placement or interview success. Feedback is generated by AI and may not be error-free. Use it as a supplement to your own preparation. Fuenzer Career and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. We may update these terms from time to time. Continued use after changes constitutes acceptance of the new terms. For questions about these terms, contact fuenzerofficial@gmail.com.",
  "terms.section.1": "1. Acceptance of Terms",
  "terms.section.2": "2. Use of Service",
  "terms.section.3": "3. Account Responsibility",
  "terms.section.4": "4. Disclaimer",
  "terms.section.5": "5. Limitation of Liability",
  "terms.section.6": "6. Changes to Terms",
  "terms.section.7": "7. Cookies & Analytics",
  "terms.section.8": "8. Contact",

  /* ── Privacy Policy ── */
  "privacy.back": "Back to Home",
  "privacy.title": "Privacy Policy",
  "privacy.lastUpdated": "Last updated: June 2025",
  "privacy.section.1": "1. Information We Collect",
  "privacy.section.2": "2. How We Use Your Data",
  "privacy.section.3": "3. Data Security",
  "privacy.section.4": "4. Your Rights",
  "privacy.section.5": "5. Cookies & Google Analytics",
  "privacy.section.6": "6. Contact",

  /* ── Role Combobox ── */
  "role.searchPlaceholder": "e.g. Frontend Developer",
  "role.buttonText": "Start Target Research",
  "role.noMatch": "No matching roles — press Enter to use \"{value}\"",
  "role.targetLabel": "Target job role",
  "role.openList": "Open role list",
  "role.closeList": "Close role list",

  /* ── SEO Meta Descriptions ── */
  "meta.home.desc":
    "Ace your next interview. Practise with voice-driven mock interviews, get AI-powered feedback on skill gaps and delivery, and track your progress. Free to start.",
  "meta.interview.desc":
    "Practice your interview skills with AI-generated questions, real-time voice transcription, and STAR-method guidance in your chosen language.",
  "meta.report.desc":
    "Review your AI-powered interview evaluation report with skill matching, delivery feedback, and transcript analysis.",
  "meta.login.desc":
    "Sign in to Fuenzer Career to save your interview practice history, track scores, and revisit past evaluation reports.",
  "meta.signup.desc":
    "Create a free account on Fuenzer Career to unlock interview history, saved reports, and personalised notifications.",
  "meta.terms.desc":
    "Terms of Service for Fuenzer Career — AI-powered mock interview practice platform.",
  "meta.privacy.desc":
    "Privacy Policy for Fuenzer Career — learn how we collect, use, and protect your data.",
  "meta.notfound.desc":
    "Page not found — the page you are looking for does not exist or has been moved.",

  /* ── Misc / Shared ── */
  "generic.loading": "Loading…",
  "generic.error": "Something went wrong",
  "generic.retry": "Retry",
  "generic.save": "Save",
  "generic.close": "Close",
};

export default en;
