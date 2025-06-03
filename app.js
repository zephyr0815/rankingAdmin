const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const { createProxyMiddleware } = require("http-proxy-middleware");
const i18n = require("i18n");
const cookieParser = require("cookie-parser");
const config = require("config");
const app = express();

// ✅ i18n Configuration (no cookies)
i18n.configure({
  locales: ['en', 'ko', 'ja', 'zh'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  cookie: 'lang',
  queryParameter: 'lang',
  autoReload: true,
  updateFiles: false,
  objectNotation: true
});

app.use(cookieParser());
// Init i18n middleware
app.use(i18n.init);


app.use((req, res, next) => {
  const supported = ['en','ko','ja','zh'];
  let lang = req.query.lang
          || req.cookies.lang   
          || req.acceptsLanguages(supported)
          || i18n.getLocale();

  if (!supported.includes(lang)) lang = i18n.getLocale();
  i18n.setLocale(req, lang);
  res.locals.currentLang = lang;
  res.locals.apiUrl = config.get('ApiUrl');
  next();
});


app.get('/change-lang', (req, res) => {
  const lang = req.query.lang;
  if (['en','ko','ja','zh'].includes(lang)) {
    res.cookie('lang', lang, { maxAge: 30*24*60*60*1000 }); // 30 days
    i18n.setLocale(req, lang);
  }
  res.redirect('back');
});

app.use((req, res, next) => {
  console.log('→ cookies:', req.cookies);
  next();
});

// 1) PROXY /api/* → backend http://localhost:4000/api/*
app.use(
  "/api",
  createProxyMiddleware({
    // target: "http://gs.ev0-games.com:4000/api",  
    target: config.ApiUrl + "/api",  
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq:  (proxyReq, req, res) =>
      console.log(`→ PROXY REQ  ${req.method} ${req.originalUrl}`),
    onProxyRes: (proxyRes, req, res) =>
      console.log(`← PROXY RES  ${req.method} ${req.originalUrl} → ${proxyRes.statusCode}`),
    onError:      (err, req, res) => {
      console.error("💥 PROXY ERROR:", err);
      res.status(500).json({ error: "Proxy error" });
    },
  })
);

// 2) Body parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Static assets
app.use(express.static(path.join(__dirname, "public")));

// 4) EJS + layouts
app.use(expressLayouts);
app.set("layout", "./layout/layout");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 5) Your page router
const pageRouter = require("./routes/routes");
pageRouter(app);

// 6) Start server
const PORT = process.env.PORT || 4021;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
