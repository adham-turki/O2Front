import './App.css';
import EngineersDashboard from './components/EmployeeStats';
import TicketsDashboard from './components/TicketsStatistics';
import MainDashboard from './components/MainDashboard';
import CustomDashboard from './components/TicketsTable.jsx';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TicketWorkflow from './components/TicketFlow';
import CustomerDashboard from './components/Customer';
import Component from './components/AdvancedFunnel.jsx';
import Sankey from './components/SankeyChart';


function App() {
  const [ticketsData, setTicketsData] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  useEffect(() => {
    const fetchtickets = async () => {
      try {
        const response = await fetch('http://localhost:1337/api/tickets');
        const data = await response.json();
        setTicketsData(data.data);
      }
      catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };
    const fetchResolutions = async () => {
      try {
        const response = await fetch('http://localhost:1337/api/resolutions');
        const data = await response.json();
        setResolutions(data.data);
      }
      catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };
    fetchtickets();
    fetchResolutions();
  }, []);
  return (
    <Router>
      <div style={{ display: 'flex',  background:'#F0F4F8'}}>
        <Sidebar />
        <div style={{ flexGrow: 1, marginTop: '48px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/main-dashboard" />} />
            <Route path="/main-dashboard" element={<MainDashboard  tickets={ticketsData} resolutions={resolutions} />} />
            <Route path="/ticket-dashboard" element={<TicketsDashboard tickets={ticketsData} resolutions={resolutions} />} />
            <Route path="/engineers-dashboard" element={<EngineersDashboard tickets={ticketsData} resolutions={resolutions} />} />
            <Route path="/table-dashboard" element={<CustomDashboard tickets={ticketsData} resolutions={resolutions} />} />
            <Route path="/ticket-flow" element={<TicketWorkflow />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard tickets={ticketsData} resolutions={resolutions} />} />
            <Route path="/tickets-funnel" element={<Sankey tickets={ticketsData} resolutions={resolutions} />} />
            <Route path="/advanced-tickets-funnel" element={<Component tickets={ticketsData} resolutions={resolutions} />} />
          </Routes>
        </div>
      </div>
    </Router>
   

  );
}

export default App;
