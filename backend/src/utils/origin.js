const splitList = (value = "") =>
  String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeOrigin = (origin) => {
  if (!origin) return "";
  return String(origin).trim().replace(/\/+$/, "");
};

const buildAllowedOrigins = () => {
  const origins = [
    ...splitList(process.env.CORS_ORIGIN),
    ...splitList(process.env.FRONTEND_URL),
    "http://localhost:5173",
  ];

  return [...new Set(origins.map(normalizeOrigin).filter(Boolean))];
};

const getPrimaryFrontendUrl = () => buildAllowedOrigins()[0] || "http://localhost:5173";

const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  if (buildAllowedOrigins().includes(normalized)) return true;

  const previewPattern = process.env.VERCEL_PREVIEW_ORIGIN_PATTERN;
  if (previewPattern) {
    try {
      return new RegExp(previewPattern).test(normalized);
    } catch {
      return false;
    }
  }

  return false;
};

export { buildAllowedOrigins, getPrimaryFrontendUrl, isOriginAllowed, normalizeOrigin };
