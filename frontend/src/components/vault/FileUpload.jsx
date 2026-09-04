import { useState } from "react";
import { uploadVaultFile } from "../../services/vaultAPI.js";

export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedVault, setUploadedVault] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] || null;

        setFile(selectedFile);
        setUploadedVault(null);
        setError("");
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        try {
            setUploading(true);
            setError("");
            setUploadedVault(null);

            const data = await uploadVaultFile(file);

            setUploadedVault(data.vault);

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h2>Upload File</h2>

            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
            />

            {file && (
                <div>
                    <p>Selected file:</p>
                    <p>{file.name}</p>
                </div>
            )}

            <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
            >
                {uploading ? "Uploading..." : "Upload File"}
            </button>

            {error && (
                <p>
                    {error}
                </p>
            )}

            {uploadedVault && (
                <div>
                    <p>Upload successful!</p>

                    <p>
                        Vault ID:
                        {" "}
                        {uploadedVault.vaultId}
                    </p>
                </div>
            )}
        </div>
    );
}