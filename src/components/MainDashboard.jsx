
import  { useState, useMemo } from 'react'
import {Box,Container,Typography,Tab,Tabs,styled,useTheme,Select,MenuItem,FormControl,InputLabel,
} from '@mui/material'
import { TrendingUp,Engineering,BugReport,FilterList,Business} from '@mui/icons-material'
import { parseISO, subDays, subMonths, subYears, isAfter } from 'date-fns'
import TicketsDashboard from './TicketsStatistics'
import EngineersDashboard from './EmployeeStats'
import ResolutionsDashboard from './ResolutionsDashboard'
import CustomerDashboard from './Customer'
import PropTypes from 'prop-types'

const StyledSelect = styled(Select)(({ theme }) => ({
  minWidth: 200,
  '& .MuiSelect-select': {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}))

export default function MainDashboard({ tickets, resolutions }) {
  const [tabValue, setTabValue] = useState(0)
  const [dateRange, setDateRange] = useState('all')
  const theme = useTheme()

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

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

  return (
    <Box sx={{ display: 'flex' }} className='shadow-xl'>
      <Container maxWidth="xl" sx={{ flexGrow: 1 }}>
        <Typography variant="h3" gutterBottom sx={{ my: 4 , fontWeight: '', color: "#3f51b5", textAlign: 'center' }}>
          Analyitics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ 
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                fontSize: '1rem',
              },
            }}
          >
            <Tab icon={<TrendingUp />} label="Overview" />
            <Tab icon={<Engineering />} label="Engineer Performance" />
            <Tab icon={<BugReport />} label="Resolutions Analysis" />
            <Tab icon={<Business />} label="Domains" />
          </Tabs>
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

        {tabValue === 0 && (
          <TicketsDashboard tickets={filteredTickets} resolutions={resolutions} />
        )}
        {tabValue === 1 && (
          <EngineersDashboard tickets={filteredTickets} resolutions={resolutions} />
        )}

        {tabValue === 2 && (
          <ResolutionsDashboard resolutions={resolutions} />
        )}
          {tabValue === 3 && (
          <CustomerDashboard tickets={filteredTickets} resolutions={resolutions}/>
        )}
      </Container>

    </Box>
  )
}
MainDashboard.propTypes = {
  tickets: PropTypes.array.isRequired,
  resolutions: PropTypes.array.isRequired,
};