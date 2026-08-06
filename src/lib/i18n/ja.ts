/**
 * Japanese translation dictionary.
 */

const ja: Record<string, string> = {
  /* ── NavBar ── */
  "nav.trending": "トレンド",
  "nav.howItWorks": "仕組み",
  "nav.testimonials": "ユーザーの声",
  "nav.faq": "よくある質問",
  "nav.signIn": "ログイン",
  "nav.signUp": "新規登録",
  "nav.history": "履歴",
  "nav.notifications": "通知",
  "nav.practiceHistory": "練習履歴",
  "nav.noHistory": "履歴がありません",
  "nav.noHistoryDesc":
    "面接練習を完了すると、ここに練習セッションが表示されます。",
  "nav.noNotifications": "まだ通知はありません。",
  "nav.showMore": "もっと見る",
  "nav.showLess": "閉じる",
  "nav.signOut": "ログアウト",
  "nav.deleteAccount": "アカウント削除",
  "nav.deleting": "削除中…",
  "nav.guest": "ゲスト",
  "nav.confirmDeleteAccount":
    "アカウントを削除してもよろしいですか？この操作は元に戻せません。",
  "nav.deleteFailed":
    "アカウントの削除に失敗しました。もう一度お試しください。",
  "nav.userFallback": "ユーザー",
  "nav.aria.logo": "Fuenzer Career",
  "nav.aria.langSelect": "言語を選択",
  "nav.aria.notifications": "通知",
  "nav.aria.history": "履歴",
  "nav.aria.userProfile": "ユーザープロフィール",
  "nav.aria.close": "閉じる",
  "nav.aria.openMenu": "ナビゲーションメニューを開く",
  "nav.aria.closeMenu": "ナビゲーションメニューを閉じる",
  "nav.aria.prevPage": "前のページ",
  "nav.aria.nextPage": "次のページ",
  "nav.aria.deleteSession": "{role} のセッションを削除",
  "nav.notif.alphaTitle": "🚀 新着 — データベースが稼働中！",
  "nav.notif.alphaDesc":
    "練習履歴とスコア追跡が LIVE になりました！Google でログインしてセッションを保存し、過去の評価レポートを再確認して、スコアの推移を追跡しましょう。通知も有効です — 新機能やアップデートをお知らせします。一緒に歩んでいただきありがとうございます！",

  /* ── Dashboard ── */
  "dashboard.hero.heading": "次の面接を成功させよう",
  "dashboard.hero.subtitle":
    "ターゲット職種のトレンドスキルを発見し、音声で模擬面接を練習し、進捗を追跡し、AI フィードバックを取得 — すべて1つのダッシュボードから。",
  "dashboard.trending.heading": "トレンドスキル",
  "dashboard.trending.live": "リアルタイム市場データ",
  "dashboard.trending.general": "一般的なトレンド",
  "dashboard.trending.basedOn": "「{role}」の現在の求人情報に基づく",
  "dashboard.trending.genericBasedOn":
    "上の役職を入力してライブデータを取得してください。",
  "dashboard.trending.searchPlaceholder": "スキルを検索…",
  "dashboard.trending.filter.all": "すべてのレベル",
  "dashboard.trending.filter.high": "高需要 (>70)",
  "dashboard.trending.filter.mid": "中程度 (40–70)",
  "dashboard.trending.filter.low": "低 (<40)",
  "dashboard.trending.sort.highest": "高い順",
  "dashboard.trending.sort.lowest": "低い順",
  "dashboard.trending.sort.alpha": "アルファベット順",
  "dashboard.trending.noMatch": "検索条件に一致するスキルはありません。",
  "dashboard.keywords.title":
    "面接で練習したいスキルを選択してください",
  "dashboard.keywords.subtitle":
    "ターゲット職種に最も関連するスキルを選択してください。上位5つが事前選択されています。",
  "dashboard.keywords.nextBtn": "次へ：質問を生成（{count}スキル）",
  "dashboard.keywords.skipBtn": "スキップ → 上位5つを自動選択",
  "dashboard.keywords.minError": "続行するには少なくとも3つのスキルを選択してください。",
  "dashboard.keywords.prepErrorTitle": "質問を生成できませんでした",
  "dashboard.keywords.tryAgain": "再試行",
  "dashboard.idle.title": "練習が進歩を生む",
  "dashboard.idle.subtitle":
    "上のターゲット職種を入力または選択し、「ターゲットリサーチを開始」をクリックして面接シミュレーションを始めてください。",
  "dashboard.howItWorks.heading": "仕組み",
  "dashboard.howItWorks.subtitle":
    "3つのインテリジェントエージェントが連携してあなたに優位性をもたらします。",
  "dashboard.howItWorks.agents.market.title": "市場職種エージェント",
  "dashboard.howItWorks.agents.market.desc":
    "リアルタイムで求人情報を収集し、トレンドスキル、給与範囲、役割要件を特定します。",
  "dashboard.howItWorks.agents.interviewer.title": "面接官エージェント",
  "dashboard.howItWorks.agents.interviewer.desc":
    "役割に基づいた文脈的な面接質問を生成し、STARメソッドの回答をガイドします。",
  "dashboard.howItWorks.agents.evaluation.title": "評価エージェント",
  "dashboard.howItWorks.agents.evaluation.desc":
    "音声回答を分析し、明瞭さ、自信、スキルの適合性、実用的な改善のヒントを提供します。",
  "dashboard.why.heading": "Fuenzer Careerの強み",
  "dashboard.why.subtitle":
    "面接室に入る前に優位性を提供するために構築されました。",
  "dashboard.why.features.market.title": "市場主導のリサーチ",
  "dashboard.why.features.market.desc":
    "面接に臨む前に、企業が求めるスキルを把握しましょう。",
  "dashboard.why.features.voice.title": "音声面接練習",
  "dashboard.why.features.voice.desc":
    "リアルな質問で声に出して練習。実際の面接のための筋肉記憶を構築します。",
  "dashboard.why.features.ai.title": "AI搭載の洞察",
  "dashboard.why.features.ai.desc":
    "自信、ためらいのパターン、スキルの適合性に関する即時フィードバックを取得します。",
  "dashboard.testimonials.heading": "ユーザーの声",
  "dashboard.testimonials.subtitle":
    "Fuenzer Careerを使用した人々の声をお聞きください。",
  "dashboard.testimonials.aria.next": "次の体験談",
  "dashboard.testimonials.aria.prev": "前の体験談",
  "dashboard.testimonials.aria.goTo": "体験談 {index} へ",
  "dashboard.faq.heading": "よくある質問",
  "dashboard.faq.subtitle":
    "始める前に知っておくべきすべてのこと。",
  "dashboard.faq.q1": "無料ですか？",
  "dashboard.faq.a1":
    "はい！フェーズ1は完全に無料です。アカウントやクレジットカードは不要です — 職種を入力して練習を始めるだけです。",
  "dashboard.faq.q2": "マイクは必要ですか？",
  "dashboard.faq.a2":
    "最高の体験のためには、はい。マイクなしでもプラットフォームを探索できますが、音声練習こそが本当の魔法です。",
  "dashboard.faq.q3": "AIフィードバックの仕組みは？",
  "dashboard.faq.a3":
    "当社のAIは、話し方のパターン、フィラーワードの使用状況、回答がターゲット職種の必要スキルとどの程度一致しているかを分析します。",
  "dashboard.faq.q4": "進捗を保存できますか？",
  "dashboard.faq.a4":
    "はい！無料アカウントを作成すると、面接履歴、スコア、フィードバックが自動的に保存されます。過去のセッションは履歴パネルからいつでも確認できます。",
  "dashboard.faq.q5": "Fuenzer Careerの使用にアカウントは必要ですか？",
  "dashboard.faq.a5":
    "いいえ！サインアップ不要でゲストとして練習できます。アカウント作成で履歴追跡、レポート保存、パーソナライズされた通知が利用可能になります。",
  "dashboard.cta.heading": "面接を成功させる準備はできましたか？",
  "dashboard.cta.subtitle":
    "今日から面接練習を始めて、AIによるフィードバックを即座に取得しましょう。",
  "dashboard.cta.button": "今すぐ始める",
  "dashboard.footer.tagline":
    "次の面接を成功させよう — 音声で練習し、AIフィードバックを受け、役割を勝ち取りましょう。",
  "dashboard.footer.quickLinks": "クイックリンク",
  "dashboard.footer.legal": "法的情報",
  "dashboard.footer.connect": "お問い合わせ",
  "dashboard.footer.privacy": "プライバシーポリシー",
  "dashboard.footer.terms": "利用規約",
  "dashboard.footer.copyright":
    "© {year} Fuenzer Career. All rights reserved.",
  "dashboard.loading.market": "エージェントがリアルタイム市場データを取得中…",
  "dashboard.loading.prep": "エージェントが面接質問を生成中…",
  "dashboard.loading.seconds": "秒",
  "dashboard.loading.searching": "市場を検索中…",
  "dashboard.loading.working": "まだ処理中 — ライブデータを取得しています。",
  "dashboard.loading.patience":
    "少し時間がかかっています — お待ちいただきありがとうございます。",
  "dashboard.loading.powered": "提供：",
  "dashboard.error.timeout":
    "この検索は予想より時間がかかっています。別の職種を試すか、後でもう一度確認してください。",
  "dashboard.error.liveUnavailable":
    "ライブデータが一時的に利用できません。一般的なスキルを使用しています。",
  "dashboard.error.prepTimeout":
    "質問の生成に時間がかかりすぎています。選択したスキルを減らして再試行してください。",
  "dashboard.error.rateLimit":
    "検索する前に {seconds} 秒お待ちください。",
  "dashboard.error.prepRateLimit":
    "生成する前に {seconds} 秒お待ちください。",
  "dashboard.error.marketTimeout":
    "市場データの取得に失敗しました。一般的なスキルを使用しています。",

  /* ── Interview Room ── */
  "interview.topBar.label": "面接練習",
  "interview.topBar.questionCount": "質問 {current} / {total}",
  "interview.questionCard.interviewer": "面接官",
  "interview.questionCard.instructionVoice":
    "考えをまとめる時間を取り、マイクを押して明確に答えを話してください。",
  "interview.questionCard.instructionText":
    "考えをまとめる時間を取り、下に答えを入力してください。",
  "interview.questionCard.liveTranscript": "リアルタイム文字起こし",
  "interview.questionCard.yourAnswer": "あなたの回答",
  "interview.questionCard.fillerWords": "フィラーワード {count}個",
  "interview.hint.button": "ヒントが必要ですか？",
  "interview.hint.hide": "ヒントを隠す",
  "interview.hint.title": "STARメソッドのヒント",
  "interview.hint.star.situation": "状況",
  "interview.hint.star.task": "課題",
  "interview.hint.star.action": "行動",
  "interview.hint.star.result": "結果",
  "interview.hint.star.situationDesc":
    "コンテキストを説明してください — プロジェクト、チーム、複雑さの要因。",
  "interview.hint.star.taskDesc":
    "あなたの具体的な責任と達成すべきことを説明してください。",
  "interview.hint.star.actionDesc":
    "あなたが取った手順を説明してください — ツール、技術、判断。",
  "interview.hint.star.resultDesc":
    "測定可能な成果を共有してください — 読み込み時間の短縮、ユーザー満足度の向上など。",
  "interview.hint.loading": "パーソナライズされたヒントを生成中…",
  "interview.hint.error": "現在ヒントを生成できません。",
  "interview.hint.retry": "再試行",
  "interview.hint.suggestionLabel": "面接官エージェントの提案：",
  "interview.tip": "ヒント：最適な評価精度のために {language} で回答してください。",
  "interview.status.typeAnswer": "下に回答を入力してください",
  "interview.status.recording": "録音中… タップして停止",
  "interview.status.processing": "音声処理中…",
  "interview.status.recorded": "回答が録音されました",
  "interview.status.tapToStart": "タップして録音開始",
  "interview.textarea.label": "回答を入力",
  "interview.textarea.placeholder": "ここに回答を入力してください…",
  "interview.textarea.emptyHint":
    "上に回答を入力して続行してください。",
  "interview.textarea.words": "{count} 語",
  "interview.mic.toggleToText": "テキスト入力に切り替え",
  "interview.mic.toggleToMic": "マイクを使用",
  "interview.mic.aria.start": "録音開始",
  "interview.mic.aria.stop": "録音停止",
  "interview.mic.aria.processing": "音声処理中",
  "interview.mic.error.denied":
    "マイクへのアクセスが拒否されました。代わりに回答を入力してください。",
  "interview.mic.error.notFound":
    "マイクが見つかりません。代わりに回答を入力してください。",
  "interview.mic.error.general":
    "音声サービスが一時的に利用できません — {message}。代わりに回答を入力してください。",
  "interview.mic.fillerBadge": "フィラーワード {count}個",
  "interview.button.skip": "質問をスキップ",
  "interview.button.retry": "やり直す",
  "interview.button.next": "次の質問",
  "interview.button.finish": "完了して結果を見る",
  "interview.button.evaluating": "評価中…",
  "interview.evaluation.overlay.title": "回答を分析中…",
  "interview.evaluation.overlay.subtitle":
    "AIがあなたの回答を評価し、フィードバックを準備しています。",
  "interview.answer.skipped": "[スキップ]",
  "interview.answer.noAnswer": "[回答なし]",

  /* ── Evaluation Report ── */
  "report.titleBadge": "評価完了",
  "report.heading": "面接ダッシュボード",
  "report.subtitle":
    "{role}の模擬面接パフォーマンスの詳細な内訳です。",
  "report.score.excellent": "素晴らしい！",
  "report.score.great": "素晴らしいパフォーマンス！",
  "report.score.good": "良い努力 — まだ成長の余地あり",
  "report.score.needsWork": "改善が必要 — 練習を続けましょう",
  "report.summary.high":
    "強力な技術知識と明確なコミュニケーションを示しました。より強いインパクトのために回答を深めることに集中してください。",
  "report.summary.low":
    "練習を続けましょう！回答を明確に構成し、具体的な例で裏付けることに集中してください。",
  "report.skillMatch.heading": "スキルマッチ",
  "report.skillMatch.demonstrated": "実証済み ✓",
  "report.skillMatch.focusAreas": "重点分野",
  "report.skillMatch.noMatch": "まだ一致するスキルはありません。",
  "report.skillMatch.noMissing": "不足スキルなし — 優れた適合性！",
  "report.breakdown.heading": "質問ごとの内訳",
  "report.transcript.heading": "文字起こし",
  "report.transcript.noData": "文字起こしデータは利用できません。",
  "report.transcript.prev": "前の質問",
  "report.transcript.next": "次の質問",
  "report.transcript.questionCount": "質問 {current} / {total}",
  "report.transcript.fillerDetected":
    "{count}個のフィラーワードを検出：{words}",
  "report.transcript.aria.question": "質問 {index}",
  "report.recommendations.heading": "おすすめ",
  "report.recommendations.skillMatch": "スキルマッチ：",
  "report.recommendations.skillMatchYou":
    "{matched} を実証しました。",
  "report.recommendations.skillMatchMissing":
    " {missing} の開発に集中してください。",
  "report.recommendations.delivery": "話し方",
  "report.recommendations.fillerAnalysis": "フィラーワード分析",
  "report.recommendations.fillerTotal": "合計 {count}個",
  "report.recommendations.noFiller":
    "フィラーワードデータは利用できません。マイクで回答を話すとフィラーワード分析が取得できます。",
  "report.recommendations.tips": "実用的なヒント",
  "report.recommendations.noTips": "利用可能な具体的なヒントはありません。",
  "report.recommendations.suggestion": "提案",
  "report.recommendations.outstanding": "卓越したパフォーマンス",
  "report.recommendations.skillsToDevelop":
    "開発すべきスキル {count}個",
  "report.cta.button": "別の役職を試す",
  "report.cta.subtitle": "次のラウンドの準備はできましたか？練習が進歩を生みます。",
  "report.error.notFound": "レポートが見つかりません",
  "report.error.notFoundDesc":
    "そのレポートが見つかりませんでした。削除されたか、表示権限がない可能性があります。",
  "report.error.goToDashboard": "ダッシュボードへ",
  "report.loading": "レポートを読み込み中…",

  /* ── Login ── */
  "login.heading": "お帰りなさい",
  "login.subtitle": "ログインして続行するか、ゲストとして探索してください。",
  "login.googleBtn": "Googleでログイン",
  "login.redirecting": "リダイレクト中…",
  "login.guestBtn": "ゲストとして続行",
  "login.termsNote":
    "続行することにより、利用規約とプライバシーポリシーに同意したことになります。",
  "login.error.googleFailed": "Googleでのログインに失敗しました",

  /* ── Sign Up ── */
  "signup.heading": "アカウントを作成",
  "signup.subtitle":
    "登録して進捗を追跡し、パーソナライズされたフィードバックを受け取りましょう。",
  "signup.googleBtn": "Googleで登録",
  "signup.redirecting": "リダイレクト中…",
  "signup.guestBtn": "ゲストとして続行",
  "signup.existingAccount": "すでにアカウントをお持ちですか？",
  "signup.signInLink": "ログイン",
  "signup.error.googleFailed": "Googleでの登録に失敗しました",

  /* ── Not Found ── */
  "notfound.heading": "404",
  "notfound.subheading": "ページが見つかりません",
  "notfound.message":
    "お探しのページは存在しないか、移動されました。正しい道に戻りましょう。",
  "notfound.dashboard": "ダッシュボードへ",
  "notfound.goBack": "戻る",

  /* ── Cookie Consent ── */
  "cookie.title": "プライバシーを尊重します",
  "cookie.description":
    "Fuenzer Careerの改善のため、Google Analyticsを使用して利用状況を理解しています。データは匿名化され、販売されることはありません。",
  "cookie.learnMore": "詳細",
  "cookie.reject": "拒否",
  "cookie.accept": "同意",

  /* ── Interview Config Modal ── */
  "config.title": "面接を設定",
  "config.subtitle": "AIが質問を生成する方法をカスタマイズします。",
  "config.language": "言語",
  "config.languageHint": "質問は {language} で生成されます。",
  "config.difficulty": "難易度",
  "config.difficultyCustomLabel": "難易度を説明してください",
  "config.difficultyCustomPlaceholder":
    "例：「AWSに焦点を当てた中級レベル」",
  "config.questions": "質問数",
  "config.questionsLabel": "{count} 問",
  "config.summary.title": "概要",
  "config.summary.role": "役職：",
  "config.summary.skills": "スキル：",
  "config.summary.notSelected": "未選択",
  "config.summary.noneSelected": "選択なし",
  "config.summary.desc":
    "AIが選択したスキルに焦点を当て、{difficulty}レベルで{language}の{count}を生成します。",
  "config.cancel": "キャンセル",
  "config.generate": "質問を生成",

  /* ── Role Combobox ── */
  "role.searchPlaceholder": "例：フロントエンド開発者",
  "role.buttonText": "ターゲットリサーチを開始",
  "role.noMatch": "一致する役職がありません — Enterキーで「{value}」を使用",
  "role.targetLabel": "ターゲット職種",
  "role.openList": "役職リストを開く",
  "role.closeList": "役職リストを閉じる",

  /* ── Terms of Service ── */
  "terms.back": "ホームに戻る",
  "terms.title": "利用規約",
  "terms.lastUpdated": "最終更新日：2025年6月",
  "terms.sections._body":
    "Fuenzer Careerを使用することにより、これらの利用規約に同意したことになります。同意しない場合は、プラットフォームを使用しないでください。Fuenzer CareerはAI搭載の模擬面接練習を提供します。お客様は、合法的な目的のためにのみ本サービスを使用することに同意し、以下を行わないことに同意します：有害、わいせつ、または違法なコンテンツのアップロード。AIシステムのリバースエンジニアリングまたは悪用の試み。他人になりすますためのプラットフォームの使用。アカウントを作成した場合、パスワードの機密性を維持し、アカウント上のすべての活動に責任を負います。Fuenzer Careerは練習ツールであり、就職や面接の成功を保証するものではありません。フィードバックはAIによって生成され、エラーがないとは限りません。ご自身の準備の補足として使用してください。Fuenzer Careerおよびその運営者は、本サービスの使用から生じるいかなる間接的、偶発的、または結果的な損害についても責任を負いません。当社はこれらの規約を随時更新することがあります。変更後の継続使用は新しい規約の受諾を意味します。これらの規約に関する質問は fuenzerofficial@gmail.com までご連絡ください。",
  "terms.section.1": "1. 規約の受諾",
  "terms.section.2": "2. サービスの利用",
  "terms.section.3": "3. アカウントの責任",
  "terms.section.4": "4. 免責事項",
  "terms.section.5": "5. 責任の制限",
  "terms.section.6": "6. 規約の変更",
  "terms.section.7": "7. Cookieと分析",
  "terms.section.8": "8. お問い合わせ",

  /* ── Privacy Policy ── */
  "privacy.back": "ホームに戻る",
  "privacy.title": "プライバシーポリシー",
  "privacy.lastUpdated": "最終更新日：2025年6月",
  "privacy.section.1": "1. 収集する情報",
  "privacy.section.2": "2. データの利用方法",
  "privacy.section.3": "3. データセキュリティ",
  "privacy.section.4": "4. お客様の権利",
  "privacy.section.5": "5. CookieとGoogle Analytics",
  "privacy.section.6": "6. お問い合わせ",

  /* ── Misc / Shared ── */
  "generic.loading": "読み込み中…",
  "generic.error": "エラーが発生しました",
  "generic.retry": "再試行",
  "generic.save": "保存",
  "generic.close": "閉じる",
};

export default ja;
