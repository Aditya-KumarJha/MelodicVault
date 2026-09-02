import ImageKit from 'imagekit';

const getImageKit = () => new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const parseDataUrl = (value) => {
  const match = String(value || '').match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
};

export const uploadProfileImage = async ({ image }) => {
  if (!image) return '';

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  const parsed = parseDataUrl(image);
  if (!parsed) {
    throw new Error('Profile image must be a URL or base64 data URL');
  }

  if (parsed.buffer.length > 2 * 1024 * 1024) {
    throw new Error('Profile image cannot exceed 2MB');
  }

  if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY) {
    throw new Error('ImageKit is not configured');
  }

  const uploaded = await getImageKit().upload({
    file: parsed.buffer,
    fileName: `profile-${Date.now()}`,
    folder: '/melodic-vault/profiles',
    useUniqueFileName: true,
    tags: ['profile-picture'],
  });

  return uploaded.url;
};
