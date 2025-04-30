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

// POST /api/employees - Add new employee
router.post("/", async (req, res) => {
  try {
    const { employeeId, name, email, role, department, phone, status, salary } = req.body;
    if (
      !employeeId ||
      !name ||
      !email ||
      !role ||
      !department ||
      !status ||
      !salary
    )
      return res.status(400).json({ message: "All required fields must be provided" });

    // Check for unique employeeId
    const exists = await Employee.findOne({ employeeId });
    if (exists)
      return res.status(400).json({ message: "Employee ID already exists" });

    const employee = new Employee({
      employeeId,
      name,
      email,
      role,
      department,
      phone,
      status,
      salary,
    });
    await employee.save();
    res.status(201).json({ employee });
  } catch (error) {
    console.error("Error adding employee:", error.message, error.stack);
    res.status(500).json({ message: "Server error while adding employee" });
  }
});

// PUT /api/employees/:id - Update employee
router.put("/:id", async (req, res) => {
  try {
    const { employeeId, name, email, role, department, phone, status, salary } = req.body;
    if (
      !employeeId ||
      !name ||
      !email ||
      !role ||
      !department ||
      !status ||
      !salary
    )
      return res.status(400).json({ message: "All required fields must be provided" });

    // Check for unique employeeId (excluding current employee)
    const exists = await Employee.findOne({ employeeId, _id: { $ne: req.params.id } });
    if (exists)
      return res.status(400).json({ message: "Employee ID already exists" });

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { employeeId, name, email, role, department, phone, status, salary },
      { new: true }
    );
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ employee });
  } catch (error) {
    console.error("Error updating employee:", error.message, error.stack);
    res.status(500).json({ message: "Server error while updating employee" });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted" });
  } catch (error) {
    console.error("Error deleting employee:", error.message, error.stack);
    res.status(500).json({ message: "Server error while deleting employee" });
  }
});

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