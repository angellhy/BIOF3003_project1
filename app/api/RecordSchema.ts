import mongoose from "mongoose";

// Define the schema with an extra field for ppgData
export const RecordSchema = new mongoose.Schema({
  subjectId: { type: String, required: true },
  heartRate: {
    bpm: { type: Number, required: true },
    confidence: { type: Number, required: true },
  },
  hrv: {
    sdnn: { type: Number, required: true },
    confidence: { type: Number, required: true },
  },
  ppgData: { type: [Number], required: true },
  timestamp: { type: Date, default: Date.now },
});


// Use an existing model if available or compile a new one
export const Record = mongoose.models.Record || mongoose.model('Record', RecordSchema);