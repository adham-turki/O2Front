
import  { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
  styled,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import FilterList from '@mui/icons-material/FilterList'
import { motion } from 'framer-motion'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import BugReportIcon from '@mui/icons-material/BugReport'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import AssignmentIcon from '@mui/icons-material/Assignment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import PropTypes from 'prop-types'

const StyledSelect = styled(Select)(({ theme }) => ({
  minWidth: 200,
  '& .MuiSelect-select': {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}))

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
    background: {
      default: '#f0f2f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
}
const AnimatedCard = motion(Card)
const AnimatedGrid = motion(Grid)
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
AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired,
}

const TopicCard = ({ icon, title, value, color }) => (
  <Card sx={{ bgcolor: color, color: 'white' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6" component="div" ml={1}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        <AnimatedNumber value={value} />
      </Typography>
    </CardContent>
  </Card>
)
TopicCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
}
const ProgressCard = ({ title, value, total, color }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress
            variant="determinate"
            value={(value / total) * 100}
            sx={{
              height: 10,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
              },
            }}
          />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(
            (value / total) * 100
          )}%`}</Typography>
        </Box>
      </Box>
      <Typography variant="subtitle2" color="textSecondary">
        {value} out of {total}
      </Typography>
    </CardContent>
  </Card>
)
ProgressCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
}

export default function CustomDashboard() {
  const [timeRange, setTimeRange] = useState('all')
  const navigate = useNavigate()
  const [data, setData] = useState({})
  const apiUrl = import.meta.env.VITE_API_HOST;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/stats/CustomDashboard`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const res = await response.json();
        console.log(res);
        
        setData(res);
        console.log(res);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    fetchTickets();
  },[])
  

  const totalTickets = data.totalTickets || 0
  const solvedTickets = data.solvedTickets || 0
  const openTickets = totalTickets - solvedTickets

 

  const handleRowClick = (ticketId) => {
    const selectedTicket = data.filteredTickets.find(ticket => ticket.id === ticketId)
    const ticketResolutions = data.ticketResolutions?.ticketResolution?.filter(resolution => 
      resolution.tickets.some(ticket => ticket.id === ticketId)
    )
    navigate('/ticket-flow', { state: { selectedTicket, ticketResolutions } })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatedGrid container spacing={4} variants={itemVariants}>
              <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                <AnimatedTypography
                  component="h1"
                  variant="h3"
                  color="primary"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Tickets Dashboard
                </AnimatedTypography>
                <FormControl variant="outlined">
                  <InputLabel id="date-range-label">Time Range</InputLabel>
                  <StyledSelect
                    labelId="date-range-label"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    label="Time Range"
                    startAdornment={<FilterList sx={{ color: 'action.active', mr: 1, my: 0.5 }} />}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="last-week">Last Week</MenuItem>
                    <MenuItem value="last-month">Last Month</MenuItem>
                    <MenuItem value="last-6-months">Last 6 Months</MenuItem>
                    <MenuItem value="last-year">Last Year</MenuItem>
                  </StyledSelect>
                </FormControl>
              </Grid>

              <AnimatedGrid item xs={12} md={4} variants={itemVariants}>
                <AnimatedCard variants={itemVariants}>
                  <TopicCard
                    icon={<TrendingUpIcon fontSize="large" />}
                    title="Total Tickets"
                    value={totalTickets}
                    color={theme.palette.primary.main}
                  />
                </AnimatedCard>
              </AnimatedGrid>
              <AnimatedGrid item xs={12} md={4} variants={itemVariants}>
                <AnimatedCard variants={itemVariants}>
                  <TopicCard
                    icon={<DoneAllIcon fontSize="large" />}
                    title="Solved Tickets"
                    value={solvedTickets}
                    color={theme.palette.success.main}
                  />
                </AnimatedCard>
              </AnimatedGrid>
              <AnimatedGrid item xs={12} md={4} variants={itemVariants}>
                <AnimatedCard variants={itemVariants}>
                  <TopicCard
                    icon={<ErrorOutlineIcon fontSize="large" />}
                    title="Open Tickets"
                    value={openTickets}
                    color={theme.palette.error.main}
                  />
                </AnimatedCard>
              </AnimatedGrid>

              <AnimatedGrid item xs={12} md={6} variants={itemVariants}>
                <AnimatedCard variants={itemVariants}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Ticket Types Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.ticketTypeData || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {(data.ticketTypeData || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={typeColors[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </AnimatedCard>
              </AnimatedGrid>

              <AnimatedGrid item xs={12} md={6} variants={itemVariants}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <AnimatedCard variants={itemVariants}>
                      <ProgressCard
                        title="Ticket Resolution Progress"
                        value={solvedTickets}
                        total={totalTickets}
                        color={theme.palette.success.main}
                      />
                    </AnimatedCard>
                  </Grid>
                  <Grid item xs={12}>
                    <AnimatedCard variants={itemVariants}>
                      <ProgressCard
                        title="Open Tickets"
                        value={openTickets}
                        total={totalTickets}
                        color={theme.palette.error.main}
                      />
                    </AnimatedCard>
                  </Grid>
                </Grid>
              </AnimatedGrid>

              <AnimatedGrid item xs={12} variants={itemVariants}>
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
                          <TableCell>Reported By</TableCell>
                          <TableCell>Date Opened</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                          {data.filteredTickets && data.filteredTickets.map((ticket, index) => (
                            <motion.tr
                              key={ticket.id}
                              onClick={() => handleRowClick(ticket.id)}
                              style={{ cursor: 'pointer' }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
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
                              <TableCell>{ticket.reportedBy.name}</TableCell>
                              <TableCell>{new Date(ticket.reportedOn).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={ticket.resolvedOn ? <CheckCircleIcon /> : <ErrorIcon />}
                                  label={ticket.resolvedOn ? "Solved" : "Open"}
                                  color={ticket.resolvedOn ? "success" : "error"}
                                />
                              </TableCell>
                            </motion.tr>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </StyledPaper>
              </AnimatedGrid>
            </AnimatedGrid>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
CustomDashboard.propTypes = {
  tickets: PropTypes.array.isRequired,
  resolutions: PropTypes.array.isRequired
}