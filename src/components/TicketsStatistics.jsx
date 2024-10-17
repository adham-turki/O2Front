'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Box, Typography, Grid, Paper, CircularProgress, Tabs, Tab,
  ThemeProvider, createTheme, CssBaseline, styled, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Line, LineChart, ScatterChart, Scatter
} from 'recharts'
import { motion } from 'framer-motion'
import { parseISO, subDays, subMonths, subYears, isAfter } from 'date-fns'

const COLORS = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099']

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3366CC',
    },
    secondary: {
      main: '#DC3912',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
})

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  background: '#FFFFFF',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}))

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
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

export default function TicketsDashboard({ tickets, resolutions }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [dateRange, setDateRange] = useState('last-week')

  useEffect(() => {
    if (tickets && resolutions) {
      setLoading(false)
    }
  }, [tickets, resolutions])

  const filteredTickets = useMemo(() => {
    const now = new Date()
    const filterDate = {
      'last-week': subDays(now, 7),
      'last-month': subMonths(now, 1),
      'last-6-months': subMonths(now, 6),
      'last-year': subYears(now, 1)
    }[dateRange]

    return tickets.filter(ticket => isAfter(parseISO(ticket.reportedOn), filterDate))
  }, [tickets, dateRange])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  const severityData = filteredTickets.reduce((acc, ticket) => {
    acc[ticket.severity] = (acc[ticket.severity] || 0) + 1
    return acc
  }, {})

  const typeData = filteredTickets.reduce((acc, ticket) => {
    acc[ticket.type] = (acc[ticket.type] || 0) + 1
    return acc
  }, {})

  const statusData = filteredTickets.reduce((acc, ticket) => {
    acc[ticket.ticketStatus] = (acc[ticket.ticketStatus] || 0) + 1
    return acc
  }, {})

  const ticketTrendData = filteredTickets.reduce((acc, ticket) => {
    const date = ticket.reportedOn.split('T')[0]
    if (!acc[date]) {
      acc[date] = { date, count: 0 }
    }
    acc[date].count++
    return acc
  }, {})

  const resolutionTimeData = filteredTickets
    .filter(ticket => ticket.resolvedOn)
    .map(ticket => {
      const openTime = new Date(ticket.reportedOn).getTime()
      const solveTime = new Date(ticket.resolvedOn).getTime()
      const resolutionTime = (solveTime - openTime) / (1000 * 60 * 60)
      return { id: ticket.id, resolutionTime, title: ticket.title }
    })

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Paper sx={{ padding: 2, background: '#ffffff' }}>
          <Typography variant="h6">Ticket #{data.id}</Typography>
          <Typography variant="body2">Title: {data.title}</Typography>
          <Typography variant="body2">Resolution Time: {data.resolutionTime.toFixed(2)} hours</Typography>
        </Paper>
      )
    }
    return null
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh', background: '#FFFFFF' }}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 4 }}>
            Tickets Dashboard
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ flex: 1 }}
          >
            <Tab label="Overview" />
            <Tab label="Ticket Details" />
            <Tab label="Trends" />
          </Tabs>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="date-range-label">Date Range</InputLabel>
            <Select
              labelId="date-range-label"
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="last-week">Last Week</MenuItem>
              <MenuItem value="last-month">Last Month</MenuItem>
              <MenuItem value="last-6-months">Last 6 Months</MenuItem>
              <MenuItem value="last-year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom>Tickets by Severity</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(severityData).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(severityData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </StyledPaper>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom>Ticket Status</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(statusData).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(statusData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </StyledPaper>
              </motion.div>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom>Tickets by Type</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={Object.entries(typeData).map(([name, value]) => ({ name, value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3366CC" />
                    </BarChart>
                  </ResponsiveContainer>
                </StyledPaper>
              </motion.div>
            </Grid>
            <Grid item xs={12}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom>Resolution Time</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="id" name="Ticket ID" />
                      <YAxis type="number" dataKey="resolutionTime" name="Resolution Time (hours)" />
                      <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Resolution Time" data={resolutionTimeData} fill="#DC3912" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </StyledPaper>
              </motion.div>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom>Ticket Trend</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={Object.values(ticketTrendData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#109618" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </StyledPaper>
              </motion.div>
            </Grid>
          </Grid>
        )}
      </Box>
    </ThemeProvider>
  )
}