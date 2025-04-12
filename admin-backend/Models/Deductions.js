const mongoose = require("mongoose");

const deductionSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Employee ID is required"],
  },
  amount: {
    type: Number,
    required: [true, "Deduction amount is required"],
    min: [0, "Amount cannot be negative"],
  },
  reason: {
    type: String,
    required: [true, "Reason is required"],
    trim: true,
    minlength: [3, "Reason must be at least 3 characters"],
  },
  date: {
    type: Date,
    required: [true, "Deduction date is required"],
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Deduction", deductionSchema);