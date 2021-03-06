// ==UserScript==
// @name Manga OnlineViewer
// @author Tago
// @updateURL https://github.com/TagoDR/MangaOnlineViewer/raw/master/Manga_OnlineViewer.meta.js
// @downloadURL https://github.com/TagoDR/MangaOnlineViewer/raw/master/Manga_OnlineViewer.user.js
// @namespace https://github.com/TagoDR
// @description Shows all pages at once in online view for these sites: Batoto, ComiCastle, Dynasty-Scans, EatManga, Easy Going Scans, FoOlSlide, KissManga, MangaDoom, MangaFox, MangaGo, MangaHere, MangaInn, MangaLyght, MangaPark, MangaReader,MangaPanda, MangaStream, MangaTown, NineManga, ReadManga.Today, SenManga(Raw), TenManga, TheSpectrum, MangaDeep, Funmanga, UnionMangas, MangaHost
// @version 13.3.0
// @date 2017-07-12
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_listValues
// @grant GM_xmlhttpRequest
// @require https://code.jquery.com/jquery-latest.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.0.4/jscolor.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/color-scheme/1.0.0/color-scheme.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/ramda/0.24.1/ramda.min.js
// @include /https?:\/\/(www.)?bato.to\/reader.*/
// @include /https?:\/\/(www.)?comicastle.org\/comic\/.+\/[0-9]+.*/
// @include /https?:\/\/(www.)?dynasty-scans.com\/chapters\/.+/
// @include /https?:\/\/(www.)?eatmanga.me\/Manga-Scan\/.+\/.+\//
// @include /https?:\/\/read.egscans.com\/.+/
// @include /.+\/read\/.+/
// @include /https?:\/\/(www.)?kissmanga.com\/Manga\/.+\/.+?id=[0-9]+/
// @include /https?:\/\/(www.)?mangadoom.co\/.+\/[0-9]+/
// @include /https?:\/\/(www.)?mangafox.me\/manga\/.+\/.+\//
// @include /https?:\/\/(www.)?mangago.me\/read-manga\/.+\/.+/
// @include /https?:\/\/(www.)?mangahere.co\/manga\/.+\/.+/
// @include /https?:\/\/(www.)?mangainn.net\/manga\/chapter\/.+/
// @include /https?:\/\/manga.lyght.net\/series\/.+\.html/
// @include /https?:\/\/(www.)?mangapark.me\/manga\/.+\/.+/
// @include /https?:\/\/(www.)?(mangareader|mangapanda)(.net|.com)\/.+\/.+/
// @include /https?:\/\/(www.)?(mangastream|readms)(.net|.com)\/r.*\/.+/
// @include /https?:\/\/(www.)?mangatown.com\/manga\/.+\/.+/
// @include /https?:\/\/(www.)?ninemanga.com\/chapter\/.+\/.+\.html/
// @include /https?:\/\/(www.)?readmanga.today\/.+\/[0-9]+/
// @include /https?:\/\/raw.senmanga.com\/.+\/.+\/?/
// @include /https?:\/\/(www.)?tenmanga.com\/chapter\/.+/
// @include /https?:\/\/view.thespectrum.net\/.+/
// @include /https?:\/\/(www.)?(mangadeep).com\/.+\/[0-9]+/
// @include /https?:\/\/(www.)?funmanga.com\/.+\/[0-9]+/
// @include /http?:\/\/unionmangas.net\/leitor\/.+\/.+/
// @include /https?:\/\/mangahost.net\/manga\/.+\/.+/
// @exclude /https?:\/\/(www.)?tsumino.com\/.+/
// @exclude /https?:\/\/(www.)?pururin.us\/.+/
// ==/UserScript==

