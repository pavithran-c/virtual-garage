import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5001/api";

const getMonthStart = (year, month) => new Date(year, month, 1);
const getMonthEnd = (year, month) => new Date(year, month + 1, 0, 23, 59, 59, 999);

const EmployeeSalaryTable = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    // Pass month and year as query params
    axios
      .get(
        `${API_URL}/employees/salary-summaries?year=${year}&month=${month + 1}`,
        { withCredentials: true }
      )
      .then((res) => setSummaries(res.data.summaries))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to fetch salary summaries")
      )
      .finally(() => setLoading(false));
  }, [year, month]);

  const handleMonthChange = (e) => setMonth(Number(e.target.value));
  const handleYearChange = (e) => setYear(Number(e.target.value));

  // Generate last 5 years for dropdown
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) return <div>Loading salary summaries...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-xl font-semibold text-teal-800">
          All Employees Salary Summary
        </h2>
        <div className="flex gap-2">
          <select value={month} onChange={handleMonthChange} className="p-2 border rounded">
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={handleYearChange} className="p-2 border rounded">
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-teal-100 text-teal-800">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Base Salary</th>
              <th className="p-2 text-left">Total Deductions</th>
              <th className="p-2 text-left">Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((emp) => (
              <tr key={emp._id} className="border-b">
                <td className="p-2">{emp.name}</td>
                <td className="p-2">₹{emp.baseSalary?.toLocaleString() || 0}</td>
                <td className="p-2">₹{emp.totalDeductions?.toLocaleString() || 0}</td>
                <td className="p-2 text-teal-700 font-semibold">
                  ₹{emp.netSalary?.toLocaleString() || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeSalaryTable;