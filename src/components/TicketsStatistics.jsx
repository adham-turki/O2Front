import  { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, CircularProgress, 
  ThemeProvider, createTheme, styled, Card, CardContent, SvgIcon
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
  PieChart as PieChartIcon,
  GppGood,
  Timeline,
  BugReport,
  TrendingUp,
  Speed,
  EmojiEvents,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

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
// Custom SVG icon for Monthly Ticket Trends
const CalendarChartIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
    <path d="M5 21h14c1.1 0 2-.9 2-2V8H3v11c0 1.1.89 2 2 2zM7 10h5v5H7v-5z"/>
    <path d="M15 13h2v2h-2zm0-3h2v2h-2z"/>
  </SvgIcon>
);

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F3A683', '#F7D794', '#778BEB', '#786FA6', '#F8A5C2'];

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  borderRadius: 10,
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: theme.shadows[10],
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 10,
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: theme.shadows[10],
  
}));

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

export default function TicketsDashboard({ tickets, resolutions }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tickets && resolutions) {
      setLoading(false);
    }
  }, [tickets, resolutions]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  const cardTitles = [
    { title: 'Monthly Ticket Trends', icon: CalendarChartIcon },
    { title: 'Ticket Trend', icon: TrendingUp },
    { title: 'Severity Distribution', icon: BugReport },
    { title: 'Average Resolution Time by Severity', icon: Speed },
    { title: 'SLA Compliance by Severity', icon: EmojiEvents },
  ];
  const TitleWithIcon1 = ({ title, icon: Icon }) => (
    <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon color="primary" sx={{ fontSize: 28 }} />
      {title}
    </Typography>
  );

  // Data processing functions
  const processTicketStats = () => {
    const totalTickets = tickets.length;
    const solvedTickets = tickets.filter(ticket => ticket.resolvedOn).length;
    const openTickets = totalTickets - solvedTickets;
    const avgResolutionTime = tickets.reduce((acc, ticket) => {
      if (ticket.resolvedOn) {
        return acc + (new Date(ticket.resolvedOn) - new Date(ticket.reportedOn)) / (1000 * 60 * 60);
      }
      return acc;
    }, 0) / solvedTickets;
    const slaCompliance = tickets.filter(ticket => ticket.metSla).length / totalTickets * 100;

    return { totalTickets, solvedTickets, openTickets, avgResolutionTime, slaCompliance };
  };

  const processMonthlyData = () => {
    const monthlyData = {};
    tickets.forEach(ticket => {
      const month = new Date(ticket.reportedOn).toLocaleString('default', { month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = { opened: 0, resolved: 0 };
      }
      monthlyData[month].opened++;
      if (ticket.resolvedOn) {
        monthlyData[month].resolved++;
      }
    });
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      opened: data.opened,
      resolved: data.resolved,
      resolutionRate: (data.resolved / data.opened) * 100,
    }));
  };

  const processSeverityData = () => {
    const severityData = {};
    tickets.forEach(ticket => {
      if (!severityData[ticket.severity]) {
        severityData[ticket.severity] = { total: 0, resolved: 0, totalTime: 0 };
      }
      severityData[ticket.severity].total++;
      if (ticket.resolvedOn) {
        severityData[ticket.severity].resolved++;
        const resolutionTime = (new Date(ticket.resolvedOn) - new Date(ticket.reportedOn)) / (1000 * 60 * 60);
        severityData[ticket.severity].totalTime += resolutionTime;
      }
    });
    return Object.entries(severityData).map(([severity, data]) => ({
      severity,
      total: data.total,
      resolved: data.resolved,
      avgResolutionTime: data.totalTime / data.resolved || 0,
      slaCompliance: (data.resolved / data.total) * 100,
    }));
  };

  const processTicketTrendData = () => {
    const trendData = tickets.reduce((acc, ticket) => {
      const date = ticket.reportedOn.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count++;
      return acc;
    }, {});
    return Object.values(trendData);
  };

  const ticketStats = processTicketStats();
  const monthlyData = processMonthlyData();
  const severityData = processSeverityData();
  const ticketTrendData = processTicketTrendData();

  const statCards = [
    { title: 'Total Tickets', value: ticketStats.totalTickets, icon: BarChartIcon, color: '#3f51b5' },
    { title: 'Solved Tickets', value: ticketStats.solvedTickets, icon: CheckCircle, color: '#4caf50' },
    { title: 'Open Tickets', value: ticketStats.openTickets, icon: ErrorOutline, color: '#ff9800' },
    { title: 'Avg. Resolution Time', value: `${ticketStats.avgResolutionTime.toFixed(2)}h`, icon: AccessTime, color: '#9c27b0' },
    { title: 'SLA Compliance', value: `${ticketStats.slaCompliance.toFixed(2)}%`, icon: GppGood, color: '#2196f3' },
  ];
  const TitleWithIcon = ({ title, icon: Icon }) => (
    <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon color="primary" />
      {title}
    </Typography>
  );
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
          <Grid item xs={12}>
            
            <StyledPaper elevation={3}>
            <TitleWithIcon1 title={cardTitles[0].title} icon={cardTitles[0].icon} />
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="opened" fill={theme.palette.primary.light} name="Tickets Opened" />
                  <Bar yAxisId="left" dataKey="resolved" fill={theme.palette.primary.dark} name="Tickets Resolved" />
                  <Line yAxisId="right" type="monotone" dataKey="resolutionRate" stroke={theme.palette.secondary.main} name="Resolution Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper elevation={3}>
            <TitleWithIcon1 title={cardTitles[1].title} icon={cardTitles[1].icon} />
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
            <TitleWithIcon1 title={cardTitles[2].title} icon={cardTitles[2].icon} />
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
            <TitleWithIcon1 title={cardTitles[3].title} icon={cardTitles[3].icon} />
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
            <TitleWithIcon1 title={cardTitles[4].title} icon={cardTitles[4].icon} />
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