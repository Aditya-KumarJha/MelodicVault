const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const normalizeUsername = (value) => {
  if (!value) return null;
  return String(value).trim().toLowerCase();
};

export { normalizeEmail, normalizeUsername };
