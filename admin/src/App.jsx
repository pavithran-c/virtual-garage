import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg';
import './App.css';
import AddEmployee from './Components/Employee';
import AdminEmployeeManagement from './Components/ServiceProgressInput';
import SalaryDeduction from './Components/Appointments';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SalaryDeduction/>
    </>
  )
}

export default App
