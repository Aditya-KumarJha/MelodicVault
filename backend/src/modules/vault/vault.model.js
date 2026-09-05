import mongoose from 'mongoose';

const vaultRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true, trim: true, maxlength: 255 },
    fileSize: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['locked', 'unlocked', 'failed'], default: 'locked' },
    algorithm: { type: String, trim: true, maxlength: 50, default: 'AES-256-GCM' },
    melodyLength: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

vaultRecordSchema.index({ user: 1, createdAt: -1 });

const VaultRecord = mongoose.models.VaultRecord || mongoose.model('VaultRecord', vaultRecordSchema);

export default VaultRecord;