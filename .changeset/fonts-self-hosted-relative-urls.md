---
"@quartz-community/quartz-fonts": patch
---

Self-hosted fonts now work on localhost and under a base path: font URLs in `quartz-fonts.css` are relative to the stylesheet and the stylesheet link is relative to each page (jackyzha0/quartz#2547). `baseUrl` is no longer required for `fontOrigin: "selfHosted"`.
