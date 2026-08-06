/**
 * Indonesian translation dictionary.
 * Technical terms (API, STAR, SQL, Docker, etc.) remain in English per i18n requirements.
 */

const id: Record<string, string> = {
  /* ── NavBar ── */
  "nav.trending": "Tren",
  "nav.howItWorks": "Cara Kerja",
  "nav.testimonials": "Testimoni",
  "nav.faq": "FAQ",
  "nav.signIn": "Masuk",
  "nav.signUp": "Daftar",
  "nav.history": "Riwayat",
  "nav.notifications": "Notifikasi",
  "nav.practiceHistory": "Riwayat Latihan",
  "nav.noHistory": "Belum Ada Riwayat",
  "nav.noHistoryDesc":
    "Selesaikan wawancara dan sesi latihan Anda akan muncul di sini.",
  "nav.noNotifications": "Belum ada notifikasi.",
  "nav.showMore": "Lihat selengkapnya",
  "nav.showLess": "Sembunyikan",
  "nav.signOut": "Keluar",
  "nav.deleteAccount": "Hapus Akun",
  "nav.deleting": "Menghapus…",
  "nav.guest": "Tamu",
  "nav.confirmDeleteAccount":
    "Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.",
  "nav.deleteFailed":
    "Gagal menghapus akun. Silakan coba lagi.",
  "nav.userFallback": "Pengguna",
  "nav.aria.logo": "Fuenzer Career",
  "nav.aria.langSelect": "Pilih bahasa",
  "nav.aria.notifications": "Notifikasi",
  "nav.aria.history": "Riwayat",
  "nav.aria.userProfile": "Profil pengguna",
  "nav.aria.close": "Tutup",
  "nav.aria.openMenu": "Buka menu navigasi",
  "nav.aria.closeMenu": "Tutup menu navigasi",
  "nav.aria.prevPage": "Halaman sebelumnya",
  "nav.aria.nextPage": "Halaman berikutnya",
  "nav.aria.deleteSession": "Hapus sesi {role}",
  "nav.notif.alphaTitle": "🚀 Yang Baru — Database Live!",
  "nav.notif.alphaDesc":
    "Riwayat latihan dan pelacakan skor sekarang LIVE! Masuk dengan Google untuk menyimpan sesi Anda, melihat kembali laporan evaluasi sebelumnya, dan memantau peningkatan skor Anda dari waktu ke waktu. Notifikasi juga aktif — kami akan memberi tahu Anda tentang fitur dan pembaruan baru di sini. Terima kasih telah menjadi bagian dari perjalanan ini!",

  /* ── Dashboard ── */
  "dashboard.hero.heading": "Kuasai Wawancara Berikutnya",
  "dashboard.hero.subtitle":
    "Temukan tren skill untuk target peran Anda, berlatih dengan wawancara suara, lacak progres Anda, dan dapatkan feedback AI — semuanya dari satu dashboard.",
  "dashboard.trending.heading": "Skill yang Sedang Tren",
  "dashboard.trending.live": "Data pasar langsung",
  "dashboard.trending.general": "Tren umum",
  "dashboard.trending.basedOn": "Berdasarkan lowongan terkini untuk \"{role}\"",
  "dashboard.trending.genericBasedOn":
    "Ketik peran di atas untuk mengambil data langsung.",
  "dashboard.trending.searchPlaceholder": "Cari skill…",
  "dashboard.trending.filter.all": "Semua level",
  "dashboard.trending.filter.high": "Permintaan tinggi (>70)",
  "dashboard.trending.filter.mid": "Menengah (40–70)",
  "dashboard.trending.filter.low": "Rendah (<40)",
  "dashboard.trending.sort.highest": "Tertinggi dulu",
  "dashboard.trending.sort.lowest": "Terendah dulu",
  "dashboard.trending.sort.alpha": "Abjad",
  "dashboard.trending.noMatch": "Tidak ada skill yang cocok dengan pencarian Anda.",
  "dashboard.keywords.title":
    "Pilih skill yang ingin Anda latih dalam wawancara",
  "dashboard.keywords.subtitle":
    "Pilih skill yang paling relevan untuk peran target Anda. 5 teratas sudah dipilih sebelumnya.",
  "dashboard.keywords.nextBtn": "Lanjut: Buat Pertanyaan ({count} skill)",
  "dashboard.keywords.skipBtn": "Lewati → Pilih otomatis 5 teratas",
  "dashboard.keywords.minError": "Pilih minimal 3 skill untuk melanjutkan.",
  "dashboard.keywords.prepErrorTitle": "Gagal membuat pertanyaan",
  "dashboard.keywords.tryAgain": "Coba Lagi",
  "dashboard.idle.title": "Latihan membuat kemajuan",
  "dashboard.idle.subtitle":
    "Ketik atau pilih peran target Anda di atas dan klik \"Mulai Riset Target\" untuk memulai simulasi wawancara.",
  "dashboard.howItWorks.heading": "Cara Kerja",
  "dashboard.howItWorks.subtitle":
    "Tiga agen cerdas bekerja sama untuk memberi Anda keunggulan.",
  "dashboard.howItWorks.agents.market.title": "Market Job Agent",
  "dashboard.howItWorks.agents.market.desc":
    "Mengambil data lowongan langsung untuk mengidentifikasi skill yang tren, kisaran gaji, dan persyaratan peran secara real time.",
  "dashboard.howItWorks.agents.interviewer.title": "Interviewer Agent",
  "dashboard.howItWorks.agents.interviewer.desc":
    "Menghasilkan pertanyaan wawancara kontekstual berdasarkan peran dan memandu Anda melalui respons metode STAR.",
  "dashboard.howItWorks.agents.evaluation.title": "Evaluation Agent",
  "dashboard.howItWorks.agents.evaluation.desc":
    "Menganalisis respons suara Anda untuk kejelasan, kepercayaan diri, keselarasan skill, dan tips perbaikan yang dapat ditindaklanjuti.",
  "dashboard.why.heading": "Mengapa Fuenzer Career",
  "dashboard.why.subtitle":
    "Dibangun untuk memberi Anda keunggulan sebelum melangkah ke ruangan.",
  "dashboard.why.features.market.title": "Riset Berbasis Pasar",
  "dashboard.why.features.market.desc":
    "Ketahui skill apa yang dicari perusahaan untuk peran target Anda sebelum Anda masuk ke ruang wawancara.",
  "dashboard.why.features.voice.title": "Latihan Wawancara Suara",
  "dashboard.why.features.voice.desc":
    "Berlatih dengan suara menggunakan pertanyaan realistis. Bangun memori otot untuk wawancara Anda yang sebenarnya.",
  "dashboard.why.features.ai.title": "Wawasan AI",
  "dashboard.why.features.ai.desc":
    "Dapatkan feedback instan tentang kepercayaan diri, pola keraguan, dan keselarasan skill Anda.",
  "dashboard.testimonials.heading": "Kata Pengguna",
  "dashboard.testimonials.subtitle":
    "Dengar dari orang-orang yang telah menggunakan Fuenzer Career.",
  "dashboard.testimonials.aria.next": "Testimoni berikutnya",
  "dashboard.testimonials.aria.prev": "Testimoni sebelumnya",
  "dashboard.testimonials.aria.goTo": "Ke testimoni {index}",
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
  "dashboard.faq.heading": "Pertanyaan Umum",
  "dashboard.faq.subtitle":
    "Semua yang perlu Anda ketahui sebelum memulai.",
  "dashboard.faq.q1": "Apakah ini gratis?",
  "dashboard.faq.a1":
    "Ya! Fase 1 sepenuhnya gratis. Tidak perlu akun atau kartu kredit — cukup ketik peran dan mulai berlatih.",
  "dashboard.faq.q2": "Apakah saya perlu mikrofon?",
  "dashboard.faq.a2":
    "Untuk pengalaman terbaik, ya. Anda tetap bisa menjelajahi platform tanpanya, tetapi latihan suara adalah tempat keajaiban terjadi.",
  "dashboard.faq.q3": "Bagaimana cara kerja feedback AI?",
  "dashboard.faq.a3":
    "AI kami menganalisis pola bicara Anda, penggunaan filler words, dan seberapa baik jawaban Anda cocok dengan skill yang dibutuhkan untuk peran target.",
  "dashboard.faq.q4": "Bisakah saya menyimpan progres?",
  "dashboard.faq.a4":
    "Ya! Buat akun gratis dan riwayat wawancara, skor, serta feedback Anda otomatis tersimpan. Anda dapat meninjau sesi sebelumnya kapan saja dari panel riwayat.",
  "dashboard.faq.q5": "Apakah saya perlu akun untuk menggunakan Fuenzer Career?",
  "dashboard.faq.a5":
    "Tidak! Anda bisa berlatih sebagai tamu tanpa perlu mendaftar. Membuat akun hanya membuka pelacakan riwayat, laporan tersimpan, dan notifikasi personal.",
  "dashboard.cta.heading": "Siap Kuasai Wawancara Anda?",
  "dashboard.cta.subtitle":
    "Mulai latihan wawancara Anda hari ini dan dapatkan feedback AI secara instan.",
  "dashboard.cta.button": "Mulai Sekarang",
  "dashboard.footer.tagline":
    "Kuasai Wawancara Berikutnya — berlatih dengan suara, dapatkan feedback AI, dan raih peran impian.",
  "dashboard.footer.quickLinks": "Tautan Cepat",
  "dashboard.footer.legal": "Legal",
  "dashboard.footer.connect": "Hubungi",
  "dashboard.footer.privacy": "Kebijakan Privasi",
  "dashboard.footer.terms": "Ketentuan Layanan",
  "dashboard.footer.copyright":
    "© {year} Fuenzer Career. Hak cipta dilindungi undang-undang.",
  "dashboard.loading.market": "Agen sedang mengambil data pasar langsung…",
  "dashboard.loading.prep": "Agen sedang membuat pertanyaan wawancara…",
  "dashboard.loading.seconds": "detik",
  "dashboard.loading.searching": "Mencari di pasar…",
  "dashboard.loading.working": "Masih bekerja — mengambil data langsung.",
  "dashboard.loading.patience":
    "Ini memakan waktu — terima kasih atas kesabaran Anda.",
  "dashboard.loading.powered": "Didukung oleh",
  "dashboard.error.timeout":
    "Pencarian ini memakan waktu lebih lama dari yang diharapkan. Coba peran lain atau periksa kembali nanti.",
  "dashboard.error.liveUnavailable":
    "Data langsung sementara tidak tersedia. Menggunakan skill umum.",
  "dashboard.error.prepTimeout":
    "Pembuatan pertanyaan memakan waktu terlalu lama. Coba lagi dengan skill yang lebih sedikit.",
  "dashboard.error.rateLimit":
    "Silakan tunggu {seconds} detik sebelum mencari lagi.",
  "dashboard.error.prepRateLimit":
    "Silakan tunggu {seconds} detik sebelum membuat lagi.",
  "dashboard.error.marketTimeout":
    "Gagal mengambil data pasar. Menggunakan skill umum.",

  /* ── Interview Room ── */
  "interview.topBar.label": "Latihan Wawancara",
  "interview.topBar.questionCount": "Pertanyaan {current} dari {total}",
  "interview.questionCard.interviewer": "Pewawancara",
  "interview.questionCard.instructionVoice":
    "Luangkan waktu untuk mengumpulkan pikiran, lalu tekan mikrofon dan ucapkan jawaban Anda dengan jelas.",
  "interview.questionCard.instructionText":
    "Luangkan waktu untuk mengumpulkan pikiran, lalu ketik jawaban Anda di bawah.",
  "interview.questionCard.liveTranscript": "Transkripsi langsung",
  "interview.questionCard.yourAnswer": "Jawaban Anda",
  "interview.questionCard.fillerWords": "{count} filler word(s)",
  "interview.hint.button": "Butuh Petunjuk?",
  "interview.hint.hide": "Sembunyikan Petunjuk",
  "interview.hint.title": "Petunjuk Metode STAR",
  "interview.hint.star.situation": "Situation",
  "interview.hint.star.task": "Task",
  "interview.hint.star.action": "Action",
  "interview.hint.star.result": "Result",
  "interview.hint.star.situationDesc":
    "Jelaskan konteks — proyek, tim, dan apa yang membuatnya kompleks.",
  "interview.hint.star.taskDesc":
    "Jelaskan tanggung jawab spesifik Anda dan apa yang perlu dicapai.",
  "interview.hint.star.actionDesc":
    "Jelaskan langkah yang Anda ambil — tools, teknik, keputusan.",
  "interview.hint.star.resultDesc":
    "Bagikan hasil yang terukur — waktu muat lebih cepat, pengguna lebih puas, dll.",
  "interview.hint.loading": "Membuat petunjuk personal…",
  "interview.hint.error": "Tidak dapat membuat petunjuk saat ini.",
  "interview.hint.retry": "Coba Lagi",
  "interview.hint.suggestionLabel": "Saran Interviewer Agent:",
  "interview.tip": "Tip: Jawab dalam {language} untuk akurasi evaluasi terbaik.",
  "interview.status.typeAnswer": "Ketik jawaban Anda di bawah",
  "interview.status.recording": "Merekam… Ketuk untuk berhenti",
  "interview.status.processing": "Memproses Audio…",
  "interview.status.recorded": "Jawaban terekam",
  "interview.status.tapToStart": "Ketuk untuk mulai merekam",
  "interview.textarea.label": "Ketik jawaban Anda",
  "interview.textarea.placeholder": "Ketik jawaban Anda di sini…",
  "interview.textarea.emptyHint":
    "Ketik jawaban Anda di atas untuk melanjutkan.",
  "interview.textarea.words": "{count} kata",
  "interview.mic.toggleToText": "Ketik saja",
  "interview.mic.toggleToMic": "Gunakan mikrofon",
  "interview.mic.aria.start": "Mulai merekam",
  "interview.mic.aria.stop": "Berhenti merekam",
  "interview.mic.aria.processing": "Memproses audio",
  "interview.mic.error.denied":
    "Akses mikrofon ditolak. Ketik jawaban Anda saja.",
  "interview.mic.error.notFound":
    "Tidak ada mikrofon ditemukan. Ketik jawaban Anda saja.",
  "interview.mic.error.general":
    "Layanan suara sementara tidak tersedia — {message}. Ketik jawaban Anda saja.",
  "interview.mic.fillerBadge": "{count} filler word(s)",
  "interview.button.skip": "Lewati Pertanyaan",
  "interview.button.retry": "Ulangi",
  "interview.button.next": "Pertanyaan Berikutnya",
  "interview.button.finish": "Selesai & Lihat Hasil",
  "interview.button.evaluating": "Mengevaluasi…",
  "interview.evaluation.overlay.title": "Menganalisis jawaban Anda…",
  "interview.evaluation.overlay.subtitle":
    "AI sedang mengevaluasi respons Anda dan menyiapkan feedback.",
  "interview.answer.skipped": "[Dilewati]",
  "interview.answer.noAnswer": "[Tidak ada jawaban]",

  /* ── Evaluation Report ── */
  "report.titleBadge": "Evaluasi Selesai",
  "report.heading": "Dashboard Wawancara Anda",
  "report.subtitle":
    "Rincian lengkap performa wawancara tiruan{role} Anda.",
  "report.score.excellent": "Luar biasa!",
  "report.score.great": "Performa hebat!",
  "report.score.good": "Usaha bagus — masih bisa berkembang",
  "report.score.needsWork": "Perlu latihan — terus berlatih",
  "report.summary.high":
    "Anda menunjukkan pengetahuan teknis yang kuat dan komunikasi yang jelas. Fokus pada memperdalam jawaban Anda untuk dampak yang lebih kuat.",
  "report.summary.low":
    "Terus berlatih! Fokus pada menyusun jawaban dengan jelas dan mendukungnya dengan contoh spesifik.",
  "report.skillMatch.heading": "Kecocokan Skill",
  "report.skillMatch.demonstrated": "Ditunjukkan ✓",
  "report.skillMatch.focusAreas": "Area Fokus",
  "report.skillMatch.noMatch": "Belum ada skill yang cocok.",
  "report.skillMatch.noMissing": "Tidak ada skill yang kurang — keselarasan bagus!",
  "report.breakdown.heading": "Rincian Per Pertanyaan",
  "report.transcript.heading": "Transkrip",
  "report.transcript.noData": "Data transkrip tidak tersedia.",
  "report.transcript.prev": "Pertanyaan sebelumnya",
  "report.transcript.next": "Pertanyaan berikutnya",
  "report.transcript.questionCount": "Pertanyaan {current} dari {total}",
  "report.transcript.fillerDetected":
    "{count} filler word(s) terdeteksi: {words}",
  "report.transcript.aria.question": "Pertanyaan {index}",
  "report.recommendations.heading": "Rekomendasi",
  "report.recommendations.skillMatch": "Kecocokan skill:",
  "report.recommendations.skillMatchYou":
    "Anda menunjukkan {matched}.",
  "report.recommendations.skillMatchMissing":
    " Fokus mengembangkan {missing}.",
  "report.recommendations.delivery": "Penyampaian",
  "report.recommendations.fillerAnalysis": "Analisis Filler Words",
  "report.recommendations.fillerTotal": "{count} total",
  "report.recommendations.noFiller":
    "Data filler word tidak tersedia. Ucapkan jawaban Anda dengan mikrofon untuk mendapatkan analisis filler word.",
  "report.recommendations.tips": "Tips yang Dapat Ditindaklanjuti",
  "report.recommendations.noTips": "Tidak ada tips spesifik yang tersedia.",
  "report.recommendations.suggestion": "Saran",
  "report.recommendations.outstanding": "Performa luar biasa",
  "report.recommendations.skillsToDevelop":
    "{count} skill untuk dikembangkan",
  "report.cta.button": "Coba Peran Lain",
  "report.cta.subtitle": "Siap untuk putaran berikutnya? Latihan membuat kemajuan.",
  "report.error.notFound": "Laporan Tidak Ditemukan",
  "report.error.notFoundDesc":
    "Kami tidak dapat menemukan laporan itu. Mungkin telah dihapus atau Anda tidak memiliki izin untuk melihatnya.",
  "report.error.goToDashboard": "Ke Dashboard",
  "report.loading": "Memuat laporan…",

  /* ── Login ── */
  "login.heading": "Selamat Datang Kembali",
  "login.subtitle": "Masuk untuk melanjutkan atau jelajahi sebagai tamu.",
  "login.googleBtn": "Masuk dengan Google",
  "login.redirecting": "Mengalihkan…",
  "login.guestBtn": "Lanjutkan sebagai Tamu",
  "login.termsNote":
    "Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.",
  "login.error.googleFailed": "Gagal masuk dengan Google",

  /* ── Sign Up ── */
  "signup.heading": "Buat Akun Anda",
  "signup.subtitle":
    "Daftar untuk melacak progres Anda dan mendapatkan feedback personal.",
  "signup.googleBtn": "Daftar dengan Google",
  "signup.redirecting": "Mengalihkan…",
  "signup.guestBtn": "Lanjutkan sebagai Tamu",
  "signup.existingAccount": "Sudah punya akun?",
  "signup.signInLink": "Masuk",
  "signup.error.googleFailed": "Gagal mendaftar dengan Google",

  /* ── Not Found ── */
  "notfound.heading": "404",
  "notfound.subheading": "Halaman tidak ditemukan",
  "notfound.message":
    "Halaman yang Anda cari tidak ada atau telah dipindahkan. Mari kembali ke jalur yang benar.",
  "notfound.dashboard": "Ke Dashboard",
  "notfound.goBack": "Kembali",

  /* ── Cookie Consent ── */
  "cookie.title": "Kami menghargai privasi Anda",
  "cookie.description":
    "Kami menggunakan Google Analytics untuk memahami bagaimana Anda menggunakan Fuenzer Career agar kami dapat meningkatkannya. Data Anda dianonimkan dan tidak pernah dijual.",
  "cookie.learnMore": "Pelajari lebih lanjut",
  "cookie.reject": "Tolak",
  "cookie.accept": "Terima",

  /* ── Interview Config Modal ── */
  "config.title": "Konfigurasi Wawancara Anda",
  "config.subtitle": "Sesuaikan bagaimana AI membuat pertanyaan Anda.",
  "config.language": "Bahasa",
  "config.languageHint": "Pertanyaan akan dibuat dalam {language}.",
  "config.difficulty": "Tingkat Kesulitan",
  "config.difficultyCustomLabel": "Jelaskan tingkat kesulitan Anda",
  "config.difficultyCustomPlaceholder":
    "contoh: \"Mid-level dengan fokus AWS\"",
  "config.questions": "Jumlah Pertanyaan",
  "config.questionsLabel": "{count} pertanyaan",
  "config.summary.title": "Ringkasan",
  "config.summary.role": "Peran:",
  "config.summary.skills": "Skill:",
  "config.summary.notSelected": "Belum dipilih",
  "config.summary.noneSelected": "Tidak ada yang dipilih",
  "config.summary.desc":
    "AI akan membuat {count} dalam {language} pada tingkat {difficulty}, fokus pada skill yang Anda pilih.",
  "config.cancel": "Batal",
  "config.generate": "Buat Pertanyaan",

  /* ── Role Combobox ── */
  "role.searchPlaceholder": "contoh: Frontend Developer",
  "role.buttonText": "Mulai Riset Target",
  "role.noMatch": "Tidak ada peran yang cocok — tekan Enter untuk gunakan \"{value}\"",
  "role.targetLabel": "Peran target",
  "role.openList": "Buka daftar peran",
  "role.closeList": "Tutup daftar peran",

  /* ── Terms of Service ── */
  "terms.back": "Kembali ke Beranda",
  "terms.title": "Ketentuan Layanan",
  "terms.lastUpdated": "Terakhir diperbarui: Juni 2025",
  "terms.sections._body":
    "Dengan menggunakan Fuenzer Career, Anda menyetujui Ketentuan Layanan ini. Jika Anda tidak setuju, mohon jangan gunakan platform ini. Fuenzer Career menyediakan latihan wawancara tiruan berbasis AI. Anda setuju untuk menggunakan layanan hanya untuk tujuan yang sah dan tidak untuk: Mengunggah konten yang berbahaya, cabul, atau ilegal. Mencoba merekayasa balik atau menyalahgunakan sistem AI. Menggunakan platform untuk menyamar sebagai orang lain. Jika Anda membuat akun, Anda bertanggung jawab menjaga kerahasiaan kata sandi Anda dan semua aktivitas di bawah akun Anda. Fuenzer Career adalah alat latihan dan tidak menjamin penempatan kerja atau keberhasilan wawancara. Feedback dihasilkan oleh AI dan mungkin tidak bebas dari kesalahan. Gunakan sebagai pelengkap persiapan Anda sendiri. Fuenzer Career dan operatornya tidak bertanggung jawab atas kerusakan tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan. Kami dapat memperbarui ketentuan ini dari waktu ke waktu. Penggunaan berkelanjutan setelah perubahan merupakan penerimaan ketentuan baru. Untuk pertanyaan tentang ketentuan ini, hubungi fuenzerofficial@gmail.com.",
  "terms.section.1": "1. Penerimaan Ketentuan",
  "terms.section.2": "2. Penggunaan Layanan",
  "terms.section.3": "3. Tanggung Jawab Akun",
  "terms.section.4": "4. Penyangkalan",
  "terms.section.5": "5. Batasan Tanggung Jawab",
  "terms.section.6": "6. Perubahan Ketentuan",
  "terms.section.7": "7. Cookies & Analytics",
  "terms.section.8": "8. Kontak",

  /* ── Privacy Policy ── */
  "privacy.back": "Kembali ke Beranda",
  "privacy.title": "Kebijakan Privasi",
  "privacy.lastUpdated": "Terakhir diperbarui: Juni 2025",
  "privacy.section.1": "1. Informasi yang Kami Kumpulkan",
  "privacy.section.2": "2. Bagaimana Kami Menggunakan Data Anda",
  "privacy.section.3": "3. Keamanan Data",
  "privacy.section.4": "4. Hak Anda",
  "privacy.section.5": "5. Cookies & Google Analytics",
  "privacy.section.6": "6. Kontak",

  /* ── Misc / Shared ── */
  "generic.loading": "Memuat…",
  "generic.error": "Terjadi kesalahan",
  "generic.retry": "Coba Lagi",
  "generic.save": "Simpan",
  "generic.close": "Tutup",
};

export default id;