(function() {
  'use strict';

  var W = (typeof unsafeWindow === undefined) ? window : unsafeWindow;

  function logScript(...text) {
    console.log('MangaOnlineViewer:', ...text);
    return text;
  }
  const logScriptC = R.curry((x, y) => logScript(x, y)[1]);
  const getInfoGM = GM_info || {
    scriptHandler: 'Console',
    script: {
      name: 'Debug',
      version: 'Testing'
    }
  };
  const getValueGM = GM_getValue || ((name, defaultValue = null) => logScript('Getting: ', name, '=', defaultValue)[3]);
  const setValueGM = GM_setValue || ((name, value) => logScript('Getting: ', name, '=', value));

  function getBrowser() {
    const ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE ' + String(tem[1] || '');
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem !== null) {
        return tem.slice(1).join(' ').replace('OPR', 'Opera');
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    tem = ua.match(/version\/(\d+)/i);
    if (tem !== null) {
      M.splice(1, 1, tem[1]);
    }
    return M.join(' ');
  }

  function getEngine() {
    return String(getInfoGM.scriptHandler || 'Greasemonkey') + ' ' + String(getInfoGM.version);
  }

  if (typeof getValueGM('MangaFitWidthIfOversized') === 'string') {
    setValueGM('MangaFitWidthIfOversized', true);
    setValueGM('MangaShowThumbnails', true);
    setValueGM('MangaDownloadZip', false);
    setValueGM('MangaAlwaysLoad', false);
  }
  const settings = {
    Theme: getValueGM('MangaTheme', 'Light'),
    CustomTheme: getValueGM('MangaCustomTheme', '3d0099'),
    FitWidthIfOversized: getValueGM('MangaFitWidthIfOversized', true),
    ShowThumbnails: getValueGM('MangaShowThumbnails', true),
    DownloadZip: getValueGM('MangaDownloadZip', false),
    Timer: getValueGM('MangaTimer', 1000),
    Zoom: getValueGM('MangaZoom', 100),
    alwaysLoad: getValueGM('MangaAlwaysLoad', false)
  };
  const icon = {
    enlage: 'data:image/png;base64,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',
    reduce: 'data:image/png;base64,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%3D%3D',
    restore: 'data:image/png;base64,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%3D',
    fitwidth: 'data:image/png;base64,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',
    reload: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC70lEQVR4XrXQa0xTdxgG8Pd/es6x2JbL2iINtCQdAkvAuOAwBMKMfiBZJGWMYQIx68plwwEbUfACeIlGyJbQVYMxsjGGZkHDIFZHIBurboOQESgLldaISMu6cmprSi/0cnp6TL8IiSb9tN+H5+OTJw/8r/rHVgCgAr7qmZKoLown7y3rgiMnf4aY2q/roeP6Aio/9RtZc/F33kedMw0lx3WnDzcP88pbhmE7DLb5dcYKc4+cmG2DfXva5D5qecFe0JuD3Wa7T+XYxOp8RNIhQZIfK+8Yeb1gdMEFhDgR1xoDBxxhUuOkUY+XxVq9GPnFBmLzvDhK93B31lu58sxnkAOl6gmIwqNx1eCDD3P2waUHf+Q7gsEOGoWkDArq6YjfhyfFZ0X4vEyaA5gHMfsZv/f9t+z9T6hwLvNqgWnZAicmx/mrNluR3W7+208ZVLRtXpnEed6YmCn6E0Q7vGGOf3bTtXbNaTZO25aMEceKCV4p674Dn3yvEyi6bhfkHW0XjrIsFKon4NPhxYT83qmz0vPa07tqr7ybuL8qLq1uEF4jEUuh9KQaiqubUXF1E6hnLaCZ+5dT1TsWv+ezb8QJB1VkG8tCTDcWKfjBQOHKSUpeol1TFfb99fGe1qtEkfoefD4wB19PPI1v/k4nrzg3QNRotFsnqkaWgAcvsIePPRlOGi9x0JjCFwplRdxhdXZKKpEpyyVJMk5KebwKT4ixUVbTEAMZsHWi1Q5GysE1WV21z9b8lxxr3kN+q18IG/wD/3l3n11YYTSrtsCPLqe7aNNpX/yyryvkWP4HolA0pGf6gSWmMCxYUYloUTfQWDoKM4AAsRiLIlwcC6UIgrNCZLnsNmoncZ4ofP+mZqsgStY0CCzji8ciu08hmtfIBNZXI3TQirGEm2AC8wJ2/Zc485AxCHxGP6+DN5LV3gJZ3VB2uuruT2mV3yoTi6tTxIX1wuR3PiDeazMACTFIlC2QWnOOk1rVWSApOyaXKBoglpfB+En628ogAgAAAABJRU5ErkJggg%3D%3D',
    zoomin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACoUlEQVQ4jZXQu2tTYRjH8e9535OTmDQxaZuYU6NNi9a7CaiQSczmWBGKm0WHLkL9DxTETSkF0YqD1kEUvCJI6yBxUiTVqPUKLa1JJfZiehLTkzQ3h1htQBB/08sLz+e5KKzKmXMXgk1O16lyuRJ0N7cemJv9lpifn0/ksrnhK4NnY/wlcuUxcPn6gKPJeVNv2xhuD24OtrT4aXK1+NfYHeHFbLa3o2uXe/zls9G/AucvXRtwujwnd+/ey7auLvR1PrwtHvR1Xta3BViqOjCM75HOLduD7149f9AAXBy+Ha5Uqtf27Y3Q2R7AqqlIqSAVBVUKbFYNn7eV5HdBcWku3NG14+mHxIupFUDMpJL9fn0D7YH1lCoK+QKUynD07CRCAaFAs8vKntBOmv2bsdrs/asnEJUq4TZdR5UKDiustYMUUDRzmMtQAwTgb3bh14NYNK17NaDmzULYscaGFPXCI6cnKZo5CmaOQ/0jFMwsDy/1oKoKrR4XFovWcEQ19yM/ZWSNoCo3IBW4faYTgP3HRnhy5SDVGmTy9VVUKbBqlgZAmEtLicmpaaSoISWovyYpmFmEAEX582eaBppFJhqAUml5MP7qNV/Ts6gSpKx3G7vVg1CgWoVSBbI/8mTmviAUBhuAu8MXYkZm4f6Ne4+YXcjULy9AAWo1MJdhYdHg8cgdPr2Nk/oYb5hAAmzaFho1DGPr64+TW/PFMlbNSiZXYN4wmfgyw/j4Sz6/f4PHViWdTh+JRqOj8Xg8DfVGv9Nz/GSv2+3pd3s84SanE01KqrVKorxcHNzZ4SOdTl+NxWIUi8VFXdejQ0NDiQbgX+nr6+sNhUK/EbvdHpX/LvuTsbGxRCAQmI5EIt2pVMqWTCYP/xewgvh8vmmv19s9MTFx4ifGBwN4Ure0EAAAAABJRU5ErkJggg%3D%3D',
    zoomout: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAClElEQVQ4jZWQTUsbURiFz9w7mYmOSfNhYkZjjVJTba0J1EKW8R8IBXEpdOGmoP+gBemuRQJSCV1Uuyhd2C8KhXSVrlqK0bGkrS4MamJNNRonMZmJSSZdxFgHBOmBy3u5cJ733MPgnKYfz3paTOYHlUrVY7G1Bvf3/kiZTEbK5/ILz0KPorhAtHGZCb+YEVpMr8T2q/4uT6/HbnehxWx3NTUJ/qNcbrzbe8sSX/4SuRDwZG5+xmS2Tg0ODqHf64XY5oTDboXY5kBHuxtFTYAsHwZ6rt/w/Fj5+l4HeLqw6K9Wtfk7QwH0dLnBcywoZUAZBiwlMPIcnI5WJA8JSsV9f7f35udf0rfNBoDspJKTLrETXe4OlKsMCipQrgAMA5DTYzPzuO0bgM3VC97YPHk+Aalq8LeLIljKQOCBK80AJUChBCgnQA0AAeCymeESPTBw3Mh5AFtQVL/QZAQldePYwwRKSh6qkkdJOYaq5PBhbhQsy6DVaobBwOlKZPPHhU05J3tY2gnKAIvTPQAArQZoWn1mC/WvsJSA5ww6AFGKRSmxuQVKaqAUYE+TUAYgpN5F401RZHAGKukA5fJJaGllFb/Te2ApQOlpeaQ+NQ0oV4HccQHZ/W0QBiEd4M3CbFTOHrx7+fYj9g6yZ2YGQK1WL/LgSManyGusx5eQWlvSJaAAcK3fF5FluW91LdFXKFXAczyyeRUZWUFiewfx+DLWf36Hjdewu7s7FgwGI7FYLA3UF51p9N7UuMVinbRYrX6TyQQDpdBqValyUgoNdDuRTqefR6NRqKp6JIricDgclnSAyzQxMTHu8/nOIIIgDNPLbf8Ui8Ukt9u9FQgERlKplDGZTN79L0AD4nQ6txwOx8jGxsb9vyYg/nmG24G2AAAAAElFTkSuQmCC',
    zoomrestore: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACsUlEQVR4Xp2SW0iTYRjH/5/fYdtnTc0jrhPW0Dwt7HC3mZBeKF1pbVoO26V3RkK3URcqiLBADRxEXZR2o9LuDAaKeSHOw1ZuRdBhTs3cNL9tbt/29m6gqASBP/jB8168fx6e50FHR0eb1Wp9PjAwMJS0v79/aHBw0NbV1fWiurr6Av5Hc3PzbXKAQCBAnE4nsdvtpLe3N2Qyme7W19fnVVVV8fgXra2t9wglFouR5eVl4nA4SDAYJHvE4/HE1OSkq6WlxczzfAaOkMayrAKUiYn3cLncMBgM8K1vYnbxIz55v2B6doEprdSV9XR399TV1d0CIBwKoChBYdk01NbehNv7FcHtPziVnQ3CKxCJxjDhmMYJdVa+xdL2QBTFs4cCqFw4HIbX+xlqtRo//GvIzc9HFDx2EgK2IMLj/42ZuXkY9IZiGlB8NECIRqNITxeRhBMU8EsEHzeicK2F8TPEYEVi8GP1F3Jy80SO43IAMHsBXLImhCCwGQAt8G1lHf7vEviTWal3PCFDIXA4f7oQ66v+CB327qEOGAYQBAEZGWr4fD6Ua89BlgKAHIHA0/DwDs5nqXCl4hLG39lXJGnHA4DsdwBCwPMcWI7H6OgYzGYz0pUiphY+YXMjhJIzBbhxVY/ZmQ/o6+uTI5HdNBzEct/SGYmEydLiIrHZbOSZ1ZqqSVwmSf5sBcn42Bi5dv06KSoqInTtSwAq9odIQCDLMra2t6DRFILlWLwZHsaDh53JM8fjJ0/hnJ+HrrICoVAoodfrywG8pl7e2wKbHIRWq4VOp0NDQwNMRiOampqojTAa76Rsb2+HJElzHo8HNTU1ZSqV6hWAEoZenkmrvfhIqVTy2IMACUJSBcMwKelneWTk7UvaRalGo7FkZmbC7XY34hiUUa1UG7Ucx0BBzaMWUMW/uh49keTZSXYAAAAASUVORK5CYII%3D',
    zoomwidth: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACyUlEQVR4XqWSX0hTbRjAn/ecdSbbNJdFK/p3tTAvXI4IwrwJ6vtEqK819abIG1GCYRcFs+FNXdS+z82tP1ARpX7VVUVoYgWl07oItH8KUcHUxf7Y5v667exse3rfEUsxr/rBw3k453l/D895XmI2m3dJkqQGilwuj25YX2FGgFpCuApEhGw2G+QITCdT6QZRFJEQAkvhKisrr1RVVY3Q53OFQjGcTqebjxmObjMYDMqmxkal8djR7YhYX6pSuZhwBQ6HYw4RpcHBAan7v3/ziWQK/7Z7kJFIxPGv7jkMR6LodPRgj912x2KxQFdXVzHAbrfPIqW/rw8XQiFsuu7Djvte9M8H0fPNi6f/n8XDlz0YDC1gZ6f5lc1mY2eKIYOf8DyB9l4vfIqoYMaPYPiaBkYuD5AUJWi9HYfdcqG0rKwMlv6HoiBPC6+d2ARtdxOgKefhwpG1wCY+PxgDd0CCWy2bwWoVI5FIlDbjVgrWCAJEowtgN5bDuScZUClKCp2CyTjcbNkA8ej3rChmwjzJQy6HwCA0iiqtVgsvR8Ygk4rBxQYOovFFiC2mwGlUQSIWgkePB5J0zVU8yZUCEuConOeWCHQ6Hej1ehh1jUE4HCl0RzqX1+eD4eGnyPOykuPG+i0YfO+XcXgij2T5CIgI1dXVLIGhoaHiOyZSq9Ugzb/1ZKWdOw7otspdHyZu5Mr1OSq5y1Yxg4i5TCaDLBhut3tZeDwebG0/ZbW21Uw6THvj7+6dwauW5rSz2/qPDCk5Cr2yhXFoChqN5tdV5TjgeR54QhSX+idrLCf3BJ65RsnB/bXKkenJXiZghwrxG4o75whCKAHgmvi8sU6v9Y9PffGVKDUVMtpBTovWwOoUJIIglLD8ozsND1+/0Tg79o0LXH5AFggEHphMJgUASLAKAmVqauoFyxfFPLQdWgc1dYbaOuNZIGyEP+EHsrF5Hxph5xoAAAAASUVORK5CYII%3D',
    hide: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAbpJREFUeNrUk8FKAlEUhu9oqRQ2JCG0UBgNWijWQkFhiAqaXERLceE21+16A1+gRQshCFy5MGiTCROBguEqzGkVI0kgumihOKQw3f4zOL2Aqw58MHPv+f9zzr0zAuecLRIOtmAsbCAgrIf5KGtgHyggBHzzvC+ggxp4AiNbZxsIMDh1u91niqJs5XI5v6Zpq41Gw0WbsizPIpHIpFQqDWu12vt0Oi1Cd0d1aQQPOE8kEhf1el2uVCrbpmmuBwIB12RiMAIiF63RHuVQLmksrdPpTKPq42AwmBqGwQlVVTlFsXjNZfmAK8oJR1fc3qdc0pB2CS7ZZDLpQ/uu2WxmzVUoFFDZZJeXV9Z7OBxln59vzN6nXNKgUJYMblqt1vpoNNr2IChBkiSmqk2WSh1ZAo/HzZaXpT+DbwQ0H6R1OhyOfrfb/Wk2m2Y8Ht8QRdGLeZmmvbJQaIeJog/VNXZ4uGcZ67rez+fz9ziLW7oVAXPYV5FEA8fpdDqayWSivV5vs91ue6liLBYbB4PBfrlc7lSr1Q4aeMDyM52TbWB/FysgAnaBH3jn62MwBC9AA4b97Qj//19Y2OBXgAEA3HnRUkre/J0AAAAASUVORK5CYII%3D',
    settings: 'data:image/png;base64,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%3D',
    menu: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABqUlEQVR4XqWTPWtUQRhGz/vO7HWDYNJaWyz5FSJEgoWlYCGInaClCGpI4geC1mJjIWshqGn9CGwQf4TmJo0/wRRK1Jt7H+eOO8VCsIgHHjjD8MDMy4ydfLD57cfvdqFphZjFAB3mBgM3jldhjxOr73RU5lM3Np0A+Fp/BjcMw62PeL7jXBm1AMlDdil5bayeX6TvRkRmvBsJbikD3CPQUIUDXuwGAConuwTBBYCAyJRLyyOCQYxw7ZHx5KZ4tbnDhaURABuTbS4uLSLBm+QFB8ty/bExDHD1ofH0hqAFU0voyHF1ZFcKohDL7Me3xeVUHt8STQvRyFcaOJni6j0YGUEElaPwckVIEAAPUAVjOCBTHCU3oxCLvp7UuDnBI+4BOGAYnY2tGoBjUxeiKi2AuTtv1fNrmi5l+T5qJT2b1PoppfT+Jft+9m319N0yRM7dNSrg7D3jw4oAMHU45Fin7AHww4a4tSbOrBsf10UHWHmyZDC37ALC7AxUPJcBvGwimHUsl6As/usv9N0413z/NL/2/nTTdnSigP3jO5oZg2D0XQNOAQscjb0/9SM6Il0maJIAAAAASUVORK5CYII%3D'
  };

  const scheme = new ColorScheme().scheme('mono').variation('default');

  function addTheme(theme) {
    return '<style type=\'text/css\' name=\'' + String(theme[0]) + '\'>\n  .' + String(theme[0]) + ' .controlLable, .' + String(theme[0]) + ' .ViewerTitle, .' + String(theme[0]) + ', .PageFunctions a.visible, .' + String(theme[0]) + ' a, .' + String(theme[0]) + ' a:link, .' + String(theme[0]) + ' a:visited, .' + String(theme[0]) + ' a:active, .' + String(theme[0]) + ' a:focus{ text-decoration:none; color: ' + String(theme[2]) + ';}\n  .' + String(theme[0]) + ' {background-repeat: repeat;background-position: 0 0;background-image: none;background-color: ' + String(theme[1]) + ';background-attachment: scroll;}\n  .' + String(theme[0]) + ' #ImageOptions #menu .menuOuterArrow {border-left-width: 10px;border-left-style: solid;border-left-color: ' + String(theme[4]) + ';}\n  .' + String(theme[0]) + ' #ImageOptions #menu .menuInnerArrow {border-left-width: 5px;border-left-style: solid;border-left-color: ' + String(theme[1]) + ';}\n  .' + String(theme[0]) + ' .PageFunctions { border: 1px solid ' + String(theme[3]) + '; border-bottom: medium none; border-left: medium none; border-right: medium none;}\n  /*.' + String(theme[0]) + ' #Chapter { border: 1px solid ' + String(theme[3]) + '; border-top: medium none; border-left: medium none; border-right: medium none;}*/\n  .' + String(theme[0]) + ' .PageFunctions > span, .' + String(theme[0]) + ' .ThumbNail span {background: none repeat scroll 0 0 ' + String(theme[4]) + ';}\n  .' + String(theme[0]) + ' .painel {background: none repeat scroll 0 0 ' + String(theme[4]) + '; border: thin solid ' + String(theme[3]) + ';}\n  .' + String(theme[0]) + ' .PageContent, .' + String(theme[0]) + ' .ThumbNail img { outline: 2px solid ' + String(theme[3]) + '; background: none repeat scroll 0 0 ' + String(theme[4]) + ';}\n  .' + String(theme[0]) + ' .ChapterControl a { border: 1px solid ' + String(theme[3]) + '; background-color: ' + String(theme[5]) + ';\n  </style>';
  }

  function addCustomTheme(color) {
    const bg = scheme.from_hex(color).colors();
    return addTheme(['Custom_Dark', '#000000', '#' + String(bg[2]), '#' + String(bg[3]), '#' + String(bg[0]), '#' + String(bg[1])]) + addTheme(['Custom_Light', '#eeeeec', '#' + String(bg[3]), '#' + String(bg[2]), '#' + String(bg[0]), '#' + String(bg[1])]);
  }

  function loadThemes() {
    const bg = scheme.from_hex(settings.CustomTheme).colors();
    return [
      ['Dark', '#000000', '#ffffff', '#666666', '#333333', '#282828'],
      ['Light', '#eeeeec', '#2e3436', '#888a85', '#babdb6', '#c8cec2'],
      ['Clear', '#ffffff', '#2e3436', '#888a85', '#eeeeec', '#d3d7cf'],
      ['Dark_Blue', '#000000', '#91a0b0', '#586980', '#3e4b5b', '#222c3b'],
      ['Tango_Blue', '#000000', '#82a0bf', '#3d669b', '#304c77', '#102747'],
      ['Lime', '#000000', '#8abd59', '#608d34', '#38531f', '#233413'],
      ['Plum', '#000000', '#ad7fa8', '#75507b', '#49324d', '#311b37'],
      ['Light_Plum', '#eeeeec', '#5c3566', '#9b71a2', '#ad7fa8', '#d2b8ce'],
      ['Earthy', '#000000', '#ffffff', '#693d3d', '#46211a', '#683327'],
      ['Cool_Blues', '#000000', '#c4dfe6', '#66a5ad', '#07575b', '#003b46'],
      ['Custom_Dark', '#000000', '#' + String(bg[2]), '#' + String(bg[3]), '#' + String(bg[0]), '#' + String(bg[1])],
      ['Custom_Light', '#eeeeec', '#' + String(bg[3]), '#' + String(bg[2]), '#' + String(bg[0]), '#' + String(bg[1])]
    ];
  }
  const themes = loadThemes();
  const themesSelector = R.map(theme => '<option value=\'' + String(theme[0]) + '\' ' + (settings.Theme === theme[0] ? 'selected' : '') + '>' + String(theme[0].replace('_', ' ')) + '</option>', themes);
  const themesCSS = R.map(theme => addTheme(theme), themes).join('');

  const painel = '\n<div id=\'ImageOptions\'>\n  <div id=\'menu\'>\n    <span class=\'menuOuterArrow\'><span class=\'menuInnerArrow\'></span></span>\n  </div>\n  <div class=\'painel\'>\n    <img id=\'enlarge\' alt=\'Enlarge\' src=\'' + String(icon.enlage) + '\' class=\'controlButton\' />\n    <img id=\'restore\' alt=\'Restore\' src=\'' + String(icon.restore) + '\' class=\'controlButton\' />\n    <img id=\'reduce\' alt=\'Reduce\' src=\'' + String(icon.reduce) + '\' class=\'controlButton\' />\n    <img id=\'fitwidth\' alt=\'Fit Width\' src=\'' + String(icon.fitwidth) + '\' class=\'controlButton\' />\n    <img id=\'settings\' alt=\'settings\' src=\'' + String(icon.settings) + '\' class=\'controlButton\' />\n  </div>\n  <div id=\'Zoom\' class=\'controlLable\'>Zoom: <b>' + String(settings.Zoom) + '</b> %</div>\n</div>';
  const shortcuts = '\n<div id=\'ViewerShortcuts\' class=\'painel\' style=\'display: none;\'>\n  <span class=\'key\'>+</span> or <span class=\'key\'>=</span> : Global Zoom in pages (enlarge)<br/>\n  <span class=\'key\'>-</span> : Global Zoom out pages (reduce)<br/>\n  <span class=\'key\'>*</span> or <span class=\'key\'>8</span> : Global Restore pages to original<br/>\n  <span class=\'key\'>5</span> : Global Fit window width<br/>\n  <span class=\'key\'>Arrow Right</span> or <span class=\'key\'>.</span> : Next Chapter<br/>\n  <span class=\'key\'>Arrow Left</span> or <span class=\'key\'>,</span> : Previous Chapter<br/>\n</div>';
  const controls = '\n<div id=\'ViewerControls\' class=\'painel\' style=\'display: none;\'>\n  <span class=\'controlLable\'>Theme:</span>\n  <input id=\'CustomThemeHue\' class=\'jscolor\' value=\'' + String(settings.CustomTheme) + '\' ' + (settings.Theme !== 'Custom_Dark' && settings.Theme !== 'Custom_Light' ? 'style="display: none;"' : '') + '\'>\n  <select id=\'ThemeSelector\'>\n    ' + String(themesSelector) + '\n  </select>\n  <span class=\'controlLable\'>Pages/Second:</span>\n  <select id=\'PagesPerSecond\'>\n    <option value=\'3000\' ' + (settings.Timer === 3000 ? 'selected' : '') + '>0.3</option>\n    <option value=\'2000\' ' + (settings.Timer === 2000 ? 'selected' : '') + '>0.5</option>\n    <option value=\'1000\' ' + (settings.Timer === 1000 ? 'selected' : '') + '>01</option>\n    <option value=\'500\' ' + (settings.Timer === 500 ? 'selected' : '') + '>02</option>\n    <option value=\'250\' ' + (settings.Timer === 250 ? 'selected' : '') + '>04</option>\n    <option value=\'125\' ' + (settings.Timer === 125 ? 'selected' : '') + '>08</option>\n    <option value=\'100\' ' + (settings.Timer === 100 ? 'selected' : '') + '>10</option>\n  </select>\n  <span class=\'controlLable\'>Default Zoom:</span>\n  <select id=\'DefaultZoom\'>\n    <option value=\'50\' ' + (settings.Zoom === 50 ? 'selected' : '') + '>50%</option>\n    <option value=\'75\' ' + (settings.Zoom === 50 ? 'selected' : '') + '>75%</option>\n    <option value=\'100\' ' + (settings.Zoom === 50 ? 'selected' : '') + '>100%</option>\n    <option value=\'125\' ' + (settings.Zoom === 50 ? 'selected' : '') + '>125%</option>\n    <option value=\'150\' ' + (settings.Zoom === 50 ? 'selected' : '') + '>150%</option>\n    <option value=\'175\' ' + (settings.Zoom === 50 ? 'selected' : '') + '>175%</option>\n    <option value=\'200\' ' + (settings.Zoom === 50 ? 'selected' : '') + '>200%</option>\n    <option value=\'1000\' ' + (settings.Zoom === 50 ? 'selected' : '') + '>Fit Width</option>\n  </select>\n  <span class=\'controlLable\'>Fit Width if Oversized:</span>\n  <input type=\'checkbox\' val=\'true\' name=\'fitIfOversized\' id=\'fitIfOversized\' ' + (settings.FitWidthIfOversized ? 'checked' : '') + '>\n  <span class=\'controlLable\'>Show Thumbnails:</span>\n  <input type=\'checkbox\' val=\'true\' name=\'showThumbnails\' id=\'showThumbnails\' ' + (settings.ShowThumbnails ? 'checked' : '') + '>\n  <span class=\'controlLable\'>Download Images as Zip Automatically:</span>\n  <input type=\'checkbox\' val=\'false\' name=\'downloadZip\' id=\'downloadZip\' ' + (settings.DownloadZip ? 'checked' : '') + '>\n  <span class=\'controlLable\'>Always Load Script:</span>\n  <input type=\'checkbox\' val=\'true\' name=\'alwaysLoad\' id=\'alwaysLoad\' ' + (settings.alwaysLoad ? 'checked' : '') + '>\n</div>';
  const chapterControl = R.curry((id, target, manga) => '\n<div id=\'' + String(id) + '\' class=\'ChapterControl\'>\n    <a id=\'bottom\' href=\'#' + String(target) + '\' style=\'display: none;\'>Bottom</a>\n    <a href=\'#\' class=\'download\'>Download</a>\n    <a class=\'prev\' id=\'prev\' href=\'' + String(manga.prev || '') + '\' onclick=\'location="' + String(manga.prev || '') + '";location.reload();\'>Previous</a>\n    <a class=\'next\' id=\'next\' href=\'' + String(manga.next || '') + '\' onclick=\'location="' + String(manga.next || '') + '";location.reload();\'>Next</a>\n</div>');
  const chapterControlTop = chapterControl('ChapterControlTop', 'ChapterControlBottom');
  const chapterControlBottom = chapterControl('ChapterControlBottom', 'MangaOnlineViewer');
  const title = manga => '<div class=\'ViewerTitle\'><br/><a id=\'series\' href=\'' + String(manga.series) + '\'>' + String(manga.title) + '<br/>(Return to Chapter List)</a></div>';
  const listPages = R.times(index => '\n<div id=\'Page' + String(index + 1) + '\' class=\'MangaPage\'>\n  <div class=\'PageFunctions\'>\n    <a class=\'ZoomIn controlButton\'></a>\n    <a class=\'ZoomRestore controlButton\'></a>\n    <a class=\'ZoomOut controlButton\'></a>\n    <a class=\'ZoomWidth controlButton\'></a>\n    <a class=\'Hide controlButton\'></a>\n    <a class=\'Reload controlButton\'></a>\n    <span>' + String(index + 1) + '</span>\n  </div>\n  <div class=\'PageContent\' style=\'display: none;\'>\n    <img id=\'PageImg' + String(index + 1) + '\' alt=\'PageImg' + String(index + 1) + '\' />\n  </div>\n</div>');
  const listOptions = R.times(index => '<option value=\'' + String(index + 1) + '\'>' + String(index + 1) + '</option>');
  const listThumbnails = R.times(index => '<div id=\'ThumbNail' + String(index + 1) + '\' class=\'ThumbNail\'><img id=\'ThumbNailImg' + String(index + 1) + '\' alt=\'ThumbNailImg' + String(index + 1) + '\' src=\'\'/><span>' + String(index + 1) + '</span></div>');
  const body = manga => '\n<div id=\'MangaOnlineViewer\' class=\'' + String(settings.Theme) + '\' style=\'min-height: 1080px;\'>\n  ' + String(title(manga)) + '\n  ' + String(chapterControlTop(manga)) + '\n  <div id=\'Chapter\' align=\'center\' class=\'' + (settings.FitWidthIfOversized === true ? 'fitWidthIfOversized' : '') + '\'>\n    ' + String(listPages(manga.quant).join('')) + '    \n  </div>\n  ' + String(title(manga)) + '\n  ' + String(chapterControlBottom(manga)) + '\n  ' + painel + '    \n  ' + controls + '\n  ' + shortcuts + '    \n  <div id=\'Counters\' class=\'controlLable\'>\n    <i>0</i> of <b>' + String(manga.quant) + '</b> Pages Loaded \n    <span class=\'controlLable\'>Go to Page:</span>\n    <select id=\'gotoPage\'><option selected>#</option>' + String(listOptions(manga.quant).join('')) + '</select>\n  </div>\n  <div id=\'Navigation\' align=\'center\' class=\'painel ' + (settings.ShowThumbnails ? '' : 'disabled') + '\'>\n    <div id=\'NavigationCounters\' class=\'controlLable\'>\n      <img alt=\'menu\' src=\'' + String(icon.menu) + '\' class=\'nav\' /><i>0</i> of <b>' + String(manga.quant) + '</b> Pages Loaded\n    </div>\n    ' + String(listThumbnails(manga.quant).join('')) + '\n  </div>\n  <a href=\'#\' id=\'blob\' style=\'display: none;\'>Download</a>\n</div>';
  const readerCSS = '\n<style type=\'text/css\'>html{font-size:100%}\nbody{margin:0;font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#333;background-color:#FFF;padding:0}\na{color:#08C;text-decoration:none}\nimg{height:auto;max-width:100%;vertical-align:middle;border:0 none}\n/*button,input,select,textarea{margin:0;font-size:100%;vertical-align:middle}\nbutton,input{line-height:normal}\nlabel,input,button,select,textarea{font-size:14px;font-weight:normal;line-height:20px}\ninput,button,select,textarea{font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif}\nselect,textarea,input[type=\'text\'],input[type=\'password\'],input[type=\'datetime\'],input[type=\'datetime-local\'],input[type=\'date\'],input[type=\'month\'],input[type=\'time\'],input[type=\'week\'],input[type=\'number\'],input[type=\'email\'],input[type=\'url\'],input[type=\'search\'],input[type=\'tel\'],input[type=\'color\'],.uneditable-input{display:inline-block;height:20px;padding:4px 6px;margin-bottom:10px;font-size:14px;line-height:20px;color:#555;vertical-align:middle;border-radius:4px 4px 4px 4px}\ninput:not([type=\'checkbox\']),textarea,.uneditable-input{width:206px}\ntextarea,input[type=\'text\'],input[type=\'password\'],input[type=\'datetime\'],input[type=\'datetime-local\'],input[type=\'date\'],input[type=\'month\'],input[type=\'time\'],input[type=\'week\'],input[type=\'number\'],input[type=\'email\'],input[type=\'url\'],input[type=\'search\'],input[type=\'tel\'],input[type=\'color\'],.uneditable-input{background-color:#FFF;border:1px solid #CCC;box-shadow:0 1px 1px rgba(0,0,0,0.075) inset;transition:border .2s linear 0,box-shadow .2s linear 0}\ninput,textarea,.uneditable-input{margin-left:0}*/\n#nprogress .bar{background:#29d;position:fixed;z-index:1031;top:0;left:0;width:100%;height:4px;}\n.key{display:inline;display:inline-block;min-width:1em;padding:.2em .3em;font:400 .85em/1 \'Lucida Grande\',Lucida,Arial,sans-serif;text-align:center;text-decoration:none;-moz-border-radius:.3em;-webkit-border-radius:.3em;border-radius:.3em;border:none;cursor:default;-moz-user-select:none;-webkit-user-select:none;user-select:none}\n.key[title]{cursor:help}\n.key, .dark-keys,.dark-keys .key,.key.dark{background:#505050;background:-moz-linear-gradient(top,#3c3c3c,#505050);background:-webkit-gradient(linear,left top,left bottom,from(#3c3c3c),to(#505050));color:#fafafa;text-shadow:-1px -1px 0 #464646;-moz-box-shadow:inset 0 0 1px #969696,inset 0 -.05em .4em #505050,0 .1em 0 #1e1e1e,0 .1em .1em rgba(0,0,0,.3);-webkit-box-shadow:inset 0 0 1px #969696,inset 0 -.05em .4em #505050,0 .1em 0 #1e1e1e,0 .1em .1em rgba(0,0,0,.3);box-shadow:inset 0 0 1px #969696,inset 0 -.05em .4em #505050,0 .1em 0 #1e1e1e,0 .1em .1em rgba(0,0,0,.3)}\n.light-keys,.light-keys .key,.key.light{background:#fafafa;background:-moz-linear-gradient(top,#d2d2d2,#fff);background:-webkit-gradient(linear,left top,left bottom,from(#d2d2d2),to(#fff));color:#323232;text-shadow:0 0 2px #fff;-moz-box-shadow:inset 0 0 1px #fff,inset 0 0 .4em #c8c8c8,0 .1em 0 #828282,0 .11em 0 rgba(0,0,0,.4),0 .1em .11em rgba(0,0,0,.9);-webkit-box-shadow:inset 0 0 1px #fff,inset 0 0 .4em #c8c8c8,0 .1em 0 #828282,0 .11em 0 rgba(0,0,0,.4),0 .1em .11em rgba(0,0,0,.9);box-shadow:inset 0 0 1px #fff,inset 0 0 .4em #c8c8c8,0 .1em 0 #828282,0 .11em 0 rgba(0,0,0,.4),0 .1em .11em rgba(0,0,0,.9)}\n#MangaOnlineViewer{width:100%;height:100%;padding-bottom: 100px;}\n#MangaOnlineViewer #Chapter{text-align:center;margin: 25px auto 0;display:block;}\n#MangaOnlineViewer #ViewerControls{padding: 8px;position:fixed;top:0;left:190px;}\n#MangaOnlineViewer #ViewerShortcuts{padding: 8px;position:fixed;top:65px;left:0px;}\n#MangaOnlineViewer select{height:20px;padding:0;margin-bottom:5px}\n#MangaOnlineViewer .controlButton{cursor:pointer;border:0 none;}\n#MangaOnlineViewer #ImageOptions {left: 0px;position: absolute;top: 0px;width: 200px;}\n#MangaOnlineViewer #ImageOptions .painel {padding:4.5px;position: inherit;}\n#MangaOnlineViewer #ImageOptions:hover {position:fixed;}\n#MangaOnlineViewer #ImageOptions.settingsOpen {position:fixed;}\n#MangaOnlineViewer #ImageOptions #menu {position:fixed;top: 45px;height: 64px;width: 200px;top: 0;}\n#MangaOnlineViewer #ImageOptions #Zoom {position:absolute;left: 18px;bottom: -65px;}\n#MangaOnlineViewer .MangaPage{width:100%;display:inline-block;text-align:center;align:center}\n#MangaOnlineViewer .PageContent{margin:0 0 15px;text-align:center;display:inline-block}\n#MangaOnlineViewer #gotoPage{width:35px;}\n#MangaOnlineViewer #ThemeSelector{width:110px;}\n#MangaOnlineViewer #PagesPerSecond{width:46px;}\n#MangaOnlineViewer .ChapterControl{-moz-user-select:none;-webkit-user-select: none;margin-right:120px;margin-top: 1px;float: right;}\n#MangaOnlineViewer .ChapterControl a{display:inline-block;width: 80px;height:25px;text-align:center;margin-left: 3px;margin-bottom: -1px;}\n#MangaOnlineViewer .ChapterControl a[href=\'#\'],#MangaOnlineViewer .ChapterControl a[href=\'\']{visibility:hidden}\n#MangaOnlineViewer .ViewerTitle{display: block;text-align: center;height:35px;}\n#MangaOnlineViewer #Counters {position: absolute;right: 10px;top: 10px;}\n#MangaOnlineViewer .PageFunctions{-moz-user-select:none;-webkit-user-select: none;font-family:monospace;font-size:10pt;padding-right:120px;text-align:right}\n#MangaOnlineViewer .PageFunctions>span{min-width:20px;text-align:center;display:inline-block;padding:2px 10px}\n#MangaOnlineViewer .PageFunctions > a {height: 16px;width: 16px; padding: 10px;}\n#MangaOnlineViewer .PageFunctions a{opacity:0.2}\n#MangaOnlineViewer .PageFunctions:hover a{opacity:1}\n#MangaOnlineViewer #NavigationCounters {margin-top: 5px;width: 100%;}\n#MangaOnlineViewer #Navigation {bottom: -170px;height: 180px;overflow: auto;overflow-x: auto;overflow-y: hidden;padding-bottom: 20px;position: fixed;white-space: nowrap;width: 100%;}\n#MangaOnlineViewer #Navigation:hover {bottom: 0;}\n#MangaOnlineViewer #Navigation.disabled {display: none;}\n#MangaOnlineViewer #Navigation.visible {bottom: 0;}\n#MangaOnlineViewer #Navigation .ThumbNail {display: inline-block;height: 150px;margin: 0 5px;position: relative;}\n#MangaOnlineViewer #Navigation .ThumbNail span {display: block;opacity: 0.8;position: relative;top: -30px;width: 100%;}\n#MangaOnlineViewer #Navigation .ThumbNail img {align-content: center;cursor: pointer;display: inline-block;margin-bottom: -10px;margin-top: 10px;max-height: 150px;min-height: 150px;min-width: 100px;}\n#MangaOnlineViewer #Navigation .nav {behavior:url(-ms-transform.htc);-moz-transform:rotate(-90deg);-webkit-transform:rotate(-90deg);-o-transform:rotate(-90deg);}\n#MangaOnlineViewer #ImageOptions .menuOuterArrow  {width: 0;height: 0;border-top: 10px solid transparent;border-bottom: 10px solid transparent;border-left:10px solid blue;display: inline-block;position: absolute;bottom: 0;}\n#MangaOnlineViewer #ImageOptions .menuInnerArrow {width: 0;height: 0;border-top: 5px solid transparent;border-bottom: 5px solid transparent;border-left:5px solid white;left: -10px;position: absolute;top: -5px;display: inline-block;}\n#MangaOnlineViewer .fitWidthIfOversized .PageContent img { max-width: ' + String($(window).width()) + 'px;}\n#MangaOnlineViewer .PageFunctions .Reload {background: url(\'' + String(icon.reload) + '\') no-repeat scroll center center transparent;}\n#MangaOnlineViewer .PageFunctions .Hide {background: url(\'' + String(icon.hide) + '\') no-repeat scroll center center transparent;}\n#MangaOnlineViewer .PageFunctions .ZoomIn {background: url(\'' + String(icon.zoomin) + '\') no-repeat scroll center center transparent;}\n#MangaOnlineViewer .PageFunctions .ZoomOut {background: url(\'' + String(icon.zoomout) + '\') no-repeat scroll center center transparent;}\n#MangaOnlineViewer .PageFunctions .ZoomRestore {background: url(\'' + String(icon.zoomrestore) + '\') no-repeat scroll center center transparent;}\n#MangaOnlineViewer .PageFunctions .ZoomWidth {background: url(\'' + String(icon.zoomwidth) + '\') no-repeat scroll center center transparent;}\n</style>';
  const externalScripts = ['<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js" integrity="sha256-RbP/rbx4XeYJH6eYUniR63Jk5NEV48Gjestg49cNSWY=" crossorigin="anonymous"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.js" integrity="sha256-XWzSUJ+FIQ38dqC06/48sNRwU1Qh3/afjmJ080SneA8=" crossorigin="anonymous"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js" integrity="sha256-egVvxkq6UBCQyKzRBrDHu8miZ5FOaVrjSqQqauKglKc=" crossorigin="anonymous"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/color-js/1.0.1/color.min.js" integrity="sha256-qAjuzGZ65rH+O8iRUmRdRCgk33HmM0Gbq15CwUsxW3k=" crossorigin="anonymous"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/color-scheme/1.0.0/color-scheme.min.js" integrity="sha256-DonUU+7nLBqoy0pdfzuUbr+5bdhcMcnKdF2MhfkjvGs=" crossorigin="anonymous"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/ramda/0.24.1/ramda.min.js" integrity="sha256-yF1J6hzNIWN398K1d+n1XXGC3JEchH55G05dxM+rsFk=" crossorigin="anonymous"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/bacon.js/0.7.94/Bacon.min.js" integrity="sha256-/iRvW1K45C96AyicFqZ1Aw7pGD21IsgeJ6H/wYHIhvs=" crossorigin="anonymous"></script>'];
  const externalCSS = ['<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css" integrity="sha256-HxaKz5E/eBbvhGMNwhWRPrAR9i/lG1JeT4mD6hCQ7s4=" crossorigin="anonymous" />', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css" integrity="sha256-pMhcV6/TBDtqH9E9PWKgS+P32PVguLG8IipkPyqMtfY=" crossorigin="anonymous" />', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.css" integrity="sha256-iXUYfkbVl5itd4bAkFH5mjMEN5ld9t3OHvXX3IU8UxU=" crossorigin="anonymous" />'];

  function reader(manga) {
    return '\n<head>\n  <title>' + String(manga.title) + '</title>\n  <meta charset="UTF-8">\n  ' + String(externalScripts.join('\n')) + '\n  ' + String(externalCSS.join('\n')) + '\n  ' + readerCSS + '\n  ' + String(themesCSS) + '\n</head>\n<body class=\'' + String(settings.Theme) + '\'>\n  ' + String(body(manga)) + '\n</body>';
  }

  const isEmpty = R.either(R.either(R.isNil, R.isEmpty), R.either(x => R.length(x) === 0, x => x === 0));
  const mapIndexed = R.addIndex(R.map);

  function addImg(index, src) {
    logScript('Image:', index, 'Source:', src);
    $('#PageImg' + String(index)).attr('src', src).parent().slideToggle();
    $('#ThumbNailImg' + String(index)).attr('src', src);
    return index;
  }

  function getPage(url, wait = settings.Timer) {
    return new Promise(resolve => {
      setTimeout(() => {
        logScript('Getting page: ' + String(url));
        $.ajax({
          type: 'GET',
          url,
          dataType: 'html',
          async: true,
          success: html => resolve(html)
        });
      }, wait);
    });
  }
  const loadMangaPages = manga => mapIndexed((url, index) => getPage(url, (manga.timer || settings.Timer) * index).then(response => addImg(index + 1, $(response).find(manga.img).attr('src'))), manga.listPages);

  function getImages(src, wait = settings.Timer) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(src);
      }, wait);
    });
  }
  const loadMangaImages = manga => mapIndexed((src, index) => getImages(src, (manga.timer || settings.Timer) * index).then(response => addImg(index + 1, response)), manga.listImages);

  function loadManga(manga) {
    logScript('Loading Images');
    logScript('Intervals: ' + String(manga.timer || settings.Timer || 'Default(1000)'));
    if (manga.listPages !== undefined) {
      logScript('Method: Pages:', manga.listPages);
      loadMangaPages(manga);
    } else if (manga.listImages !== undefined) {
      logScript('Method: Images:', manga.listImages);
      loadMangaImages(manga);
    } else {
      logScript('Method: Brute Force');
      manga.bruteForce({
        addImg,
        loadMangaImages,
        loadMangaPages,
        getPage,
        getImages
      });
    }
  }

  function reloadImage(img) {
    const src = img.attr('src');
    img.removeAttr('src');
    setTimeout(() => {
      img.attr('src', src);
    }, 500);
  }

  function applyZoom(page, newZoom) {
    const zoom = newZoom || settings.Zoom;
    const pages = page || '.PageContent img';
    $(pages).each((index, value) => $(value).width(zoom === 1000 ? $('html').width() : $(value).prop('naturalWidth') * (zoom / 100)));
  }

  function checkImagesLoaded() {
    const images = $('.PageContent img').get();
    const total = images.length;
    const missing = images.filter(item => $(item).prop('naturalWidth') === 0);
    const loaded = images.filter(item => $(item).prop('naturalWidth') !== 0);
    loaded.filter(item => $(item).attr('width') === undefined).forEach(item => applyZoom($(item)));
    missing.forEach(item => reloadImage($(item)));
    NProgress.configure({
      showSpinner: false
    }).set(loaded.length / total);
    $('#Counters i, #NavigationCounters i').html(loaded.length);
    logScript('Progress: ' + loaded.length / total * 100 + '%');
    if (loaded.length < total) {
      setTimeout(checkImagesLoaded, 5000);
    } else {
      logScript('Images Loading Complete');
      $('.download').attr('href', '#download');
      logScript('Download Avaliable');
      if (settings.DownloadZip) {
        $('#blob').click();
      }
    }
  }

  const cache = {
    zip: new JSZip(),
    downloadFiles: 0,
    Data: {}
  };

  function customBase64Encode(inputStr) {
    const bbLen = 3;
    const enCharLen = 4;
    const inpLen = inputStr.length;
    let inx = 0;
    let jnx;
    const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let paddingBytes = 0;
    const bytebuffer = new Array(bbLen);
    const encodedCharIndexes = new Array(enCharLen);
    while (inx < inpLen) {
      for (jnx = 0; jnx < bbLen; jnx += 1) {
        if (inx < inpLen) {
          bytebuffer[jnx] = inputStr.charCodeAt(inx) & 0xff;
          inx += 1;
        } else {
          bytebuffer[jnx] = 0;
        }
      }
      encodedCharIndexes[0] = bytebuffer[0] >> 2;
      encodedCharIndexes[1] = (bytebuffer[0] & 0x3) << 4 | bytebuffer[1] >> 4;
      encodedCharIndexes[2] = (bytebuffer[1] & 0x0f) << 2 | bytebuffer[2] >> 6;
      encodedCharIndexes[3] = bytebuffer[2] & 0x3f;
      paddingBytes = inx - (inpLen - 1);
      switch (paddingBytes) {
        case 1:
          encodedCharIndexes[3] = 64;
          break;
        case 2:
          encodedCharIndexes[3] = 64;
          encodedCharIndexes[2] = 64;
          break;
        default:
          break;
      }
      for (jnx = 0; jnx < enCharLen; jnx += 1) {
        output += keyStr.charAt(encodedCharIndexes[jnx]);
      }
    }
    return output;
  }

  function generateZip() {
    if (cache.downloadFiles === 0) {
      $('.MangaPage img').get().forEach((value, index) => {
        const img = $(value);
        const filename = 'Page ' + String(String('000' + String(index + 1)).slice(-3)) + '.png';
        const src = img.attr('src');
        if (src.indexOf('base64') > -1) {
          let base64 = src.replace('data:image/png;base64,', '');
          const i = base64.indexOf(',');
          if (i !== -1) {
            base64 = base64.substring(i + 1, base64.length);
          }
          cache.zip.file(filename, base64, {
            base64: true,
            createFolders: true
          });
          logScript(filename + ' Added to Zip from Base64 Image');
          cache.downloadFiles += 1;
        } else {
          try {
            GM_xmlhttpRequest({
              method: 'GET',
              url: src,
              overrideMimeType: 'text/plain; charset=x-user-defined',
              onload(e) {
                const base64 = customBase64Encode(e.responseText);
                cache.zip.file(filename, base64, {
                  base64: true,
                  createFolders: true
                });
                logScript(filename + ' Added to Zip as Base64 Image');
                cache.downloadFiles += 1;
              }
            });
          } catch (e) {
            logScript(e);
          }
        }
      });
    }
    const total = parseInt($('#Counters').find('b').text(), 10);
    if (cache.downloadFiles < total) {
      logScript('Waiting for Files to Download ' + String(cache.downloadFiles) + ' of ' + String(total));
      setTimeout(generateZip, 2000);
    } else {
      const blobLink = document.getElementById('blob');
      try {
        blobLink.download = String($('title').text().trim()) + '.zip';
        cache.zip.generateAsync({
          type: 'blob'
        }).then(content => {
          blobLink.href = W.URL.createObjectURL(content);
          logScript('Download Ready');
          $('#blob')[0].click();
        });
      } catch (e) {
        logScript(e);
        blobLink.innerHTML += ' (not supported on this browser)';
      }
    }
  }

  function setKeyDownEvents() {
    try {
      $(document).unbind('keyup keydown keypress onload');
      $(W).unbind('keyup keydown keypress onload');
      document.onkeydown = null;
      document.onkeypress = null;
      W.onkeydown = null;
      W.onkeypress = null;
      W.onload = null;
      document.body.onload = null;
    } catch (e) {
      logScript('Keybinds error: ' + String(e));
    }

    function processKey(e) {
      const a = e.keyCode || e.which;
      if ($.inArray(a, [39, 46, 190, 37, 44, 188, 43, 107, 61, 45, 109, 42, 106, 56, 104, 53, 101]) !== -1) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        switch (a) {
          case 39:
          case 46:
          case 190:
            $('.ChapterControl:first .next')[0].click();
            break;
          case 37:
          case 44:
          case 188:
            $('.ChapterControl:first .prev')[0].click();
            break;
          case 43:
          case 107:
          case 61:
            $('#enlarge').click();
            break;
          case 45:
          case 109:
            $('#reduce').click();
            break;
          case 42:
          case 106:
          case 56:
          case 104:
            $('#restore').click();
            break;
          case 53:
          case 101:
            $('#fitwidth').click();
            break;
          default:
            break;
        }
        return false;
      }
      return true;
    }
    if (navigator.userAgent.match(/mozilla/i)) {
      $(document).keypress(processKey);
    } else {
      $(document).keydown(processKey);
    }
  }

  function controls$1() {
    $('#enlarge').click(() => {
      settings.Zoom += 25;
      $('#Zoom b').html(settings.Zoom);
      applyZoom();
    });
    $('#reduce').click(() => {
      settings.Zoom -= 25;
      $('#Zoom b').html(settings.Zoom);
      applyZoom();
    });
    $('#restore').click(() => {
      settings.Zoom = 100;
      $('#Zoom b').html(settings.Zoom);
      $('.PageContent img').removeAttr('width');
    });
    $('#fitwidth').click(() => {
      settings.Zoom = 1000;
      $('#Zoom b').html(settings.Zoom);
      applyZoom();
    });
    $('#fitIfOversized').change(event => {
      $('#Chapter').toggleClass('fitWidthIfOversized');
      if ($(event.target).is(':checked')) {
        setValueGM('MangaFitWidthIfOversized', true);
      } else {
        setValueGM('MangaFitWidthIfOversized', false);
      }
      logScript('fitIfOversized: ' + String(getValueGM('MangaFitWidthIfOversized')));
    });
    $('#alwaysLoad').change(event => {
      if ($(event.target).is(':checked')) {
        setValueGM('MangaAlwaysLoad', true);
      } else {
        setValueGM('MangaAlwaysLoad', false);
      }
      logScript('alwaysLoad: ' + String(getValueGM('MangaAlwaysLoad')));
    });
    $('#showThumbnails').change(event => {
      $('#Navigation').toggleClass('disabled');
      if ($(event.target).is(':checked')) {
        setValueGM('MangaShowThumbnails', true);
      } else {
        setValueGM('MangaShowThumbnails', false);
      }
      logScript('showThumbnails: ' + String(getValueGM('MangaShowThumbnails')));
    });
    $('#downloadZip').change(event => {
      if ($(event.target).is(':checked')) {
        setValueGM('MangaDownloadZip', true);
        swal({
          title: 'Attention',
          text: 'Next time a chapter finish loading you will be promted to save automatically',
          timer: 10000,
          type: 'info',
          confirmButtonText: 'OK'
        });
      } else {
        setValueGM('MangaDownloadZip', false);
      }
      logScript('downloadZip: ' + String(getValueGM('MangaDownloadZip')));
    });
    $('#blob').one('click', generateZip);
    $('.download').click($('#blob')[0].click);
    $('#PagesPerSecond').change(event => {
      setValueGM('MangaTimer', $(event.target).val());
    });
    $('#DefaultZoom').change(event => {
      settings.Zoom = $(event.target).val();
      $('#Zoom b').html(settings.Zoom);
      setValueGM('MangaZoom', settings.Zoom);
      applyZoom();
    });
    $('#ThemeSelector').change(event => {
      const target = $(event.target);
      $('#MangaOnlineViewer , body').removeClass().addClass(target.val());
      logScript('MangaTheme:', target.val());
      setValueGM('MangaTheme', target.val());
      if (target.val() === 'Custom_Dark' || target.val() === 'Custom_Light') {
        $('#CustomThemeHue').show();
      } else {
        $('#CustomThemeHue').hide();
      }
    });
    jscolor(document.getElementById('CustomThemeHue'));
    $('#CustomThemeHue').change(event => {
      const target = $(event.target).val();
      logScript('CustomTheme: #' + String(target));
      $('style[title="Custom_Light"], style[title="Custom_Dark"]').remove();
      $('head').append(addCustomTheme(target));
      setValueGM('MangaCustomTheme', target);
    });

    function scrollToElement(ele) {
      $(W).scrollTop(ele.offset().top).scrollLeft(ele.offset().left);
    }
    $('#gotoPage').bind('change', event => {
      scrollToElement($('#Page' + String($(event.target).val())));
    });
    $('.ThumbNail').bind('click', event => {
      scrollToElement($('#Page' + String($(event.target).find('span').html())));
    });
    $('#settings').click(() => {
      $('#ViewerControls').slideToggle();
      $('#ViewerShortcuts').slideToggle();
      $('#ImageOptions').toggleClass('settingsOpen');
      $('#Navigation').toggleClass('visible');
    });
    $('.Reload').click(event => {
      reloadImage($(event.target).parents('.MangaPage').find('.PageContent img'));
    });
    $('.ZoomIn').click(event => {
      const img = $(event.target).parents('.MangaPage').find('.PageContent img');
      const ratio = img.width() / img.prop('naturalWidth') * 1.25 * 100;
      applyZoom(img, ratio);
    });
    $('.ZoomOut').click(event => {
      const img = $(event.target).parents('.MangaPage').find('.PageContent img');
      const ratio = img.width() / img.prop('naturalWidth') * 0.75 * 100;
      applyZoom(img, ratio);
    });
    $('.ZoomRestore').click(() => {
      $('.PageContent img').removeAttr('width');
    });
    $('.ZoomWidth').click(event => {
      const img = $(event.target).parents('.MangaPage').find('.PageContent img');
      applyZoom(img, 1000);
    });
    $('.Hide').click(event => {
      const img = $(event.target).parents('.MangaPage').find('.PageContent');
      img.slideToggle('slow');
    });
  }

  function formatPage(manga) {
    logScript('Found ' + String(manga.quant) + ' pages');
    W.stop();
    if (manga.quant > 0) {
      let cancel = false;
      if (!settings.alwaysLoad) {
        $('head').append('<style type="text/css">.sweet-alert,.sweet-overlay{position:fixed;display:none}body.stop-scrolling{height:100%;overflow:hidden}.sweet-overlay{background-color:#000;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=40)";background-color:rgba(0,0,0,.4);left:0;right:0;top:0;bottom:0;z-index:10000}.sweet-alert{background-color:#fff;font-family:"Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif;width:478px;padding:17px;border-radius:5px;text-align:center;left:50%;top:50%;margin-left:-256px;margin-top:-200px;overflow:hidden;z-index:99999}@media all and (max-width:540px){.sweet-alert{width:auto;margin-left:0;margin-right:0;left:15px;right:15px}}.sweet-alert h2{color:#575757;font-size:30px;text-align:center;font-weight:600;text-transform:none;position:relative;margin:25px 0;padding:0;line-height:40px;display:block}.sweet-alert p{color:#797979;font-size:16px;font-weight:300;position:relative;text-align:inherit;float:none;margin:0;padding:0;line-height:normal}.sweet-alert fieldset{border:none;position:relative}.sweet-alert .sa-error-container{background-color:#f1f1f1;margin-left:-17px;margin-right:-17px;overflow:hidden;padding:0 10px;max-height:0;webkit-transition:padding .15s,max-height .15s;transition:padding .15s,max-height .15s}.sweet-alert .sa-error-container.show{padding:10px 0;max-height:100px;webkit-transition:padding .2s,max-height .2s;transition:padding .25s,max-height .25s}.sweet-alert .sa-error-container .icon{display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#ea7d7d;color:#fff;line-height:24px;text-align:center;margin-right:3px}.sweet-alert .sa-error-container p{display:inline-block}.sweet-alert .sa-input-error{position:absolute;top:29px;right:26px;width:20px;height:20px;opacity:0;-webkit-transform:scale(.5);transform:scale(.5);-webkit-transform-origin:50% 50%;transform-origin:50% 50%;-webkit-transition:all .1s;transition:all .1s}.sweet-alert .sa-input-error::after,.sweet-alert .sa-input-error::before{content:"";width:20px;height:6px;background-color:#f06e57;border-radius:3px;position:absolute;top:50%;margin-top:-4px;left:50%;margin-left:-9px}.sweet-alert .sa-input-error::before{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.sweet-alert .sa-input-error::after{-webkit-transform:rotate(45deg);transform:rotate(45deg)}.sweet-alert .sa-input-error.show{opacity:1;-webkit-transform:scale(1);transform:scale(1)}.sweet-alert input{width:100%;box-sizing:border-box;border-radius:3px;border:1px solid #d7d7d7;height:43px;margin-top:10px;margin-bottom:17px;font-size:18px;box-shadow:inset 0 1px 1px rgba(0,0,0,.06);padding:0 12px;display:none;-webkit-transition:all .3s;transition:all .3s}.sweet-alert input:focus{outline:0;box-shadow:0 0 3px #c4e6f5;border:1px solid #b4dbed}.sweet-alert input:focus::-moz-placeholder{transition:opacity .3s 30ms ease;opacity:.5}.sweet-alert input:focus:-ms-input-placeholder{transition:opacity .3s 30ms ease;opacity:.5}.sweet-alert input:focus::-webkit-input-placeholder{transition:opacity .3s 30ms ease;opacity:.5}.sweet-alert input::-moz-placeholder{color:#bdbdbd}.sweet-alert input::-ms-clear{display:none}.sweet-alert input:-ms-input-placeholder{color:#bdbdbd}.sweet-alert input::-webkit-input-placeholder{color:#bdbdbd}.sweet-alert.show-input input{display:block}.sweet-alert .sa-confirm-button-container{display:inline-block;position:relative}.sweet-alert .la-ball-fall{position:absolute;left:50%;top:50%;margin-left:-27px;margin-top:4px;opacity:0;visibility:hidden}.sweet-alert button{background-color:#8CD4F5;color:#fff;border:none;box-shadow:none;font-size:17px;font-weight:500;-webkit-border-radius:4px;border-radius:5px;padding:10px 32px;margin:26px 5px 0;cursor:pointer}.sweet-alert button:focus{outline:0;box-shadow:0 0 2px rgba(128,179,235,.5),inset 0 0 0 1px rgba(0,0,0,.05)}.sweet-alert button:hover{background-color:#7ecff4}.sweet-alert button:active{background-color:#5dc2f1}.sweet-alert button.cancel{background-color:#C1C1C1}.sweet-alert button.cancel:hover{background-color:#b9b9b9}.sweet-alert button.cancel:active{background-color:#a8a8a8}.sweet-alert button.cancel:focus{box-shadow:rgba(197,205,211,.8) 0 0 2px,rgba(0,0,0,.0470588) 0 0 0 1px inset!important}.sweet-alert button[disabled]{opacity:.6;cursor:default}.sweet-alert button.confirm[disabled]{color:transparent}.sweet-alert button.confirm[disabled]~.la-ball-fall{opacity:1;visibility:visible;transition-delay:0s}.sweet-alert button::-moz-focus-inner{border:0}.sweet-alert[data-has-cancel-button=false] button{box-shadow:none!important}.sweet-alert[data-has-confirm-button=false][data-has-cancel-button=false]{padding-bottom:40px}.sweet-alert .sa-icon{width:80px;height:80px;border:4px solid gray;-webkit-border-radius:40px;border-radius:50%;margin:20px auto;padding:0;position:relative;box-sizing:content-box}.sweet-alert .sa-icon.sa-error{border-color:#F27474}.sweet-alert .sa-icon.sa-error .sa-x-mark{position:relative;display:block}.sweet-alert .sa-icon.sa-error .sa-line{position:absolute;height:5px;width:47px;background-color:#F27474;display:block;top:37px;border-radius:2px}.sweet-alert .sa-icon.sa-error .sa-line.sa-left{-webkit-transform:rotate(45deg);transform:rotate(45deg);left:17px}.sweet-alert .sa-icon.sa-error .sa-line.sa-right{-webkit-transform:rotate(-45deg);transform:rotate(-45deg);right:16px}.sweet-alert .sa-icon.sa-warning{border-color:#F8BB86}.sweet-alert .sa-icon.sa-warning .sa-body{position:absolute;width:5px;height:47px;left:50%;top:10px;-webkit-border-radius:2px;border-radius:2px;margin-left:-2px;background-color:#F8BB86}.sweet-alert .sa-icon.sa-warning .sa-dot{position:absolute;width:7px;height:7px;-webkit-border-radius:50%;border-radius:50%;margin-left:-3px;left:50%;bottom:10px;background-color:#F8BB86}.sweet-alert .sa-icon.sa-info::after,.sweet-alert .sa-icon.sa-info::before{content:"";background-color:#C9DAE1;left:50%;position:absolute}.sweet-alert .sa-icon.sa-info{border-color:#C9DAE1}.sweet-alert .sa-icon.sa-info::before{width:5px;height:29px;bottom:17px;border-radius:2px;margin-left:-2px}.sweet-alert .sa-icon.sa-info::after{width:7px;height:7px;border-radius:50%;margin-left:-3px;top:19px}.sweet-alert .sa-icon.sa-success{border-color:#A5DC86}.sweet-alert .sa-icon.sa-success::after,.sweet-alert .sa-icon.sa-success::before{content:"";position:absolute;width:60px;height:120px;background:#fff}.sweet-alert .sa-icon.sa-success::before{-webkit-border-radius:120px 0 0 120px;border-radius:120px 0 0 120px;top:-7px;left:-33px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:60px 60px;transform-origin:60px 60px}.sweet-alert .sa-icon.sa-success::after{-webkit-border-radius:0 120px 120px 0;border-radius:0 120px 120px 0;top:-11px;left:30px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:0 60px;transform-origin:0 60px}.sweet-alert .sa-icon.sa-success .sa-placeholder{width:80px;height:80px;border:4px solid rgba(165,220,134,.2);-webkit-border-radius:40px;border-radius:50%;box-sizing:content-box;position:absolute;left:-4px;top:-4px;z-index:2}.sweet-alert .sa-icon.sa-success .sa-fix{width:5px;height:90px;background-color:#fff;position:absolute;left:28px;top:8px;z-index:1;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.sweet-alert .sa-icon.sa-success .sa-line{height:5px;background-color:#A5DC86;display:block;border-radius:2px;position:absolute;z-index:2}.sweet-alert .sa-icon.sa-success .sa-line.sa-tip{width:25px;left:14px;top:46px;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.sweet-alert .sa-icon.sa-success .sa-line.sa-long{width:47px;right:8px;top:38px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.sweet-alert .sa-icon.sa-custom{background-size:contain;border-radius:0;border:none;background-position:center center;background-repeat:no-repeat}@-webkit-keyframes showSweetAlert{0%{transform:scale(.7);-webkit-transform:scale(.7)}45%{transform:scale(1.05);-webkit-transform:scale(1.05)}80%{transform:scale(.95);-webkit-transform:scale(.95)}100%{transform:scale(1);-webkit-transform:scale(1)}}@keyframes showSweetAlert{0%{transform:scale(.7);-webkit-transform:scale(.7)}45%{transform:scale(1.05);-webkit-transform:scale(1.05)}80%{transform:scale(.95);-webkit-transform:scale(.95)}100%{transform:scale(1);-webkit-transform:scale(1)}}@-webkit-keyframes hideSweetAlert{0%{transform:scale(1);-webkit-transform:scale(1)}100%{transform:scale(.5);-webkit-transform:scale(.5)}}@keyframes hideSweetAlert{0%{transform:scale(1);-webkit-transform:scale(1)}100%{transform:scale(.5);-webkit-transform:scale(.5)}}@-webkit-keyframes slideFromTop{0%{top:0}100%{top:50%}}@keyframes slideFromTop{0%{top:0}100%{top:50%}}@-webkit-keyframes slideToTop{0%{top:50%}100%{top:0}}@keyframes slideToTop{0%{top:50%}100%{top:0}}@-webkit-keyframes slideFromBottom{0%{top:70%}100%{top:50%}}@keyframes slideFromBottom{0%{top:70%}100%{top:50%}}@-webkit-keyframes slideToBottom{0%{top:50%}100%{top:70%}}@keyframes slideToBottom{0%{top:50%}100%{top:70%}}.showSweetAlert[data-animation=pop]{-webkit-animation:showSweetAlert .3s;animation:showSweetAlert .3s}.showSweetAlert[data-animation=none]{-webkit-animation:none;animation:none}.showSweetAlert[data-animation=slide-from-top]{-webkit-animation:slideFromTop .3s;animation:slideFromTop .3s}.showSweetAlert[data-animation=slide-from-bottom]{-webkit-animation:slideFromBottom .3s;animation:slideFromBottom .3s}.hideSweetAlert[data-animation=pop]{-webkit-animation:hideSweetAlert .2s;animation:hideSweetAlert .2s}.hideSweetAlert[data-animation=none]{-webkit-animation:none;animation:none}.hideSweetAlert[data-animation=slide-from-top]{-webkit-animation:slideToTop .4s;animation:slideToTop .4s}.hideSweetAlert[data-animation=slide-from-bottom]{-webkit-animation:slideToBottom .3s;animation:slideToBottom .3s}@-webkit-keyframes animateSuccessTip{0%,54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}100%{width:25px;left:14px;top:45px}}@keyframes animateSuccessTip{0%,54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}100%{width:25px;left:14px;top:45px}}@-webkit-keyframes animateSuccessLong{0%,65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}100%{width:47px;right:8px;top:38px}}@keyframes animateSuccessLong{0%,65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}100%{width:47px;right:8px;top:38px}}@-webkit-keyframes rotatePlaceholder{0%,5%{transform:rotate(-45deg);-webkit-transform:rotate(-45deg)}100%,12%{transform:rotate(-405deg);-webkit-transform:rotate(-405deg)}}@keyframes rotatePlaceholder{0%,5%{transform:rotate(-45deg);-webkit-transform:rotate(-45deg)}100%,12%{transform:rotate(-405deg);-webkit-transform:rotate(-405deg)}}.animateSuccessTip{-webkit-animation:animateSuccessTip .75s;animation:animateSuccessTip .75s}.animateSuccessLong{-webkit-animation:animateSuccessLong .75s;animation:animateSuccessLong .75s}.sa-icon.sa-success.animate::after{-webkit-animation:rotatePlaceholder 4.25s ease-in;animation:rotatePlaceholder 4.25s ease-in}@-webkit-keyframes animateErrorIcon{0%{transform:rotateX(100deg);-webkit-transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);-webkit-transform:rotateX(0);opacity:1}}@keyframes animateErrorIcon{0%{transform:rotateX(100deg);-webkit-transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);-webkit-transform:rotateX(0);opacity:1}}.animateErrorIcon{-webkit-animation:animateErrorIcon .5s;animation:animateErrorIcon .5s}@-webkit-keyframes animateXMark{0%,50%{transform:scale(.4);-webkit-transform:scale(.4);margin-top:26px;opacity:0}80%{transform:scale(1.15);-webkit-transform:scale(1.15);margin-top:-6px}100%{transform:scale(1);-webkit-transform:scale(1);margin-top:0;opacity:1}}@keyframes animateXMark{0%,50%{transform:scale(.4);-webkit-transform:scale(.4);margin-top:26px;opacity:0}80%{transform:scale(1.15);-webkit-transform:scale(1.15);margin-top:-6px}100%{transform:scale(1);-webkit-transform:scale(1);margin-top:0;opacity:1}}.animateXMark{-webkit-animation:animateXMark .5s;animation:animateXMark .5s}@-webkit-keyframes pulseWarning{0%{border-color:#F8D486}100%{border-color:#F8BB86}}@keyframes pulseWarning{0%{border-color:#F8D486}100%{border-color:#F8BB86}}.pulseWarning{-webkit-animation:pulseWarning .75s infinite alternate;animation:pulseWarning .75s infinite alternate}@-webkit-keyframes pulseWarningIns{0%{background-color:#F8D486}100%{background-color:#F8BB86}}@keyframes pulseWarningIns{0%{background-color:#F8D486}100%{background-color:#F8BB86}}.pulseWarningIns{-webkit-animation:pulseWarningIns .75s infinite alternate;animation:pulseWarningIns .75s infinite alternate}@-webkit-keyframes rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}.sweet-alert .sa-icon.sa-error .sa-line.sa-left{-ms-transform:rotate(45deg)\9}.sweet-alert .sa-icon.sa-error .sa-line.sa-right{-ms-transform:rotate(-45deg)\9}.sweet-alert .sa-icon.sa-success{border-color:transparent\9}.sweet-alert .sa-icon.sa-success .sa-line.sa-tip{-ms-transform:rotate(45deg)\9}.sweet-alert .sa-icon.sa-success .sa-line.sa-long{-ms-transform:rotate(-45deg)\9}.la-ball-fall,.la-ball-fall>div{position:relative;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.la-ball-fall{display:block;font-size:0;color:#fff;width:54px;height:18px}.la-ball-fall.la-dark{color:#333}.la-ball-fall>div{display:inline-block;float:none;background-color:currentColor;border:0 solid currentColor;width:10px;height:10px;margin:4px;border-radius:100%;opacity:0;-webkit-animation:ball-fall 1s ease-in-out infinite;-moz-animation:ball-fall 1s ease-in-out infinite;-o-animation:ball-fall 1s ease-in-out infinite;animation:ball-fall 1s ease-in-out infinite}.la-ball-fall>div:nth-child(1){-webkit-animation-delay:-.2s;-moz-animation-delay:-.2s;-o-animation-delay:-.2s;animation-delay:-.2s}.la-ball-fall>div:nth-child(2){-webkit-animation-delay:-.1s;-moz-animation-delay:-.1s;-o-animation-delay:-.1s;animation-delay:-.1s}.la-ball-fall>div:nth-child(3){-webkit-animation-delay:0s;-moz-animation-delay:0s;-o-animation-delay:0s;animation-delay:0s}.la-ball-fall.la-sm{width:26px;height:8px}.la-ball-fall.la-sm>div{width:4px;height:4px;margin:2px}.la-ball-fall.la-2x{width:108px;height:36px}.la-ball-fall.la-2x>div{width:20px;height:20px;margin:8px}.la-ball-fall.la-3x{width:162px;height:54px}.la-ball-fall.la-3x>div{width:30px;height:30px;margin:12px}@-webkit-keyframes ball-fall{0%{opacity:0;-webkit-transform:translateY(-145%);transform:translateY(-145%)}10%,90%{opacity:.5}20%,80%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-webkit-transform:translateY(145%);transform:translateY(145%)}}@-moz-keyframes ball-fall{0%{opacity:0;-moz-transform:translateY(-145%);transform:translateY(-145%)}10%,90%{opacity:.5}20%,80%{opacity:1;-moz-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-moz-transform:translateY(145%);transform:translateY(145%)}}@-o-keyframes ball-fall{0%{opacity:0;-o-transform:translateY(-145%);transform:translateY(-145%)}10%,90%{opacity:.5}20%,80%{opacity:1;-o-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-o-transform:translateY(145%);transform:translateY(145%)}}@keyframes ball-fall{0%{opacity:0;-webkit-transform:translateY(-145%);-moz-transform:translateY(-145%);-o-transform:translateY(-145%);transform:translateY(-145%)}10%,90%{opacity:.5}20%,80%{opacity:1;-webkit-transform:translateY(0);-moz-transform:translateY(0);-o-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-webkit-transform:translateY(145%);-moz-transform:translateY(145%);-o-transform:translateY(145%);transform:translateY(145%)}}</style>');
        swal({
          title: 'Starting MangaOnlineViewer',
          text: 'Please wait, 3 seconds...',
          showCancelButton: false,
          confirmButtonText: 'No, cancel!',
          confirmButtonColor: '#DD6B55',
          closeOnConfirm: true
        }, isConfirm => {
          cancel = isConfirm;
        });
      }
      setTimeout(() => {
        if (cancel) {
          logScript('Aborted');
          return;
        }
        if (manga.before !== undefined) {
          manga.before();
        }
        document.documentElement.innerHTML = reader(manga);
        setTimeout(() => {
          try {
            controls$1(manga);
            setKeyDownEvents(manga);
            checkImagesLoaded(manga);
            logScript('Site rebuild done');
            setTimeout(() => {
              loadManga(manga);
            }, 50);
          } catch (e) {
            logScript(e);
          }
        }, 50);
      }, settings.alwaysLoad ? 50 : 3000);
    }
  }

  function start(sites) {
    logScript('Starting ' + String(getInfoGM.script.name) + ' ' + String(getInfoGM.script.version) + ' on ' + String(getBrowser()) + ' with ' + String(getEngine()));
    logScript(String(sites.length) + ' Known Manga Sites');

    function waitExec(site) {
      let wait = '';
      if (site.waitEle !== undefined) {
        if (site.waitAttr !== undefined) {
          wait = $(site.waitEle).attr(site.waitAttr);
        } else {
          wait = $(site.waitEle).get();
        }
        logScript('Wating for ' + String(site.waitEle) + ' = ' + String(wait));
        if (isEmpty(wait)) {
          setTimeout(() => {
            waitExec(site);
          }, 1000);
          return;
        }
      }
      if (site.waitVar !== undefined) {
        wait = W[site.waitVar];
        logScript('Wating for ' + String(site.waitVar) + ' = ' + String(wait));
        if (isEmpty(wait)) {
          setTimeout(() => {
            waitExec(site);
          }, 1000);
          return;
        }
      }
      formatPage(site.run());
    }
    logScript('Looking for a match...');
    const test = R.compose(R.map(waitExec), R.map(logScriptC('Site Found:')), R.filter(x => R.test(x.url, location.href)));
    test(sites);
  }

  var batoto = {
    name: 'Batoto',
    url: /https?:\/\/(www.)?bato.to\/reader.*/,
    waitEle: 'select#page_select:first option',
    homepage: 'http://bato.to/',
    language: ['English'],
    category: 'manga',
    run() {
      const num = $('select#page_select:first option').length;
      return {
        title: $('.moderation_bar li:first').text(),
        series: $('div.moderation_bar a:first').attr('href'),
        quant: num,
        prev: $('img[src$=\'pprev.png\']:first').parent().attr('href'),
        next: $('img[src$=\'nnext.png\']:first').parent().attr('href'),
        listPages: [...Array(num).keys()].map(i => String(location.hash.replace('#', '/areader?id=')) + '&p=' + String(i + 1)),
        img: '#comic_page'
      };
    }
  };

  var comicastle = {
    name: 'ComiCastle',
    url: /https?:\/\/(www.)?comicastle.org\/comic\/.+\/[0-9]+.*/,
    homepage: 'http://www.comicastle.org/',
    language: ['English'],
    category: 'comic',
    run() {
      const url = $('.form-control:last option').get();
      const chapter = $('.form-control:first option');
      return {
        title: chapter.find(':selected').text(),
        series: $('.navbar-header a').attr('href'),
        quant: url.length,
        prev: chapter.find(':selected').prev().val(),
        next: chapter.find(':selected').next().val(),
        listPages: url.map(item => $(item).val()),
        img: '.chapter-img'
      };
    }
  };

  var dysnatyscans = {
    name: 'Dynasty-Scans',
    url: /https?:\/\/(www.)?dynasty-scans.com\/chapters\/.+/,
    homepage: 'https://dynasty-scans.com/',
    language: ['English'],
    category: 'manga',
    run() {
      return {
        title: $('#chapter-title').text(),
        series: '#',
        quant: W.pages.length,
        prev: $('#prev_link').attr('href'),
        next: $('#next_link').attr('href'),
        listImages: W.pages.map(x => x.image)
      };
    }
  };

  var eatmanga = {
    name: 'EatManga',
    url: /https?:\/\/(www.)?eatmanga.me\/Manga-Scan\/.+\/.+\//,
    homepage: 'http://eatmanga.me/',
    language: ['English'],
    category: 'manga',
    run() {
      const chapter = $('#top_chapter_list option:selected');
      return {
        title: $('#main_content h1').text().split(',')[0].trim(),
        series: $('ul#crumbs li a:eq(2)').attr('href'),
        quant: $('select#pages option:last').html(),
        prev: chapter.next().val(),
        next: chapter.prev().val(),
        listPages: $('select#pages option').get().map(item => $(item).val()),
        img: '#eatmanga_image , #eatmanga_image_big'
      };
    }
  };

  var egscans = {
    name: 'Easy Going Scans',
    url: /https?:\/\/read.egscans.com\/.+/,
    homepage: 'http://read.egscans.com/',
    language: ['English'],
    category: 'manga',
    run() {
      const src = W.img_url.slice(1);
      return {
        title: $('select[name="manga"] option:selected').text().trim(),
        series: '#',
        quant: src.length,
        prev: W.prev_chap,
        next: W.next_chap,
        listImages: src,
        before() {
          $(src).each((index, value) => {
            const img = new Image();
            img.src = value;
          });
        }
      };
    }
  };

  var foolslide = {
    name: 'FoOlSlide',
    url: /.+\/read\/.+/,
    homepage: '',
    language: ['English'],
    obs: 'Any Scanlator site that uses FoOLSlide',
    category: 'manga',
    run() {
      const temp = String(location.href.substr(0, location.href.lastIndexOf('/'))) + '/';
      const url = temp.match(/page\/$/) ? temp : temp + 'page/';
      const num = $('.topbar_right .dropdown li').length;
      const chapter = $('.topbar_left .dropdown_parent:last ul li a');
      return {
        title: $('title').text().trim(),
        series: $('div.tbtitle div.text a:first').attr('href'),
        quant: num,
        prev: chapter.eq(chapter.index(chapter.filter('[href*=\'' + String(location.pathname.replace(/page.+/, '')) + '\']')) + 1).attr('href'),
        next: chapter.eq(chapter.index(chapter.filter('[href*=\'' + String(location.pathname.replace(/page.+/, '')) + '\']')) - 1).attr('href'),
        listPages: [...Array(num).keys()].map(i => url + (i + 1)),
        img: 'img.open'
      };
    }
  };

  var kissmanga = {
    name: 'KissManga',
    url: /https?:\/\/(www.)?kissmanga.com\/Manga\/.+\/.+?id=[0-9]+/,
    homepage: 'http://kissmanga.com/',
    language: ['English'],
    category: 'manga',
    run() {
      const chapter = $('#selectChapter option');
      const origin = $('#navsubbar a');
      return {
        title: origin.text(),
        series: origin.attr('href'),
        quant: $('#selectPage option:last').last().html(),
        prev: chapter.filter(':selected').prev().val(),
        next: chapter.filter(':selected').next().val(),
        listImages: W.lstImages
      };
    }
  };

  var mangadoom = {
    name: 'MangaDoom',
    url: /https?:\/\/(www.)?mangadoom.co\/.+\/[0-9]+/,
    homepage: 'https://mangadoom.co/',
    language: ['English'],
    category: 'manga',
    run() {
      const url = $('.selectPage:first option:not(:first)').get();
      const chapter = $('.chapterSelect:first option:selected');
      return {
        title: $('.widget-heading').text().trim(),
        series: $('.widget-heading a').attr('href'),
        quant: url.length,
        prev: chapter.next().val(),
        next: chapter.prev().val(),
        listPages: url.map(item => $(item).val()),
        img: 'img.img-responsive'
      };
    }
  };

  var mangafox = {
    name: 'MangaFox',
    url: /https?:\/\/(www.)?mangafox.me\/manga\/.+\/.+\//,
    homepage: 'http://mangafox.me/',
    language: ['English'],
    category: 'manga',
    run() {
      const num = parseInt($('select.m:first option:last').prev().val(), 10);
      return {
        title: $('#series .no').text().trim(),
        series: $('#series a:last').attr('href'),
        quant: num,
        prev: $('#chnav p:first a').attr('href'),
        next: $('#chnav p:last a').attr('href'),
        listPages: [...Array(num).keys()].map(i => String(i + 1) + '.html'),
        img: 'img#image'
      };
    }
  };

  var mangago = {
    name: 'MangaGo',
    url: /https?:\/\/(www.)?mangago.me\/read-manga\/.+\/.+/,
    homepage: 'http://www.mangago.me/',
    language: ['English'],
    category: 'manga',
    run() {
      const origin = $('#series');
      return {
        title: origin.text(),
        series: origin.attr('href'),
        quant: $('.page a:first').text().replace(/page 1 of /, ''),
        prev: $('.readtips p:eq(4) a:first').attr('href'),
        next: $('.readtips p:eq(3) a:first').attr('href'),
        listPages: $('.page a').get().map(item => $(item).attr('href')),
        img: '#page1'
      };
    }
  };

  var mangahere = {
    name: 'MangaHere',
    url: /https?:\/\/(www.)?mangahere.co\/manga\/.+\/.+/,
    homepage: 'http://www.mangahere.co/',
    language: ['English'],
    category: 'manga',
    run() {
      const num = parseInt($('.right select:first option:last').html(), 10);
      const chapter = $('#top_chapter_list option:selected');
      return {
        title: $('.title h1').text(),
        series: $('div.title h2 a').attr('href'),
        quant: num,
        prev: chapter.prev().val(),
        next: chapter.next().val(),
        listPages: [...Array(num).keys()].map(i => String(i + 1) + '.html'),
        img: 'img#image'
      };
    }
  };

  var mangainn = {
    name: 'MangaInn',
    url: /https?:\/\/(www.)?mangainn.net\/manga\/chapter\/.+/,
    homepage: 'http://www.mangainn.net/',
    language: ['English'],
    category: 'manga',
    run() {
      const num = parseInt($('select#cmbpages option:last').html(), 10);
      const chapter = $('#chapters option:selected');
      return {
        title: $('#gotomangainfo2').text().replace(' - ', ''),
        series: $('#gotoMangaInfo').attr('href'),
        quant: num,
        prev: chapter.prev().val(),
        next: chapter.next().val(),
        listPages: [...Array(num).keys()].map(i => String(location.href) + '/page_' + String(i + 1)),
        img: 'img#imgPage'
      };
    }
  };

  var mangalyght = {
    name: 'MangaLyght',
    url: /https?:\/\/manga.lyght.net\/series\/.+\.html/,
    homepage: 'http://manga.lyght.net/',
    language: ['English'],
    category: 'manga',
    run() {
      const chapter = $('.selectchapter option:selected');
      const url = String($('form[name=\'pageSelector1\']').attr('action')) + '?ch=' + String(chapter.val().replace(' ', '+')) + '&page=';
      const num = $('.selectpage option').length;
      const origin = $('div.entry h1 a');
      return {
        title: origin.text().trim(),
        series: origin.attr('href'),
        quant: num,
        prev: (String(location.pathname) + '?ch=' + String(chapter.prev().val())).replace(' ', '+'),
        next: (String(location.pathname) + '?ch=' + String(chapter.next().val())).replace(' ', '+'),
        listPages: [...Array(num).keys()].map(i => url + (i + 1)),
        img: '#mainimage'
      };
    }
  };

  var mangapark = {
    name: 'MangaPark',
    url: /https?:\/\/(www.)?mangapark.me\/manga\/.+\/.+/,
    homepage: 'http://mangapark.me/',
    language: ['English'],
    category: 'manga',
    run() {
      const url = location.href + (location.href.lastIndexOf('/') !== location.href.length - 1 ? '/' : '');
      const num = $('.info div:eq(1) a').length;
      return {
        title: $('.loc a:first').text().trim(),
        series: '/manga/' + String(location.pathname.split('/')[2]),
        quant: num,
        prev: $('.info a:eq(0)').attr('href'),
        next: $('.info a:eq(1)').attr('href'),
        listPages: [...Array(num).keys()].map(i => url + (i + 1)),
        img: '.img'
      };
    }
  };

  var mangareader = {
    name: ['MangaReader', 'MangaPanda'],
    url: /https?:\/\/(www.)?(mangareader|mangapanda)(.net|.com)\/.+\/.+/,
    homepage: ['http://www.mangareader.net/', 'http://www.mangapanda.com/'],
    language: ['English'],
    category: 'manga',
    run() {
      const url = location.href + (location.href.lastIndexOf('/') !== location.href.length - 1 ? '/' : '');
      const num = parseInt($('select#pageMenu option:last').html(), 10);
      const chapter = $('#mangainfo_bas a');
      return {
        title: $('#mangainfo h1').text(),
        series: $('#mangainfo a').attr('href'),
        quant: num,
        prev: chapter.last().attr('href'),
        next: chapter.first().attr('href'),
        listPages: [...Array(num).keys()].map(i => url + (i + 1), num),
        img: 'img#img',
        before() {
          if (location.pathname.match(/\/.+\/.+\/chapter-[0-9]+.*/)) {
            const path = location.pathname.split('/');
            location.pathname = '/' + String(path[2]) + '/' + String(path[3].match(/[0-9]+/));
          } else if (location.search) {
            location.href = location.pathname;
          }
        }
      };
    }
  };

  var mangastream = {
    name: 'MangaStream',
    url: /https?:\/\/(www.)?(mangastream|readms)(.net|.com)\/r.*\/.+/,
    homepage: 'http://mangastream.com/',
    language: ['English'],
    category: 'manga',
    run() {
      const url = location.href.substring(0, location.href.lastIndexOf('/') + 1);
      const num = parseInt($('div.controls div.btn-group ul.dropdown-menu li:last').text().match(/[0-9]+/), 10);
      const chapter = $('.dropdown-menu:eq(1) a');
      return {
        title: $('.btn:eq(0)').text().trim(),
        series: $('div.controls div.btn-group ul.dropdown-menu:first li a:last').attr('href'),
        quant: num,
        prev: chapter.eq(chapter.index(chapter.filter('[href*=\'' + String(location.pathname) + '\']')) + 1).attr('href'),
        next: chapter.eq(chapter.index(chapter.filter('[href*=\'' + String(location.pathname) + '\']')) - 1).attr('href'),
        listPages: [...Array(num).keys()].map(i => url + (i + 1)),
        img: 'img#manga-page'
      };
    }
  };

  var mangatown = {
    name: 'MangaTown',
    url: /https?:\/\/(www.)?mangatown.com\/manga\/.+\/.+/,
    homepage: 'http://www.mangatown.com/',
    language: ['English'],
    category: 'manga',
    waitEle: '#top_chapter_list option',
    run() {
      const num = $('.page_select select:first option').get();
      const chapter = $('#top_chapter_list option:selected');
      return {
        title: $('.title h1').text(),
        series: $('.title h2 a').attr('href'),
        quant: num.length,
        prev: chapter.prev().val(),
        next: chapter.next().val(),
        listPages: num.map(item => $(item).val()),
        img: '#image'
      };
    }
  };

  var ninemanga = {
    name: 'NineManga',
    url: /https?:\/\/(www.)?ninemanga.com\/chapter\/.+\/.+\.html/,
    homepage: 'http://ninemanga.com/',
    language: ['English'],
    category: 'manga',
    run() {
      return {
        title: $('.tip a:first').text(),
        series: $('.subgiude a:eq(1)').attr('href'),
        quant: $('#page:first option').length,
        prev: $('.chnav a:first').attr('href'),
        next: $('.chnav a:eq(1)').attr('href'),
        listPages: $('#page:first option').get().map(item => $(item).val()),
        img: '.manga_pic'
      };
    }
  };

  var readmangatoday = {
    name: 'ReadManga.Today',
    url: /https?:\/\/(www.)?readmanga.today\/.+\/[0-9]+/,
    homepage: 'http://www.readmanga.today/',
    language: ['English'],
    category: 'manga',
    run() {
      const chapter = $('select[name="chapter_list"] option:selected');
      return {
        title: $('title').text().trim(),
        series: $('.btn:eq(4)').attr('href'),
        quant: $('select[name="category_type"]:last option').get().length,
        prev: chapter.next('option').val(),
        next: chapter.prev('option').val(),
        bruteForce(func) {
          func.getPage(String(location) + '/all-pages').then(html => {
            const listImages = $(html).find('img.img-responsive-2').get().map(item => $(item).attr('src'));
            func.loadMangaImages({
              listImages
            });
          });
        }
      };
    }
  };

  var senmanga = {
    name: 'SenManga(Raw)',
    url: /https?:\/\/raw.senmanga.com\/.+\/.+\/?/,
    homepage: 'http://raw.senmanga.com/',
    language: ['English'],
    category: 'manga',
    run() {
      const url = '/' + String(location.pathname.split('/')[1]) + '/' + String(location.pathname.split('/')[2]);
      const num = parseInt($('select[name=\'page\'] option:last').val(), 10);
      const chapter = $('select[name="chapter"] option:selected');
      const origin = $('.title a');
      return {
        title: $('.title').text().trim(),
        series: origin.attr('href'),
        quant: num,
        prev: origin.attr('href') + chapter.next().val(),
        next: origin.attr('href') + chapter.prev().val(),
        listPages: [...Array(num).keys()].map(i => url + '/' + String(i + 1) + '/'),
        img: '#picture',
        before() {
          $('body').contents().filter(() => this.nodeType === 3).remove();
        }
      };
    }
  };

  var tenmanga = {
    name: 'TenManga',
    url: /https?:\/\/(www.)?tenmanga.com\/chapter\/.+/,
    homepage: 'http://www.tenmanga.com/',
    language: ['English'],
    category: 'manga',
    run() {
      const url = $('.sl-page:first option').get();
      const chapter = $('.sl-chap:first option:selected');
      return {
        title: $('.read-page  a:eq(2)').text().replace('»', '').trim(),
        series: $('.read-page a:eq(1)').attr('href'),
        quant: url.length,
        prev: chapter.next().val(),
        next: chapter.prev().val(),
        listPages: url.map(item => $(item).val()),
        img: '.manga_pic'
      };
    }
  };

  var thespectrum = {
    name: 'TheSpectrum',
    url: /https?:\/\/view.thespectrum.net\/.+/,
    homepage: 'http://www.thespectrum.net/',
    language: ['English'],
    category: 'manga',
    run() {
      const url = String(location.pathname) + '?' + String($('form').serialize().substring(0, $('form').serialize().lastIndexOf('=')));
      const num = $('.selectpage option').length;
      const chapter = $('.selectchapter option:selected');
      return {
        title: $('.viewerLabel:eq(1)').text(),
        series: '#',
        quant: num,
        prev: String(location.pathname) + '?ch=' + String(chapter.prev().val()),
        next: String(location.pathname) + '?ch=' + String(chapter.next().val()),
        listPages: [...Array(num).keys()].map(i => url + '=' + String(i + 1)),
        img: '#imgContainer img'
      };
    }
  };

  var wpmanga = {
    name: ['MangaDeep'],
    url: /https?:\/\/(www.)?(mangadeep).com\/.+\/[0-9]+/,
    homepage: ['http://mangadeep.com/'],
    language: ['English'],
    category: 'manga',
    run() {
      const url = '/' + String(location.pathname.split('/')[1]) + '/' + String(location.pathname.split('/')[2]);
      const num = parseInt($('select.cbo_wpm_pag:first option:last').html(), 10);
      const chapter = $('.cbo_wpm_chp option:selected');
      const key = $('.cbo_wpm_chp').attr('onchange').replace(/location.href='/, '');
      return {
        title: $('.wpm_pag h1').text().trim(),
        series: $('h1.ttl a').attr('href'),
        quant: num,
        prev: key.replace(/'.+/, chapter.next().val()),
        next: key.replace(/'.+/, chapter.prev().val()),
        listPages: [...Array(num).keys()].map(i => url + '/' + String(i + 1) + '/'),
        img: 'img.manga-page , .prw > a img, .prw a img'
      };
    }
  };

  var funmanga = {
    name: 'Funmanga',
    url: /https?:\/\/(www.)?funmanga.com\/.+\/[0-9]+/,
    homepage: 'http://funmanga.com/',
    language: ['English'],
    category: 'manga',
    run() {
      const chapter = $('.extra-buttons select:first option:selected');
      const url = $('.widget-heading select option').get().slice(1);
      return {
        title: $('title').text().trim(),
        series: $('h5.widget-heading a:first').attr('href'),
        quant: url.length,
        prev: chapter.next('option').val(),
        next: chapter.prev('option').val(),
        listPages: url.map(item => $(item).val()),
        img: '.img-responsive'
      };
    }
  };

  var unionmangas = {
    name: 'UnionMangas',
    url: /http?:\/\/unionmangas.net\/leitor\/.+\/.+/,
    homepage: 'http://unionmangas.net/',
    language: ['Portuguese'],
    category: 'manga',
    run() {
      const origin = $('#topo h1 a');
      const chapter = $('#cap_manga1 option:selected');
      const src = $('.item img.real').get();
      return {
        title: origin.text(),
        series: origin.attr('href'),
        quant: $('.selectPage:first option').length,
        prev: chapter.prev().val(),
        next: chapter.next().val(),
        listImages: [$(src[0]).attr('src')].concat(src.splice(1).map(item => $(item).attr('data-lazy')))
      };
    }
  };

  var mangahost = {
    name: 'MangaHost',
    url: /https?:\/\/mangahost.net\/manga\/.+\/.+/,
    homepage: 'https://mangahost.net/',
    language: ['Portuguese'],
    category: 'manga',
    run() {
      const url = location.href + (location.href.lastIndexOf('/') !== location.href.length - 1 ? '/' : '');
      const chapter = $('.viewerChapter:first option:selected');
      const num = parseInt($('.viewerPage:first option:last').html(), 10);
      const manga = {
        title: $('.breadcrumb li:eq(3)').text().trim(),
        series: $('.breadcrumb li:eq(2) a').attr('href'),
        quant: num,
        prev: chapter.next().val(),
        next: chapter.prev().val(),
        img: '.image-content img'
      };
      if ($('.read-slideshow img').get().length === 0) {
        manga.listPages = [...Array(num).keys()].map(i => url + (i + 1));
      } else {
        manga.listImages = $('.read-slideshow img').get().map(item => $(item).attr('src'));
      }
      return manga;
    }
  };

  var sites = [batoto, comicastle, dysnatyscans, eatmanga, egscans, foolslide, kissmanga, mangadoom, mangafox, mangago, mangahere, mangainn, mangalyght, mangapark, mangareader, mangastream, mangatown, ninemanga, readmangatoday, senmanga, tenmanga, thespectrum, wpmanga, funmanga, unionmangas, mangahost];

  start(sites);

}());