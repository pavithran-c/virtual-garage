import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navbar from "./Components/Navbar";
import EmployeeSalaryDeduction from "./Components/EmployeeManagement/EmployeeSalaryDeduction";
import AdminEmployeeManagement from "./Components/EmployeeManagement/AdminEmployeeManagement";
import Employee from "./Components/Employee";

// Layout with Navbar
const Layout = () => (
  <div className="font-poppins min-h-screen bg-gray-100">
    <Navbar />
    <main className="p-4 sm:p-6">
      <Outlet />
    </main>
  </div>
);

const App = () => {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Employee />,
        },
        {
          path: "/employee",
          element: <AdminEmployeeManagement />,
        },
        {
          path: "/deduction",
          element: <EmployeeSalaryDeduction />,
        },
        
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;