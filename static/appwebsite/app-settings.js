(function (global) {
  'use strict'

  var supportedLocales = [
    'ar', 'cn', 'da', 'de', 'en', 'es', 'fa', 'fil', 'fr', 'hi', 'hu', 'in', 'it',
    'ja', 'ko', 'ms', 'nl', 'pl', 'pt', 'ru', 'sk', 'th', 'tr', 'tw', 'uk', 'vi',
  ]
  var localeLookup = supportedLocales.reduce(function (result, locale) {
    result[locale] = true
    return result
  }, {})
  var localeAliases = {
    zh: 'cn',
    'zh-cn': 'cn',
    'zh-sg': 'cn',
    'zh-hans': 'cn',
    'zh-chs': 'cn',
    'zh-tw': 'tw',
    'zh-hk': 'tw',
    'zh-mo': 'tw',
    'zh-hant': 'tw',
    'zh-cht': 'tw',
    id: 'in',
    'id-id': 'in',
    tl: 'fil',
  }

  function isAndroidWebView() {
    var userAgent = global.navigator && global.navigator.userAgent ? global.navigator.userAgent : ''
    return /Android/i.test(userAgent) && (/;\s*wv\)/i.test(userAgent) || /\bwv\b/i.test(userAgent) || /Version\/4\.0/i.test(userAgent))
  }

  function isChromeBrowser() {
    var userAgent = global.navigator && global.navigator.userAgent ? global.navigator.userAgent : ''
    return /(?:Chrome|CriOS)\//i.test(userAgent) && !/(?:Edg|OPR)\//i.test(userAgent)
  }

  function normalizeLocale(value) {
    if (typeof value !== 'string' || !value.trim()) return null
    var normalized = value.trim().replace(/_/g, '-').toLowerCase()
    if (localeAliases[normalized]) return localeAliases[normalized]
    if (localeLookup[normalized]) return normalized
    var base = normalized.split('-')[0]
    return localeAliases[base] || (localeLookup[base] ? base : null)
  }

  function normalizeTheme(value) {
    if (typeof value !== 'string') return null
    var normalized = value.trim().toLowerCase()
    if (normalized === 'dark') return 'dark'
    if (normalized === 'light') return 'light'
    return null
  }

  function readQuery(names) {
    try {
      var params = new URLSearchParams(global.location.search)
      for (var index = 0; index < names.length; index += 1) {
        var value = params.get(names[index])
        if (value !== null && value !== '') return value
      }
    } catch (_) {
      // Query parameters are optional in restricted WebView environments.
    }
    return null
  }

  function readNavigatorLocale() {
    if (!global.navigator) return null
    var candidates = [global.navigator.language]
    if (global.navigator.languages && global.navigator.languages.length) {
      candidates = candidates.concat(global.navigator.languages)
    }
    for (var index = 0; index < candidates.length; index += 1) {
      var locale = normalizeLocale(candidates[index])
      if (locale) return locale
    }
    return null
  }

  function readPreferredTheme() {
    try {
      return global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch (_) {
      return 'light'
    }
  }

  function getLocale() {
    // An Android WebView's own locale is authoritative and needs no JS bridge.
    if (isAndroidWebView()) return readNavigatorLocale()
    var explicitLocale = normalizeLocale(readQuery(['lang', 'locale', 'language']))
    if (explicitLocale) return explicitLocale
    return isChromeBrowser() ? readNavigatorLocale() : null
  }

  function getTheme() {
    // Android WebView exposes its current theme through prefers-color-scheme.
    if (isAndroidWebView()) return readPreferredTheme()
    return normalizeTheme(readQuery(['theme', 'mode'])) || readPreferredTheme()
  }

  function applyTheme() {
    var theme = getTheme()
    global.document.documentElement.dataset.theme = theme
    global.document.documentElement.style.colorScheme = theme
    return theme
  }

  function notify() {
    var detail = { locale: getLocale(), theme: getTheme() }
    try {
      global.dispatchEvent(new CustomEvent('vidtak-app-settings', { detail: detail }))
    } catch (_) {
      var event = global.document.createEvent('CustomEvent')
      event.initCustomEvent('vidtak-app-settings', false, false, detail)
      global.dispatchEvent(event)
    }
  }

  function subscribe(listener) {
    global.addEventListener('vidtak-app-settings', listener)
    return function () {
      global.removeEventListener('vidtak-app-settings', listener)
    }
  }

  global.VidTakAppSettings = {
    getLocale: getLocale,
    getTheme: getTheme,
    applyTheme: applyTheme,
    isAndroidWebView: isAndroidWebView,
    isChromeBrowser: isChromeBrowser,
    normalizeLocale: normalizeLocale,
    normalizeTheme: normalizeTheme,
    subscribe: subscribe,
  }

  global.addEventListener('languagechange', notify)
  var preferredTheme = global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)')
  if (preferredTheme) {
    if (preferredTheme.addEventListener) preferredTheme.addEventListener('change', notify)
    else if (preferredTheme.addListener) preferredTheme.addListener(notify)
  }
  global.document.addEventListener('visibilitychange', function () {
    if (global.document.visibilityState !== 'hidden') notify()
  })
})(window)
