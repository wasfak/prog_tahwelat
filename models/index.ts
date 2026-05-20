import mongoose, { Schema, model, models, Types } from "mongoose";

// ---------- Branch ----------
const branchSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);

// ---------- User ----------
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "auditor", "branch", "purchase"],
      required: true,
    },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", default: null },
  },
  { timestamps: true },
);

// ---------- Batch ----------
const batchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    batchStatus: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ---------- Code ----------
const codeSchema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },

    // from Excel
    code: { type: String, required: true },
    productName: { type: String, required: true },
    fromBranchId: { type: Schema.Types.ObjectId, ref: "Branch", default: null },
    fromBranchRaw: { type: String, default: null },
    toBranchId: { type: Schema.Types.ObjectId, ref: "Branch", default: null },
    toBranchRaw: { type: String, default: null },
    quantity: { type: Number, default: 0 },
    tarsed: { type: String, default: null },

    // auditor side (hidden from branch)
    auditorNotes: { type: String, default: null },
    auditorStatus: {
      type: String,
      enum: ["pending", "finished"],
      default: "pending",
    },
    auditorUpdatedAt: { type: Date, default: null },

    // branch side (hidden from auditor)
    branchNotes: { type: String, default: null },
    branchStatus: {
      type: String,
      enum: ["pending", "finished"],
      default: "pending",
    },
    branchUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// indexes that match your query patterns
codeSchema.index({ batchId: 1 });
codeSchema.index({ toBranchId: 1, auditorStatus: 1 });
codeSchema.index({ auditorStatus: 1 });

// `models.X ||` guard prevents "OverwriteModelError" on hot reload
export const Branch = models.Branch || model("Branch", branchSchema);
export const User = models.User || model("User", userSchema);
export const Batch = models.Batch || model("Batch", batchSchema);
export const Code = models.Code || model("Code", codeSchema);
