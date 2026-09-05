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
            .select('fileName fileSize status algorithm melodyLength createdAt updatedAt')
            .lean();

        return res.json({ records });
    } catch (error) {
        console.error("Vault history fetch failed:", error);
        return res.status(500).json({ message: "Vault history fetch failed" });
    }
};

export const createVaultRecord = async (req, res) => {
    const { fileName, fileSize, status, algorithm, melodyLength } = req.body;

    if (!fileName || typeof fileName !== 'string') {
        return res.status(400).json({ message: 'A file name is required' });
    }

    const record = await VaultRecord.create({
        user: req.user._id,
        fileName,
        fileSize,
        status,
        algorithm,
        melodyLength,
    });

    return res.status(201).json({ record });
};