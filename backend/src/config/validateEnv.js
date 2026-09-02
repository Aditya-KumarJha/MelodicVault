const hasValue = (value) => value != null && String(value).trim() !== "";

const requireOneOf = (names) => names.some((name) => hasValue(process.env[name]));

export const validateEnv = () => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = [];
  const required = [
    "MONGO_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
  ];

  for (const name of required) {
    if (!hasValue(process.env[name])) {
      missing.push(name);
    }
  }

  if (!requireOneOf(["CORS_ORIGIN", "FRONTEND_URL"])) {
    missing.push("CORS_ORIGIN or FRONTEND_URL");
  }

  if (!requireOneOf(["REDIS_URL", "REDIS_HOST"])) {
    missing.push("REDIS_URL or REDIS_HOST");
  }

  const googleOAuthEnabled =
    hasValue(process.env.GOOGLE_CLIENT_ID) || hasValue(process.env.GOOGLE_CLIENT_SECRET);
  const githubOAuthEnabled =
    hasValue(process.env.GITHUB_CLIENT_ID) || hasValue(process.env.GITHUB_CLIENT_SECRET);

  if (googleOAuthEnabled && !hasValue(process.env.GOOGLE_CLIENT_SECRET)) {
    missing.push("GOOGLE_CLIENT_SECRET");
  }

  if (googleOAuthEnabled && !hasValue(process.env.GOOGLE_CLIENT_ID)) {
    missing.push("GOOGLE_CLIENT_ID");
  }

  if (githubOAuthEnabled && !hasValue(process.env.GITHUB_CLIENT_SECRET)) {
    missing.push("GITHUB_CLIENT_SECRET");
  }

  if (githubOAuthEnabled && !hasValue(process.env.GITHUB_CLIENT_ID)) {
    missing.push("GITHUB_CLIENT_ID");
  }

  if ((googleOAuthEnabled || githubOAuthEnabled) && !hasValue(process.env.BACKEND_URL)) {
    missing.push("BACKEND_URL");
  }

  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }
};
