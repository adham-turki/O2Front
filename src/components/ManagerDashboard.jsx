import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  styled,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  TrendingUp, 
  Warning, 
  Engineering, 
  BugReport,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline,
  Speed
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.37)',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
  },
  '& .MuiTableRow-root': {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.2s ease',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(2),
}));

export default function ManagerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Data processing functions
  const getMonthlyResolutionRate = () => {
    const monthlyData = {};
    tickets.forEach(ticket => {
      const month = new Date(ticket.dateOpened).toLocaleString('default', { month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = { opened: 0, resolved: 0 };
      }
      monthlyData[month].opened++;
      if (ticket.isSolved) {
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

  const getAverageResolutionTimeByMonth = () => {
    const monthlyData = {};
    tickets.forEach(ticket => {
      if (ticket.isSolved && ticket.resolutionTime) {
        const month = new Date(ticket.dateOpened).toLocaleString('default', { month: 'long' });
        if (!monthlyData[month]) {
          monthlyData[month] = { totalTime: 0, count: 0 };
        }
        const resolutionTime = (new Date(ticket.resolutionTime).getTime() - new Date(ticket.dateOpened).getTime()) / (1000 * 60 * 60);
        monthlyData[month].totalTime += resolutionTime;
        monthlyData[month].count++;
      }
    });
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      avgResolutionTime: data.totalTime / data.count,
    }));
  };

  const getAverageResolutionTimeBySeverity = () => {
    const severityData = {};
    tickets.forEach(ticket => {
      if (ticket.isSolved && ticket.resolutionTime) {
        if (!severityData[ticket.severity]) {
          severityData[ticket.severity] = { totalTime: 0, count: 0 };
        }
        const resolutionTime = (new Date(ticket.resolutionTime).getTime() - new Date(ticket.dateOpened).getTime()) / (1000 * 60 * 60);
        severityData[ticket.severity].totalTime += resolutionTime;
        severityData[ticket.severity].count++;
      }
    });
    return Object.entries(severityData).map(([severity, data]) => ({
      severity,
      avgResolutionTime: data.totalTime / data.count,
    }));
  };

  const getSLAComplianceBySeverity = () => {
    const severityData = {};
    tickets.forEach(ticket => {
      if (!severityData[ticket.severity]) {
        severityData[ticket.severity] = { total: 0, compliant: 0 };
      }
      severityData[ticket.severity].total++;
      if (ticket.SLA) {
        severityData[ticket.severity].compliant++;
      }
    });
    return Object.entries(severityData).map(([severity, data]) => ({
      severity,
      complianceRate: (data.compliant / data.total) * 100,
    }));
  };

  const getTicketResolutionRateByEngineer = () => {
    const engineerData = {};
    tickets.forEach(ticket => {
      ticket.engagedEngineers.forEach(engineer => {
        if (!engineerData[engineer]) {
          engineerData[engineer] = { resolved: 0, total: 0 };
        }
        engineerData[engineer].total++;
        if (ticket.isSolved) {
          engineerData[engineer].resolved++;
        }
      });
    });
    return Object.entries(engineerData)
      .map(([engineer, data]) => ({
        engineer,
        resolutionRate: (data.resolved / data.total) * 100,
        totalTickets: data.total,
      }))
      .sort((a, b) => b.resolutionRate - a.resolutionRate)
      .slice(0, 10);
  };

  const getEngineerUtilizationRate = () => {
    const engineerData = {};
    let totalTickets = 0;
    tickets.forEach(ticket => {
      totalTickets++;
      ticket.engagedEngineers.forEach(engineer => {
        engineerData[engineer] = (engineerData[engineer] || 0) + 1;
      });
    });
    return Object.entries(engineerData)
      .map(([engineer, count]) => ({
        engineer,
        utilizationRate: (count / totalTickets) * 100,
      }))
      .sort((a, b) => b.utilizationRate - a.utilizationRate)
      .slice(0, 10);
  };

  const getRootCauseFrequency = () => {
    const rootCauseData = {};
    tickets.forEach(ticket => {
      if (ticket.rootCause) {
        rootCauseData[ticket.rootCause] = (rootCauseData[ticket.rootCause] || 0) + 1;
      }
    });
    return Object.entries(rootCauseData)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getAverageResolutionTimeByRootCause = () => {
    const rootCauseData = {};
    tickets.forEach(ticket => {
      if (ticket.isSolved && ticket.resolutionTime && ticket.rootCause) {
        if (!rootCauseData[ticket.rootCause]) {
          rootCauseData[ticket.rootCause] = { totalTime: 0, count: 0 };
        }
        const resolutionTime = (new Date(ticket.resolutionTime).getTime() - new Date(ticket.dateOpened).getTime()) / (1000 * 60 * 60);
        rootCauseData[ticket.rootCause].totalTime += resolutionTime;
        rootCauseData[ticket.rootCause].count++;
      }
    });
    return Object.entries(rootCauseData)
      .map(([cause, data]) => ({
        cause,
        avgResolutionTime: data.totalTime / data.count,
      }))
      .sort((a, b) => b.avgResolutionTime - a.avgResolutionTime)
      .slice(0, 10);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ my: 4, fontWeight: 'bold', color: theme.palette.primary.main }}>
        Manager Dashboard
      </Typography>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        centered 
        sx={{ 
          mb: 4,
          '& .MuiTab-root': { 
            fontWeight: 'bold',
            fontSize: '1rem',
          },
        }}
      >
        <Tab icon={<TrendingUp />} label="Trend Analysis" />
        <Tab icon={<Warning />} label="Severity Impact" />
        <Tab icon={<Engineering />} label="Engineer Performance" />
        <Tab icon={<BugReport />} label="Root Cause Analysis" />
      </Tabs>
      <Box mt={3}>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledCard>
                <IconWrapper>
                  <BarChartIcon />
                </IconWrapper>
                <Typography variant="h6" gutterBottom>
                  Monthly Resolution Rate
                </Typography>
                <BarChart width={800} height={400} data={getMonthlyResolutionRate()}>
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
              </StyledCard>
            </Grid>
            <Grid item xs={12}>
              <StyledCard>
                <IconWrapper>
                  <Timeline />
                </IconWrapper>
                <Typography variant="h6" gutterBottom>
                  Average Resolution Time Trend
                </Typography>
                <LineChart width={800} height={400} data={getAverageResolutionTimeByMonth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgResolutionTime" stroke={theme.palette.primary.main} name="Avg Resolution Time (hours)" />
                </LineChart>
              </StyledCard>
            </Grid>
          </Grid>
        )}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <IconWrapper>
                  <BarChartIcon />
                </IconWrapper>
                <Typography variant="h6" gutterBottom>
                  Average Resolution Time by Severity
                </Typography>
                <BarChart width={400} height={300} data={getAverageResolutionTimeBySeverity()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgResolutionTime" fill={theme.palette.primary.main} name="Avg Resolution Time (hours)" />
                </BarChart>
              </StyledCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <IconWrapper>
                  <PieChartIcon />
                </IconWrapper>
                <Typography variant="h6" gutterBottom>
                  SLA Compliance by Severity
                </Typography>
                <PieChart width={500} height={300}  >
                  <Pie
                    data={getSLAComplianceBySeverity()}
                    cx={250}
                    cy={150}
                    labelLine={false}
                    outerRadius={80}
                    fill={theme.palette.primary.main}
                    dataKey="complianceRate"
                    nameKey="severity"
                    label={({ severity, complianceRate }) => `${severity}: ${complianceRate.toFixed(2)}%`}
                  >
                    {getSLAComplianceBySeverity().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </StyledCard>
            </Grid>
          </Grid>
        )}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <IconWrapper>
                  <Speed />
                </IconWrapper>
                <Typography variant="h6" gutterBottom>
                  Top 10 Engineers by Resolution Rate
                </Typography>
                <BarChart width={400} height={300} data={getTicketResolutionRateByEngineer()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="engineer" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolutionRate" fill={theme.palette.primary.main} name="Resolution Rate (%)" />
                </BarChart>
              </StyledCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <IconWrapper>
                  <Engineering />
                </IconWrapper>
                <Typography variant="h6" gutterBottom>
                  Engineer Utilization Rate
                </Typography>
                <BarChart width={400} height={300} data={getEngineerUtilizationRate()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="engineer" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilizationRate" fill={theme.palette.secondary.main} name="Utilization Rate (%)" />
                </BarChart>
              </StyledCard>
            </Grid>
          </Grid>
        )}
        {tabValue === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <IconWrapper>
                  <BugReport />
                </IconWrapper>
                <Typography variant="h6" gutterBottom>
                  Top 10 Root Causes
                </Typography>
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Root Cause</StyledTableCell>
                        <StyledTableCell align="right">Frequency</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getRootCauseFrequency().map((row) => (
                        <StyledTableRow key={row.cause}>
                          <StyledTableCell component="th" scope="row">
                            {row.cause}
                          </StyledTableCell>
                          <StyledTableCell align="right">{row.count}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </StyledCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <IconWrapper>
                  <Timeline />
                </IconWrapper>
                <Typography variant="h6" gutterBottom>
                  Average Resolution Time by Root Cause
                </Typography>
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Root Cause</StyledTableCell>
                        <StyledTableCell align="right">Average Resolution Time (hours)</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getAverageResolutionTimeByRootCause().map((row) => (
                        <StyledTableRow key={row.cause}>
                          <StyledTableCell component="th" scope="row">
                            {row.cause}
                          </StyledTableCell>
                          <StyledTableCell align="right">{row.avgResolutionTime.toFixed(2)}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </StyledCard>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
}