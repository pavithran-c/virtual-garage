const express = require("express");
const router = express.Router();
const Employee = require("../Models/Employee");
const Deduction = require("../Models/Deductions");


// GET /api/employees - Fetch all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error.message, error.stack);
    res.status(500).json({ message: "Server error while fetching employees" });
  }
});

// GET /api/employees/:id - Fetch single employee
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ employee });
  } catch (error) {
    console.error("Error fetching employee:", error.message, error.stack);
    if (error.kind === "ObjectId")
      return res.status(400).json({ message: "Invalid employee ID" });
    res.status(500).json({ message: "Server error while fetching employee" });
  }
});

// GET /api/employees/:id/deductions - Fetch all deductions
router.get("/:id/deductions", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    const deductions = await Deduction.find({ employeeId: req.params.id }).sort({
      date: -1,
    });
    res.json({ deductions });
  } catch (error) {
    console.error("Error fetching deductions:", error.message, error.stack);
    if (error.kind === "ObjectId")
      return res.status(400).json({ message: "Invalid employee ID" });
    res.status(500).json({ message: "Server error while fetching deductions" });
  }
});

// POST /api/employees/:id/deductions - Add a deduction
router.post(
  "/:id/deductions",
  async (req, res) => {
    const { amount, reason, date } = req.body;
    if (!amount || !reason || !date)
      return res
        .status(400)
        .json({ message: "Amount, reason, and date are required" });
    if (typeof amount !== "number" || amount < 0)
      return res
        .status(400)
        .json({ message: "Amount must be a non-negative number" });
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee)
        return res.status(404).json({ message: "Employee not found" });

      // Calculate existing total deductions
      const existingDeductions = await Deduction.find({ employeeId: req.params.id });
      const totalDeductions = existingDeductions.reduce(
        (sum, d) => sum + d.amount,
        0
      );

      // Check if new deduction would exceed salary
      if (totalDeductions + amount > employee.salary)
        return res.status(400).json({
          message: "Total deductions cannot exceed employee salary",
        });

      const deduction = new Deduction({
        employeeId: req.params.id,
        amount,
        reason: reason.trim(),
        date: new Date(date),
      });
      await deduction.save();
      res.status(201).json({ deduction });
    } catch (error) {
      console.error("Error creating deduction:", error.message, error.stack);
      if (error.kind === "ObjectId")
        return res.status(400).json({ message: "Invalid employee ID" });
      res.status(500).json({ message: "Server error while creating deduction" });
    }
  }
);

// GET /api/employees/:id/net-salary - Calculate net salary
router.get(
  "/:id/net-salary",
  async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee)
        return res.status(404).json({ message: "Employee not found" });
      const deductions = await Deduction.find({ employeeId: req.params.id });
      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
      const netSalary = Math.max(0, employee.salary - totalDeductions);
      res.json({
        baseSalary: employee.salary,
        totalDeductions,
        netSalary,
      });
    } catch (error) {
      console.error("Error calculating net salary:", error.message, error.stack);
      if (error.kind === "ObjectId")
        return res.status(400).json({ message: "Invalid employee ID" });
      res.status(500).json({ message: "Server error while calculating net salary" });
    }
  }
);

module.exports = router;