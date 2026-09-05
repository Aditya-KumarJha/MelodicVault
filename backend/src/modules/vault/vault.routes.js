import express from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { uploadVaultFile } from "./vault.controller.js";
import { createVaultRecord, getVaultHistory } from "./vault.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRoot = path.resolve(__dirname, "../../../uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            req.vaultId = crypto.randomUUID();

            const vaultDirectory = path.join(
                uploadRoot,
                req.vaultId
            );

            fs.mkdirSync(vaultDirectory, {
                recursive: true
            });

            cb(null, vaultDirectory);

        } catch (error) {
            cb(error);
        }
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        cb(
            null,
            `original${extension}`
        );
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 500 * 1024 * 1024
    }
});

router.post(
    "/upload",
    upload.single("file"),
    uploadVaultFile
);

router.get("/history", authenticate, getVaultHistory);
router.post("/history", authenticate, createVaultRecord);

export default router;