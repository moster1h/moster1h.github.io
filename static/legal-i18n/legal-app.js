(function () {
  'use strict'

  var catalog = window.VIDTAK_LEGAL_CATALOG || {}
  var navigation = window.VIDTAK_LEGAL_NAVIGATION || { locales: [], documents: [], labels: {} }
  var body = document.body
  var appDirectory = body.getAttribute('data-app')
  var appName = body.getAttribute('data-app-name')
  var initialLocale = body.getAttribute('data-locale') || 'en'
  var documentFile = body.getAttribute('data-document')
  var appSettings = window.VidTakAppSettings || null
  var applicationTheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null

  function legalHref(locale, file, setLocaleQuery) {
    var target = new URL('/' + appDirectory + '/' + locale + '/' + file, window.location.origin)
    var current = new URL(window.location.href)
    current.searchParams.forEach(function (value, key) {
      target.searchParams.append(key, value)
    })
    target.hash = current.hash

    if (setLocaleQuery) {
      target.searchParams.delete('locale')
      target.searchParams.delete('language')
      target.searchParams.delete('appLanguage')
      target.searchParams.set('lang', locale)
    }
    return target.pathname + target.search + target.hash
  }

  var applicationLocale = appSettings && appSettings.getLocale()
  if (applicationLocale && catalog[applicationLocale] && applicationLocale !== initialLocale) {
    window.location.replace(legalHref(applicationLocale, documentFile, false))
    return
  }

  var uiMessages = {
    en: { language: 'Language', documents: 'Legal documents', fallback: 'This translation is not available yet. The English source is displayed.' },
    nl: { language: 'Taal', documents: 'Juridische documenten', fallback: 'Deze vertaling is nog niet beschikbaar. De Engelse brontekst wordt weergegeven.' },
    da: { language: 'Sprog', documents: 'Juridiske dokumenter', fallback: 'Denne oversættelse er ikke tilgængelig endnu. Den engelske kildetekst vises.' },
    de: { language: 'Sprache', documents: 'Rechtliche Dokumente', fallback: 'Diese Übersetzung ist noch nicht verfügbar. Der englische Ausgangstext wird angezeigt.' },
    es: { language: 'Idioma', documents: 'Documentos legales', fallback: 'Esta traducción aún no está disponible. Se muestra el texto original en inglés.' },
    pt: { language: 'Idioma', documents: 'Documentos legais', fallback: 'Esta tradução ainda não está disponível. É apresentado o texto original em inglês.' },
    fr: { language: 'Langue', documents: 'Documents juridiques', fallback: "Cette traduction n’est pas encore disponible. Le texte source anglais est affiché." },
    it: { language: 'Lingua', documents: 'Documenti legali', fallback: 'Questa traduzione non è ancora disponibile. Viene mostrato il testo originale in inglese.' },
    fil: { language: 'Wika', documents: 'Mga legal na dokumento', fallback: 'Hindi pa available ang salin na ito. Ipinapakita ang English na source.' },
    in: { language: 'Bahasa', documents: 'Dokumen hukum', fallback: 'Terjemahan ini belum tersedia. Teks sumber bahasa Inggris ditampilkan.' },
    ms: { language: 'Bahasa', documents: 'Dokumen undang-undang', fallback: 'Terjemahan ini belum tersedia. Teks sumber bahasa Inggeris dipaparkan.' },
    vi: { language: 'Ngôn ngữ', documents: 'Tài liệu pháp lý', fallback: 'Bản dịch này chưa có. Nội dung gốc bằng tiếng Anh đang được hiển thị.' },
    tr: { language: 'Dil', documents: 'Yasal belgeler', fallback: 'Bu çeviri henüz mevcut değil. İngilizce kaynak metin gösteriliyor.' },
    pl: { language: 'Język', documents: 'Dokumenty prawne', fallback: 'To tłumaczenie nie jest jeszcze dostępne. Wyświetlany jest angielski tekst źródłowy.' },
    sk: { language: 'Jazyk', documents: 'Právne dokumenty', fallback: 'Tento preklad zatiaľ nie je k dispozícii. Zobrazuje sa anglický zdrojový text.' },
    ru: { language: 'Язык', documents: 'Правовые документы', fallback: 'Этот перевод пока недоступен. Показан исходный текст на английском языке.' },
    uk: { language: 'Мова', documents: 'Правові документи', fallback: 'Цей переклад ще недоступний. Показано англійський вихідний текст.' },
    hu: { language: 'Nyelv', documents: 'Jogi dokumentumok', fallback: 'Ez a fordítás még nem érhető el. Az angol forrásszöveg jelenik meg.' },
    hi: { language: 'भाषा', documents: 'कानूनी दस्तावेज़', fallback: 'यह अनुवाद अभी उपलब्ध नहीं है। अंग्रेज़ी स्रोत दिखाया जा रहा है।' },
    th: { language: 'ภาษา', documents: 'เอกสารทางกฎหมาย', fallback: 'ยังไม่มีคำแปลนี้ จึงแสดงต้นฉบับภาษาอังกฤษ' },
    fa: { language: 'زبان', documents: 'اسناد حقوقی', fallback: 'این ترجمه هنوز موجود نیست. متن منبع انگلیسی نمایش داده می‌شود.' },
    ar: { language: 'اللغة', documents: 'المستندات القانونية', fallback: 'هذه الترجمة غير متاحة بعد. يتم عرض النص الإنجليزي المصدر.' },
    ko: { language: '언어', documents: '법률 문서', fallback: '이 번역은 아직 제공되지 않습니다. 영어 원문이 표시됩니다.' },
    ja: { language: '言語', documents: '法的文書', fallback: 'この翻訳はまだ利用できません。英語の原文を表示しています。' },
    tw: { language: '語言', documents: '法律文件', fallback: '此翻譯尚未提供，目前顯示英文原文。' },
    cn: { language: '语言', documents: '法律文件', fallback: '该翻译尚未提供，当前显示英文原文。' },
  }

  if (!window.Vue || !window.VueI18n) {
    document.getElementById('legal-app').innerHTML = '<p class="runtime-error">Unable to load the legal document viewer.</p>'
    return
  }

  window.Vue.use(window.VueI18n)

  var i18n = new window.VueI18n({
    locale: initialLocale,
    fallbackLocale: 'en',
    messages: catalog,
    silentFallbackWarn: true,
    silentTranslationWarn: true,
  })

  new window.Vue({
    el: '#legal-app',
    i18n: i18n,
    data: function () {
      return {
        appDirectory: appDirectory,
        appName: appName,
        locale: initialLocale,
        documentFile: documentFile,
        locales: navigation.locales || [],
        theme: document.documentElement.dataset.theme || 'light',
        unsubscribeApplicationSettings: null,
      }
    },
    computed: {
      currentMessage: function () {
        var localized = this.$i18n.getLocaleMessage(this.locale)
        return localized && localized.content ? localized : this.$i18n.getLocaleMessage('en')
      },
      usesEnglishFallback: function () {
        return this.locale !== 'en' && !catalog[this.locale]
      },
      ui: function () {
        return uiMessages[this.locale] || uiMessages.en
      },
      fallbackNotice: function () {
        return this.ui.fallback
      },
      homeLink: function () {
        var target = new URL('/', window.location.origin)
        var current = new URL(window.location.href)
        current.searchParams.forEach(function (value, key) {
          target.searchParams.append(key, value)
        })
        target.searchParams.delete('locale')
        target.searchParams.delete('language')
        target.searchParams.delete('appLanguage')
        target.searchParams.set('lang', this.locale)
        return target.pathname + target.search
      },
      themeLabel: function () {
        if (this.locale === 'cn') return this.theme === 'dark' ? '使用浅色模式' : '使用深色模式'
        if (this.locale === 'tw') return this.theme === 'dark' ? '使用淺色模式' : '使用深色模式'
        return this.theme === 'dark' ? 'Use light mode' : 'Use dark mode'
      },
      documentLinks: function () {
        var labels = navigation.labels[this.locale] || navigation.labels.en || {}
        var locale = this.locale
        var directory = this.appDirectory
        return (navigation.documents || []).map(function (item) {
          return {
            file: item.file,
            label: labels[item.file] || item.key,
            href: legalHref(locale, item.file, false),
          }
        })
      },
    },
    watch: {
      currentMessage: {
        immediate: true,
        handler: function (message) {
          if (message && message.title) document.title = message.title
        },
      },
    },
    mounted: function () {
      this.syncWithApplicationTheme()
      if (applicationTheme) {
        if (applicationTheme.addEventListener) applicationTheme.addEventListener('change', this.handleApplicationTheme)
        else if (applicationTheme.addListener) applicationTheme.addListener(this.handleApplicationTheme)
      }
      document.addEventListener('visibilitychange', this.syncWithApplicationTheme)
      if (appSettings && appSettings.subscribe) {
        this.unsubscribeApplicationSettings = appSettings.subscribe(this.handleApplicationSettings)
      }
    },
    beforeDestroy: function () {
      if (applicationTheme) {
        if (applicationTheme.removeEventListener) applicationTheme.removeEventListener('change', this.handleApplicationTheme)
        else if (applicationTheme.removeListener) applicationTheme.removeListener(this.handleApplicationTheme)
      }
      document.removeEventListener('visibilitychange', this.syncWithApplicationTheme)
      if (this.unsubscribeApplicationSettings) this.unsubscribeApplicationSettings()
    },
    methods: {
      changeLocale: function (event) {
        var locale = event.target.value
        window.location.assign(legalHref(locale, this.documentFile, true))
      },
      toggleTheme: function () {
        this.theme = this.theme === 'dark' ? 'light' : 'dark'
        document.documentElement.dataset.theme = this.theme
        document.documentElement.style.colorScheme = this.theme
      },
      handleApplicationTheme: function (event) {
        this.theme = appSettings ? appSettings.getTheme() : (event.matches ? 'dark' : 'light')
        document.documentElement.dataset.theme = this.theme
        document.documentElement.style.colorScheme = this.theme
      },
      handleApplicationSettings: function () {
        var locale = appSettings && appSettings.getLocale()
        if (locale && catalog[locale] && locale !== this.locale) {
          window.location.replace(legalHref(locale, this.documentFile, true))
          return
        }
        this.syncWithApplicationTheme()
      },
      syncWithApplicationTheme: function () {
        if (document.visibilityState === 'hidden') return
        if (appSettings) {
          this.theme = appSettings.getTheme()
          document.documentElement.dataset.theme = this.theme
          document.documentElement.style.colorScheme = this.theme
        } else if (applicationTheme) {
          this.handleApplicationTheme(applicationTheme)
        }
      },
    },
  })
})()
