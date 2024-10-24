import  { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, CircularProgress,
  ThemeProvider, createTheme, CardContent, SvgIcon
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Line, LineChart,
} from 'recharts';
import {
  BarChart as BarChartIcon,
  CheckCircle,
  ErrorOutline,
  AccessTime,
  GppGood,
  BugReport,
  TrendingUp,
  Speed,
  EmojiEvents,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { StyledPaperForTickets as StyledPaper } from './StyledPaper';
import { StyledCardFortickets as StyledCard } from './StyledCards';
import PropTypes from 'prop-types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#F0F4F8',
      paper: '#FFFFFF',
    },
  },
});

const CalendarChartIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
    <path d="M5 21h14c1.1 0 2-.9 2-2V8H3v11c0 1.1.89 2 2 2zM7 10h5v5H7v-5z" />
    <path d="M15 13h2v2h-2zm0-3h2v2h-2z" />
  </SvgIcon>
);

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F3A683', '#F7D794', '#778BEB', '#786FA6', '#F8A5C2'];

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const duration = 2000;
    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, duration / end);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};
AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired,
};
export default function TicketsDashboard() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_HOST;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/hello`);
      const res = await response.json();
      setData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  const cardTitles = [
    { title: 'Monthly Ticket Trends', icon: CalendarChartIcon },
    { title: 'Ticket Trend', icon: TrendingUp },
    { title: 'Severity Distribution', icon: BugReport },
    { title: 'Average Resolution Time by Severity', icon: Speed },
    { title: 'SLA Compliance by Severity', icon: EmojiEvents },
  ];

  const TitleWithIcon = ({ title, icon: Icon }) => (
    <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon color="primary" sx={{ fontSize: 28 }} />
      {title}
    </Typography>
  );
  TitleWithIcon.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
  };
  

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const ticketStats = data.processTicketStats;
  const monthlyData = data.processMonthlyData;
  const severityData = data.processSeverityData.map(item => ({
    ...item,
    severity: `${item.severity}` // Convert severity to SEV0, SEV1, etc.
  }));
  const ticketTrendData = data.processTicketTrendData;

  const statCards = [
    { title: 'Total Tickets', value: ticketStats.totalTickets, icon: BarChartIcon, color: '#3f51b5' },
    { title: 'Solved Tickets', value: ticketStats.solvedTickets, icon: CheckCircle, color: '#4caf50' },
    { title: 'Open Tickets', value: ticketStats.openTickets, icon: ErrorOutline, color: '#ff9800' },
    { title: 'Avg. Resolution Time', value: `${ticketStats.avgResolutionTime.toFixed(2)}h`, icon: AccessTime, color: '#9c27b0' },
    { title: 'SLA Compliance', value: `${ticketStats.slaCompliance.toFixed(2)}%`, icon: GppGood, color: '#2196f3' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Grid container spacing={3}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StyledCard elevation={3}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="h2">
                        {card.title}
                      </Typography>
                      <card.icon sx={{ fontSize: 40, color: card.color }} />
                    </Box>
                    <Typography variant="h4" component="p" sx={{ textAlign: 'center', color: card.color }}>
                      <AnimatedNumber value={card.value} />
                      {isNaN(card.value) ? card.value.replace(/[0-9.]/g, '') : ''}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <TitleWithIcon title={cardTitles[0].title} icon={cardTitles[0].icon} />
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="opened" stackId="a" fill={COLORS[0]} name="Tickets Opened" />
                  <Bar dataKey="resolved" stackId="a" fill={COLORS[1]} name="Tickets Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <TitleWithIcon title={cardTitles[1].title} icon={cardTitles[1].icon} />
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={ticketTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#109618" strokeWidth={2} dot={{ r: 4 }} name="Ticket Count" />
                </LineChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <TitleWithIcon title={cardTitles[2].title} icon={cardTitles[2].icon} />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="severity"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <TitleWithIcon title={cardTitles[3].title} icon={cardTitles[3].icon} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgResolutionTime" fill={theme.palette.primary.main} name="Avg Resolution Time (hours)" />
                </BarChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper elevation={3}>
              <TitleWithIcon title={cardTitles[4].title} icon={cardTitles[4].icon} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="slaCompliance" fill={theme.palette.secondary.main} name="SLA Compliance (%)" />
                </BarChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}