const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
 role: {
    type: String,
    enum: ["manager", "technician", "support", "other"],
    default: "technician",
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    trim: true,
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s-]{7,15}$/, "Invalid phone number"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  salary: {
    type: Number,
    required: [true, "Salary is required"],
    min: [1000, "Salary must be at least 1000"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

employeeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);