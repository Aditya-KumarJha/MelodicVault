import VaultRecord from './vault.model.js';

export const uploadVaultFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",

            vault: {
                vaultId: req.vaultId,
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype
            }
        });

    } catch (error) {
        console.error("File upload failed:", error);

        return res.status(500).json({
            success: false,
            message: "File upload failed"
        });
    }
};

export const getVaultHistory = async (req, res) => {
    try {
        const records = await VaultRecord.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(100)
            .select('fileName fileSize mimeType status algorithm melodyLength hasRecoveryPhrase createdAt updatedAt')
            .lean();

        return res.json({ records });
    } catch (error) {
        console.error("Vault history fetch failed:", error);
        return res.status(500).json({ message: "Vault history fetch failed" });
    }
};

export const createVaultRecord = async (req, res) => {
    const { fileName, fileSize, mimeType, algorithm, melodyLength, hasRecoveryPhrase } = req.body;
    const normalizedFileName = typeof fileName === 'string' ? fileName.trim() : '';

    if (!normalizedFileName) {
        return res.status(400).json({ message: 'A file name is required' });
    }

    if (normalizedFileName.length > 255 || (mimeType && mimeType.length > 255)) {
        return res.status(400).json({ message: 'Vault metadata is too long' });
    }

    if (fileSize !== undefined && (!Number.isFinite(fileSize) || fileSize < 0)) {
        return res.status(400).json({ message: 'File size must be a non-negative number' });
    }

    if (melodyLength !== undefined && (!Number.isInteger(melodyLength) || melodyLength < 0)) {
        return res.status(400).json({ message: 'Melody length must be a non-negative integer' });
    }

    const record = await VaultRecord.create({
        user: req.user._id,
        fileName: normalizedFileName,
        fileSize,
        mimeType: mimeType || undefined,
        status: 'locked',
        algorithm: algorithm || 'AES-256-GCM',
        melodyLength,
        hasRecoveryPhrase: hasRecoveryPhrase !== false,
    });

    return res.status(201).json({ record });
};