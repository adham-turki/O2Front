import  { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  AppBar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  styled,
  IconButton,
} from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
  Dashboard,
  BugReport,
  AccessTime,
  CheckCircle,
  Computer,
  Warning,
  DateRange,
  Person
} from '@mui/icons-material';
import PropTypes from 'prop-types';


const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EA',
    },
    secondary: {
      main: '#00C853',
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #7E57C2 30%, #5E35B1 90%)',
  borderRadius: 15,
  transition: '0.3s',
  boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
  '&:hover': {
    boxShadow: '0 16px 70px -12.125px rgba(0,0,0,0.3)',
    transform: 'translateY(-3px)',
  },
}));

const StyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  color: 'white',
});

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, duration / end);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};
//add props validation for animated number
AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired,
  duration: PropTypes.number
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function CustomDashboard() {
  const [ticketData, setTickets] = useState([]);
  const [data, setData] = useState({
    totalTickets: 0,
    openTickets: 0,
    avgResolutionTime: 0,
    slaCompliance: 0,
    platformDistribution: [],
    severityDistribution: [],
    monthlyTickets: [],
    topEngineers: [],
  });
  const [tabValue, setTabValue] = useState(0);

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

  useEffect(() => {
    const processData = () => {
      const result = {
        totalTickets: ticketData.length,
        openTickets: 0,
        avgResolutionTime: 0,
        slaCompliance: 0,
        platformDistribution: { BE: 0, FE: 0 },
        severityDistribution: {},
        monthlyTickets: {},
        topEngineers: {},
      };

      ticketData.forEach(ticket => {
        if (!ticket.isSolved) result.openTickets++;

        // Count platform distribution
        result.platformDistribution[ticket.platform] = (result.platformDistribution[ticket.platform] || 0) + 1;

        // Count severity distribution
        result.severityDistribution[ticket.severity] = (result.severityDistribution[ticket.severity] || 0) + 1;

        // Count monthly tickets
        const month = new Date(ticket.dateOpened).toLocaleString('default', { month: 'long' });
        result.monthlyTickets[month] = (result.monthlyTickets[month] || 0) + 1;

        // Check SLA compliance
        if (ticket.SLA) result.slaCompliance++;

        // Calculate average resolution time for solved tickets
        if (ticket.isSolved) {
          const resolutionTime = new Date(ticket.resolutionTime).getTime() - new Date(ticket.dateOpened).getTime();
          result.avgResolutionTime += resolutionTime;
        }

        // Count top engineers
        ticket.engagedEngineers.forEach(engineer => {
          result.topEngineers[engineer] = (result.topEngineers[engineer] || 0) + 1;
        });
      });

      // Calculate the final average resolution time in hours
      result.avgResolutionTime = result.avgResolutionTime / ticketData.filter(t => t.isSolved).length / (1000 * 60 * 60);

      // Calculate SLA compliance percentage
      result.slaCompliance = (result.slaCompliance / result.totalTickets) * 100;

      // Prepare data for charts
      setData({
        ...result,
        platformDistribution: Object.entries(result.platformDistribution).map(([name, value]) => ({ name, value })),
        severityDistribution: Object.entries(result.severityDistribution).map(([name, value]) => ({ name, value })),
        monthlyTickets: Object.entries(result.monthlyTickets).map(([name, value]) => ({ name, value })),
        topEngineers: Object.entries(result.topEngineers)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, value })),
      });
    };

    processData();
  }, [ticketData]); // Added ticketData as a dependency

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 3, background: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, textAlign: 'center', mb: 4 }}>
          Custom Statistics
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center" alignItems="center">
        {[
            { title: 'Total Tickets', value: data.totalTickets, icon: <Dashboard /> },
            { title: 'Avg. Resolution Time', value: `${data.avgResolutionTime.toFixed(2)} hrs`, icon: <AccessTime /> },
            { title: 'SLA Compliance', value: `${data.slaCompliance.toFixed(2)} `, icon: <CheckCircle /> },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} >
              <StyledCard >
                <StyledCardContent>
                  <IconButton sx={{ coloar: 'white', mb: 2 }}>
                    {item.icon}
                  </IconButton>
                  <Typography variant="h6" component="div" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="h4">
                    <AnimatedNumber value={item.value} />
                    {item.title === 'SLA Compliance' && '%'}
                    {item.title === 'Avg. Resolution Time' && 'h'}
                  </Typography>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        <AppBar position="static" color="default" sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontWeight: 'bold',
              }
            }}
          >
            <Tab icon={<Computer />} label="Platform" />
            <Tab icon={<Warning />} label="Severity" />
            <Tab icon={<DateRange />} label="Monthly" />
            <Tab icon={<Person />} label="Engineers" />
          </Tabs>
        </AppBar>
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>Platform Distribution</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.platformDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>Severity Distribution</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.severityDistribution}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {data.severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>Monthly Tickets</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.monthlyTickets}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Top Engineers</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.topEngineers} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {data.topEngineers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>
        </Box>
      </Box>
    </ThemeProvider>
  );
}