(() => {
  function showToast(msg) {
    const t = document.getElementById("toast"); t.textContent = msg; t.className = "show";
    setTimeout(() => { t.className = t.className.replace("show", ""); }, 2500);
  }

  const SETTINGS_KEY = "coleLanguageLab_v10_grid_beta";
  const synth = window.speechSynthesis;
  window.currentUtterance = null;

  let activePaintbrushVoice = null;

  const els = {
    themeBtn: document.getElementById("themeBtn"),
    v1: document.getElementById("voice1"),
    v2: document.getElementById("voice2"),
    v3: document.getElementById("voice3"),
    r1: document.getElementById("rate1"), rv1: document.getElementById("rateVal1"),
    r2: document.getElementById("rate2"), rv2: document.getElementById("rateVal2"),
    r3: document.getElementById("rate3"), rv3: document.getElementById("rateVal3"),
    text: document.getElementById("textInput"),
    gridEditor: document.getElementById("gridEditor"),
    gridWrapper: document.getElementById("gridEditorWrapper"),
    verticalEditor: document.getElementById("verticalEditor"),
    verticalWrapper: document.getElementById("verticalEditorWrapper"),
    modeGridBtn: document.getElementById("modeGridBtn"),
    modeVerticalBtn: document.getElementById("modeVerticalBtn"),
    display: document.getElementById("readerDisplay"),
    fileLoader: document.getElementById("fileLoader"),
    prev: document.getElementById("prevBtn"),
    next: document.getElementById("nextBtn"),
    loop: document.getElementById("loopBtn"),
    play: document.getElementById("playBtn"),
    pause: document.getElementById("pauseBtn"),
    stop: document.getElementById("stopBtn"),
    vocab: document.getElementById("vocabList"),
    copyAll: document.getElementById("copyAllBtn"),
    exportCsv: document.getElementById("exportCsvBtn"),
    clear: document.getElementById("clearBtn"),
    vocabUndo: document.getElementById("vocabUndoBtn"),
    // NEW CONTROLS
    show1: document.getElementById("chkShow1"), show2: document.getElementById("chkShow2"), show3: document.getElementById("chkShow3"),
    audio1: document.getElementById("chkAudio1"), audio2: document.getElementById("chkAudio2"), audio3: document.getElementById("chkAudio3"),
    autoScroll: document.getElementById("autoScrollChk"),
    autoSplit: document.getElementById("autoSplitPasteChk"),
    chkKuromoji: document.getElementById("chkKuromoji"),
    chkPinyin: document.getElementById("chkPinyin"),
    chkJyutping: document.getElementById("chkJyutping"),
  };

  // --- i18n Translation Logic ---
  const i18nDict = {
    "align_btn_help": { en: "Identifies possible misalignments when the number of lines don't match.", ja: "行数が一致しない場合の考えられるズレを特定します。", "zh-CN": "当行数不匹配时，识别可能的对齐错误。", "zh-TW": "當行數不匹配時，識別可能的對齊錯誤。", es: "Identifica posibles desajustes cuando el número de líneas no coincide." },
    "align_btn_help_ok": { en: "No misalignment. Click to check if 🔴", ja: "ズレはありません。🔴の場合のみクリックして確認できます。", "zh-CN": "无对齐错误。如果显示🔴可点击检查。", "zh-TW": "無對齊錯誤。如果顯示🔴可點擊檢查。", es: "Sin desajustes. Haz clic para comprobar si 🔴" },
    "align_btn": { en: "Alignment 🟢", ja: "ズレ 🟢", "zh-CN": "对齐 🟢", "zh-TW": "對齊 🟢", es: "Alineación 🟢" },
    "align_btn_red": { en: "Alignment 🔴", ja: "ズレ 🔴", "zh-CN": "对齐 🔴", "zh-TW": "對齊 🔴", es: "Alineación 🔴" },
    "scroll_to_bottom": { en: "Click to go to the bottom of the grid", ja: "クリックしてグリッドの最後に移動する", "zh-CN": "点击滚动到网格底部", "zh-TW": "點擊滾動到網格底部", es: "Haz clic para ir al final de la cuadrícula" },
    "app_title": { en: "Code-switch Reader", ja: "コードスイッチ・リーダー", "zh-CN": "代码切换阅读器", "zh-TW": "語碼轉換閱讀器", es: "Lector de Cambio de Código" },
    "v1_label": { en: "<span style=\"font-size:1.3em\">🎤</span>Voice 1", ja: "<span style=\"font-size:1.3em\">🎤</span>音声 1", "zh-CN": "<span style=\"font-size:1.3em\">🎤</span>语音 1", "zh-TW": "<span style=\"font-size:1.3em\">🎤</span>語音 1", es: "<span style=\"font-size:1.3em\">🎤</span>Voz 1" },
    "v2_label": { en: "<span style=\"font-size:1.3em\">🎤</span>Voice 2", ja: "<span style=\"font-size:1.3em\">🎤</span>音声 2", "zh-CN": "<span style=\"font-size:1.3em\">🎤</span>语音 2", "zh-TW": "<span style=\"font-size:1.3em\">🎤</span>語音 2", es: "<span style=\"font-size:1.3em\">🎤</span>Voz 2" },
    "v3_label": { en: "<span style=\"font-size:1.3em\">🎤</span>Voice 3", ja: "<span style=\"font-size:1.3em\">🎤</span>音声 3", "zh-CN": "<span style=\"font-size:1.3em\">🎤</span>语音 3", "zh-TW": "<span style=\"font-size:1.3em\">🎤</span>語音 3", es: "<span style=\"font-size:1.3em\">🎤</span>Voz 3" },
    "pause_shadowing": { en: "⏱️sentence pause time:", ja: "⏱️文の後に間を入れる：", "zh-CN": "⏱️句子后添加停顿：", "zh-TW": "⏱️句子後添加停頓：", es: "⏱️pausa después de cada frase:" },
    "show": { en: "👁️ Show:", ja: "👁️ 表示：", "zh-CN": "👁️ 显示：", "zh-TW": "👁️ 顯示：", es: "👁️ Mostrar:" },
    "audio": { en: "🎧 Audio:", ja: "🎧 音声：", "zh-CN": "🎧 语音：", "zh-TW": "🎧 語音：", es: "🎧 Audio:" },
    "auto_scroll": { en: "Auto-Scroll", ja: "自動スクロール", "zh-CN": "自动滚动", "zh-TW": "自動滾動", es: "Auto-Desplazamiento" },
    "clear": { en: "Clear", ja: "クリア", "zh-CN": "清除", "zh-TW": "清除", es: "Borrar" },
    "play": { en: "▶ Play", ja: "▶ 再生", "zh-CN": "▶ 播放", "zh-TW": "▶ 播放", es: "▶ Reproducir" },
    "pause": { en: "⏸ Pause", ja: "⏸ 一時停止", "zh-CN": "⏸ 暂停", "zh-TW": "⏸ 暫停", es: "⏸ Pausar" },
    "resume": { en: "⏯ Resume", ja: "⏯ 再開", "zh-CN": "⏯ 继续", "zh-TW": "⏯ 繼續", es: "⏯ Reanudar" },
    "exit": { en: "⏹ Exit", ja: "⏹ 終了", "zh-CN": "⏹ 退出", "zh-TW": "⏹ 退出", es: "⏹ Salir" },
    "notebook_title": { en: "📓 Notebook", ja: "📓 ノートブック", "zh-CN": "📓 词汇本", "zh-TW": "📓 詞彙本", es: "📓 Cuaderno" },
    "your_saves": { en: "(Your saves)", ja: "（保存した単語）", "zh-CN": "（你的保存）", "zh-TW": "（你的保存）", es: "(Tus guardados)" },
    "undo": { en: "Undo", ja: "元に戻す", "zh-CN": "撤销", "zh-TW": "撤銷", es: "Deshacer" },
    "gap": { en: "⬜ Gap", ja: "⬜ 空白", "zh-CN": "⬜ 留白", "zh-TW": "⬜ 留白", es: "⬜ Espacio" },
    "copy_all": { en: "Copy All", ja: "全てコピー", "zh-CN": "复制全部", "zh-TW": "複製全部", es: "Copiar Todo" },
    "cols": { en: "columns:", ja: "列：", "zh-CN": "列数：", "zh-TW": "列數：", es: "Cols:" },
    "export_csv": { en: "Export CSV", ja: "CSV出力", "zh-CN": "导出 CSV", "zh-TW": "導出 CSV", es: "Exportar CSV" },
    "tip_drag": { en: "💡 Tip: Left-click to drag/re-order. Right-click to delete.", ja: "💡 ヒント：左クリックでドラッグ/並び替え。右クリックで削除。", "zh-CN": "💡 提示：左键拖动以重新排序。右键删除。", "zh-TW": "💡 提示：左鍵拖動以重新排序。右鍵刪除。", es: "💡 Consejo: Clic izq. para arrastrar/reordenar. Clic der. para eliminar." },
    "how_csv": { en: "❓ How does CSV Export work? (For Anki users)", ja: "❓ CSV出力の仕組み（Ankiユーザー向け）", "zh-CN": "❓ CSV 导出如何运作？（适用于 Anki 用户）", "zh-TW": "❓ CSV 導出如何運作？（適用於 Anki 用戶）", es: "❓ ¿Cómo funciona Exportar CSV? (Para Anki)" },
    "empty_words": { en: "(Words/sentences you click or ➕ will appear here)", ja: "（クリックまたは➕した単語/文がここに表示されます）", "zh-CN": "（你点击或 ➕ 的单词/句子将出现在这里）", "zh-TW": "（你點擊或 ➕ 的單詞/句子將出現在這裡）", es: "(Las palabras/frases que hagas clic o ➕ aparecerán aquí)" },
    "shortcuts_title": { en: "⌨️ Shortcuts", ja: "⌨️ ショートカット", "zh-CN": "⌨️ 快捷键", "zh-TW": "⌨️ 快捷鍵", es: "⌨️ Atajos" },
    "mouse_title": { en: "🖱️ Mouse (Reader)", ja: "🖱️ マウス（リーダー）", "zh-CN": "🖱️ 鼠标（阅读器）", "zh-TW": "🖱️ 滑鼠（閱讀器）", es: "🖱️ Ratón (Lector)" },
    "notebook_help_title": { en: "📓 Notebook", ja: "📓 ノートブック", "zh-CN": "📓 词汇本", "zh-TW": "📓 詞彙本", es: "📓 Cuaderno" },
    "adv_jp": { en: "⚙️ Advanced Japanese Parsing", ja: "⚙️ 高度な日本語解析", "zh-CN": "⚙️ 高级日语解析", "zh-TW": "⚙️ 高級日語解析", es: "⚙️ Análisis Japonés Avanzado" },
    "adv_lang": { en: "⚙️ Advanced Language Settings", ja: "⚙️ 高度な言語設定", "zh-CN": "⚙️ 高级语言设置", "zh-TW": "⚙️ 高級語言設置", es: "⚙️ Configuración Avanzada de Idioma" },
    "kuromoji_desc": { en: "By default, browsers struggle to break Japanese sentences into proper words. Enable the Kuromoji Dictionary to help with word splitting for vocab capturing.", ja: "デフォルトでは、ブラウザは日本語の文章を正しく単語に分割するのに苦労します。Kuromoji辞書を有効にして、単語の分割を改善してください。", "zh-CN": "默认情况下，浏览器很难将日语句子正确地分解成单词。启用 Kuromoji 字典以帮助分词并捕获词汇。", "zh-TW": "默認情況下，瀏覽器很難將日語句子正確地分解成單詞。啟用 Kuromoji 字典以幫助分詞並捕獲詞彙。", es: "Por defecto, los navegadores tienen problemas para dividir oraciones en japonés en palabras adecuadas. Habilite el diccionario Kuromoji para ayudar con la división de palabras." },
    "enable_kuromoji": { en: "Enable Kuromoji (~15MB download)", ja: "Kuromojiを有効にする (約15MBのダウンロードが必要)", "zh-CN": "启用 Kuromoji（需要约 15MB 下载）", "zh-TW": "啟用 Kuromoji（需要約 15MB 下載）", es: "Habilitar Kuromoji (Requiere descarga de ~15MB)" },
    "pinyin_desc": { en: "Enable Pinyin Pro to display pinyin readings over Chinese characters.", ja: "Pinyin Proを有効にすると、漢字の上にピンインを表示します。", "zh-CN": "启用 Pinyin Pro 在汉字上方显示拼音。", "zh-TW": "啟用 Pinyin Pro 在漢字上方顯示拼音。", es: "Habilite Pinyin Pro para mostrar lecturas de pinyin sobre los caracteres chinos." },
    "enable_pinyin": { en: "Enable Pinyin Dictionary (~3MB download)", ja: "ピンイン辞書を有効にする (約3MBのダウンロードが必要)", "zh-CN": "启用拼音字典（需要约 3MB 下载）", "zh-TW": "啟用拼音字典（需要約 3MB 下載）", es: "Habilitar Diccionario Pinyin (Requiere descarga de ~3MB)" },
    "kuromoji_success": { en: "Dictionary loaded successfully! Japanese text will now be perfectly split.", ja: "辞書の読み込みに成功しました！日本語のテキストが正しく分割されます。", "zh-CN": "字典加载成功！日文文本现在将被完美分割。", "zh-TW": "字典加載成功！日文文本現在將被完美分割。", es: "¡Diccionario cargado con éxito! El texto en japonés ahora se dividirá perfectamente." },
    "pinyin_success": { en: "Dictionary loaded successfully! Chinese text will show pinyin.", ja: "辞書の読み込みに成功しました！中国語のテキストにピンインが表示されます。", "zh-CN": "字典加载成功！中文文本将显示拼音。", "zh-TW": "字典加載成功！中文文本將顯示拼音。", es: "¡Diccionario cargado con éxito! El texto en chino mostrará pinyin." },
    "jyutping_desc": { en: "Enable Cantonese Jyutping dictionary to display readings over Chinese characters.", ja: "広東語のJyutping辞書を有効にして、漢字の上に読みを表示します。", "zh-CN": "启用粤语拼音（Jyutping）字典在汉字上方显示读音。", "zh-TW": "啟用粵語拼音（Jyutping）字典在漢字上方顯示讀音。", es: "Habilite el diccionario de Jyutping cantonés para mostrar lecturas sobre los caracteres chinos." },
    "enable_jyutping": { en: "Enable Jyutping Dictionary (~1MB download)", ja: "Jyutping辞書を有効にする (約1MBのダウンロードが必要)", "zh-CN": "启用粤语拼音字典（需要约 1MB 下载）", "zh-TW": "啟用粵語拼音字典（需要約 1MB 下載）", es: "Habilitar Diccionario Jyutping (Requiere descarga de ~1MB)" },
    "jyutping_success": { en: "Dictionary loaded successfully! Chinese text will show Jyutping.", ja: "辞書の読み込みに成功しました！中国語のテキストにJyutpingが表示されます。", "zh-CN": "字典加载成功！中文文本将显示粤语拼音。", "zh-TW": "字典加載成功！中文文本將顯示粵語拼音。", es: "¡Diccionario cargado con éxito! El texto en chino mostrará Jyutping." },
    "powered_by": { en: "Powered by open-source:", ja: "オープンソースプロジェクトによって提供：", "zh-CN": "由开源项目提供支持：", "zh-TW": "由開源項目提供支持：", es: "Impulsado por código abierto:" },
    "kofi_title": { en: "⭐ Kit's Recommended Study Stack", ja: "⭐ Kitのおすすめ学習ツール", "zh-CN": "⭐ Kit 推荐的学习工具", "zh-TW": "⭐ Kit 推薦的學習工具", es: "⭐ Recursos de Estudio Recomendados por Kit" },
    "support_dev": { en: "☕ Support the Dev", ja: "☕ 開発者を支援する", "zh-CN": "☕ 支持开发者", "zh-TW": "☕ 支持開發者", es: "☕ Apoyar al Desarrollador" },
    "coffee_desc": { en: "Is this tool helping you? A coffee keeps the updates coming!", ja: "このツールは役立っていますか？コーヒー一杯の支援が開発のモチベーションになります！", "zh-CN": "这个工具对你有帮助吗？请我喝杯咖啡，支持持续更新！", "zh-TW": "這個工具對你有幫助嗎？請我喝杯咖啡，支持持續更新！", es: "¿Te ayuda esta herramienta? ¡Un café mantiene las actualizaciones!" },
    "coffee_btn": { en: "Buy me a Coffee →", ja: "コーヒーを奢る →", "zh-CN": "请我喝杯咖啡 →", "zh-TW": "請我喝杯咖啡 →", es: "Cómprame un Café →" },
    "kofi_float": { en: "Built by Kit & Cole. Support us", ja: "KitとColeによる開発。推し活はこちら", "zh-CN": "Kit和Cole开发。赞助我们/打赏", "zh-TW": "Kit和Cole開發。贊助我們/打賞", es: "Creado por Kit & Cole. Apóyanos" },
    "nav_reader": { en: "Reader", ja: "リーダー", "zh-CN": "阅读器", "zh-TW": "閱讀器", es: "Lector" },
    "nav_notebook": { en: "Notebook", ja: "ノート", "zh-CN": "词汇本", "zh-TW": "詞彙本", es: "Cuaderno" },
    "nav_flashcards": { en: "Flashcards", ja: "単語帳", "zh-CN": "闪卡", "zh-TW": "閃卡", es: "Tarjetas" },
    "google_translate": { en: "Google", ja: "Google 翻訳", "zh-CN": "谷歌", "zh-TW": "Google 翻譯", es: "Traductor" },
    "deepl": { en: "DeepL", ja: "DeepL", "zh-CN": "DeepL", "zh-TW": "DeepL", es: "DeepL" },
    "auto_split": { en: "✂️ Auto-split sentences to break up long paragraphs", ja: "✂️ 文を自動分割して長い段落を区切る", "zh-CN": "✂️ 自动拆分句子以打断长段落", "zh-TW": "✂️ 自動拆分句子以打斷長段落", es: "✂️ Dividir oraciones automáticamente para romper párrafos largos" },
    "auto_split_help": { en: "Doesn't affect how your text is played if you only have 1 voice.\nTurn off if your bilingual reader already gives you perfectly matching paragraphs/sentences. Can help with breaking up long paragraphs.\nToggle on/off before you paste your text and see what you prefer!", ja: "音声が1つだけの場合は、テキストの再生には影響しません。\nバイリンガル・リーダーがすでに完全に一致する段落/文を提供している場合はオフにしてください。長い段落を区切るのに役立ちます。\nテキストを貼り付ける前にオン/オフを切り替えて、好みの方法を確認してください！", "zh-CN": "如果只有一种语音，则不影响文本播放。\n如果您的双语阅读器已经提供了完全匹配的段落/句子，请将其关闭。有助于打断长段落。\n在粘贴文本前切换开/关，看看您更喜欢哪种！", "zh-TW": "如果只有一種語音，則不影響文本播放。\n如果您的雙語閱讀器已經提供了完全匹配的段落/句子，請將其關閉。有助於打斷長段落。\n在粘貼文本前切換開/關，看看您更喜歡哪種！", es: "No afecta cómo se reproduce tu texto si solo tienes 1 voz.\nDesactívalo si tu lector bilingüe ya te da párrafos/oraciones que coinciden perfectamente. Puede ayudar a dividir párrafos largos.\n¡Alterna entre activado/desactivado antes de pegar tu texto y mira qué prefieres!" },
    "zen_mode_title": { en: "Focus / Full Page Mode", ja: "フォーカス / フルページモード", "zh-CN": "专注 / 全屏模式", "zh-TW": "專注 / 全屏模式", es: "Modo Enfoque / Pantalla Completa" },
    "v1_placeholder_first": { en: "Voice 1...\n💡\nStart by pasting your ENTIRE text for each voice into the boxes.\n\nHit ▶️ play!\n\nAs long as each voice has the same amount of lines, they will read side-by-side perfectly!", ja: "音声 1...\n💡\n各音声のすべてのテキストをボックスに貼り付けることから始めます。\n\n▶️ 再生を押してください！\n\n各音声の行数が同じであれば、完全に並んで読み上げられます！", "zh-CN": "语音 1...\n💡\n首先将每种语音的完整文本粘贴到框中。\n\n点击 ▶️ 播放！\n\n只要每种语音的行数相同，它们就会完美地并排朗读！", "zh-TW": "語音 1...\n💡\n首先將每種語音的完整文本粘貼到框中。\n\n點擊 ▶️ 播放！\n\n只要每種語音的行數相同，它們就會完美地並排朗讀！", es: "Voz 1...\n💡\nComienza pegando TODO tu texto para cada voz en los cuadros.\n\n¡Presiona ▶️ reproducir!\n\n¡Mientras cada voz tenga la misma cantidad de líneas, se leerán una al lado de la otra perfectamente!" },
    "v1_placeholder": { en: "Voice 1...", ja: "音声 1...", "zh-CN": "语音 1...", "zh-TW": "語音 1...", es: "Voz 1..." },
    "v2_placeholder": { en: "Voice 2...", ja: "音声 2...", "zh-CN": "语音 2...", "zh-TW": "語音 2...", es: "Voz 2..." },
    "v3_placeholder": { en: "Voice 3...", ja: "音声 3...", "zh-CN": "语音 3...", "zh-TW": "語音 3...", es: "Voz 3..." }
  };

  function applyTranslation(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (i18nDict[key] && i18nDict[key][lang]) {
            if (key === "notebook_title") {
                el.textContent = i18nDict[key][lang];
            } else if (el.tagName === "LABEL" && el.querySelector('input')) {
                 const cb = el.querySelector('input');
                 el.textContent = " " + i18nDict[key][lang];
                 el.prepend(cb);
            } else {
                el.innerHTML = i18nDict[key][lang];
            }
        }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.dataset.i18nTitle;
        if (i18nDict[key] && i18nDict[key][lang]) {
            el.title = i18nDict[key][lang];
        }
    });

    const p1 = lang === "ja" ? "検索... (例: 日本語)" : lang.startsWith("zh") ? "搜索... (例如: 中文)" : lang === "es" ? "Escribe para buscar (ej. Español)..." : "Type to search (e.g. English)...";
    document.getElementById("voice1").placeholder = p1;
    document.getElementById("voice2").placeholder = p1;
    document.getElementById("voice3").placeholder = p1;

    const ta = document.getElementById("textInput");
    if (ta) {
        if (lang === "ja") ta.placeholder = "ここにテキストを貼り付け:\n例: The cat is black. {猫は黒いです。} [Le chat est noir.]\n\n使い方は[?]を参照してください。";
        else if (lang.startsWith("zh")) ta.placeholder = "在此粘贴您的文本:\n例如: The cat is black. {这只猫是黑色的。} [Le chat est noir.]\n\n有关更多说明，请参见[?]。";
        else if (lang === "es") ta.placeholder = "Pega tu texto aquí:\nEj: The cat is black. {El gato es negro.} [Le chat est noir.]\n\nVer [?] para más instrucciones.";
        else ta.placeholder = "Paste your text here:\nEx: The cat is black. {El gato es negro.} [Le chat est noir.]\n\nSee [?] for more instructions.";
    }

    if (els.gridEditor) {
        Array.from(els.gridEditor.querySelectorAll(".grid-row")).forEach((row, rowIndex) => {
            const cells = row.querySelectorAll(".grid-cell");
            if (cells[0]) {
                const firstHolder = i18nDict["v1_placeholder_first"][lang] || i18nDict["v1_placeholder_first"]["en"];
                const regHolder = i18nDict["v1_placeholder"][lang] || i18nDict["v1_placeholder"]["en"];
                cells[0].dataset.placeholder = rowIndex === 0 ? firstHolder : regHolder;
            }
            if (cells[1]) cells[1].dataset.placeholder = i18nDict["v2_placeholder"][lang] || i18nDict["v2_placeholder"]["en"];
            if (cells[2]) cells[2].dataset.placeholder = i18nDict["v3_placeholder"][lang] || i18nDict["v3_placeholder"]["en"];
        });
    }
  }

  let state = {
    editorMode: "grid", // "grid" or "vertical"
    verticalData: [],
    verticalSpeakerMap: {},
    gridData: [],
    v1: "", v2: "", v3: "",
    speeds: ["1.0", "1.0", "1.0"],
    text: "",
    vocab: [],
    theme: "light",
    showTracks: [true, true, true], // Visual
    audioTracks: [true, true, true], // Audio
    shadow: "0",
    useKuromoji: false,
    usePinyin: false,
    useJyutping: false,
    autoSplit: true
  };

  let voices = [];
  let segments = [];
  let currentSegmentIndex = 0;
  let isPlaying = false;
  let isPaused = false;
  let isLooping = false;
  let isSkipping = false;
  let renderTask = null;
  let combosInitialized = false;
  let jpTokenizer = null;
  let isKuromojiLoading = false;
  let isPinyinLoading = false;
  let isJyutpingLoading = false;
  let lastGridData = null;
  let lastMainText = "";

  function captureGridSnapshot() {
      if (!els.gridEditor) return;
      const currentData = [];
      Array.from(els.gridEditor.querySelectorAll(".grid-row")).forEach(r => {
          const cells = r.querySelectorAll(".grid-cell");
          currentData.push({
              t1: cells[0] ? cells[0].textContent : "",
              t2: cells[1] ? cells[1].textContent : "",
              t3: cells[2] ? cells[2].textContent : ""
          });
      });
      lastGridData = currentData;
  }

  async function loadJyutping() {
    if (window.ToJyutping || isJyutpingLoading) return;
    isJyutpingLoading = true;
    const statusEl = document.getElementById("jyutpingStatus");
    statusEl.textContent = "⏳ Downloading Jyutping dictionary (this may take a moment)...";
    statusEl.style.color = "var(--accent)";

    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/to-jyutping@3.1.1/dist/index.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      statusEl.textContent = "✅ " + (i18nDict["jyutping_success"]?.[state.lang] || i18nDict["jyutping_success"]?.["en"] || "Dictionary loaded successfully! Chinese text will show Jyutping.");
      statusEl.style.color = "#28a745";
      isJyutpingLoading = false;

      if (els.text.value && isPlaying) {
           const currentTime = currentSegmentIndex;
           buildSegmentsAndUI(els.text.value);
           jumpToSegment(currentTime);
      }
    } catch (e) {
      statusEl.textContent = "❌ Failed to load Jyutping script.";
      statusEl.style.color = "#dc3545";
      isJyutpingLoading = false;
      els.chkJyutping.checked = false;
      saveSettings();
    }
  }

  async function loadPinyin() {
    if (window.pinyinPro || isPinyinLoading) return;
    isPinyinLoading = true;
    const statusEl = document.getElementById("pinyinStatus");
    statusEl.textContent = "⏳ Downloading Pinyin dictionary (this may take a moment)...";
    statusEl.style.color = "var(--accent)";

    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/pinyin-pro";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      statusEl.textContent = "✅ " + (i18nDict["pinyin_success"][state.lang] || i18nDict["pinyin_success"]["en"]);
      statusEl.style.color = "#28a745";
      isPinyinLoading = false;

      if (els.text.value && isPlaying) {
           const currentTime = currentSegmentIndex;
           buildSegmentsAndUI(els.text.value);
           jumpToSegment(currentTime);
      }
    } catch (e) {
      statusEl.textContent = "❌ Failed to load Pinyin script.";
      statusEl.style.color = "#dc3545";
      isPinyinLoading = false;
      els.chkPinyin.checked = false;
      saveSettings();
    }
  }

  async function loadKuromoji() {
    if (jpTokenizer || isKuromojiLoading) return;
    isKuromojiLoading = true;
    const statusEl = document.getElementById("kuromojiStatus");
    statusEl.textContent = "⏳ Downloading Japanese dictionary (this may take a moment)...";
    statusEl.style.color = "var(--accent)";

    try {
      if (!window.kuromoji) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Wrap the .build() callback in a Promise so we can await it
      await new Promise((resolve, reject) => {
        window.kuromoji.builder({ dicPath: "dict/" }).build((err, tokenizer) => {
          if (err) {
            reject(err);
            return;
          }
          jpTokenizer = tokenizer;
          resolve();
        });
      });

      // Only update UI if we successfully completed
      statusEl.textContent = "✅ " + (i18nDict["kuromoji_success"][state.lang] || i18nDict["kuromoji_success"]["en"]);
      statusEl.style.color = "#28a745";
      isKuromojiLoading = false;

      // Re-render if there's text
      if (els.text.value && isPlaying) {
        const currentTime = currentSegmentIndex;
        buildSegmentsAndUI(els.text.value);
        jumpToSegment(currentTime);
      }
    } catch (e) {
      statusEl.textContent = "❌ Failed to load dictionary. Check your internet connection.";
      statusEl.style.color = "#dc3545";
      isKuromojiLoading = false;
      els.chkKuromoji.checked = false;
      saveSettings();
    }
  }

  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ColeReaderDB", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function readSettings() {
    try {
      const db = await initDB();
      const transaction = db.transaction(["settings"], "readonly");
      const store = transaction.objectStore("settings");
      const request = store.get(SETTINGS_KEY);

      // Wrap the callback in a Promise so we can await it
      await new Promise((resolve, reject) => {
        request.onsuccess = () => {
          if (request.result) {
            state = { ...state, ...request.result };
          } else {
            // Fallback to localStorage if no DB entry exists
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
              state = { ...state, ...JSON.parse(raw) };
            }
          }
          resolve(); // Signal that we're done loading settings
        };

        request.onerror = () => {
          reject(request.error);
        };
      });

      // Now apply settings to UI after they're fully loaded
      applySettingsToUI();
    } catch (e) {
      console.error("IndexedDB read error:", e);
      // Fallback to localStorage
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        state = { ...state, ...JSON.parse(raw) };
      }
      applySettingsToUI();
    }
  }

  let _saveTimer = null;
  function saveSettings() {
      clearTimeout(_saveTimer);
      _saveTimer = setTimeout(saveSettingsImmediate, 500);
  }

  async function saveSettingsImmediate() {
    try {
      state.autoScroll = els.autoScroll.checked;

      if (state.editorMode === "vertical" && els.verticalEditor) {
          const data = [];
          Array.from(els.verticalEditor.querySelectorAll(".vertical-row")).forEach(row => {
              const voice = parseInt(row.querySelector(".vertical-voice-select").value);
              const text = row.querySelector(".vertical-cell").textContent;
              data.push({ voice, text });
          });
          state.verticalData = data;
          
          let compiledText = "";
          data.forEach(r => {
              if (r.text.trim().length > 0) {
                  if (r.voice === 1) compiledText += r.text + "\n";
                  else if (r.voice === 2) compiledText += "{" + r.text + "}\n";
                  else if (r.voice === 3) compiledText += "[" + r.text + "]\n";
              }
          });
          state.text = compiledText;
          els.text.value = state.text;
          
      } else if (els.gridEditor) {
          const data = [];
          Array.from(els.gridEditor.querySelectorAll(".grid-row")).forEach(row => {
              const cells = row.querySelectorAll(".grid-cell");
              data.push({
                  t1: cells[0].textContent,
                  t2: cells[1].textContent,
                  t3: cells[2].textContent
              });
          });
          state.gridData = data;

          state.text = data.map(r => {
             let res = "";
             if (r.t1) res += r.t1 + "\n";
             if (r.t2) res += "{" + r.t2 + "}\n";
             if (r.t3) res += "[" + r.t3 + "]\n";
             return res;
          }).join("\n");
          els.text.value = state.text;
      } else {
          state.text = els.text.value;
      }

      state.v1 = els.v1.value;
      state.v2 = els.v2.value;
      state.v3 = els.v3.value;
      state.speeds = [els.r1.value, els.r2.value, els.r3.value];
      // V9: Save both arrays
      state.showTracks = [els.show1.checked, els.show2.checked, els.show3.checked];
      state.audioTracks = [els.audio1.checked, els.audio2.checked, els.audio3.checked];
      state.shadow = document.getElementById("shadowSlider").value;
      state.useKuromoji = els.chkKuromoji.checked;
      state.usePinyin = els.chkPinyin.checked;
      state.useJyutping = els.chkJyutping.checked;
      if (els.autoSplit) state.autoSplit = els.autoSplit.checked;

      try {
        const db = await initDB();
        const transaction = db.transaction(["settings"], "readwrite");
        const store = transaction.objectStore("settings");
        store.put(state, SETTINGS_KEY);
      } catch (e) {
         console.error("IndexedDB write error:", e);
         // Fallback for smaller data if possible, though not ideal if over 5MB
         try {
             localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
         } catch(e2) {
             console.error("Storage full!", e2);
         }
      }      
      // Toggle IPA Button Visibility
      if (voices.length > 0) {
          const btn = document.getElementById("generateIpaBtn");
          if (btn) {
              const v2Voice = voices.find(v => `${v.name} (${v.lang})` === state.v2);
              const isRu2 = v2Voice && v2Voice.lang.toLowerCase().startsWith("ru");
              const isAr2 = v2Voice && v2Voice.lang.toLowerCase().startsWith("ar");
              const isEn2 = v2Voice && v2Voice.lang.toLowerCase().startsWith("en");
              
              if (isRu2 || isAr2 || isEn2) {
                  btn.style.display = "flex";
                  btn.disabled = false;
                  btn.style.opacity = "1";
                  btn.style.filter = "none";
                  btn.style.cursor = "pointer";
                  btn.title = "Generate IPA for English, Russian or Arabic text from voice 2.\nThe server might take a minute to wake up for the first generation. \n⚠️ Note: Machine-generated IPA is a guide, not a perfect transcription. Pronunciation and stress may vary";
              } else {
                  btn.style.display = "flex";
                  btn.disabled = true;
                  btn.style.opacity = "0.4";
                  btn.style.filter = "grayscale(100%)";
                  btn.style.cursor = "not-allowed";
                  btn.title = "✨ IPA Generator (Available when English, Russian, or Arabic is selected for Voice 2)";
              }
          }
      }
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }

  function updateModeUI() {
      if (state.editorMode === "vertical") {
          els.verticalWrapper.style.display = "block";
          els.gridWrapper.style.display = "none";
          els.modeVerticalBtn.style.backgroundColor = "var(--accent)";
          els.modeVerticalBtn.style.color = "var(--bg-color)";
          els.modeGridBtn.style.backgroundColor = "transparent";
          els.modeGridBtn.style.color = "var(--accent)";
      } else {
          els.verticalWrapper.style.display = "none";
          els.gridWrapper.style.display = "block";
          els.modeGridBtn.style.backgroundColor = "var(--accent)";
          els.modeGridBtn.style.color = "var(--bg-color)";
          els.modeVerticalBtn.style.backgroundColor = "transparent";
          els.modeVerticalBtn.style.color = "var(--accent)";
      }
  }

  function applySettingsToUI() {
    els.text.value = state.text || "";
    initGridFromState();
    initVerticalFromState();
    updateModeUI();

    // Voices restore INDEPENDENTLY
    els.v1.value = state.v1 || "";
    els.v2.value = state.v2 || "";
    els.v3.value = state.v3 || "";

    // Speeds restore INDEPENDENTLY
    if (state.speeds && state.speeds.length === 3) {
      els.r1.value = state.speeds[0]; els.rv1.textContent = state.speeds[0] + "x";
      els.r2.value = state.speeds[1]; els.rv2.textContent = state.speeds[1] + "x";
      els.r3.value = state.speeds[2]; els.rv3.textContent = state.speeds[2] + "x";
    }

    if (state.showTracks) {
        els.show1.checked = state.showTracks[0]; els.show2.checked = state.showTracks[1]; els.show3.checked = state.showTracks[2];
    }
    if (state.audioTracks) {
        els.audio1.checked = state.audioTracks[0]; els.audio2.checked = state.audioTracks[1]; els.audio3.checked = state.audioTracks[2];
    }

    if (state.shadow) {
        document.getElementById("shadowSlider").value = state.shadow;
        document.getElementById("shadowVal").textContent = state.shadow + "s";
    }

    if (state.lang) {
        document.getElementById("langSelect").value = state.lang;
    }

    document.documentElement.setAttribute("data-theme", state.theme || "light");
    renderVocab();
    if (state.autoScroll !== undefined) els.autoScroll.checked = state.autoScroll;
    if (state.autoSplit !== undefined && els.autoSplit) els.autoSplit.checked = state.autoSplit;
    if (state.useKuromoji !== undefined) els.chkKuromoji.checked = state.useKuromoji;
    if (state.usePinyin !== undefined) els.chkPinyin.checked = state.usePinyin;
    if (state.useJyutping !== undefined) els.chkJyutping.checked = state.useJyutping;

    if (els.chkKuromoji.checked) {
        loadKuromoji();
    }
    if (els.chkPinyin.checked) {
        loadPinyin();
    }
    if (els.chkJyutping.checked) {
        loadJyutping();
    }
  }

  function createGridRow(t1="", t2="", t3="") {
    const row = document.createElement("div");
    row.className = "grid-row";

    const createCell = (text, colIndex) => {
        const wrapper = document.createElement("div");
        wrapper.className = "cell-wrapper";

        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.contentEditable = "true";
        cell.textContent = text;
        
        const isFirstRow = els.gridEditor.children.length === 0;
        const currentLang = document.documentElement.lang || "en";
        if (colIndex === 0) {
            const firstHolder = i18nDict["v1_placeholder_first"][currentLang] || i18nDict["v1_placeholder_first"]["en"];
            const regHolder = i18nDict["v1_placeholder"][currentLang] || i18nDict["v1_placeholder"]["en"];
            cell.dataset.placeholder = isFirstRow ? firstHolder : regHolder;
        }
        if (colIndex === 1) cell.dataset.placeholder = i18nDict["v2_placeholder"][currentLang] || i18nDict["v2_placeholder"]["en"];
        if (colIndex === 2) cell.dataset.placeholder = i18nDict["v3_placeholder"][currentLang] || i18nDict["v3_placeholder"]["en"];
        
        const shiftActions = document.createElement("div");
        shiftActions.className = "cell-shift-actions";
        shiftActions.contentEditable = "false";
        
        const shiftUp = document.createElement("button");
        shiftUp.className = "cell-shift-btn";
        shiftUp.innerHTML = "❌";
        shiftUp.title = "Delete this cell and shift below up";
        shiftUp.onclick = (e) => {
             e.stopPropagation();
             captureGridSnapshot();
             let currentRow = row;
             while (currentRow) {
                 let nextRow = currentRow.nextElementSibling;
                 if (nextRow && nextRow.classList.contains("grid-row")) {
                     currentRow.children[colIndex].querySelector('.grid-cell').textContent = nextRow.children[colIndex].querySelector('.grid-cell').textContent;
                 } else {
                     currentRow.children[colIndex].querySelector('.grid-cell').textContent = "";
                 }
                 currentRow = nextRow;
             }
             saveSettings();
        };

        const shiftDown = document.createElement("button");
        shiftDown.className = "cell-shift-btn";
        shiftDown.innerHTML = "⬇️";
        shiftDown.title = "Insert blank cell and shift below down";
        shiftDown.onclick = (e) => {
             e.stopPropagation();
             captureGridSnapshot();
             let textsToShift = [];
             let currentRow = row;
             while (currentRow && currentRow.classList.contains("grid-row")) {
                 textsToShift.push(currentRow.children[colIndex].querySelector('.grid-cell').textContent);
                 currentRow = currentRow.nextElementSibling;
             }
             
             currentRow = row.nextElementSibling;
             let textIndex = 0;
             row.children[colIndex].querySelector('.grid-cell').textContent = ""; 
             
             while (textIndex < textsToShift.length) {
                 if (!currentRow || !currentRow.classList.contains("grid-row")) {
                     currentRow = createGridRow();
                     els.gridEditor.appendChild(currentRow);
                 }
                 currentRow.children[colIndex].querySelector('.grid-cell').textContent = textsToShift[textIndex];
                 currentRow = currentRow.nextElementSibling;
                 textIndex++;
             }
             saveSettings();
        };
        
        shiftActions.appendChild(shiftUp);
        shiftActions.appendChild(shiftDown);
        
        wrapper.appendChild(cell);
        wrapper.appendChild(shiftActions);

        cell.addEventListener("paste", (e) => {
            e.preventDefault();
            captureGridSnapshot();
            let pastedText = (e.clipboardData || window.clipboardData).getData('text');

            const autoSplit = document.getElementById("autoSplitPasteChk")?.checked ?? true;
            let chunks = [];

            if (autoSplit) {
                chunks = autoChunkText(pastedText);
            } else {
                // Manual Line-by-Line mode: Just split by hard enters
                chunks = pastedText.split(/\r?\n/).filter(line => line.trim().length > 0);
            }

            if (chunks.length <= 1) {
                document.execCommand("insertText", false, pastedText);
            } else {
                document.execCommand("insertText", false, chunks[0]);
                let currentRow = row;
                for (let i = 1; i < chunks.length; i++) {
                    let nextRow = currentRow.nextElementSibling;
                    if (!nextRow || !nextRow.classList.contains("grid-row")) {
                        nextRow = createGridRow();
                        currentRow.after(nextRow);
                    }
                    const nextCell = nextRow.children[colIndex].querySelector('.grid-cell');
                    const existingText = nextCell.textContent;
                    nextCell.textContent = existingText ? existingText + (autoSplit ? " " : "\n") + chunks[i] : chunks[i];
                    currentRow = nextRow;
                }
            }
            saveSettings();
        });

        cell.addEventListener("input", () => {
            saveSettings();
        });
        
        return wrapper;
    };

    const c1 = createCell(t1, 0);
    const c2 = createCell(t2, 1);
    const c3 = createCell(t3, 2);

    const actions = document.createElement("div");
    actions.className = "grid-actions";

    const insBtn = document.createElement("button");
    insBtn.className = "grid-action-btn grid-insert-btn";
    insBtn.innerHTML = "➕";
    insBtn.title = "Insert row below";
    insBtn.onclick = () => { 
        captureGridSnapshot();
        const newRow = createGridRow();
        row.after(newRow);
        saveSettings();
        newRow.children[0].querySelector('.grid-cell').focus(); 
    };

    const delBtn = document.createElement("button");
    delBtn.className = "grid-action-btn grid-delete-btn";
    delBtn.innerHTML = "×";
    delBtn.title = "Delete row";
    delBtn.onclick = () => { captureGridSnapshot(); row.remove(); saveSettings(); if(els.gridEditor.children.length===0) els.gridEditor.appendChild(createGridRow()); };

    actions.appendChild(delBtn);
    actions.appendChild(insBtn);

    row.appendChild(c1); row.appendChild(c2); row.appendChild(c3); row.appendChild(actions);
    return row;
  }

  function initGridFromState() {
      if(!els.gridEditor) return;
      els.gridEditor.innerHTML = "";
      if (state.gridData && state.gridData.length > 0) {
          state.gridData.forEach(r => els.gridEditor.appendChild(createGridRow(r.t1, r.t2, r.t3)));
      } else {
          els.gridEditor.appendChild(createGridRow());
      }
  }

  function getVerticalLabels() {
      const labels = { 1: "V1", 2: "V2", 3: "V3" };
      if (state.verticalSpeakerMap) {
          for (const [name, voice] of Object.entries(state.verticalSpeakerMap)) {
              if (labels[voice] === `V${voice}`) labels[voice] = `V${voice}: ${name}`;
              else labels[voice] += `, ${name}`;
          }
      }
      return labels;
  }

  function updateVerticalDropdownLabels() {
      if(!els.verticalEditor) return;
      const labels = getVerticalLabels();
      els.verticalEditor.querySelectorAll('.vertical-voice-select').forEach(select => {
          if (select.options.length >= 3) {
              select.options[0].textContent = labels[1];
              select.options[1].textContent = labels[2];
              select.options[2].textContent = labels[3];
          }
      });
  }

  function createVerticalRow(voice = 1, text = "") {
      const row = document.createElement("div");
      row.className = "vertical-row";

      const labels = getVerticalLabels();
      const voiceSelect = document.createElement("select");
      voiceSelect.className = "vertical-voice-select";
      const v1Opt = document.createElement("option"); v1Opt.value = "1"; v1Opt.textContent = labels[1];
      const v2Opt = document.createElement("option"); v2Opt.value = "2"; v2Opt.textContent = labels[2];
      const v3Opt = document.createElement("option"); v3Opt.value = "3"; v3Opt.textContent = labels[3];
      voiceSelect.appendChild(v1Opt);
      voiceSelect.appendChild(v2Opt);
      voiceSelect.appendChild(v3Opt);
      voiceSelect.value = voice.toString();
      voiceSelect.onchange = () => saveSettings();

      const cell = document.createElement("div");
      cell.className = "vertical-cell";
      cell.textContent = text;
      cell.dataset.placeholder = "Paste the ENTIRE text here. The app parses it automatically";

      if (activePaintbrushVoice !== null) {
          const cursorStyle = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23b05a2f\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 2l4 4L7 21H3v-4L18 2z\"></path><path d=\"M14 6l4 4\"></path></svg>') 0 24, crosshair";
          cell.contentEditable = "false";
          cell.style.cursor = cursorStyle;
          row.style.cursor = cursorStyle;
      } else {
          cell.contentEditable = "true";
          cell.style.cursor = "text";
      }

      cell.addEventListener("input", saveSettings);      cell.addEventListener("paste", (e) => {
          e.preventDefault();
          let pastedText = (e.clipboardData || window.clipboardData).getData('text');
          const lines = pastedText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
          
          if (lines.length > 0) {
              const patternVal = document.getElementById("verticalPatternSelect").value;
              const pattern = patternVal.split("").map(Number);
              
              if (!state.verticalSpeakerMap) state.verticalSpeakerMap = {};
              
              let currentRow = row;
              let firstLine = true;
              
              const autoDetectEl = document.getElementById("verticalAutoDetectChk");
              const autoDetect = autoDetectEl ? autoDetectEl.checked : true;

              for (let i = 0; i < lines.length; i++) {
                  let lineText = lines[i];
                  let assignedVoice = pattern[i % pattern.length];

                  if (autoDetect) {
                      const speakerMatch = lineText.match(/^([^:]{1,30}):\s*(.*)$/);
                      if (speakerMatch) {
                          const name = speakerMatch[1].trim();
                          lineText = speakerMatch[2].trim();

                          if (!state.verticalSpeakerMap[name]) {
                              const currentCount = Object.keys(state.verticalSpeakerMap).length;
                              state.verticalSpeakerMap[name] = (currentCount % 3) + 1;
                          }
                          assignedVoice = state.verticalSpeakerMap[name];
                      }
                  }

                  if (firstLine) {
                      cell.textContent = lineText;
                      voiceSelect.value = assignedVoice.toString();
                      firstLine = false;
                  } else {
                      const newRow = createVerticalRow(assignedVoice, lineText);
                      currentRow.after(newRow);
                      currentRow = newRow;
                  }
              }
              updateVerticalDropdownLabels();
              saveSettings();
          }
      });

      const actions = document.createElement("div");
      actions.className = "grid-actions";
      
      const insBtn = document.createElement("button");
      insBtn.innerHTML = "➕";
      insBtn.className = "grid-action-btn grid-insert-btn";
      insBtn.title = "Insert row below";
      insBtn.onclick = () => {
          let nextVoice = (parseInt(voiceSelect.value) % 3) + 1;
          const newRow = createVerticalRow(nextVoice, "");
          row.after(newRow);
          newRow.querySelector('.vertical-cell').focus();
          saveSettings();
      };
      
      const delBtn = document.createElement("button");
      delBtn.innerHTML = "🗑️";
      delBtn.className = "grid-action-btn grid-delete-btn";
      delBtn.title = "Delete row";
      delBtn.onclick = () => { row.remove(); saveSettings(); if(els.verticalEditor.children.length===0) els.verticalEditor.appendChild(createVerticalRow()); };

      actions.appendChild(delBtn);
      actions.appendChild(insBtn);

      row.appendChild(voiceSelect);
      row.appendChild(cell);
      row.appendChild(actions);

      row.addEventListener("mousedown", (e) => {
          if (activePaintbrushVoice !== null) {
              e.preventDefault(); // Prevent text focus if just painting
              // Don't paint if they clicked the voice select itself or action buttons
              if (e.target.tagName !== 'SELECT' && !e.target.closest('.grid-action-btn')) {
                  if (voiceSelect.value !== activePaintbrushVoice) {
                      voiceSelect.value = activePaintbrushVoice;
                      saveSettings();
                  }
              }
          }
      });

      return row;  }

  function initVerticalFromState() {
      if(!els.verticalEditor) return;
      els.verticalEditor.innerHTML = "";
      if (state.verticalData && state.verticalData.length > 0) {
          state.verticalData.forEach(r => els.verticalEditor.appendChild(createVerticalRow(r.voice, r.text)));
      } else {
          els.verticalEditor.appendChild(createVerticalRow());
      }
  }

  let lastVerticalSpeakerMap = null;

  window.clearVerticalEditor = () => {
      lastVerticalData = JSON.parse(JSON.stringify(state.verticalData || []));
      lastVerticalSpeakerMap = JSON.parse(JSON.stringify(state.verticalSpeakerMap || {}));
      state.verticalData = [];
      state.verticalSpeakerMap = {};
      initVerticalFromState();
      saveSettingsImmediate();
      document.getElementById("undoVerticalClearBtn").style.display = "inline-flex";
      setTimeout(() => {
          document.getElementById("undoVerticalClearBtn").style.display = "none";
      }, 5000);
  };
  
  window.undoVerticalClear = () => {
      if (!lastVerticalData) return;
      state.verticalData = JSON.parse(JSON.stringify(lastVerticalData));
      if (lastVerticalSpeakerMap) state.verticalSpeakerMap = JSON.parse(JSON.stringify(lastVerticalSpeakerMap));
      initVerticalFromState();
      saveSettingsImmediate();
      document.getElementById("undoVerticalClearBtn").style.display = "none";
  };

  function toggleTheme() {
    state.theme = (state.theme === "dark") ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    saveSettings();
  }

  function setupCombo(input, list, arrow) {
      input.removeAttribute('list'); // Remove native datalist attribute
      if (arrow) arrow.style.display = ''; // Show the custom arrow again

      // Helper to render list
      const render = (filterText = "") => {
          list.innerHTML = "";
          const lower = filterText.toLowerCase();
          const matches = voices.filter(v =>
              `${v.name} (${v.lang})`.toLowerCase().includes(lower)
          );

          if (matches.length === 0) {
              const div = document.createElement("div"); div.className="combo-option";
              div.textContent = "No matches"; list.appendChild(div);
              return;
          }

          matches.forEach(v => {
              const div = document.createElement("div");
              div.className = "combo-option";
              div.textContent = `${v.name} (${v.lang})`;
              // FIXED FOR MOBILE: Use pointerdown instead of mousedown, and e.preventDefault()
              div.onpointerdown = (e) => {
                  e.preventDefault(); // Prevents input blur, allowing touch to register
                  input.value = div.textContent;
                  list.classList.remove("show");
                  saveSettings(); // Save immediately
              };
              list.appendChild(div);
          });
      };

      // 1. INPUT: Type to filter
      input.addEventListener("input", () => {
          render(input.value);
          list.classList.add("show");
      });

      // 2. FOCUS: Show full list if empty, or filtered list if text exists
      input.addEventListener("focus", () => {
          render(input.value);
          list.classList.add("show");
      });

      // 3. ARROW CLICK: Toggle Full list
      // FIXED FOR MOBILE: Use pointerdown
      arrow.addEventListener("pointerdown", (e) => {
          e.preventDefault(); // prevent losing focus
          if (list.classList.contains("show")) {
              list.classList.remove("show");
          } else {
              // Show ALL voices (pass empty string), ignore current text
              render("");
              list.classList.add("show");
              input.focus(); // Put focus in the input box so blur event works later
          }
      });

      // 4. BLUR: Hide list when clicking outside
      input.addEventListener("blur", () => {
          // No timeout needed anymore thanks to pointerdown + preventDefault!
          list.classList.remove("show");
      });
  }

  function populateVoices() {
    voices = synth.getVoices().slice().sort((a,b) => a.name.localeCompare(b.name));
    if (!voices.length) return;

    // Only attach event listeners ONCE
    if (!combosInitialized) {
      setupCombo(document.getElementById("voice1"), document.getElementById("list1"), document.querySelector("#wrap1 .combo-arrow"));
      setupCombo(document.getElementById("voice2"), document.getElementById("list2"), document.querySelector("#wrap2 .combo-arrow"));
      setupCombo(document.getElementById("voice3"), document.getElementById("list3"), document.querySelector("#wrap3 .combo-arrow"));
      combosInitialized = true;
    }
  }

  function forcePause() { synth.pause(); setTimeout(() => synth.pause(), 30); }
  function forceResume() { synth.resume(); setTimeout(() => synth.resume(), 30); }
  function updatePauseUI() {
    if (isPaused) { els.pause.textContent = "⏯ Resume"; els.pause.className = "action-btn resume"; }
    else { els.pause.textContent = "⏸ Pause"; els.pause.className = "action-btn pause"; }
  }
  function setLoopUI() { els.loop.classList.toggle("loop-active", isLooping); }

  function normalizeWord(w) { return (w || "").trim().replace(/^[\s“”"‘’'(){}\[\]<>¿¡.,!?;:。！？]+/, "").replace(/[\s“”"‘’'(){}\[\]<>¿¡.,!?;:。！？]+$/, ""); }
  function addToVocab(wordRaw, sourceTrackIdx = null) {
    const w = normalizeWord(wordRaw); if (!w) return;
    state.vocab.push((wordRaw.trim().indexOf(" ") > 0) ? wordRaw.trim() : w);
    
    // Auto-detect deck language based on the track it came from
    if (sourceTrackIdx !== null) {
        const trackInput = [els.v1, els.v2, els.v3][sourceTrackIdx];
        const targetName = trackInput ? trackInput.value : "";
        let voice = voices.find(v => `${v.name} (${v.lang})` === targetName);
        
        if (voice && voice.lang) {
            const langCode = voice.lang.toLowerCase();
            let deckToSelect = "";
            
            if (langCode.startsWith("ja")) deckToSelect = "Japanese";
            else if (langCode.startsWith("zh") || langCode.startsWith("yue")) {
                if (langCode.includes("yue") || langCode.includes("hk") || langCode.includes("mo") || langCode.includes("macau")) {
                    deckToSelect = "Cantonese";
                } else {
                    deckToSelect = "Mandarin";
                }
            }
            else if (langCode.startsWith("es")) deckToSelect = "Spanish";
            else if (langCode.startsWith("fr")) deckToSelect = "French";
            else if (langCode.startsWith("de")) deckToSelect = "German";
            else if (langCode.startsWith("ko")) deckToSelect = "Korean";
            else if (langCode.startsWith("it")) deckToSelect = "Italian";
            else if (langCode.startsWith("en")) deckToSelect = "English";
            
            if (deckToSelect) {
                const deckSelect = document.getElementById("deckSelect");
                if (deckSelect && deckSelect.value !== deckToSelect) {
                    deckSelect.value = deckToSelect;
                }
            }
        }
    }
    
    saveSettings(); renderVocab();
  }
  function removeFromVocab(index) { state.vocab.splice(index, 1); saveSettings(); renderVocab(); }
  let lastVocabBackup = [];
  function clearVocab() {
    if (!state.vocab.length) return; lastVocabBackup = [...state.vocab]; state.vocab = []; saveSettings(); renderVocab();
  }
  window.restoreVocab = () => { if (!lastVocabBackup.length) return; state.vocab = [...lastVocabBackup]; saveSettings(); renderVocab(); };
  async function copyVocabList() { try { await navigator.clipboard.writeText(state.vocab.join("\n")); showToast("📋 Copied all words!"); } catch(e) { showToast("❌ Copy failed — try again"); } }

  async function exportVocabCsv() {
    if (!state.vocab.length) { alert("Notebook is empty."); return; }
    const mode = parseInt(document.getElementById("csvMode").value) || 2;
    let headers = (mode===2)?["Front","Back"]:(mode===3)?["Col1","Col2","Col3"]:["Col1","Col2","Col3","Col4"];
    let csvContent = headers.join(",") + "\n";
    for (let i = 0; i < state.vocab.length; i += mode) {
        let row = [];
        for (let k = 0; k < mode; k++) {
            let val = state.vocab[i + k] || "";
            if (val === "   ") val = "";
            row.push(`"${val.replace(/"/g, '""')}"`);
        }
        csvContent += row.join(",") + "\n";
    }
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv; charset=utf-8;' });
    const suggestedName = `cole_anki_export_${mode}col.csv`;
    
    try {
        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName,
                id: 'cole_export_csv',
                types: [{ description: 'CSV File', accept: {'text/csv': ['.csv']} }]
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        }
    } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
        return;
    }

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = suggestedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Free up memory by revoking the object URL
    URL.revokeObjectURL(url);
  }

  window.updateDeckAliases = function() {
      const deckSelect = document.getElementById("deckSelect");
      if (!deckSelect) return;
      Array.from(deckSelect.options).forEach(opt => {
          const alias = localStorage.getItem(`cole_deck_alias_${opt.value}`);
          const baseText = opt.getAttribute("data-base-text") || opt.textContent;
          if (!opt.hasAttribute("data-base-text")) opt.setAttribute("data-base-text", baseText);
          opt.textContent = alias ? `${baseText} (${alias})` : baseText;
      });
  };
  // Initialize aliases shortly after script load
  setTimeout(window.updateDeckAliases, 500);

  window.sendToIndexedDBDeck = function() {
    if (!state.vocab.length) { alert("Notebook is empty."); return; }
    const deckName = document.getElementById("deckSelect").value;
    const mode = 2; // Fixed to 2 columns for built-in flashcards
    
    const request = indexedDB.open("coleFlashcardsDB", 1);
    
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("cards")) {
            const store = db.createObjectStore("cards", { keyPath: "id", autoIncrement: true });
            store.createIndex("deck", "deck", { unique: false });
        }
    };
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(["cards"], "readwrite");
        const store = transaction.objectStore("cards");
        
        let count = 0;
        for (let i = 0; i < state.vocab.length; i += mode) {
            const card = {
                deck: deckName,
                col1: state.vocab[i] || "",
                col2: mode >= 2 ? (state.vocab[i+1] || "") : "",
                col3: mode >= 3 ? (state.vocab[i+2] || "") : "",
                col4: mode >= 4 ? (state.vocab[i+3] || "") : "",
                queuePos: 0, // 0 = new
                isNew: true,
                createdAt: Date.now()
            };
            store.add(card);
            count++;
        }
        
        transaction.oncomplete = function() {
            showToast(`Sent ${count} cards to ${deckName}!`);
            clearVocab();
        };
        transaction.onerror = function() {
            alert("Error saving to flashcards database.");
        };
    };
    
    request.onerror = function(event) {
        alert("IndexedDB error: " + event.target.error);
    };
  };

  let dragSrcIndex = null;

  // Event delegation: attach listeners ONCE to the parent container
  // instead of attaching 7 listeners to every single vocab word.
  function getVocabItem(e) {
    return e.target.closest(".vocab-item");
  }

  els.vocab.addEventListener("click", (e) => {
    const item = getVocabItem(e);
    if (!item) return;
    const index = Number(item.dataset.index);
    const word = state.vocab[index];
    if (word === undefined) return;

    if (e.ctrlKey) {
      const u = new SpeechSynthesisUtterance(word);
      const v = voices[parseInt(els.v1.value)];
      if (v) { u.voice = v; u.lang = v.lang; }
      synth.speak(u);
    } else {
      navigator.clipboard.writeText(word);
      showToast("Copied to clipboard");
    }
  });

  els.vocab.addEventListener("contextmenu", (e) => {
    const item = getVocabItem(e);
    if (!item) return;
    e.preventDefault();
    removeFromVocab(Number(item.dataset.index));
  });

  els.vocab.addEventListener("dragstart", (e) => {
    const item = getVocabItem(e);
    if (!item) return;
    item.classList.add('dragging');
    dragSrcIndex = Number(item.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
  });

  els.vocab.addEventListener("dragover", (e) => {
    const item = getVocabItem(e);
    if (!item) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = item.getBoundingClientRect();
    if (e.clientX > rect.left + rect.width / 2) {
      item.classList.remove('drag-over-left'); item.classList.add('drag-over-right');
    } else {
      item.classList.remove('drag-over-right'); item.classList.add('drag-over-left');
    }
  });

  els.vocab.addEventListener("dragleave", (e) => {
    const item = getVocabItem(e);
    if (!item) return;
    item.classList.remove('drag-over-left', 'drag-over-right');
  });

  els.vocab.addEventListener("drop", (e) => {
    const item = getVocabItem(e);
    if (!item) return;
    e.stopPropagation();
    item.classList.remove('drag-over-left', 'drag-over-right');
    let dropTargetIndex = Number(item.dataset.index);
    if (dragSrcIndex !== null && dragSrcIndex !== dropTargetIndex) {
      const rect = item.getBoundingClientRect();
      const insertAfter = e.clientX > rect.left + rect.width / 2;
      const itemToMove = state.vocab[dragSrcIndex];

      state.vocab.splice(dragSrcIndex, 1);

      if (dragSrcIndex < dropTargetIndex) dropTargetIndex--;
      if (insertAfter) dropTargetIndex++;

      state.vocab.splice(dropTargetIndex, 0, itemToMove);
      saveSettings(); renderVocab();
    }
  });

  els.vocab.addEventListener("dragend", (e) => {
    const item = getVocabItem(e);
    if (!item) return;
    item.classList.remove('dragging');
    els.vocab.querySelectorAll('.vocab-item').forEach(i => i.classList.remove('drag-over-left', 'drag-over-right'));
  });

  function renderVocab() {
    els.vocab.replaceChildren();
    const mode = document.getElementById("csvMode").value || "2"; els.vocab.className = `group-${mode}`;
    if (!state.vocab.length) {
        els.vocab.innerHTML = '<span class="empty-msg" data-i18n="empty_words">(Words you click or ➕ will appear here)</span>';
        applyTranslation(state.lang || "en");
        return;
    }

    state.vocab.forEach((word, index) => {
      const item = document.createElement("div"); item.className = "vocab-item";
      item.title = word;
      item.draggable = true;
      item.dataset.index = index;

      const numSpan = document.createElement("span");
      numSpan.className = "vocab-idx";
      numSpan.textContent = (index + 1) + ".";
      item.appendChild(numSpan);

      const textSpan = document.createElement("span");
      textSpan.className = "vocab-text";
      textSpan.textContent = word;
      item.appendChild(textSpan);

      els.vocab.appendChild(item);
    });
  }


  // Drag to Select Phrases
  let justDragged = false;
  els.display.addEventListener("mouseup", (e) => {
    // Process left-clicks for speaking phrase, and right-clicks for saving phrase
    if (e.button !== 0 && e.button !== 2) return;

    const sel = window.getSelection();
    if (sel.isCollapsed) return;

    // Extract text without <rt> furigana tags
    const containerDiv = document.createElement("div");
    for (let i = 0; i < sel.rangeCount; i++) {
        containerDiv.appendChild(sel.getRangeAt(i).cloneContents());
    }
    containerDiv.querySelectorAll("rt").forEach(rt => rt.remove());
    let selectedText = containerDiv.textContent.trim();

    if (selectedText.length > 0) {
      justDragged = true;
      // Clean up UI symbols if accidentally dragged over, and normalize spacing
      selectedText = selectedText.replace(/▶/g, '').replace(/➕/g, '').replace(/✔️/g, '').replace(/\s+/g, ' ').trim();

      if (selectedText) {
        let targetNode = sel.anchorNode;
        if (targetNode && targetNode.nodeType === 3) targetNode = targetNode.parentNode;
        const container = targetNode ? targetNode.closest(".sentence-container") : null;
        const trackIdx = container ? parseInt(container.dataset.track || "0") : 0;

        if (e.button === 0) {
          // LEFT CLICK & DRAG = Speak Phrase
          synth.cancel();
          isPaused = true; updatePauseUI();

          const trackInput = [els.v1, els.v2, els.v3][trackIdx];
          const targetName = trackInput ? trackInput.value : "";
          let voice = voices.find(v => `${v.name} (${v.lang})` === targetName);
          const spd = parseFloat([els.r1, els.r2, els.r3][trackIdx].value);

          const u = new SpeechSynthesisUtterance(selectedText);
          if (voice) { u.voice = voice; u.lang = voice.lang; }
          u.rate = spd;
          synth.speak(u);
          sel.removeAllRanges(); // Clear selection after speaking
        } else if (e.button === 2) {
          // RIGHT CLICK ON SELECTION = Save Phrase
          if (!e.ctrlKey) {
            addToVocab(selectedText, trackIdx);
            if (container) {
                const clone = container.cloneNode(true);
                clone.querySelectorAll("rt, .play-cue").forEach(el => el.remove());
                let sentenceText = clone.textContent.replace(/▶/g, '').replace(/➕/g, '').replace(/✔️/g, '').replace(/\s+/g, ' ').trim();
                addToVocab(sentenceText, trackIdx);
            }
            showToast(`Saved with context: ${selectedText}`);
          }
        }
      }
      setTimeout(() => { justDragged = false; }, 100);
    }
  });

  // Left Click to Speak Word
  els.display.addEventListener("click", (e) => {
    if (justDragged) return; // Prevent single click action if finishing a drag

    const wordNode = e.target.closest(".word");
    if (wordNode && e.button === 0) {
      // Extract text without <rt> furigana/pinyin tags
      const clone = wordNode.cloneNode(true);
      clone.querySelectorAll("rt").forEach(rt => rt.remove());
      const text = clone.textContent;

      // Ignore the UI buttons inside the text
      if (text.trim() === "➕" || text.trim() === "✔️" || text.trim() === "▶") return;

      // 🎤 LEFT CLICK = SPEAK WORD
      e.preventDefault();

      // 1. Stop the main player
      synth.cancel();
      isPaused = true; updatePauseUI(); // Set to paused state so you can resume later

      // 2. Identify the language track (0=Normal, 1=Curly, 2=Square)
      const container = wordNode.closest(".sentence-container");
      const trackIdx = parseInt(container.dataset.track || "0");

      // 3. Get proper voice & speed setting for that track
      const trackInput = [els.v1, els.v2, els.v3][trackIdx];
      const targetName = trackInput ? trackInput.value : "";
      let voice = voices.find(v => `${v.name} (${v.lang})` === targetName);

      const spd = parseFloat([els.r1, els.r2, els.r3][trackIdx].value);

      // 4. Visual feedback (yellow flash)
      wordNode.classList.add("active-word");
      setTimeout(()=>wordNode.classList.remove("active-word"), 1000);

      // 5. Speak perfectly
      const u = new SpeechSynthesisUtterance(text);
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      u.rate = spd; // Matches your slider speed
      synth.speak(u);

      // --- AI Context Trigger ---
      const aiToggle = document.getElementById(`aiToggle${trackIdx}`);
      if (aiToggle && aiToggle.checked && typeof triggerAiModal === "function") {
          triggerAiModal(text, wordNode, trackIdx, container);
      }
    }
  });

  // Right Click to Save Word
  els.display.addEventListener("contextmenu", (e) => {
    // If the user is holding Ctrl, they want the native browser menu (e.g. for dictionary extension)
    if (e.ctrlKey) {
        return; 
    }

    // Otherwise, we suppress the native menu because Right-Click is meant for saving!
    e.preventDefault();

    // If there is a text selection, we already handled saving it in mouseup!
    const sel = window.getSelection();
    if (!sel.isCollapsed && sel.toString().trim().length > 0) {
        return; 
    }

    const wordNode = e.target.closest(".word");
    if (wordNode) {
      const clone = wordNode.cloneNode(true);
      clone.querySelectorAll("rt").forEach(rt => rt.remove());
      const text = clone.textContent;

      if (text.trim() === "➕" || text.trim() === "✔️" || text.trim() === "▶") return;

      // 💾 RIGHT CLICK = SAVE TO NOTEBOOK
      wordNode.classList.add("saved-flash");
      setTimeout(() => wordNode.classList.remove("saved-flash"), 250);
      const container = wordNode.closest(".sentence-container");
      const trackIdx = container ? parseInt(container.dataset.track || "0") : 0;
      addToVocab(text, trackIdx);
      if (container) {
          const clone = container.cloneNode(true);
          clone.querySelectorAll("rt, .play-cue").forEach(el => el.remove());
          let sentenceText = clone.textContent.replace(/▶/g, '').replace(/➕/g, '').replace(/✔️/g, '').replace(/\s+/g, ' ').trim();
          addToVocab(sentenceText, trackIdx);
      }
      showToast(`Saved with context: ${text}`);
    }
  });


const _segmenterCache = new Map();

function getWordSegmenter(localeHint) {
  let locale = (localeHint || "en").toLowerCase().replace(/_/g, '-');
  if (!("Segmenter" in Intl)) return null;
  if (_segmenterCache.has(locale)) return _segmenterCache.get(locale);
  
  let seg = null;
  try {
    seg = new Intl.Segmenter(locale, { granularity: "word" });
  } catch (e) {
    console.warn("Intl.Segmenter error with locale:", locale, e);
    try {
      seg = new Intl.Segmenter("en", { granularity: "word" });
    } catch (e2) {
      return null;
    }
  }
  
  _segmenterCache.set(locale, seg);
  return seg;
}

function looksLikeNoSpaceLanguage(text) {
  // Heuristic: contains CJK and has no spaces
  return !/\s/.test(text) && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
}

function buildWordSpans(text, localeHint = "en") {
  const container = document.createElement("span");
  container.className = "sentence-container";

  const spans = [];
  let charIndex = 0;

  // Kuromoji Path for Japanese
  if (localeHint.toLowerCase().startsWith("ja") && jpTokenizer) {
      const tokens = jpTokenizer.tokenize(text);
      let currentTokens = [];
      let currentStart = 0;

      function katakanaToHiragana(kata) {
          return kata.replace(/[\u30a1-\u30f6]/g, function(match) {
              return String.fromCharCode(match.charCodeAt(0) - 0x60);
          });
      }

      function buildRubyElement(tokensChunk) {
          const span = document.createElement("span");

          let hasKanji = false;
          let combinedSurface = "";
          let combinedReading = "";

          for (const t of tokensChunk) {
              combinedSurface += t.surface_form;
              if (t.reading && t.reading !== "*") {
                  combinedReading += katakanaToHiragana(t.reading);
              } else {
                  combinedReading += t.surface_form;
              }
              if (/[\u4e00-\u9faf]/.test(t.surface_form)) {
                  hasKanji = true;
              }
          }

          if (hasKanji && combinedReading.length > 0 && combinedSurface !== combinedReading) {
              // Very simple okurigana stripping:
              // Find the longest common hiragana suffix between surface and reading
              let suffixLength = 0;
              while (suffixLength < combinedSurface.length && suffixLength < combinedReading.length) {
                  const sChar = combinedSurface[combinedSurface.length - 1 - suffixLength];
                  const rChar = combinedReading[combinedReading.length - 1 - suffixLength];
                  if (sChar === rChar && /[\u3040-\u309f]/.test(sChar)) {
                      suffixLength++;
                  } else {
                      break;
                  }
              }

              if (suffixLength > 0) {
                  const rubySurface = combinedSurface.slice(0, -suffixLength);
                  const rubyReading = combinedReading.slice(0, -suffixLength);
                  const okurigana = combinedSurface.slice(-suffixLength);

                  const ruby = document.createElement("ruby");
                  ruby.textContent = rubySurface;
                  const rt = document.createElement("rt");
                  rt.textContent = rubyReading;
                  ruby.appendChild(rt);

                  span.appendChild(ruby);
                  span.appendChild(document.createTextNode(okurigana));
              } else {
                  const ruby = document.createElement("ruby");
                  ruby.textContent = combinedSurface;
                  const rt = document.createElement("rt");
                  rt.textContent = combinedReading;
                  ruby.appendChild(rt);
                  span.appendChild(ruby);
              }
          } else {
              span.textContent = combinedSurface;
          }
          return { span, text: combinedSurface };
      }

      function commitCurrentSpan() {
          if (currentTokens.length === 0) return;
          const { span, text: currentSpanText } = buildRubyElement(currentTokens);
          const end = currentStart + currentSpanText.length;

          if (currentSpanText.trim().length > 0 && !/^[\s“”"‘’'(){}\[\]<>¿¡.,!?;:。！？]+$/.test(currentSpanText)) {
              span.className = "word";
              span.dataset.start = String(currentStart);
              span.dataset.end = String(end);
              spans.push({ node: span, start: currentStart, end });
          }
          container.appendChild(span);
          currentTokens = [];
      }

      for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const s = token.surface_form;
          const pos = token.pos;
          const posDetail = token.pos_detail_1;

          const currentSurfaceText = currentTokens.map(t => t.surface_form).join('');

          // The "Smart Glue" Logic:
          // 1. 助動詞 (Auxiliary verbs: た, です, ます, ない, られる)
          // 2. 動詞 -> 非自立 (Non-independent verbs: つけ, いる, みる)
          // 3. 助詞 -> 接続助詞 (Conjunctive particles: て, で, ば)
          // 4. 接尾 (Suffixes)
          const shouldGlue = currentTokens.length > 0 && !/^[\s“”"‘’'(){}\[\]<>¿¡.,!?;:。！？]+$/.test(currentSurfaceText) && (
              pos === "助動詞" || 
              (pos === "動詞" && posDetail === "非自立") ||
              (pos === "助詞" && posDetail === "接続助詞") ||
              pos.includes("接尾")
          );

          if (shouldGlue) {
              currentTokens.push(token);
          } else {
              commitCurrentSpan();
              currentStart = charIndex;
              currentTokens = [token];
          }
          charIndex += s.length;
      }
      commitCurrentSpan();

      return { container, spans };
  }

  const seg = getWordSegmenter(localeHint);

  if (seg) {
    // Best path: real word segmentation (works for ja/zh in Chrome)
    for (const part of seg.segment(text)) {
      const s = part.segment;
      const start = part.index;              // UTF-16 code unit index
      const end = start + s.length;

      const span = document.createElement("span");

      const loc = localeHint.toLowerCase();
      if ((loc.startsWith("zh") || loc.startsWith("yue")) && part.isWordLike && /[\u4e00-\u9fa5]/.test(s)) {
          let reading = null;
          const isCantonese = loc.startsWith("yue") || loc.includes("-hk") || loc.includes("-mo") || loc.includes("macau");

          if (isCantonese && els.chkJyutping.checked && window.ToJyutping) {
              reading = window.ToJyutping.getJyutpingText(s);
          } else if (!isCantonese && els.chkPinyin.checked && window.pinyinPro) {
              reading = window.pinyinPro.pinyin(s, { type: 'string' });
          }

          if (reading) {
              const ruby = document.createElement("ruby");
              ruby.textContent = s;
              const rt = document.createElement("rt");
              rt.textContent = reading;
              ruby.appendChild(rt);
              span.appendChild(ruby);
          } else {
              span.textContent = s;
          }
      } else {
          span.textContent = s;
      }

      // Only mark “word-like” chunks as clickable/highlightable
      if (part.isWordLike) {
        span.className = "word";
        span.dataset.start = String(start);
        span.dataset.end = String(end);
        spans.push({ node: span, start, end });
      }

      container.appendChild(span);
    }
    return { container, spans };
  }

  // Fallback path if Intl.Segmenter is missing:
  // - if it has spaces, do the old split
  // - if it’s likely CJK with no spaces, fall back to PER-CHAR clickable units
  if (!looksLikeNoSpaceLanguage(text)) {
    const tokens = text.split(/(\s+)/);
    tokens.forEach(token => {
      const span = document.createElement("span");
      span.textContent = token;

      if (token.trim().length > 0) {
        span.className = "word";
        span.dataset.start = String(charIndex);
        span.dataset.end = String(charIndex + token.length);
        spans.push({ node: span, start: charIndex, end: charIndex + token.length });
      }
      container.appendChild(span);
      charIndex += token.length;
    });
    return { container, spans };
  }

  // CJK char fallback (still works with boundary charIndex reasonably well)
  // IMPORTANT: use code unit lengths so it matches SpeechSynthesis charIndex.
  for (const ch of Array.from(text)) {
    const span = document.createElement("span");
    span.textContent = ch;

    // Skip making punctuation “word” clickable if you want; I’ll keep it clickable-simple:
    if (ch.trim().length > 0) {
      span.className = "word";
      span.dataset.start = String(charIndex);
      span.dataset.end = String(charIndex + ch.length);
      spans.push({ node: span, start: charIndex, end: charIndex + ch.length });
    }

    container.appendChild(span);
    charIndex += ch.length;
  }

  return { container, spans };
}

  function autoChunkText(text) {
    if (!text) return [];
    let safeText = text;
    // FAST PATH: Skip abbreviation checks entirely if there are no periods
    if (safeText.includes('.')) {
        const abbrevs = ["e.g.","i.e.","Ph.D.","U.S.","U.K.","N.Y.","D.C.","a.m.","p.m.","Mme.","Mlle.","Uds.","Sra.","Srta.","Sig.","Mrs.","Frl.","Prof.","Gen.","Rep.","Sen.","Gov.","Lt.","Maj.","Capt.","Col.","Rev.","Hon.","Sgt.","Ave.","Rd.","Blvd.","Mt.","St.","Inc.","Ltd.","Co.","Corp.","Est.","vs.","v.","approx.","Mx.","M.","MM.","H.","Hr.","Fr.","Dr.","Mr.","Ms.","Sr.","Jr.","No.","Ud."];
        const placeholder = "___DOT___";
        abbrevs.forEach(abbr => { 
            if (safeText.includes(abbr)) {
                safeText = safeText.split(abbr).join(abbr.split(".").join(placeholder)); 
            }
        });
    }

    let finalChunks = [];
    safeText.split(/\r?\n/).forEach(line => {
      if (!line.trim()) return;
      // FAST PATH: If line has no sentence-ending punctuation, just push it whole.
      // This prevents Chrome's V8 engine from hanging on lookbehind regexes for massive lines.
      if (!/[.!?¡¿。！？؟\u06D4]/.test(line)) {
          finalChunks.push(line.trim());
          return;
      }
      // Safe split without lookbehinds for mobile browser compatibility
      let processedLine = line.trim()
          .replace(/([.!?¡¿؟\u06D4]['"”」』]?)\s+/g, "$1___SPLIT___")
          .replace(/([。！？]['"”」』]?)\s*(?![。！？.!?¡¿؟\u06D4]|['"”」』]|$)/g, "$1___SPLIT___");
          
      finalChunks = finalChunks.concat(processedLine.split("___SPLIT___").map(s => s.trim()).filter(s => s.length > 0));
    });
    
    if (safeText.includes('___DOT___')) {
        return finalChunks.map(c => c.split('___DOT___').join("."));
    }
    return finalChunks;
  }

  let allPages = [];
  let currentPageIndex = 0;

  function buildAllSegmentsToRender(rawText) {
    if (renderTask) cancelAnimationFrame(renderTask);
    els.display.innerHTML = ""; segments = [];
    const parts = rawText.split(/(\{[\s\S]*?\})|(\[[\s\S]*?\])/g);

    const findIndex = (nameStr) => {
        const idx = voices.findIndex(v => `${v.name} (${v.lang})` === nameStr);
        return idx >= 0 ? idx : 0;
    };

    const vIndices = [
      findIndex(els.v1.value),
      findIndex(els.v2.value),
      findIndex(els.v3.value)
    ];

    const playAudio = [els.audio1.checked, els.audio2.checked, els.audio3.checked];

    let segmentsToRender = [];
    parts.forEach(part => {
      if (!part || !part.trim()) return;
      let typeIndex = 0; let clean = part; let pSym = "", poSym = "";
      if (part.startsWith("{") && part.endsWith("}")) { typeIndex=1; clean=part.slice(1, -1); pSym="{"; poSym="}"; }
      else if (part.startsWith("[") && part.endsWith("]")) { typeIndex=2; clean=part.slice(1, -1); pSym="["; poSym="]"; }

      if (!clean.trim()) return;
      autoChunkText(clean).forEach(chunkText => {
         segmentsToRender.push({ text: chunkText, typeIndex, voiceIndex: vIndices[typeIndex], pSym, poSym, playAudio: playAudio[typeIndex] });
      });
    });

    allPages = [];
    let currentPage = [];
    for (let i = 0; i < segmentsToRender.length; i++) {
        currentPage.push(segmentsToRender[i]);
        let nextSeg = segmentsToRender[i+1];
        // 120 segments is roughly 40 rows * 3 voices
        if (currentPage.length >= 120 && nextSeg) {
             if (nextSeg.typeIndex <= segmentsToRender[i].typeIndex || nextSeg.typeIndex === 0) {
                 allPages.push(currentPage);
                 currentPage = [];
             }
        }
    }
    if (currentPage.length > 0) allPages.push(currentPage);
  }

  window.jumpToPage = (val) => {
      let pageNum = parseInt(val);
      if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
      if (pageNum > allPages.length) pageNum = allPages.length;
      document.getElementById('pageJumpInput').value = pageNum;
      
      synth.cancel(); isPlaying = false; isPaused = false; updatePauseUI();
      renderPage(pageNum - 1, false, 0);
  };
  
  window.prevPage = () => { 
      if (currentPageIndex > 0) {
          synth.cancel(); isPlaying = false; isPaused = false; updatePauseUI();
          renderPage(currentPageIndex - 1, false, 0); 
      }
  };
  window.nextPage = () => { 
      if (currentPageIndex < allPages.length - 1) {
          synth.cancel(); isPlaying = false; isPaused = false; updatePauseUI();
          renderPage(currentPageIndex + 1, false, 0); 
      }
  };

  function renderPage(pageIndex, autoPlay = true, startIndex = 0) {
     if (renderTask) cancelAnimationFrame(renderTask);
     els.display.innerHTML = "";
     segments = [];
     currentPageIndex = pageIndex;
     
     const pageCtrl = document.getElementById('paginationControl');
     if (pageCtrl) {
         if (allPages.length > 1) {
             pageCtrl.style.display = 'flex';
             const input = document.getElementById('pageJumpInput');
             if (input) {
                 input.value = pageIndex + 1;
                 input.max = allPages.length;
             }
             const totalSpan = document.getElementById('totalPagesIndicator');
             if (totalSpan) totalSpan.textContent = allPages.length;
             
             const pBtn = document.getElementById('prevPageBtn');
             const nBtn = document.getElementById('nextPageBtn');
             pBtn.disabled = (pageIndex === 0);
             nBtn.disabled = (pageIndex === allPages.length - 1);
             pBtn.style.opacity = (pageIndex === 0) ? '0.3' : '1';
             nBtn.style.opacity = (pageIndex === allPages.length - 1) ? '0.3' : '1';
         } else {
             pageCtrl.style.display = 'none';
         }
     }

     if (!allPages[pageIndex] || allPages[pageIndex].length === 0) { stop(); return; }

     const segmentsToRender = allPages[pageIndex];
     let processed = 0; const batchSize = 50;
     function renderBatch() {
         const chunk = document.hidden ? segmentsToRender.length : batchSize;
         const end = Math.min(processed + chunk, segmentsToRender.length);
         for (let i = processed; i < end; i++) {
             const data = segmentsToRender[i];
             const localeHint = voices[data.voiceIndex]?.lang || "en";
             const { container, spans } = buildWordSpans(data.text, localeHint);
             const absoluteIndex = i;

             container.dataset.track = data.typeIndex;

             const isVisible = (data.typeIndex === 0 && els.show1.checked) ||
                               (data.typeIndex === 1 && els.show2.checked) ||
                               (data.typeIndex === 2 && els.show3.checked);

             const playA = [els.audio1.checked, els.audio2.checked, els.audio3.checked];
             data.playAudio = playA[data.typeIndex];

             if (!isVisible) container.style.display = "none";
             if (!data.playAudio) { container.classList.add("silent-mode"); }

             const playCue = document.createElement("span"); playCue.textContent = "▶ "; playCue.className = "play-cue";
             playCue.onclick = (e) => { e.stopPropagation(); jumpToSegment(absoluteIndex); };
             container.prepend(playCue);

             if (data.pSym) { const pre = document.createElement("span"); pre.textContent = data.pSym; pre.style.color = "rgba(0,0,0,0.2)"; container.prepend(pre); }
             const saveBtn = document.createElement("span"); saveBtn.textContent = " ➕"; saveBtn.className = "word"; saveBtn.style.color = "rgba(40, 167, 69, 0.5)"; saveBtn.style.fontWeight = "bold";
             
             // Extract track index to pass to addToVocab
             const trackIdx = parseInt(container.dataset.track || "0");
             saveBtn.onclick = (e) => { e.stopPropagation(); addToVocab(data.text, trackIdx); saveBtn.textContent = " ✔️"; setTimeout(() => { saveBtn.textContent = " ➕"; }, 1000); };
             
             container.appendChild(saveBtn);
             if (data.poSym) { const post = document.createElement("span"); post.textContent = data.poSym; post.style.color = "rgba(0,0,0,0.2)"; container.append(post); }
             els.display.appendChild(container); els.display.appendChild(document.createTextNode(" "));
             segments.push({ ...data, container, spans });
         }
         processed = end;
         if (processed < segmentsToRender.length) {
             if (document.hidden) { setTimeout(renderBatch, 0); } 
             else { renderTask = requestAnimationFrame(renderBatch); }
         } else {
             if (autoPlay) speakSegment(startIndex);
         }
     }
     renderBatch();
  }

function findSpanByCharIndex(spans, charIndex) {
  if (!spans || !spans.length) return null;

  // 1. Exact match (Binary Search)
  let lo = 0, hi = spans.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const s = spans[mid];
    if (charIndex < s.start) hi = mid - 1;
    else if (charIndex >= s.end) lo = mid + 1;
    else return s;
  }

  // 2. Chrome Fallback: If charIndex hits whitespace/punctuation 
  // before a word, just return the next upcoming word.
  for (let i = 0; i < spans.length; i++) {
    if (spans[i].start >= charIndex) return spans[i];
  }

  // 3. If past all words, return the last one
  return spans[spans.length - 1];
}

  function speakSegment(index) {
    currentSegmentIndex = index;
    if (index >= segments.length) {
        if (currentPageIndex < allPages.length - 1) {
            renderPage(currentPageIndex + 1, true, 0);
            return;
        }
        isPlaying = false;
        isPaused = false;
        updatePauseUI();
        try { localStorage.removeItem("cole_reader_bookmark"); } catch(e) { console.warn("Bookmark cleanup failed:", e); }
        currentSegmentIndex = 0;
        return;
    }
    if (index < 0) {
        if (currentPageIndex > 0) {
            renderPage(currentPageIndex - 1, true, allPages[currentPageIndex - 1].length - 1);
            return;
        }
        currentSegmentIndex = 0;
        index = 0;
    }
    
    const seg = segments[index];
    try {
        localStorage.setItem("cole_reader_bookmark", JSON.stringify({ index: index, text: seg.text }));
    } catch(e) { console.warn("Bookmark save failed:", e); }

    // V9: SKIP LOGIC (If Audio is unchecked)
    if (!seg.playAudio) {
       // We skip, but we must highlight briefly so user knows where we are?
       // Actually user requested "Subtitle" behavior.
       // Usually subtitles appear while audio plays. But here audio is OFF.
       // So we just push to next.
       requestAnimationFrame(() => {
          document.querySelectorAll(".active-sentence").forEach(e => e.classList.remove("active-sentence"));

           if (els.autoScroll.checked) seg.container.scrollIntoView({ behavior: "smooth", block: "center" });
       });

       // 200ms delay so it doesn't zip through 100 silent sentences instantly and crash
       setTimeout(() => {
           const nextTarget = isLooping ? currentSegmentIndex : currentSegmentIndex + 1;
           speakSegment(nextTarget);
       }, 200); // 200ms read time for silent text
       return;
    }

    // NORMAL PLAYBACK
    requestAnimationFrame(() => {
        document.querySelectorAll(".active-sentence").forEach(e => e.classList.remove("active-sentence"));
        if (seg && seg.container) {
            seg.container.classList.add("active-sentence");
            if (els.autoScroll.checked) seg.container.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    const utter = new SpeechSynthesisUtterance(seg.text);

    // Dynamic Voice Lookup (Fixes mid-read switching)
    const trackInput = [els.v1, els.v2, els.v3][seg.typeIndex];
    const targetName = trackInput ? trackInput.value : "";
    let voice = voices.find(v => `${v.name} (${v.lang})` === targetName);

    // Missing Voice Fallback
    if (!voice && targetName) {
        const langMatch = targetName.match(/\(([^)]+)\)$/);
        if (langMatch) {
            const targetLang = langMatch[1];
            voice = voices.find(v => v.lang === targetLang);
            if (voice) showToast(`Saved voice unavailable, using default for ${targetLang}`);
        }
    }

    // Fallback
    if (!voice && seg.voiceIndex !== undefined) voice = voices[seg.voiceIndex];

    if (voice) { utter.voice = voice; utter.lang = voice.lang; }
    const rateInputs = [els.r1, els.r2, els.r3];
    utter.rate = parseFloat(rateInputs[seg.typeIndex].value || "1.0");

utter.onboundary = (event) => {
  if (typeof event.charIndex !== "number") return;

  const charIndex = event.charIndex;
  const match = findSpanByCharIndex(seg.spans, charIndex);
  if (!match) return;

  if (seg._activeWordNode && seg._activeWordNode !== match.node) {
    seg._activeWordNode.classList.remove("active-word");
  }
  match.node.classList.add("active-word");
  seg._activeWordNode = match.node;
};

    utter.onend = () => {
      window.currentUtterance = null;
if (seg._activeWordNode) {
  seg._activeWordNode.classList.remove("active-word");
  seg._activeWordNode = null;
}

      if (!isPlaying || isPaused) return;

      // Trigger Reader Onboarding after sentence 2 finishes
      if (index === 1 && typeof window.triggerReaderOnboarding === 'function' && localStorage.getItem("hasSeenReaderOnboarding") !== "true") {
          togglePause(); // Pauses the UI and sets isPaused = true
          window.triggerReaderOnboarding();
          return; // Stop the auto-advance
      }

      const nextTarget = isLooping ? currentSegmentIndex : currentSegmentIndex + 1;
      const delay = parseFloat(state.shadow || "0") * 1000;
      if (delay > 0 && !isSkipping) setTimeout(() => speakSegment(nextTarget), delay);
      else speakSegment(nextTarget);
    };
    window.currentUtterance = utter; synth.speak(utter);
  }

  function play() {
    // 1. Show the Stop button immediately
    els.stop.style.display = "flex"; els.stop.className = "action-btn stop"; els.stop.disabled = false;

    // 2. THE "KICK" LOGIC (Fixes the stuck/paused state)
    // If we are technically "playing" (even if paused or stuck), treat Play as "Restart Current Sentence"
    if (isPlaying) {
        // Force the pause state off
        isPaused = false;
        updatePauseUI();
        // Cancel whatever ghost audio might be stuck
        synth.cancel();
        // Force-feed the current sentence back into the engine
        // This is more reliable than 'resume()' for waking up a stuck browser
        setTimeout(() => speakSegment(currentSegmentIndex), 50);
        return;
    }

    // 3. THE "REPLAY" LOGIC (For when we finished playing but haven't closed the reader)
    if (els.display.style.display === "block" && segments.length > 0) {
        isPlaying = true;
        isPaused = false;
        updatePauseUI();
        synth.cancel();
        const unlock = new SpeechSynthesisUtterance("");
        unlock.volume = 0;
        synth.speak(unlock);
        setTimeout(() => speakSegment(currentSegmentIndex), 50);
        return;
    }

    // 4. THE "FRESH START" LOGIC (Start from 0)
    // If we are NOT playing (stopped or finished), parse and start from top.
    const raw = els.text.value || ""; if (!raw.trim()) return;
    isPlaying = true; isPaused = false; updatePauseUI();

    // Trigger background AI summaries if toggled
    if (typeof kickoffAiSummaries === "function") kickoffAiSummaries();

    if (els.gridWrapper) els.gridWrapper.classList.add("hidden");
    if (els.verticalWrapper) els.verticalWrapper.classList.add("hidden");

    if (!els.gridWrapper && !els.verticalWrapper) {
        els.text.classList.add("hidden");
    }

    els.display.style.display = "block";

    const isLargeText = raw.length >= 5000;

    // Show overlay for large texts so the browser stays responsive
    const overlay = document.getElementById("processingOverlay");
    const progressEl = document.getElementById("processingProgress");
    const messageEl = document.getElementById("processingMessage");
    if (isLargeText && overlay) {
        messageEl.textContent = "Parsing your text...";
        progressEl.textContent = "This may take a moment for large texts.";
        overlay.style.display = "flex";
        els.display.textContent = "";
    } else {
        els.display.textContent = "Parsing text...";
    }

    // Cancel any existing speech, with a safety timeout for stuck browsers
    try { synth.cancel(); } catch(e) { console.warn("synth.cancel() failed:", e); }

    // --- MOBILE AUDIO WAKE-UP HACK ---
    const unlock = new SpeechSynthesisUtterance("");
    unlock.volume = 0;
    synth.speak(unlock);
    // ---------------------------------

    // Tiny delay to ensure UI updates before heavy parsing
    setTimeout(() => {
        // FAST PATH: Small text — parse on main thread (instant)
        if (raw.length < 5000) {
            buildAllSegmentsToRender(raw);
            finishPlaySetup();
            return;
        }

        // WORKER PATH: Parse in background so the browser doesn't freeze
        const workerCode = `
          self.onmessage = function(e) {
            const rawText = e.data;
            const parts = rawText.split(/(\\{[\\s\\S]*?\\})|(\\[[\\s\\S]*?\\])/g);

            ${autoChunkText.toString()}

            let segmentsToRender = [];
            parts.forEach(part => {
              if (!part || !part.trim()) return;
              let typeIndex = 0; let clean = part; let pSym = "", poSym = "";
              if (part.startsWith("{") && part.endsWith("}")) { typeIndex=1; clean=part.slice(1, -1); pSym="{"; poSym="}"; }
              else if (part.startsWith("[") && part.endsWith("]")) { typeIndex=2; clean=part.slice(1, -1); pSym="["; poSym="]"; }

              if (!clean.trim()) return;
              autoChunkText(clean).forEach(chunkText => {
                 segmentsToRender.push({ text: chunkText, typeIndex, pSym, poSym });
              });
            });

            self.postMessage(segmentsToRender);
          };
        `;

        const blob = new Blob([workerCode], {type: 'application/javascript'});
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = function(e) {
            const parsedSegments = e.data;
            if (overlay) overlay.style.display = "none";
            finishPlaySetupFromWorker(parsedSegments);
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };
        worker.postMessage(raw);

    }, 10);
  }

  function finishPlaySetupFromWorker(parsedSegments) {
      if (renderTask) cancelAnimationFrame(renderTask);
      els.display.innerHTML = ""; segments = [];
      
      const findIndex = (nameStr) => {
          const idx = voices.findIndex(v => `${v.name} (${v.lang})` === nameStr);
          return idx >= 0 ? idx : 0;
      };

      const vIndices = [
        findIndex(els.v1.value),
        findIndex(els.v2.value),
        findIndex(els.v3.value)
      ];

      const playAudio = [els.audio1.checked, els.audio2.checked, els.audio3.checked];

      // Re-hydrate with UI state
      parsedSegments.forEach(seg => {
          seg.voiceIndex = vIndices[seg.typeIndex];
          seg.playAudio = playAudio[seg.typeIndex];
      });

      allPages = [];
      let currentPage = [];
      for (let i = 0; i < parsedSegments.length; i++) {
          currentPage.push(parsedSegments[i]);
          let nextSeg = parsedSegments[i+1];
          if (currentPage.length >= 120 && nextSeg) {
               if (nextSeg.typeIndex <= parsedSegments[i].typeIndex || nextSeg.typeIndex === 0) {
                   allPages.push(currentPage);
                   currentPage = [];
               }
          }
      }
      if (currentPage.length > 0) allPages.push(currentPage);
      
      finishPlaySetup();
  }

  function finishPlaySetup() {
        if (allPages.length === 0) { stop(); return; }

        let startPage = 0;
        let startIdx = 0;
        try {
            const bmRaw = localStorage.getItem("cole_reader_bookmark");
            if (bmRaw) {
                const bm = JSON.parse(bmRaw);
                for (let p = 0; p < allPages.length; p++) {
                    let found = allPages[p].findIndex(s => s.text === bm.text);
                    if (found !== -1) {
                        startPage = p;
                        startIdx = found;
                        break;
                    }
                }
            }
        } catch(e) { console.warn("Bookmark restore failed:", e); }
        renderPage(startPage, true, startIdx);
  }

  function togglePause() {
    if (!isPlaying) return;
    if (!isPaused) { if (synth.speaking) { forcePause(); isPaused = true; updatePauseUI(); } }
    else { forceResume(); isPaused = false; updatePauseUI(); }
  }

  function stop() {
    if (els.stop.style.display === "none") return;

    // Zen mode
    document.body.classList.remove("zen-mode");
    if (els.zen) { els.zen.style.borderColor = ""; els.zen.style.color = ""; }

    // Kill in-progress render batches
    if (renderTask) { cancelAnimationFrame(renderTask); renderTask = null; }

    // Kill audio immediately
    synth.cancel();
    window.currentUtterance = null;
    isPlaying = false; isPaused = false; isSkipping = false;
    updatePauseUI();

    // Swap views instantly
    els.display.style.display = "none";
    if (els.gridWrapper) els.gridWrapper.classList.remove("hidden");
    if (els.verticalWrapper) els.verticalWrapper.classList.remove("hidden");
    if (!els.gridWrapper && !els.verticalWrapper) {
        els.text.classList.remove("hidden");
    }

    // Drop heavy JS references and nuke DOM instantly
    segments = [];
    allPages = [];
    currentSegmentIndex = 0;
    currentPageIndex = 0;
    els.display.innerHTML = "";
    
    const pageCtrl = document.getElementById('paginationControl');
    if (pageCtrl) pageCtrl.style.display = 'none';

    // Restore text inputs
    els.text.disabled = false;
    els.text.style.opacity = "1";
    
    // Finalize Button state
    els.stop.style.display = "none";
  }

  function toggleLoop() { isLooping = !isLooping; setLoopUI(); }
  function jumpToSegment(newIndex) {
    if (!segments.length) return;
    currentSegmentIndex = Math.max(0, Math.min(newIndex, segments.length - 1));
    isPlaying = true; isPaused = false; updatePauseUI(); isSkipping = true; synth.cancel();
    setTimeout(() => { isSkipping = false; speakSegment(currentSegmentIndex); }, 60);
  }
  function prevSentence() {
      if (currentSegmentIndex === 0 && typeof currentPageIndex !== 'undefined' && currentPageIndex > 0) {
          synth.cancel(); isPlaying = true; isPaused = false; updatePauseUI(); isSkipping = true;
          renderPage(currentPageIndex - 1, true, allPages[currentPageIndex - 1].length - 1);
          setTimeout(() => { isSkipping = false; }, 60);
      } else {
          jumpToSegment(currentSegmentIndex - 1);
      }
  }
  function nextSentence() {
      if (currentSegmentIndex === segments.length - 1 && typeof currentPageIndex !== 'undefined' && currentPageIndex < allPages.length - 1) {
          synth.cancel(); isPlaying = true; isPaused = false; updatePauseUI(); isSkipping = true;
          renderPage(currentPageIndex + 1, true, 0);
          setTimeout(() => { isSkipping = false; }, 60);
      } else {
          jumpToSegment(currentSegmentIndex + 1);
      }
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === 'Enter') { e.preventDefault(); play(); return; }
    const tag = document.activeElement.tagName;
    const isEditable = document.activeElement.isContentEditable;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) { 
        if(e.code === 'Escape') document.activeElement.blur(); 
        return; 
    }
    if (e.code === 'Space') { e.preventDefault(); if (isPlaying) togglePause(); else play(); }
    else if (e.code === 'ArrowLeft') { e.preventDefault(); prevSentence(); }
    else if (e.code === 'ArrowRight') { e.preventDefault(); nextSentence(); }
    else if (e.code === 'KeyL') toggleLoop();
    else if (e.code === 'Digit1') { e.preventDefault(); if (e.shiftKey) document.getElementById('chkAudio1').click(); else document.getElementById('chkShow1').click(); }
    else if (e.code === 'Digit2') { e.preventDefault(); if (e.shiftKey) document.getElementById('chkAudio2').click(); else document.getElementById('chkShow2').click(); }
    else if (e.code === 'Digit3') { e.preventDefault(); if (e.shiftKey) document.getElementById('chkAudio3').click(); else document.getElementById('chkShow3').click(); }
    else if (e.code === 'Escape') toggleZen();
    else if (e.code === 'KeyX') stop();
  });

  readSettings().then(() => { populateVoices(); });
  if ("onvoiceschanged" in speechSynthesis) speechSynthesis.onvoiceschanged = populateVoices;

  els.themeBtn.addEventListener("click", toggleTheme);
  els.chkKuromoji.addEventListener("change", (e) => {
      saveSettings();
      if (e.target.checked) loadKuromoji();
      else {
          jpTokenizer = null;
          document.getElementById("kuromojiStatus").textContent = "Dictionary disabled.";
          document.getElementById("kuromojiStatus").style.color = "var(--text-color)";

          // Re-render immediately without Kuromoji
          if (els.text.value && isPlaying) {
             const currentTime = currentSegmentIndex;
             buildSegmentsAndUI(els.text.value);
             jumpToSegment(currentTime);
          }
      }
  });
  els.chkPinyin.addEventListener("change", (e) => {
      saveSettings();
      if (e.target.checked) loadPinyin();
      else {
          document.getElementById("pinyinStatus").textContent = "Dictionary disabled.";
          document.getElementById("pinyinStatus").style.color = "var(--text-color)";

          if (els.text.value && isPlaying) {
             const currentTime = currentSegmentIndex;
             buildSegmentsAndUI(els.text.value);
             jumpToSegment(currentTime);
          }
      }
  });
  els.chkJyutping.addEventListener("change", (e) => {
      saveSettings();
      if (e.target.checked) loadJyutping();
      else {
          document.getElementById("jyutpingStatus").textContent = "Dictionary disabled.";
          document.getElementById("jyutpingStatus").style.color = "var(--text-color)";

          if (els.text.value && isPlaying) {
             const currentTime = currentSegmentIndex;
             buildSegmentsAndUI(els.text.value);
             jumpToSegment(currentTime);
          }
      }
  });
  els.autoSplit.addEventListener("change", saveSettings);
  [els.r1, els.r2, els.r3].forEach((slider, i) => { const displays=[els.rv1, els.rv2, els.rv3]; slider.addEventListener("input", () => { displays[i].textContent = `${slider.value}x`; saveSettings(); }); });
  els.text.addEventListener("input", saveSettings);
  [els.v1, els.v2, els.v3].forEach(sel => sel.addEventListener("change", saveSettings));
  els.play.addEventListener("click", play); els.pause.addEventListener("click", togglePause); els.stop.addEventListener("click", stop);
  els.loop.addEventListener("click", toggleLoop); els.prev.addEventListener("click", prevSentence); els.next.addEventListener("click", nextSentence);
  els.copyAll.addEventListener("click", copyVocabList); els.exportCsv.addEventListener("click", exportVocabCsv); els.clear.addEventListener("click", clearVocab);

  els.modeGridBtn.addEventListener("click", () => {
      state.editorMode = "grid";
      updateModeUI();
      saveSettingsImmediate();
  });
  els.modeVerticalBtn.addEventListener("click", () => {
      state.editorMode = "vertical";
      updateModeUI();
      saveSettingsImmediate();
  });

  const paintV1Btn = document.getElementById("paintV1Btn");
  const paintV2Btn = document.getElementById("paintV2Btn");
  const paintV3Btn = document.getElementById("paintV3Btn");
  const paintOffBtn = document.getElementById("paintOffBtn");

  function updatePaintbrushUI() {
      const activeStyle = "background: var(--accent); color: var(--bg-color); border: 1px solid var(--accent); cursor: pointer; border-radius: 4px; padding: 2px 8px; font-weight: bold;";
      const inactiveStyle = "border: 1px solid var(--accent); background: transparent; color: var(--text-color); cursor: pointer; border-radius: 4px; padding: 2px 8px;";
      
      if(paintV1Btn) paintV1Btn.style.cssText = activePaintbrushVoice === "1" ? activeStyle : inactiveStyle;
      if(paintV2Btn) paintV2Btn.style.cssText = activePaintbrushVoice === "2" ? activeStyle : inactiveStyle;
      if(paintV3Btn) paintV3Btn.style.cssText = activePaintbrushVoice === "3" ? activeStyle : inactiveStyle;
      if(paintOffBtn) paintOffBtn.style.cssText = activePaintbrushVoice === null ? activeStyle : inactiveStyle;

      // Update cursor for vertical editor rows
      if (els.verticalEditor) {
          const cells = els.verticalEditor.querySelectorAll('.vertical-cell');
          const rows = els.verticalEditor.querySelectorAll('.vertical-row');
          const selectsAndBtns = els.verticalEditor.querySelectorAll('select, button');
          
          if (activePaintbrushVoice !== null) {
              const cursorStyle = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23b05a2f\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 2l4 4L7 21H3v-4L18 2z\"></path><path d=\"M14 6l4 4\"></path></svg>') 0 24, crosshair";
              els.verticalEditor.style.cursor = cursorStyle;
              cells.forEach(cell => {
                  cell.style.cursor = cursorStyle;
                  cell.contentEditable = "false"; // Disable editing while painting
              });
              rows.forEach(row => row.style.cursor = cursorStyle);
              selectsAndBtns.forEach(el => el.style.cursor = "pointer"); // Keep pointer for interactive elements
          } else {
              els.verticalEditor.style.cursor = "default";
              cells.forEach(cell => {
                  cell.style.cursor = "text";
                  cell.contentEditable = "true"; // Re-enable editing
              });
              rows.forEach(row => row.style.cursor = "default");
              selectsAndBtns.forEach(el => el.style.cursor = "pointer");
          }
      }
  }

  if (paintV1Btn) paintV1Btn.addEventListener("click", () => { activePaintbrushVoice = "1"; updatePaintbrushUI(); });
  if (paintV2Btn) paintV2Btn.addEventListener("click", () => { activePaintbrushVoice = "2"; updatePaintbrushUI(); });
  if (paintV3Btn) paintV3Btn.addEventListener("click", () => { activePaintbrushVoice = "3"; updatePaintbrushUI(); });
  if (paintOffBtn) paintOffBtn.addEventListener("click", () => { activePaintbrushVoice = null; updatePaintbrushUI(); });

  updatePaintbrushUI(); // Initialize states

  // Helper to toggle visibility instantly without rebuilding
  function updateTrackVisibility() {
      const show = [els.show1.checked, els.show2.checked, els.show3.checked];
      document.querySelectorAll(".sentence-container").forEach(el => {
          const trackIdx = parseInt(el.dataset.track || "0");
          el.style.display = show[trackIdx] ? "" : "none";
      });
  }

  // LISTENER: Saves settings AND updates visibility immediately
  [els.show1, els.show2, els.show3].forEach(c => c.addEventListener("change", () => {
      saveSettings();
      updateTrackVisibility();
  }));

  // Helper to update audio state instantly without rebuilding
  function updateAudioState() {
      const playA = [els.audio1.checked, els.audio2.checked, els.audio3.checked];
      segments.forEach(seg => {
          seg.playAudio = playA[seg.typeIndex];
          if (seg.container) {
              if (!seg.playAudio) {
                  seg.container.classList.add("silent-mode");
              } else {
                  seg.container.classList.remove("silent-mode");
              }
          }
      });
  }

  // Audio tracks save AND update state dynamically
  [els.audio1, els.audio2, els.audio3].forEach(c => c.addEventListener("change", () => {
      saveSettings();
      updateAudioState();
  }));

  els.fileLoader.addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader(); 
    reader.onload = (evt) => { 
        const text = evt.target.result;
        if (state.editorMode === "vertical" && els.verticalEditor) {
            const newVerticalData = [];
            const regex = /\{([^}]+)\}|\[([^\]]+)\]|([^{}\[\]]+)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                if (match[1] !== undefined && match[1].trim()) {
                    newVerticalData.push({ voice: 2, text: match[1].trim() });
                } else if (match[2] !== undefined && match[2].trim()) {
                    newVerticalData.push({ voice: 3, text: match[2].trim() });
                } else if (match[3] !== undefined && match[3].trim()) {
                    // Because it might be multiple lines of plain text, split it
                    const lines = match[3].trim().split(/\r?\n/).filter(l => l.trim().length > 0);
                    lines.forEach(l => newVerticalData.push({ voice: 1, text: l.trim() }));
                }
            }
            if (newVerticalData.length === 0) newVerticalData.push({ voice: 1, text: '' });
            state.verticalData = newVerticalData;
            initVerticalFromState();
            saveSettingsImmediate();
        } else if (els.gridEditor) {
            const hasFormatting = /\{([^}]+)\}|\[([^\]]+)\]/.test(text);
            if (hasFormatting) {
                const newGridData = [];
                let currentRow = {t1: '', t2: '', t3: ''};
                const regex = /\{([^}]+)\}|\[([^\]]+)\]|([^{}\[\]]+)/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    if (match[1] !== undefined) {
                        if (currentRow.t2 !== '') { newGridData.push({...currentRow}); currentRow = {t1: '', t2: '', t3: ''}; }
                        currentRow.t2 = match[1].trim();
                    } else if (match[2] !== undefined) {
                        if (currentRow.t3 !== '') { newGridData.push({...currentRow}); currentRow = {t1: '', t2: '', t3: ''}; }
                        currentRow.t3 = match[2].trim();
                    } else if (match[3] !== undefined) {
                        const t1 = match[3].trim();
                        if (t1) {
                            if (currentRow.t1 !== '' || currentRow.t2 !== '' || currentRow.t3 !== '') {
                                newGridData.push({...currentRow});
                                currentRow = {t1: '', t2: '', t3: ''};
                            }
                            currentRow.t1 = t1;
                        }
                    }
                }
                if (currentRow.t1 !== '' || currentRow.t2 !== '' || currentRow.t3 !== '') {
                    newGridData.push({...currentRow});
                }
                state.gridData = newGridData;
            } else {
                const autoSplit = document.getElementById("autoSplitPasteChk")?.checked ?? true;
                let chunks = [];
                if (autoSplit && typeof autoChunkText === "function") {
                    chunks = autoChunkText(text); 
                } else {
                    chunks = text.split(/\r?\n/).filter(line => line.trim().length > 0);
                }
                state.gridData = chunks.map(chunk => ({t1: chunk, t2: '', t3: ''}));
                if (state.gridData.length === 0) state.gridData = [{t1: '', t2: '', t3: ''}];
            }
            initGridFromState();
            saveSettingsImmediate();
        } else {
            els.text.value = text; 
            els.text.dispatchEvent(new Event('input')); 
        }
    };
    reader.readAsText(file); e.target.value = '';
  });

  // Allow dropping on the container's empty space to move item to the very end
  els.vocab.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  });
  els.vocab.addEventListener("drop", (e) => {
      // If dropped directly on the container (not on a child item)
      if (e.target === els.vocab && dragSrcIndex !== null) {
          e.preventDefault();
          const itemToMove = state.vocab[dragSrcIndex];
          state.vocab.splice(dragSrcIndex, 1);
          state.vocab.push(itemToMove);
          saveSettings(); renderVocab();
      }
  });

  const forceTwoColumns = () => {
      // Visually lock to 2 columns for deck interaction, without changing the CSV dropdown
      els.vocab.className = "group-2";
  };
  const restoreSelectedColumns = () => {
      // Restore visually back to the actual CSV dropdown selection
      els.vocab.className = `group-2`;
  };

  document.getElementById("sendToDeckBtn").addEventListener("mouseenter", forceTwoColumns);
  document.getElementById("deckSelect").addEventListener("change", forceTwoColumns);
  document.getElementById("deckSelect").addEventListener("mouseenter", forceTwoColumns);

  // Restore when hovering back to the CSV section
  document.getElementById("csvExportBlock").addEventListener("mouseenter", restoreSelectedColumns);

    const shadowSlider = document.getElementById("shadowSlider");
    shadowSlider.addEventListener("input", () => { document.getElementById("shadowVal").textContent = shadowSlider.value + "s"; saveSettings(); });

  let lastVerticalData = null;

  window.clearMainText = () => { 
      if (state.editorMode === "vertical" && els.verticalEditor) {
          els.verticalEditor.style.opacity = "0.5";
          setTimeout(() => {
              lastVerticalData = JSON.parse(JSON.stringify(state.verticalData || []));
              lastVerticalSpeakerMap = JSON.parse(JSON.stringify(state.verticalSpeakerMap || {}));
              state.verticalData = [];
              state.verticalSpeakerMap = {};
              initVerticalFromState();
              saveSettingsImmediate();
              els.verticalEditor.style.opacity = "1";
          }, 20);
      } else if (els.gridEditor) {
          els.gridEditor.style.opacity = "0.5";
          setTimeout(() => {
              lastGridData = JSON.parse(JSON.stringify(state.gridData || []));
              state.gridData = [];
              initGridFromState();
              saveSettingsImmediate();
              els.gridEditor.style.opacity = "1";
          }, 20);
      } else {
          const box = document.getElementById("textInput"); 
          if (!box.value) return; 
          lastMainText = box.value; 
          box.value = ""; 
          box.dispatchEvent(new Event('input')); 
      }
  };
  window.restoreMainText = () => {
      if (state.editorMode === "vertical" && els.verticalEditor) {
          if (!lastVerticalData) return;
          state.verticalData = JSON.parse(JSON.stringify(lastVerticalData));
          if (lastVerticalSpeakerMap) state.verticalSpeakerMap = JSON.parse(JSON.stringify(lastVerticalSpeakerMap));
          initVerticalFromState();
          saveSettings();
      } else if (els.gridEditor) {
          if (!lastGridData) return;
          state.gridData = JSON.parse(JSON.stringify(lastGridData));
          initGridFromState();
          saveSettings();
      } else {
          if (!lastMainText) return;
          document.getElementById("textInput").value = lastMainText;
          document.getElementById("textInput").dispatchEvent(new Event('input'));
      }
  };
  window.copyGridColumn = async (colIndex, btn) => {
      if (!els.gridEditor) return;
      const rows = Array.from(els.gridEditor.querySelectorAll(".grid-row"));
      const textToCopy = rows.map(row => {
          const cells = row.querySelectorAll(".grid-cell");
          return cells[colIndex] ? cells[colIndex].textContent : "";
      }).join("\n");
      
      try {
          await navigator.clipboard.writeText(textToCopy);
          showToast(`📋 Copied Voice ${colIndex + 1} column!`);
          if (btn) {
              const originalText = btn.textContent;
              btn.textContent = "✔️";
              btn.style.color = "#28a745";
              setTimeout(() => {
                  btn.textContent = originalText;
                  btn.style.color = "";
              }, 1000);
          }
      } catch (err) {
          console.error('Failed to copy!', err);
          showToast("❌ Failed to copy");
      }
  };

  window.scrollToGridBottom = () => {
      if (!els.gridEditor) return;
      els.gridEditor.scrollTop = els.gridEditor.scrollHeight;
  };

  window.startAutoAlignment = async () => {
      const sourceFileInput = document.getElementById('alignerSourceFile');
      const targetFileInput = document.getElementById('alignerTargetFile');

      if (!sourceFileInput.files.length || !targetFileInput.files.length) {
          alert("Please select both files to align.");
          return;
      }

      document.getElementById('alignerModal').style.display = 'none';
      
      const overlay = document.getElementById('processingOverlay');
      const msg = document.getElementById('processingMessage');
      const prog = document.getElementById('processingProgress');
      
      msg.textContent = "Reading and Aligning Dual Ebooks...";
      prog.textContent = "0%";
      overlay.style.display = 'flex';

      try {
          const readFile = async (file) => {
              if (file.name.toLowerCase().endsWith('.epub')) {
                  try {
                      const buffer = await file.arrayBuffer();
                      const zip = await JSZip.loadAsync(buffer);
                      
                      const containerXml = await zip.file("META-INF/container.xml").async("string");
                      const parser = new DOMParser();
                      const containerDoc = parser.parseFromString(containerXml, "text/xml");
                      const rootfiles = containerDoc.getElementsByTagName("rootfile");
                      if (!rootfiles.length) throw new Error("Invalid EPUB: no rootfile found.");
                      const opfPath = rootfiles[0].getAttribute("full-path");
                      const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/'));
                      const opfPrefix = opfDir ? opfDir + '/' : '';
                      
                      const opfXml = await zip.file(opfPath).async("string");
                      const opfDoc = parser.parseFromString(opfXml, "text/xml");
                      
                      const manifest = {};
                      Array.from(opfDoc.getElementsByTagName("item")).forEach(item => {
                          manifest[item.getAttribute("id")] = item.getAttribute("href");
                      });
                      
                      const spine = [];
                      Array.from(opfDoc.getElementsByTagName("itemref")).forEach(itemref => {
                          const idref = itemref.getAttribute("idref");
                          if (manifest[idref]) {
                              spine.push(opfPrefix + decodeURIComponent(manifest[idref]));
                          }
                      });
                      
                      let fullText = "";
                      for (const htmlPath of spine) {
                          const fileObj = zip.file(htmlPath) || zip.file(htmlPath.replace(/\\/g, '/'));
                          if (!fileObj) continue;
                          const htmlStr = await fileObj.async("string");
                          const htmlDoc = parser.parseFromString(htmlStr, "text/html");
                          
                          htmlDoc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, li').forEach(el => {
                              el.prepend('\n');
                              el.append('\n');
                          });
                          htmlDoc.querySelectorAll('br').forEach(el => {
                              el.replaceWith('\n');
                          });
                          
                          let text = htmlDoc.body ? htmlDoc.body.textContent : htmlDoc.documentElement.textContent;
                          text = text.replace(/\n\s*\n/g, '\n\n').trim();
                          if (text) {
                              fullText += text + "\n\n";
                          }
                      }
                      return fullText;
                  } catch (e) {
                      throw new Error("Failed to parse EPUB: " + e.message);
                  }
              } else {
                  return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = (e) => resolve(e.target.result);
                      reader.onerror = (e) => reject(new Error('Failed to read file.'));
                      reader.readAsText(file);
                  });
              }
          };

          const [sourceText, targetText] = await Promise.all([
              readFile(sourceFileInput.files[0]),
              readFile(targetFileInput.files[0])
          ]);

      // To bypass 'file://' origin null CORS issues on local execution,
      // we embed the worker code as a blob instead of loading 'aligner_worker.js' directly.
      const workerCode = `
self.onmessage = function(e) {
    const { sourceText, targetText } = e.data;
    self.postMessage({ type: 'progress', percent: 10 });
    try {
        const sourceParagraphs = sourceText.replace(/\\r\\n/g, '\\n').split(/\\n\\s*\\n+/).filter(p => p.trim().length > 0);
        const targetParagraphs = targetText.replace(/\\r\\n/g, '\\n').split(/\\n\\s*\\n+/).filter(p => p.trim().length > 0);

        let alignments = [];

        if (sourceParagraphs.length === targetParagraphs.length && sourceParagraphs.length > 1) {
            for (let i = 0; i < sourceParagraphs.length; i++) {
                const percent = 10 + Math.floor((i / sourceParagraphs.length) * 85);
                self.postMessage({ type: 'progress', percent: percent });
                
                const paraAlignments = runBandedAlignment(sourceParagraphs[i], targetParagraphs[i], false);
                alignments.push(...paraAlignments);
            }
            self.postMessage({ type: 'progress', percent: 95 });
        } else {
            alignments = runBandedAlignment(sourceText, targetText, true);
        }
        
        self.postMessage({ type: 'complete', alignments: alignments });
    } catch (err) {
        self.postMessage({ type: 'error', message: err.message });
    }
};

function runBandedAlignment(sourceText, targetText, emitProgress) {
    const splitRegex = /(?<=[.!?。！？])\\s*/;
    const sourceSentences = sourceText.replace(/\\r\\n/g, '\\n').split(splitRegex).filter(s => s.trim().length > 0);
    const targetSentences = targetText.replace(/\\r\\n/g, '\\n').split(splitRegex).filter(s => s.trim().length > 0);

    const N = sourceSentences.length;
    const M = targetSentences.length;

    self.postMessage({ type: 'progress', percent: 20 });
    if (N === 0 || M === 0) return [];

    const sourceChars = sourceSentences.reduce((sum, s) => sum + s.length, 0) || 1;
    const targetChars = targetSentences.reduce((sum, s) => sum + s.length, 0) || 1;
    const C = targetChars / sourceChars;
    const ratio = M / N; 
    const BAND_RADIUS = Math.max(50, Math.floor(Math.abs(N - M) + 20)); 

    const dp = Array.from({ length: N + 1 }, () => new Map());
    dp[0].set(0, { cost: 0, prev: null, type: null });

    const penalties = { '1-1': 0, '0-1': 20, '1-0': 20, '2-1': 15, '1-2': 15, '2-2': 25 };

    function getNumbers(str) {
        const matches = str.match(/\\b\\d+(?:[,.]\\d+)*\\b/g);
        return matches ? matches : [];
    }

    const sourceNumbers = sourceSentences.map(getNumbers);
    const targetNumbers = targetSentences.map(getNumbers);

    function getCost(sLen, tLen, iArr, jArr) { 
        let cost = Math.abs(sLen * C - tLen); 
        
        let sNums = [];
        for (let idx of iArr) if (idx >= 0 && idx < N) sNums.push(...sourceNumbers[idx]);
        
        let tNums = [];
        for (let idx of jArr) if (idx >= 0 && idx < M) tNums.push(...targetNumbers[idx]);
        
        let matchCount = 0;
        for (let num of sNums) {
            const tIdx = tNums.indexOf(num);
            if (tIdx !== -1) {
                matchCount++;
                tNums.splice(tIdx, 1);
            }
        }
        
        cost -= matchCount * 100; // Massive bonus for matching numbers
        return cost;
    }

    let progressCounter = 0;

    for (let i = 0; i <= N; i++) {
        if (emitProgress && progressCounter++ % 1000 === 0) {
            const percent = 20 + Math.floor((i / N) * 70);
            self.postMessage({ type: 'progress', percent: percent });
        }

        const expectedJ = Math.floor(i * ratio);
        const startJ = Math.max(0, expectedJ - BAND_RADIUS);
        const endJ = Math.min(M, expectedJ + BAND_RADIUS);

        for (let j = startJ; j <= endJ; j++) {
            if (i === 0 && j === 0) continue;

            let minCost = Infinity;
            let bestPrev = null;
            let bestType = null;

            const evaluate = (prevI, prevJ, type, sLen, tLen, iArr, jArr) => {
                if (prevI >= 0 && prevJ >= 0) {
                    const prevRow = dp[prevI];
                    if (prevRow && prevRow.has(prevJ)) {
                        const prevCost = prevRow.get(prevJ).cost;
                        if (prevCost !== Infinity) {
                            const currentCost = prevCost + getCost(sLen, tLen, iArr, jArr) + penalties[type];
                            if (currentCost < minCost) {
                                minCost = currentCost;
                                bestPrev = [prevI, prevJ];
                                bestType = type;
                            }
                        }
                    }
                }
            };

            if (i >= 1 && j >= 1) evaluate(i - 1, j - 1, '1-1', sourceSentences[i - 1].length, targetSentences[j - 1].length, [i-1], [j-1]);
            if (i >= 1)           evaluate(i - 1, j,     '1-0', sourceSentences[i - 1].length, 0, [i-1], []);
            if (j >= 1)           evaluate(i,     j - 1, '0-1', 0, targetSentences[j - 1].length, [], [j-1]);
            if (i >= 2 && j >= 1) evaluate(i - 2, j - 1, '2-1', sourceSentences[i - 1].length + sourceSentences[i - 2].length, targetSentences[j - 1].length, [i-1, i-2], [j-1]);
            if (i >= 1 && j >= 2) evaluate(i - 1, j - 2, '1-2', sourceSentences[i - 1].length, targetSentences[j - 1].length + targetSentences[j - 2].length, [i-1], [j-1, j-2]);
            if (i >= 2 && j >= 2) evaluate(i - 2, j - 2, '2-2', sourceSentences[i - 1].length + sourceSentences[i - 2].length, targetSentences[j - 1].length + targetSentences[j - 2].length, [i-1, i-2], [j-1, j-2]);

            if (minCost !== Infinity) dp[i].set(j, { cost: minCost, prev: bestPrev, type: bestType });
        }
    }

    if (emitProgress) self.postMessage({ type: 'progress', percent: 95 });

    const alignments = [];
    let currI = N;
    let currJ = M;
    
    if (!dp[N].has(M)) {
        let bestCost = Infinity;
        for (const [j, cell] of dp[N].entries()) {
            if (cell.cost < bestCost) { bestCost = cell.cost; currJ = j; }
        }
    }

    while (currI > 0 || currJ > 0) {
        const row = dp[currI];
        if (!row || !row.has(currJ)) { currI--; currJ--; continue; }

        const cell = row.get(currJ);
        const type = cell.type;
        const prev = cell.prev;

        if (!prev) break;

        let sourcePart = [];
        let targetPart = [];

        if (type === '1-1') {
            sourcePart.push(sourceSentences[currI - 1]); targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '1-0') {
            sourcePart.push(sourceSentences[currI - 1]);
        } else if (type === '0-1') {
            targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '2-1') {
            sourcePart.push(sourceSentences[currI - 2], sourceSentences[currI - 1]); targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '1-2') {
            sourcePart.push(sourceSentences[currI - 1]); targetPart.push(targetSentences[currJ - 2], targetSentences[currJ - 1]);
        } else if (type === '2-2') {
            sourcePart.push(sourceSentences[currI - 2], sourceSentences[currI - 1]); targetPart.push(targetSentences[currJ - 2], targetSentences[currJ - 1]);
        }

        alignments.unshift({ source: sourcePart.join(' '), target: targetPart.join(' ') });
        currI = prev[0]; currJ = prev[1];
    }
    return alignments;
}
`;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      
      worker.onmessage = function(e) {
          if (e.data.type === 'progress') {
              prog.textContent = e.data.percent + "%";
          } else if (e.data.type === 'complete') {
              overlay.style.display = 'none';
              
              if (els.gridEditor) {
                  // Capture state before overwriting for undo
                  captureGridSnapshot();
                  
                  els.gridEditor.innerHTML = "";
                  e.data.alignments.forEach(item => {
                      els.gridEditor.appendChild(createGridRow(item.source, item.target, ""));
                  });
                  
                  captureGridSnapshot();
                  saveSettingsImmediate();
                  
                  if (window.checkAlignmentStatus) {
                      setTimeout(window.checkAlignmentStatus, 500);
                  }
                  
                  // Clear the file inputs for next time
                  document.getElementById('alignerSourceFile').value = "";
                  document.getElementById('alignerTargetFile').value = "";
              }
              worker.terminate();
          } else if (e.data.type === 'error') {
              overlay.style.display = 'none';
              alert("Error during alignment: " + e.data.message);
              worker.terminate();
          }
      };

      worker.postMessage({ sourceText, targetText });
      } catch (err) {
          overlay.style.display = 'none';
          alert("Error reading files: " + err.message);
      }
  };

  window.checkAlignmentStatus = () => {
      if (!els.gridEditor) return;
      const rows = Array.from(els.gridEditor.querySelectorAll(".grid-row"));
      if (rows.length === 0) return;

      const totalLengths = [0, 0, 0];
      const nonEmptyCounts = [0, 0, 0];

      rows.forEach(row => {
          const cells = row.querySelectorAll(".grid-cell");
          for (let c = 0; c < 3; c++) {
              const text = cells[c] ? cells[c].innerText.trim() : "";
              const len = text.length;
              totalLengths[c] += len;
              if (len > 0) nonEmptyCounts[c]++;
          }
      });

      const activeCols = [];
      if (totalLengths[0] > 0) activeCols.push(0);
      if (totalLengths[1] > 0) activeCols.push(1);
      if (totalLengths[2] > 0) activeCols.push(2);

      const btn = document.getElementById("btnCheckAlignment");
      if (!btn) return;

      let isRed = false;
      if (activeCols.length >= 2) {
          let firstCount = nonEmptyCounts[activeCols[0]];
          for (let i = 1; i < activeCols.length; i++) {
              if (nonEmptyCounts[activeCols[i]] !== firstCount) {
                  isRed = true;
                  break;
              }
          }
      }

      const lang = document.documentElement.lang || "en";
      const span = btn.querySelector("span");
      const resultSpan = document.getElementById("misalignmentResult");

      if (isRed) {
          btn.dataset.clickable = "true";
          btn.style.cursor = "pointer";
          const dictRed = { en: "Alignment 🔴", ja: "ズレ 🔴", "zh-CN": "对齐 🔴", "zh-TW": "對齊 🔴", es: "Alineación 🔴" };
          const dictTitle = { en: "Identifies possible misalignments when the number of lines don't match.", ja: "行数が一致しない場合の考えられるズレを特定します。", "zh-CN": "当行数不匹配时，识别可能的对齐错误。", "zh-TW": "當行數不匹配時，識別可能的對齊錯誤。", es: "Identifica posibles desajustes cuando el número de líneas no coincide." };
          if (span) {
              span.textContent = dictRed[lang] || dictRed.en;
              span.setAttribute("data-i18n", "align_btn_red");
          }
          btn.title = dictTitle[lang] || dictTitle.en;
          btn.setAttribute("data-i18n-title", "align_btn_help");
      } else {
          btn.dataset.clickable = "false";
          btn.style.cursor = "default";
          const dictGreen = { en: "Alignment 🟢", ja: "ズレ 🟢", "zh-CN": "对齐 🟢", "zh-TW": "對齊 🟢", es: "Alineación 🟢" };
          const dictTitle = { en: "No misalignment. Click to check if 🔴", ja: "ズレはありません。🔴の場合のみクリックして確認できます。", "zh-CN": "无对齐错误。如果显示🔴可点击检查。", "zh-TW": "無對齊錯誤。如果顯示🔴可點擊檢查。", es: "Sin desajustes. Haz clic para comprobar si 🔴" };
          if (span) {
              span.textContent = dictGreen[lang] || dictGreen.en;
              span.setAttribute("data-i18n", "align_btn");
          }
          btn.title = dictTitle[lang] || dictTitle.en;
          btn.setAttribute("data-i18n-title", "align_btn_help_ok");
          if (resultSpan) resultSpan.textContent = "";
      }
  };

  let alignmentDebounce;
  const alignmentObserver = new MutationObserver(() => {
      clearTimeout(alignmentDebounce);
      alignmentDebounce = setTimeout(() => {
          if (window.checkAlignmentStatus) window.checkAlignmentStatus();
      }, 500);
  });
  if (els.gridEditor) {
      alignmentObserver.observe(els.gridEditor, { childList: true, subtree: true, characterData: true });
  }

  window.findMisalignment = () => {
      if (!els.gridEditor) return;
      const rows = Array.from(els.gridEditor.querySelectorAll(".grid-row"));
      if (rows.length === 0) return;

      const rowData = rows.map((row, i) => {
          const cells = row.querySelectorAll(".grid-cell");
          return {
              texts: [
                  cells[0] ? cells[0].innerText.trim() : "",
                  cells[1] ? cells[1].innerText.trim() : "",
                  cells[2] ? cells[2].innerText.trim() : ""
              ],
              index: i + 1
          };
      });

      const totalLengths = [0, 0, 0];
      const nonEmptyCounts = [0, 0, 0];
      const colArrays = [[], [], []];

      rowData.forEach(r => {
          for (let c = 0; c < 3; c++) {
              const len = r.texts[c].length;
              totalLengths[c] += len;
              if (len > 0) {
                  nonEmptyCounts[c]++;
                  colArrays[c].push({ len, rowIdx: r.index });
              }
          }
      });

      const activeCols = [];
      if (totalLengths[0] > 0) activeCols.push(0);
      if (totalLengths[1] > 0) activeCols.push(1);
      if (totalLengths[2] > 0) activeCols.push(2);

      const resultSpan = document.getElementById("misalignmentResult");
      if (!resultSpan) return;
      const lang = document.documentElement.lang || "en";

      if (activeCols.length < 2) {
          const dict = { en: "Need >1 voice", ja: "複数の音声が必要", "zh-CN": "需要多于1个语音", "zh-TW": "需要多於1個語音", es: "Se necesita >1 voz" };
          resultSpan.textContent = dict[lang] || dict.en;
          resultSpan.style.color = "var(--text-color)";
          return;
      }

      let lineCountsMatch = true;
      let firstCount = nonEmptyCounts[activeCols[0]];
      for (let i = 1; i < activeCols.length; i++) {
          if (nonEmptyCounts[activeCols[i]] !== firstCount) {
              lineCountsMatch = false;
              break;
          }
      }

      if (lineCountsMatch) {
          const dict = { en: "Looks good! ✨", ja: "問題なし！ ✨", "zh-CN": "看起来不错！ ✨", "zh-TW": "看起來不錯！ ✨", es: "¡Se ve bien! ✨" };
          resultSpan.textContent = dict[lang] || dict.en;
          resultSpan.style.color = "#28a745";
          return;
      }

      const mismatchSet = new Set();
        
      function findDP(A, B) {
          const n = A.length; const m = B.length;
          if (n === 0 || m === 0) return;
          const ratio = A.reduce((s, x) => s + x.len, 0) / Math.max(1, B.reduce((s, x) => s + x.len, 0));
          
          const dp = Array.from({length: n + 1}, () => new Float32Array(m + 1));
          const bp = Array.from({length: n + 1}, () => new Uint8Array(m + 1));
          
          for (let i = 1; i <= n; i++) { dp[i][0] = dp[i-1][0] + A[i-1].len; bp[i][0] = 1; }
          for (let j = 1; j <= m; j++) { dp[0][j] = dp[0][j-1] + B[j-1].len * ratio; bp[0][j] = 2; }
          
          for (let i = 1; i <= n; i++) {
              for (let j = 1; j <= m; j++) {
                  const costMatch = dp[i-1][j-1] + Math.abs(A[i-1].len - B[j-1].len * ratio);
                  const costDel = dp[i-1][j] + A[i-1].len;
                  const costIns = dp[i][j-1] + B[j-1].len * ratio;
                  
                  if (costMatch <= costDel && costMatch <= costIns) {
                      dp[i][j] = costMatch; bp[i][j] = 3;
                  } else if (costDel <= costIns) {
                      dp[i][j] = costDel; bp[i][j] = 1;
                  } else {
                      dp[i][j] = costIns; bp[i][j] = 2;
                  }
              }
          }
          
          let i = n, j = m;
          while (i > 0 || j > 0) {
              if (bp[i][j] === 3) { i--; j--; }
              else if (bp[i][j] === 1) { mismatchSet.add(A[i-1].rowIdx); i--; }
              else if (bp[i][j] === 2) { mismatchSet.add(B[j-1].rowIdx); j--; }
          }
      }

      for (let k = 1; k < activeCols.length; k++) {
          findDP(colArrays[activeCols[0]], colArrays[activeCols[k]]);
      }
      
      const validScores = Array.from(mismatchSet).sort((a, b) => a - b);
      
      if (validScores.length === 0) {
          resultSpan.textContent = "";
          return;
      }

      const top1 = validScores[0];
      const top2 = validScores.length > 1 ? validScores[1] : null;

      const prefixDict = { en: "Check line: ", ja: "要確認：", "zh-CN": "检查行：", "zh-TW": "檢查行：", es: "Revisar línea: " };
      const prefix = prefixDict[lang] || prefixDict.en;

      if (top2) {
          resultSpan.innerHTML = `${prefix}${top1}, ${top2} <span style="cursor:pointer; display:inline-block; transition:transform 0.2s; user-select:none;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="window.autoAlignGridCols()" title="Auto-Align 🪄">🪄</span>`;
      } else {
          resultSpan.innerHTML = `${prefix}${top1} <span style="cursor:pointer; display:inline-block; transition:transform 0.2s; user-select:none;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="window.autoAlignGridCols()" title="Auto-Align 🪄">🪄</span>`;
      }
      resultSpan.style.color = "#dc3545";
  };

  window.autoAlignGridCols = () => {
      if (!els.gridEditor) return;
      const rows = Array.from(els.gridEditor.querySelectorAll('.grid-row'));
      if (rows.length === 0) return;

      const totalLengths = [0, 0, 0];
      rows.forEach(row => {
          const cells = row.querySelectorAll('.grid-cell');
          for (let c = 0; c < 3; c++) {
              if (cells[c]) totalLengths[c] += cells[c].innerText.trim().length;
          }
      });

      const activeCols = [];
      if (totalLengths[0] > 0) activeCols.push(0);
      if (totalLengths[1] > 0) activeCols.push(1);
      if (totalLengths[2] > 0) activeCols.push(2);

      if (activeCols.length !== 2) {
          showToast('Auto-Align currently requires exactly 2 active voices. 🧲');
          return;
      }

      const sourceText = rows.map(row => {
          const cells = row.querySelectorAll('.grid-cell');
          return cells[activeCols[0]] ? cells[activeCols[0]].innerText.trim() : '';
      }).join('\n\n').replace(/\n\n+/g, '\n\n');

      const targetText = rows.map(row => {
          const cells = row.querySelectorAll('.grid-cell');
          return cells[activeCols[1]] ? cells[activeCols[1]].innerText.trim() : '';
      }).join('\n\n').replace(/\n\n+/g, '\n\n');

      const overlay = document.getElementById('processingOverlay');
      const prog = document.getElementById('importProgress');
      if (overlay) overlay.style.display = 'flex';
      if (prog) prog.textContent = '0%';

      const workerCode = `
self.onmessage = function(e) {
    const { sourceText, targetText } = e.data;
    self.postMessage({ type: 'progress', percent: 10 });
    try {
        const sourceParagraphs = sourceText.replace(/\\r\\n/g, '\\n').split(/\\n\\s*\\n+/).filter(p => p.trim().length > 0);
        const targetParagraphs = targetText.replace(/\\r\\n/g, '\\n').split(/\\n\\s*\\n+/).filter(p => p.trim().length > 0);

        let alignments = [];

        if (sourceParagraphs.length === targetParagraphs.length && sourceParagraphs.length > 1) {
            for (let i = 0; i < sourceParagraphs.length; i++) {
                const percent = 10 + Math.floor((i / sourceParagraphs.length) * 85);
                self.postMessage({ type: 'progress', percent: percent });
                
                const paraAlignments = runBandedAlignment(sourceParagraphs[i], targetParagraphs[i], false);
                alignments.push(...paraAlignments);
            }
            self.postMessage({ type: 'progress', percent: 95 });
        } else {
            alignments = runBandedAlignment(sourceText, targetText, true);
        }
        
        self.postMessage({ type: 'complete', alignments: alignments });
    } catch (err) {
        self.postMessage({ type: 'error', message: err.message });
    }
};

function runBandedAlignment(sourceText, targetText, emitProgress) {
    const splitRegex = /(?<=[.!?。！？])\\s*/;
    const sourceSentences = sourceText.replace(/\\r\\n/g, '\\n').split(splitRegex).filter(s => s.trim().length > 0);
    const targetSentences = targetText.replace(/\\r\\n/g, '\\n').split(splitRegex).filter(s => s.trim().length > 0);

    const N = sourceSentences.length;
    const M = targetSentences.length;

    self.postMessage({ type: 'progress', percent: 20 });
    if (N === 0 || M === 0) return [];

    const sourceChars = sourceSentences.reduce((sum, s) => sum + s.length, 0) || 1;
    const targetChars = targetSentences.reduce((sum, s) => sum + s.length, 0) || 1;
    const C = targetChars / sourceChars;
    const ratio = M / N; 
    const BAND_RADIUS = Math.max(50, Math.floor(Math.abs(N - M) + 20)); 

    const dp = Array.from({ length: N + 1 }, () => new Map());
    dp[0].set(0, { cost: 0, prev: null, type: null });

    const penalties = { '1-1': 0, '0-1': 20, '1-0': 20, '2-1': 15, '1-2': 15, '2-2': 25 };

    function getNumbers(str) {
        const matches = str.match(/\\b\\d+(?:[,.]\\d+)*\\b/g);
        return matches ? matches : [];
    }

    const sourceNumbers = sourceSentences.map(getNumbers);
    const targetNumbers = targetSentences.map(getNumbers);

    function getCost(sLen, tLen, iArr, jArr) { 
        let cost = Math.abs(sLen * C - tLen); 
        
        let sNums = [];
        for (let idx of iArr) if (idx >= 0 && idx < N) sNums.push(...sourceNumbers[idx]);
        
        let tNums = [];
        for (let idx of jArr) if (idx >= 0 && idx < M) tNums.push(...targetNumbers[idx]);
        
        let matchCount = 0;
        for (let num of sNums) {
            const tIdx = tNums.indexOf(num);
            if (tIdx !== -1) {
                matchCount++;
                tNums.splice(tIdx, 1);
            }
        }
        
        cost -= matchCount * 100;
        return cost;
    }

    let progressCounter = 0;

    for (let i = 0; i <= N; i++) {
        if (emitProgress && progressCounter++ % 1000 === 0) {
            const percent = 20 + Math.floor((i / N) * 70);
            self.postMessage({ type: 'progress', percent: percent });
        }

        const expectedJ = Math.floor(i * ratio);
        const startJ = Math.max(0, expectedJ - BAND_RADIUS);
        const endJ = Math.min(M, expectedJ + BAND_RADIUS);

        for (let j = startJ; j <= endJ; j++) {
            if (i === 0 && j === 0) continue;

            let minCost = Infinity;
            let bestPrev = null;
            let bestType = null;

            const evaluate = (prevI, prevJ, type, sLen, tLen, iArr, jArr) => {
                if (prevI >= 0 && prevJ >= 0) {
                    const prevRow = dp[prevI];
                    if (prevRow && prevRow.has(prevJ)) {
                        const prevCost = prevRow.get(prevJ).cost;
                        if (prevCost !== Infinity) {
                            const currentCost = prevCost + getCost(sLen, tLen, iArr, jArr) + penalties[type];
                            if (currentCost < minCost) {
                                minCost = currentCost;
                                bestPrev = [prevI, prevJ];
                                bestType = type;
                            }
                        }
                    }
                }
            };

            if (i >= 1 && j >= 1) evaluate(i - 1, j - 1, '1-1', sourceSentences[i - 1].length, targetSentences[j - 1].length, [i-1], [j-1]);
            if (i >= 1)           evaluate(i - 1, j,     '1-0', sourceSentences[i - 1].length, 0, [i-1], []);
            if (j >= 1)           evaluate(i,     j - 1, '0-1', 0, targetSentences[j - 1].length, [], [j-1]);
            if (i >= 2 && j >= 1) evaluate(i - 2, j - 1, '2-1', sourceSentences[i - 1].length + sourceSentences[i - 2].length, targetSentences[j - 1].length, [i-1, i-2], [j-1]);
            if (i >= 1 && j >= 2) evaluate(i - 1, j - 2, '1-2', sourceSentences[i - 1].length, targetSentences[j - 1].length + targetSentences[j - 2].length, [i-1], [j-1, j-2]);
            if (i >= 2 && j >= 2) evaluate(i - 2, j - 2, '2-2', sourceSentences[i - 1].length + sourceSentences[i - 2].length, targetSentences[j - 1].length + targetSentences[j - 2].length, [i-1, i-2], [j-1, j-2]);

            if (minCost !== Infinity) dp[i].set(j, { cost: minCost, prev: bestPrev, type: bestType });
        }
    }

    if (emitProgress) self.postMessage({ type: 'progress', percent: 95 });

    const alignments = [];
    let currI = N;
    let currJ = M;
    
    if (!dp[N].has(M)) {
        let bestCost = Infinity;
        for (const [j, cell] of dp[N].entries()) {
            if (cell.cost < bestCost) { bestCost = cell.cost; currJ = j; }
        }
    }

    while (currI > 0 || currJ > 0) {
        const row = dp[currI];
        if (!row || !row.has(currJ)) { currI--; currJ--; continue; }

        const cell = row.get(currJ);
        const type = cell.type;
        const prev = cell.prev;

        if (!prev) break;

        let sourcePart = [];
        let targetPart = [];

        if (type === '1-1') {
            sourcePart.push(sourceSentences[currI - 1]); targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '1-0') {
            sourcePart.push(sourceSentences[currI - 1]);
        } else if (type === '0-1') {
            targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '2-1') {
            sourcePart.push(sourceSentences[currI - 2], sourceSentences[currI - 1]); targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '1-2') {
            sourcePart.push(sourceSentences[currI - 1]); targetPart.push(targetSentences[currJ - 2], targetSentences[currJ - 1]);
        } else if (type === '2-2') {
            sourcePart.push(sourceSentences[currI - 2], sourceSentences[currI - 1]); targetPart.push(targetSentences[currJ - 2], targetSentences[currJ - 1]);
        }

        alignments.unshift({ source: sourcePart.join(' '), target: targetPart.join(' ') });
        currI = prev[0]; currJ = prev[1];
    }
    return alignments;
}
`;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = function(e) {
          if (e.data.type === 'progress') {
              if (prog) prog.textContent = e.data.percent + '%';
          } else if (e.data.type === 'complete') {
              if (overlay) overlay.style.display = 'none';
              
              captureGridSnapshot();
              els.gridEditor.innerHTML = '';
              
              e.data.alignments.forEach(item => {
                  const rowData = ['', '', ''];
                  rowData[activeCols[0]] = item.source || '';
                  rowData[activeCols[1]] = item.target || '';
                  els.gridEditor.appendChild(createGridRow(rowData[0], rowData[1], rowData[2]));
              });
              
              captureGridSnapshot();
              saveSettingsImmediate();
              window.findMisalignment();
              
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
              showToast('Auto-Aligned successfully! ✨');
          } else if (e.data.type === 'error') {
              if (overlay) overlay.style.display = 'none';
              showToast('Aligner error: ' + e.data.message);
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
          }
      };

      worker.postMessage({ sourceText, targetText });
  };

  window.clearGridColumn = (colIndex) => {
      if (!els.gridEditor) return;
      
      // Save current state for the Undo button
      const currentData = [];
      Array.from(els.gridEditor.querySelectorAll(".grid-row")).forEach(row => {
          const cells = row.querySelectorAll(".grid-cell");
          currentData.push({
              t1: cells[0] ? cells[0].textContent : "",
              t2: cells[1] ? cells[1].textContent : "",
              t3: cells[2] ? cells[2].textContent : ""
          });
      });
      lastGridData = currentData;
      
      const rows = Array.from(els.gridEditor.querySelectorAll(".grid-row"));
      rows.forEach(row => {
          const cells = row.querySelectorAll(".grid-cell");
          if (cells[colIndex]) {
              cells[colIndex].textContent = "";
          }
      });
      saveSettings();
      showToast(`🗑️ Voice ${colIndex + 1} cleared (Undo available)`);
  };

  window.openBulkTextModal = (e, colIndex) => {
      e.preventDefault(); // Stop normal right-click menu
      if (!els.gridEditor) return;
      
      const rows = Array.from(els.gridEditor.querySelectorAll(".grid-row"));
      const textToCopy = rows.map(row => {
          const cells = row.querySelectorAll(".grid-cell");
          return cells[colIndex] ? cells[colIndex].textContent : "";
      }).join("\n");

      const modal = document.getElementById('bulkTextModal');
      const textarea = document.getElementById('bulkTextContent');
      
      textarea.value = textToCopy;
      modal.style.display = 'flex';
      
      // Select the text instantly
      textarea.select();
      // For mobile/some browsers, explicit selection range is needed
      textarea.setSelectionRange(0, 99999);
  };

  window.generateIpa = async () => {
      if (!els.gridEditor) return;
      
      const btn = document.getElementById("generateIpaBtn");
      const originalText = btn.innerHTML;
      
      // Determine which column to pull from
      let sourceCol = 0;
      let targetLang = "ru"; // Default

      if (voices.length > 0) {
          const v2Voice = voices.find(v => `${v.name} (${v.lang})` === els.v2.value);
          const isRu2 = v2Voice && v2Voice.lang.toLowerCase().startsWith("ru");
          const isAr2 = v2Voice && v2Voice.lang.toLowerCase().startsWith("ar");
          const isEn2 = v2Voice && v2Voice.lang.toLowerCase().startsWith("en");

          if (isRu2) { sourceCol = 1; targetLang = "ru"; }
          else if (isAr2) { sourceCol = 1; targetLang = "ar"; }
          else if (isEn2) { sourceCol = 1; targetLang = "en"; }
      }

      const rows = Array.from(els.gridEditor.querySelectorAll(".grid-row"));
      const texts = rows.map(row => {
          const cells = row.querySelectorAll(".grid-cell");
          return cells[sourceCol] ? cells[sourceCol].textContent.trim() : "";
      });
      
      const hasContent = texts.some(t => t.length > 0);
      if (!hasContent) {
          alert(`Please paste some text into Voice ${sourceCol + 1} first!`);
          return;
      }

      // Set loading state
      btn.innerHTML = "⏳ Generating...";
      btn.disabled = true;
      btn.style.opacity = "0.7";

      try {
          if (targetLang === 'en' && window.ingglishTranslate) {
              // Generate English IPA completely offline via the CDN library
              const ipaRows = await Promise.all(texts.map(async (text) => {
                  if (!text.trim()) return "";
                  try {
                      return await window.ingglishTranslate(text, { format: 'ipa' });
                  } catch (e) {
                      console.error("Ingglish translation error on:", text, e);
                      return text;
                  }
              }));
              
              rows.forEach((row, index) => {
                  const cells = row.querySelectorAll(".grid-cell");
                  if (cells[2] && ipaRows[index] !== undefined) {
                      cells[2].textContent = ipaRows[index];
                  }
              });
              saveSettings();
              showToast("✨ IPA Generated Locally!");
          } else {
              // Arabic and Russian still use the Python API
              const response = await fetch("https://codeswitchreader-api-539648342659.europe-west1.run.app/generate-ipa", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: texts.join("\n"), lang: targetLang })
              });

              if (!response.ok) {
                  throw new Error(`Server responded with status ${response.status}`);
              }

              const data = await response.json();
              
              if (data.error) {
                  throw new Error(data.error);
              }

              if (data.ipa) {
                  const ipaRows = data.ipa.split("\n");
                  rows.forEach((row, index) => {
                      const cells = row.querySelectorAll(".grid-cell");
                      if (cells[2] && ipaRows[index] !== undefined) {
                          cells[2].textContent = ipaRows[index];
                      }
                  });
                  saveSettings(); // Save the grid state
                  showToast("✨ IPA Generated Successfully!");
              }
          }

      } catch (err) {
          console.error("API Error:", err);
          alert("Failed to connect to the IPA server. Check console for details.");
      } finally {
          // Restore button state
          btn.innerHTML = originalText;
          btn.disabled = false;
          btn.style.opacity = "1";
      }
  };

    window.downloadText = async () => {
      const text = document.getElementById("textInput").value; if (!text.trim()) { alert("No text"); return; }
      const blob = new Blob([text], { type: "text/plain" }); 
      const suggestedName = "cole_study_session.txt";
      
      try {
          if (window.showSaveFilePicker) {
              const handle = await window.showSaveFilePicker({
                  suggestedName,
                  id: 'cole_study_session_txt',
                  types: [{ description: 'Text File', accept: {'text/plain': ['.txt']} }]
              });
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              return;
          }
      } catch (err) {
          if (err.name !== 'AbortError') console.error(err);
          return;
      }
      
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = suggestedName;
      a.click();
      // Free up memory by revoking the object URL
      URL.revokeObjectURL(url);
    };

    setLoopUI(); updatePauseUI();

    els.zen = document.getElementById("zenBtn");
    function toggleZen() {
      document.body.classList.toggle("zen-mode");
      if(document.body.classList.contains("zen-mode")){ 
          els.zen.style.borderColor = "var(--accent)"; 
          els.zen.style.color = "var(--accent)"; 
          // Force close sidebar when entering zen mode
          if (typeof window.toggleResourcesDrawer === 'function') {
              const drawer = document.getElementById('resourcesDrawer');
              if (drawer && drawer.classList.contains('open')) {
                  window.toggleResourcesDrawer();
              }
          }
      }
      else { els.zen.style.borderColor = ""; els.zen.style.color = ""; }
    }
    els.zen.addEventListener("click", toggleZen);

    const langSelect = document.getElementById("langSelect");

    langSelect.addEventListener("change", (e) => {
        state.lang = e.target.value;
        applyTranslation(e.target.value);
        saveSettings(); // Now it has access to saveSettings!
    });

    // Run on startup
    // --- AI Context Engine ---
    let aiSummaries = { 0: null, 1: null, 2: null };
    let aiTexts = { 0: "", 1: "", 2: "" };
    let aiEnabledCols = { 0: false, 1: false, 2: false };
    
    window.kickoffAiSummaries = async function() {
        for (let i = 0; i < 3; i++) {
            const toggle = document.getElementById(`aiToggle${i}`);
            aiEnabledCols[i] = toggle && toggle.checked;
        }
        if (!Object.values(aiEnabledCols).some(v => v)) {
            console.log("AI Context: No columns have the AI toggle enabled.");
            return;
        }

        let colTexts = { 0: [], 1: [], 2: [] };
        
        if (state.editorMode === "grid" && state.gridData) {
            state.gridData.forEach(r => {
                if (aiEnabledCols[0] && r.t1 && r.t1.trim()) colTexts[0].push(r.t1.trim());
                if (aiEnabledCols[1] && r.t2 && r.t2.trim()) colTexts[1].push(r.t2.trim());
                if (aiEnabledCols[2] && r.t3 && r.t3.trim()) colTexts[2].push(r.t3.trim());
            });
        } else if (state.editorMode === "vertical" && state.verticalData) {
            state.verticalData.forEach(r => {
                let v = parseInt(r.voice);
                if (v >= 1 && v <= 3 && aiEnabledCols[v - 1] && r.text && r.text.trim()) {
                    colTexts[v - 1].push(r.text.trim());
                }
            });
        }
        
        for (let i = 0; i < 3; i++) {
            if (!aiEnabledCols[i]) continue;
            let fullText = colTexts[i].join(" ");
            if (!fullText) continue;
            
            // Smart Caching: Only re-summarize if the text has actually changed
            if (aiTexts[i] === fullText && aiSummaries[i]) {
                console.log(`AI Context (Col ${i}): Summary already cached in memory. Skipping API call.`);
                continue;
            }
            
            aiTexts[i] = fullText;
            aiSummaries[i] = null; // Reset summary since text changed
            
            let wordCount = fullText.split(/\s+/).length;
            if (wordCount > 450) {
                console.log(`AI Context (Col ${i}): Text is ${wordCount} words (>450). Fetching background summary...`);
                fetchGeminiSummary(i, fullText);
            } else {
                console.log(`AI Context (Col ${i}): Text is ${wordCount} words (<=450). Storing full text as summary. No API call needed.`);
                aiSummaries[i] = fullText;
            }
        }
    };

    async function getGeminiApiKey() {
        let key = localStorage.getItem("geminiApiKey");
        if (!key) {
            key = prompt("Please enter your Google Gemini API Key to use the AI Explanation feature.\n(This is stored locally in your browser)");
            if (key) localStorage.setItem("geminiApiKey", key);
        }
        return key;
    }

    async function fetchGeminiSummary(colIndex, text) {
        const apiKey = await getGeminiApiKey();
        if (!apiKey) return;
        
        const promptText = `Please provide a concise 150-300 word summary of the following text to serve as global context. Do not include any pleasantries or conversational filler, just the summary itself. Keep in mind that it could be an auto caption transcript that involves multiple people and incorrect capturing. Infer the best as you can. \n\nText:\n${text}`;
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    systemInstruction: { parts: [{ text: "You are an expert summarizer." }]}
                })
            });
            const data = await res.json();
            if (data.candidates && data.candidates[0]) {
                aiSummaries[colIndex] = data.candidates[0].content.parts[0].text;
                console.log(`AI Summary for Column ${colIndex} ready.`);
            }
        } catch (e) {
            console.error("Failed to fetch AI summary", e);
        }
    }

    let currentAiData = { explain: '', examples: '' };

    window.switchAiTab = function(tabName) {
        document.getElementById('aiTabExplain').style.opacity = tabName === 'explain' ? '1' : '0.7';
        document.getElementById('aiTabExplain').style.borderBottom = tabName === 'explain' ? '2px solid var(--accent)' : 'none';
        document.getElementById('aiTabExamples').style.opacity = tabName === 'examples' ? '1' : '0.7';
        document.getElementById('aiTabExamples').style.borderBottom = tabName === 'examples' ? '2px solid var(--accent)' : 'none';
        
        const contentDiv = document.getElementById('aiModalContent');
        if (tabName === 'explain') {
            contentDiv.innerHTML = currentAiData.explain || "No explanation available.";
        } else {
            contentDiv.innerHTML = currentAiData.examples || "No examples available.";
        }
    };

    window.setAiLanguage = function() {
        let currentLang = localStorage.getItem("aiLanguage") || "English";
        let newLang = prompt("What language should the AI use for explanations and translations?", currentLang);
        if (newLang !== null && newLang.trim() !== "") {
            localStorage.setItem("aiLanguage", newLang.trim());
            alert(`AI Explanation Language set to: ${newLang.trim()}`);
        }
    };

    function injectRubyTags(htmlString, targetLang) {
        // Create a temporary DOM element to parse the HTML safely
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;
        
        // We only want to process text nodes, not tags or attributes
        const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
        const nodesToProcess = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.trim().length > 0) {
                nodesToProcess.push(node);
            }
        }
        
        const loc = (targetLang || "en").toLowerCase();
        const isChinese = loc.startsWith("zh") || loc.startsWith("yue") || loc.includes("-hk") || loc.includes("-mo") || loc.includes("macau");
        const isCantonese = loc.startsWith("yue") || loc.includes("-hk") || loc.includes("-mo") || loc.includes("macau");
        const isJapanese = loc.startsWith("ja");
        
        // If neither Japanese nor Chinese dictionaries are loaded or appropriate, just return the original HTML
        if (!((isJapanese && jpTokenizer) || (isChinese && (window.pinyinPro || window.ToJyutping)))) {
            return htmlString;
        }

        nodesToProcess.forEach(textNode => {
            const text = textNode.nodeValue;
            const fragment = document.createDocumentFragment();
            
            if (isJapanese && jpTokenizer) {
                const tokens = jpTokenizer.tokenize(text);
                tokens.forEach(token => {
                    const s = token.surface_form;
                    if (token.reading && token.reading !== "*" && s.match(/[\u4e00-\u9faf]/)) {
                        // Very simple Katakana to Hiragana conversion for Furigana
                        const hiragana = token.reading.replace(/[\u30a1-\u30f6]/g, function(match) {
                            return String.fromCharCode(match.charCodeAt(0) - 0x60);
                        });
                        const ruby = document.createElement("ruby");
                        ruby.textContent = s;
                        const rt = document.createElement("rt");
                        rt.textContent = hiragana;
                        // Match the main app's styling for rt, but tweaked for the popup
                        rt.style.color = "var(--accent)";
                        rt.style.fontSize = "0.7em";
                        ruby.appendChild(rt);
                        fragment.appendChild(ruby);
                    } else {
                        fragment.appendChild(document.createTextNode(s));
                    }
                });
            } else if (isChinese) {
                const seg = getWordSegmenter(loc);
                if (seg) {
                    const segments = seg.segment(text);
                    for (const part of segments) {
                        const s = part.segment;
                        if (part.isWordLike && /[\u4e00-\u9fa5]/.test(s)) {
                            let reading = null;
                            if (isCantonese && els.chkJyutping.checked && window.ToJyutping) {
                                reading = window.ToJyutping.getJyutpingText(s);
                            } else if (!isCantonese && els.chkPinyin.checked && window.pinyinPro) {
                                reading = window.pinyinPro.pinyin(s, { type: 'string' });
                            }
                            
                            if (reading) {
                                const ruby = document.createElement("ruby");
                                ruby.textContent = s;
                                const rt = document.createElement("rt");
                                rt.textContent = reading;
                                rt.style.color = "var(--accent)";
                                rt.style.fontSize = "0.7em";
                                ruby.appendChild(rt);
                                fragment.appendChild(ruby);
                            } else {
                                fragment.appendChild(document.createTextNode(s));
                            }
                        } else {
                            fragment.appendChild(document.createTextNode(s));
                        }
                    }
                } else {
                    fragment.appendChild(document.createTextNode(text));
                }
            } else {
                fragment.appendChild(document.createTextNode(text));
            }
            
            textNode.parentNode.replaceChild(fragment, textNode);
        });
        
        return tempDiv.innerHTML;
    }

    window.triggerAiModal = async function(word, wordNode, trackIdx, container) {
        const apiKey = await getGeminiApiKey();
        if (!apiKey) {
            document.getElementById(`aiToggle${trackIdx}`).checked = false;
            return;
        }

        const modal = document.getElementById('aiModal');
        const titleWord = document.getElementById('aiModalWord');
        const titleTrans = document.getElementById('aiModalTranslation');
        const contentDiv = document.getElementById('aiModalContent');
        
        modal.style.display = 'flex';
        
        // Robustly extract the reading (Furigana/Pinyin/IPA) if it exists on the word
        let readingText = "";
        const rtNodes = wordNode.querySelectorAll('rt');
        if (rtNodes.length > 0) {
            readingText = Array.from(rtNodes).map(n => n.textContent).join("");
        }

        // Render the word and its reading cleanly using flexbox instead of native <ruby> (which can break in flex headers)
        if (readingText) {
            titleWord.innerHTML = `<div style="display:flex; flex-direction:column; align-items:flex-start; line-height:1.1; gap:2px;">
                <span style="font-size:0.7em; font-weight:normal; color:rgba(255,255,255,0.85);">${readingText}</span>
                <span>${word}</span>
            </div>`;
        } else {
            titleWord.textContent = word;
        }
        
        titleTrans.textContent = "Loading translation...";
        contentDiv.innerHTML = `<span style="opacity:0.7;">Reading context...</span>`;
        currentAiData = { explain: 'Loading...', examples: 'Loading...' };
        switchAiTab('explain');
        
        const rect = wordNode.getBoundingClientRect();
        let top = rect.bottom + window.scrollY + 10;
        let left = rect.left + window.scrollX - 20;
        
        if (left + 340 > window.innerWidth) left = window.innerWidth - 350;
        if (left < 10) left = 10;
        if (top + 300 > window.innerHeight + window.scrollY) {
            top = rect.top + window.scrollY - 310;
        }
        
        modal.style.top = `${top - window.scrollY}px`;
        modal.style.left = `${left}px`;
        
        let localSentences = [];
        const trackSegments = segments.filter(s => s.typeIndex === trackIdx);
        const currentIndex = trackSegments.findIndex(s => s.container === container);
        
        let isFullTextSummary = (aiSummaries[trackIdx] && aiTexts[trackIdx] && aiSummaries[trackIdx] === aiTexts[trackIdx]);
        let summaryText = aiSummaries[trackIdx] || "(No background summary available. Please infer from local context only.)";
        let localContextStr = "";

        if (currentIndex !== -1) {
            if (isFullTextSummary) {
                // If the summary is the full text, inject the marker directly and skip the redundant local context block
                let fullTextWithMarker = [];
                for (let i = 0; i < trackSegments.length; i++) {
                    let prefix = (i === currentIndex) ? ">>[TARGET SENTENCE]<< " : "";
                    fullTextWithMarker.push(prefix + trackSegments[i].text);
                }
                summaryText = fullTextWithMarker.join(" ");
            } else {
                // Regular 7-sentence zoom window
                let start = currentIndex - 3;
                let end = currentIndex + 3;
                
                // Shift the 7-sentence window if we hit the beginning or end of the text
                if (start < 0) { end += Math.abs(start); start = 0; }
                if (end > trackSegments.length - 1) { start -= (end - (trackSegments.length - 1)); end = trackSegments.length - 1; }
                start = Math.max(0, start); // Failsafe if total text is less than 7 sentences
                
                for (let i = start; i <= end; i++) {
                    let prefix = (i === currentIndex) ? ">>[TARGET SENTENCE]<< " : "";
                    localSentences.push(prefix + trackSegments[i].text);
                }
                localContextStr = `### Local Context (Up to 7 sentences):\n${localSentences.join("\n")}\n\n`;
            }
        }
        
        const targetLang = localStorage.getItem("aiLanguage") || "English";
        const translationInstruction = `Provide all explanations and example translations in ${targetLang}. If the source language and ${targetLang} are the same, provide explanations in simpler ${targetLang} acting as a monoligual dictionary and skip the translations.`;

        const prompt = `You are a helpful language learning assistant.
The user clicked on the word/phrase: "${word}".

### Global Story Summary:
${summaryText}

${localContextStr}### Task:
${translationInstruction}
1. Provide a brief, literal meaning of "${word}".
2. Explain its grammatical role and meaning *specifically within the [TARGET SENTENCE]*, considering the global context. Keep the explanation concise and easy to read.
3. Provide 3 short example sentences using "${word}" in a similar context or meaning, along with their translations (following the instruction above).
Keep in mind that the text can be an auto caption transcipt with incorrect captioning. Infer the best that you can.

CRITICAL INSTRUCTION: You MUST output ONLY a single, valid JSON object. Your entire response must start with { and end with }.

Format the response exactly like this JSON object:
{
  "translation": "short literal translation",
  "explainHtml": "HTML formatted explanation (use <p>, <strong>, etc. don't use markdown headers, just simple styling. Avoid overly verbose text)",
  "examplesHtml": "HTML formatted numbered list of 3 examples (use <ol><li><strong>Example:</strong> Translation</li>...)"
}`;

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });
            const data = await res.json();
            if (data.candidates && data.candidates[0]) {
                let responseText = data.candidates[0].content.parts[0].text;
                let parsed = null;
                
                // Try to aggressively extract JSON in case the model added conversational filler
                let jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsed = JSON.parse(jsonMatch[0]);
                    } catch(e) {
                        console.warn("Extracted JSON was invalid", e);
                    }
                }
                
                if (parsed && parsed.translation) {
                    // Valid JSON extracted
                    // Determine language for pronunciation mapping based on the track's voice
                    const trackInput = [els.v1, els.v2, els.v3][trackIdx];
                    const targetName = trackInput ? trackInput.value : "";
                    let voice = voices.find(v => `${v.name} (${v.lang})` === targetName);
                    const langHint = voice ? voice.lang : "en";

                    titleTrans.textContent = parsed.translation;
                    currentAiData.explain = injectRubyTags(parsed.explainHtml || "No explanation.", langHint);
                    currentAiData.examples = injectRubyTags(parsed.examplesHtml || "No examples.", langHint);
                } else {
                    // Fallback: The model just gave us raw text instead of JSON
                    console.warn("Gemma refused to output valid JSON. Falling back to raw text renderer.");
                    titleTrans.textContent = "AI Explanation";
                    
                    // Determine language for pronunciation mapping based on the track's voice
                    const trackInput = [els.v1, els.v2, els.v3][trackIdx];
                    const targetName = trackInput ? trackInput.value : "";
                    let voice = voices.find(v => `${v.name} (${v.lang})` === targetName);
                    const langHint = voice ? voice.lang : "en";
                    
                    // Simple markdown-ish conversion to HTML for the raw text
                    let rawHtml = responseText
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>');
                        
                    currentAiData.explain = `<div style="font-family: monospace; white-space: pre-wrap;">${injectRubyTags(rawHtml, langHint)}</div>`;
                    currentAiData.examples = "<em>(Examples were not formatted correctly by the model. Please check the Explain tab.)</em>";
                }
                
                switchAiTab(document.getElementById('aiTabExplain').style.opacity === '1' ? 'explain' : 'examples');
            } else {
                contentDiv.innerHTML = `<span style="color:red;">Failed to get AI explanation.</span>`;
            }
        } catch (e) {
            console.error("AI Modal Error", e);
            contentDiv.innerHTML = `<span style="color:red;">Error fetching data. Check your API key and connection.</span>`;
        }
    };

    setTimeout(() => {
       if (state.lang) {
           langSelect.value = state.lang;
           applyTranslation(state.lang);
       } else {
           applyTranslation("en");
       }
    }, 100);

  })();
