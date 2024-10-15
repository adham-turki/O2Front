import './App.css';
import EngineersDashboard from './components/EmployeeStats';
import TicketsDashboard from './components/TicketsStatistics';
import MainDashboard from './components/MainDashboard';
import CustomDashboard from './components/CustomDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TicketWorkflow from './components/TicketFlow';
import CustomerDashboard from './components/Customer';
import Component from './components/funnel';

function App() {
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        setTickets(data);
        console.log("Tickets data:", data);
      } catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flexGrow: 1, padding: '20px', marginTop: '48px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/main-dashboard" />} />
            <Route path="/main-dashboard" element={<MainDashboard ticketData={tickets} />} />
            <Route path="/ticket-dashboard" element={<TicketsDashboard tickets={tickets} />} />
            <Route path="/engineers-dashboard" element={<EngineersDashboard ticketData={tickets} />} />
            <Route path="/custom-dashboard" element={<CustomDashboard ticketData={tickets} />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard ticketData={tickets} />} />
            <Route path="/ticket-flow" element={<TicketWorkflow />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
    // <>
    // <Component />
    // </>

  );
}

export default App;
