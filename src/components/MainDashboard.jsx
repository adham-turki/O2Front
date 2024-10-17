'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Typography,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { motion } from 'framer-motion'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import BugReportIcon from '@mui/icons-material/BugReport'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const priorityColors = {
  Low: '#4CAF50',
  Medium: '#FFC107',
  High: '#FF9800',
  Highest: '#F44336',
}

const typeColors = {
  BUG: '#FF5722',
  FEATURE: '#2196F3',
  SUPPORT: '#9C27B0',
}

const typeIcons = {
  BUG: <BugReportIcon />,
  FEATURE: <NewReleasesIcon />,
  SUPPORT: <AssignmentIcon />,
}

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
})

const StyledPaper = motion(Paper)

const AnimatedTypography = motion(Typography)

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      return
    }

    let start = 0
    const end = parseInt(value)
    const duration = 2000
    let timer = setInterval(() => {
      start += 1
      setDisplayValue(start)
      if (start === end) clearInterval(timer)
    }, duration / end)

    return () => clearInterval(timer)
  }, [value])

  return <span>{displayValue}</span>
}

export default function MainDashboard({ tickets, resolutions }) {
  const [timeRange, setTimeRange] = useState('all')
  const [filteredTickets, setFilteredTickets] = useState(tickets)
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date()
    const filtered = tickets.filter((ticket) => {
      const ticketDate = new Date(ticket.reportedOn)
      switch (timeRange) {
        case 'week':
          return now - ticketDate <= 7 * 24 * 60 * 60 * 1000
        case 'month':
          return now - ticketDate <= 30 * 24 * 60 * 60 * 1000
        case '6months':
          return now - ticketDate <= 180 * 24 * 60 * 60 * 1000
        case 'year':
          return now - ticketDate <= 365 * 24 * 60 * 60 * 1000
        default:
          return true
      }
    })
    setFilteredTickets(filtered)
  }, [timeRange, tickets])

  const totalTickets = filteredTickets.length
  const solvedTickets = filteredTickets.filter((ticket) => ticket.resolvedOn).length
  const openTickets = totalTickets - solvedTickets

  const engineerPerformanceData = filteredTickets.reduce((acc, ticket) => {
    const owners = ticket.owners
    owners.map(owner => {
    
      try {
        
        acc[owner.name].total += 1  
        if (ticket.resolvedOn) {
          acc[owner.name].solved += 1
        } else {
          acc[owner.name].open += 1
        }
      } catch (error) {
          acc[owner.name] = { name: owner.name, solved: 0, open: 0, total: 0 }
        
      }
    })
    return acc
   
  }, {})

  const topEngineers = Object.values(engineerPerformanceData)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

    const handleRowClick = (ticketId) => {
      // Find the selected ticket based on the ticketId
      const selectedTicket = tickets.find(ticket => ticket.id === ticketId);
    
      // Filter the resolutions where the tickets array contains the ticketId
      const ticketResolutions = resolutions.filter(resolution => 
        resolution.tickets.some(ticket => ticket.id === ticketId)
      );
    
     
    
      // Navigate to the ticket-flow page and pass the selected ticket and its resolutions
      navigate('/ticket-flow', { state: { selectedTicket, ticketResolutions } });
    };
    

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <AppBar position="static"></AppBar>
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
                      {filteredTickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          onClick={() => handleRowClick(ticket.id)}
                          style={{ cursor: 'pointer' }}
                          hover
                        >
                          <TableCell>{ticket.id}</TableCell>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.severity}
                              style={{
                                backgroundColor: priorityColors[ticket.priority],
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
                          <TableCell>{ticket.owners.name}</TableCell>
                          <TableCell>{new Date(ticket.reportedOn).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              icon={ticket.resolvedOn ? <CheckCircleIcon /> : <ErrorIcon />}
                              label={ticket.resolvedOn ? "Solved" : "Open"}
                              color={ticket.resolvedOn ? "success" : "error"}
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
      </Box>
    </ThemeProvider>
  )
}