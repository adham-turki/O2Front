'use client'

import { useState, useEffect, useMemo } from 'react'
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import {
  Dashboard,
  BugReport,
  AccessTime,
  CheckCircle,
  Computer,
  Warning,
  DateRange,
  Person,
  FilterList,
} from '@mui/icons-material'
import { parseISO, subDays, subMonths, subYears, isAfter } from 'date-fns'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

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
})

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #7E57C2 30%, #5E35B1 90%)',
  borderRadius: 15,
  transition: '0.3s',
  boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
  '&:hover': {
    boxShadow: '0 16px 70px -12.125px rgba(0,0,0,0.3)',
    transform: 'translateY(-3px)',
  },
}))

const StyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  color: 'white',
})

const StyledSelect = styled(Select)(({ theme }) => ({
  minWidth: 200,
  '& .MuiSelect-select': {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}))

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value)
    if (start === end) return

    let timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start === end) clearInterval(timer)
    }, duration / end)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count}</span>
}

function TabPanel(props) {
  const { children, value, index, ...other } = props

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
  )
}

export default function CustomDashboard({ tickets }) {
  const [data, setData] = useState({
    totalTickets: 0,
    openTickets: 0,
    avgResolutionTime: 0,
    slaCompliance: 0,
    typeDistribution: [],
    severityDistribution: [],
    monthlyTickets: [],
    topEngineers: [],
  })
  const [tabValue, setTabValue] = useState(0)
  const [dateRange, setDateRange] = useState('all')

  const filteredTickets = useMemo(() => {
    if (dateRange === 'all') return tickets

    const now = new Date()
    const filterDate = {
      'last-week': subDays(now, 7),
      'last-month': subMonths(now, 1),
      'last-6-months': subMonths(now, 6),
      'last-year': subYears(now, 1)
    }[dateRange]

    return tickets.filter(ticket => isAfter(parseISO(ticket.reportedOn), filterDate))
  }, [tickets, dateRange])

  useEffect(() => {
    const processData = () => {
      const result = {
        totalTickets: filteredTickets.length,
        openTickets: 0,
        avgResolutionTime: 0,
        slaCompliance: 0,
        typeDistribution: {},
        severityDistribution: {},
        monthlyTickets: {},
        topEngineers: {},
      }

      filteredTickets.forEach(ticket => {
        if (ticket.ticketStatus !== 'RESOLVED') result.openTickets++

        // Count type distribution
        result.typeDistribution[ticket.type] = (result.typeDistribution[ticket.type] || 0) + 1

        // Count severity distribution
        result.severityDistribution[ticket.severity] = (result.severityDistribution[ticket.severity] || 0) + 1

        // Count monthly tickets
        const month = new Date(ticket.reportedOn).toLocaleString('default', { month: 'long' })
        result.monthlyTickets[month] = (result.monthlyTickets[month] || 0) + 1

        // Check SLA compliance
        if (ticket.metSla) result.slaCompliance++

        // Calculate average resolution time for resolved tickets
        if (ticket.resolvedOn) {
          const resolutionTime = new Date(ticket.resolvedOn).getTime() - new Date(ticket.reportedOn).getTime()
          result.avgResolutionTime += resolutionTime
        }

        // Count top engineers
        result.topEngineers[ticket.owners.name] = (result.topEngineers[ticket.owners.name] || 0) + 1
      })

      // Calculate the final average resolution time in hours
      result.avgResolutionTime = result.avgResolutionTime / filteredTickets.filter(t => t.resolvedOn).length / (1000 * 60 * 60)

      // Calculate SLA compliance percentage
      result.slaCompliance = (result.slaCompliance / result.totalTickets) * 100

      // Prepare data for charts
      setData({
        ...result,
        typeDistribution: Object.entries(result.typeDistribution).map(([name, value]) => ({ name, value })),
        severityDistribution: Object.entries(result.severityDistribution).map(([name, value]) => ({ name, value })),
        monthlyTickets: Object.entries(result.monthlyTickets).map(([name, value]) => ({ name, value })),
        topEngineers: Object.entries(result.topEngineers)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, value })),
      })
    }

    processData()
  }, [filteredTickets])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 3, background: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, textAlign: 'center', mb: 4 }}>
          Custom Statistics
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl variant="outlined">
            <InputLabel id="date-range-label">Date Range</InputLabel>
            <StyledSelect
              labelId="date-range-label"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
              startAdornment={<FilterList sx={{ color: 'action.active', mr: 1, my: 0.5 }} />}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="last-week">Last Week</MenuItem>
              <MenuItem value="last-month">Last Month</MenuItem>
              <MenuItem value="last-6-months">Last 6 Months</MenuItem>
              <MenuItem value="last-year">Last Year</MenuItem>
            </StyledSelect>
          </FormControl>
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center" alignItems="center">
          {[
            { title: 'Total Tickets', value: data.totalTickets, icon: <Dashboard /> },
            { title: 'Avg. Resolution Time', value: `${data.avgResolutionTime.toFixed(2)}`, icon: <AccessTime /> },
            { title: 'SLA Compliance', value: `${data.slaCompliance.toFixed(2)}`, icon: <CheckCircle /> },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} >
              <StyledCard >
                <StyledCardContent>
                  <IconButton sx={{ color: 'white', mb: 2 }}>
                    {item.icon}
                  </IconButton>
                  <Typography variant="h6" component="div" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="h4">
                    <AnimatedNumber value={parseFloat(item.value)} />
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
            <Tab icon={<Computer />} label="Type" />
            <Tab icon={<Warning />} label="Severity" />
            <Tab icon={<DateRange />} label="Monthly" />
            <Tab icon={<Person />} label="Engineers" />
          </Tabs>
        </AppBar>
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>Type Distribution</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.typeDistribution.map((entry, index) => (
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
  )
}