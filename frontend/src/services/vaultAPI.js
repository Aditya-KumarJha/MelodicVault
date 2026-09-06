const API_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadVaultFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/vault/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server returned invalid response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data.message || 'File upload failed');
  }

  return data;
};

export const fetchVaultHistory = async () => {
  const response = await fetch(`${API_URL}/api/vault/history`, {
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not load vault history');
  return data.records || [];
};

export const createVaultRecord = async (metadata) => {
  const response = await fetch(`${API_URL}/api/vault/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(metadata),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not save vault metadata');
  return data.record;
};
