import React, { useEffect, useState } from 'react';
import {
  AppBar, Typography, Container, Grid, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Avatar, Box, ThemeProvider, createTheme, CssBaseline, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  ResponsiveContainer, Tooltip, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineDot,
  TimelineConnector, TimelineContent
} from '@mui/lab';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LabelIcon from '@mui/icons-material/Label';
import BugReportIcon from '@mui/icons-material/BugReport';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PropTypes from 'prop-types';

const priorityColors = {
  Low: '#4CAF50',
  Medium: '#FFC107',
  High: '#FF9800',
  Critical: '#F44336'
};

const typeColors = {
  Bug: '#FF5722',
  'New Feature': '#2196F3',
  Performance: '#9C27B0',
  Security: '#F44336',
  Documentation: '#607D8B',
  Task: '#795548'
};

const typeIcons = {
  Bug: <BugReportIcon />,
  'New Feature': <NewReleasesIcon />,
  Performance: <SpeedIcon />,
  Security: <SecurityIcon />,
  Documentation: <DescriptionIcon />,
  Task: <AssignmentIcon />
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const StyledPaper = motion(Paper);

const AnimatedTypography = motion(Typography);

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

export default function MainDashboard({ ticketData }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [filteredTickets, setFilteredTickets] = useState(ticketData);
  const apiUrl = import.meta.env.VITE_API_HOST;


  // useEffect(() => {
  //   const now = new Date();
  //   const filtered = ticketData.filter(ticket => {
  //     const ticketDate = new Date(ticket.dateOpened);
  //     switch (timeRange) {
  //       case 'week':
  //         return now - ticketDate <= 7 * 24 * 60 * 60 * 1000;
  //       case 'month':
  //         return now - ticketDate <= 30 * 24 * 60 * 60 * 1000;
  //       case '6months':
  //         return now - ticketDate <= 180 * 24 * 60 * 60 * 1000;
  //       case 'year':
  //         return now - ticketDate <= 365 * 24 * 60 * 60 * 1000;
  //       default:
  //         return true;
  //     }
  //   });
  //   setFilteredTickets(filtered);
  // }, [timeRange, ticketData]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(apiUrl);

        const response = await fetch(`${apiUrl}/api/stats/dashboard`);
        const data = await response.json();
        setFilteredTickets(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  // const totalTickets = filteredTickets.length;
  // const solvedTickets = filteredTickets.filter(ticket => ticket.isSolved).length;
  // const openTickets = totalTickets - solvedTickets;
  const totalTickets = filteredTickets['total'];
  const solvedTickets = filteredTickets['closedTickets'];
  const openTickets = filteredTickets['openedTickets'];



  
const topEngineers = filteredTickets['engineerPerformance']


console.log("Top Engineers", topEngineers);


  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <AppBar position="static">
        </AppBar>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="time-range-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-label"
                  id="time-range-select"
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="6months">Last 6 Months</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Summary Cards */}
            {[
              { title: 'Total Tickets', value: totalTickets, color: "#6200EA", icon: <ConfirmationNumberIcon sx={{ fontSize: 40 }} /> },
              { title: 'Solved Tickets', value: solvedTickets, color: "#00C853", icon: <DoneAllIcon sx={{ fontSize: 40 }} /> },
              { title: 'Open Tickets', value: openTickets, color: "#FF6D00", icon: <ErrorOutlineIcon sx={{ fontSize: 40 }} /> },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <StyledPaper
                  elevation={3}
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: `linear-gradient(45deg, #7E57C2 30%, #5E35B1 90%)`,
                    color: 'white',
                    borderRadius: 4,
                  }}
                >
                  {item.icon}
                  <AnimatedTypography
                    component="h2"
                    variant="h6"
                    color="inherit"
                    gutterBottom
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {item.title}
                  </AnimatedTypography>
                  <AnimatedTypography
                    component="p"
                    variant="h4"
                    color="inherit"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <AnimatedNumber value={item.value} />
                  </AnimatedTypography>
                </StyledPaper>
              </Grid>
            ))}

            {/* Top Engineers Radar Chart */}
            <Grid item xs={12}>
              <StyledPaper
                elevation={3}
                whileHover={{ scale: 1.02 }}
                sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 500 }}
              >
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Top Engineers Performance
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topEngineers}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar name="Solved Tickets" dataKey="solved" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Open Tickets" dataKey="open" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </StyledPaper>
            </Grid>

            {/* Enhanced Ticket Table */}
            <Grid item xs={12}>
              <StyledPaper
                elevation={3}
                sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
              >
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  All Tickets
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Issue</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>On Call</TableCell>
                        <TableCell>Date Opened</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTickets['tickets'] && filteredTickets['tickets'].map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          onClick={() => handleTicketClick(ticket)}
                          style={{ cursor: 'pointer' }}
                          hover
                        >
                          <TableCell>{ticket.id}</TableCell>
                          <TableCell>{ticket.issue}</TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.severity}
                              style={{
                                backgroundColor: priorityColors[ticket.severity],
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={typeIcons[ticket.type]}
                              label={ticket.type}
                              style={{ backgroundColor: typeColors[ticket.type], color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>{ticket.on_call}</TableCell>
                          <TableCell>{ticket.date_opened}</TableCell>
                          <TableCell>
                            <Chip
                              icon={ticket.is_solved ? <CheckCircleIcon /> : <ErrorIcon />}
                              label={ticket.is_solved ? "Solved" : "Open"}
                              color={ticket.is_solved ? "success" : "error"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>

        {/* Ticket Detail Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h5" component="div" style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
              Ticket Details
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTicket && (
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom style={{ color: theme.palette.secondary.main, fontWeight: 'bold' }}>
                  {selectedTicket.issue}
                </Typography>

                {/* Ticket Status and Severity */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Chip
                    label={selectedTicket.isSolved ? "Solved" : "Open"}
                    color={selectedTicket.isSolved ? "success" : "error"}
                    icon={selectedTicket.isSolved ? <CheckCircleIcon /> : <ErrorIcon />}
                  />
                  <Chip
                    label={selectedTicket.severity}
                    style={{ backgroundColor: priorityColors[selectedTicket.severity], color: 'white' }}
                  />
                </Box>

                {/* Ticket Timeline */}
                <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>Timeline</Typography>
                <Timeline align="alternate">
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>Opened: {new Date(selectedTicket.date_opened).toLocaleString()}</TimelineContent>
                  </TimelineItem>
                  {selectedTicket.first_touch && (
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color="secondary" />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>First Touch: {new Date(selectedTicket.first_touch).toLocaleString()}</TimelineContent>
                    </TimelineItem>
                  )}
                  {selectedTicket.resolution_time && (
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color="success" />
                      </TimelineSeparator>
                      <TimelineContent>Resolved: {new Date(selectedTicket.resolution_time).toLocaleString()}</TimelineContent>
                    </TimelineItem>
                  )}
                </Timeline>

                {/* Engaged Engineers */}
                <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>Engaged Engineers</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {selectedTicket['engaged_engineers'].split(',').map((engineer, index) => (
                    <Chip
                      key={index}
                      avatar={<Avatar>{engineer[0]}</Avatar>}
                      label={engineer}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>

                {/* Root Cause */}
                <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>Root Cause</Typography>
                <Typography variant="body1" paragraph>
                  {selectedTicket.root_cause || 'Not identified yet'}
                </Typography>

                {/* Tags */}
                <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedTicket.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      icon={<LabelIcon />}
                      variant="outlined"
                      color="secondary"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

MainDashboard.propTypes = {
  ticketData: PropTypes.array.isRequired
};