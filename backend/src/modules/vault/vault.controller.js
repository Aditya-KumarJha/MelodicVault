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