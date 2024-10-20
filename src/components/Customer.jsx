'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box, Typography, Grid, Chip, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, CircularProgress, LinearProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip
} from '@mui/material'
import { ThemeProvider, createTheme, styled } from '@mui/material/styles'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts'
import { Person, BugReport, CheckCircle, Error, AccessTime, FilterList, BarChart as BarChartIcon, PieChart as PieChartIcon, Visibility } from '@mui/icons-material'
import { parseISO, subDays, subMonths, subYears, isAfter } from 'date-fns'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
})

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}))

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
})

const ChartTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& > svg': {
    marginRight: theme.spacing(1),
  },
}))

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function CustomerDashboard({ resolutions, tickets }) {
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    if (resolutions && tickets) {
      setLoading(false)
    }
  }, [resolutions, tickets])

  const getCustomerStats = useMemo(() => {
    const stats = {}
    tickets.forEach(ticket => {
      ticket.domains.forEach(domain => {
        if (!stats[domain.name]) {
          stats[domain.name] = { total: 0, solved: 0, slaViolations: 0 }
        }
        stats[domain.name].total += 1
        if (ticket.resolvedOn) stats[domain.name].solved += 1
        if (!ticket.metSla) stats[domain.name].slaViolations += 1
      })
    })
    return Object.entries(stats).map(([customer, data]) => ({
      customer,
      total: data.total,
      solved: data.solved,
      slaViolations: data.slaViolations,
      slaPerformance: ((data.total - data.slaViolations) / data.total) * 100
    })).sort((a, b) => b.total - a.total)
  }, [tickets])

  const getCustomerTicketDistribution = useMemo(() => {
    const distribution = {}
    tickets.forEach(ticket => {
      ticket.domains.forEach(domain => {
        distribution[domain.name] = (distribution[domain.name] || 0) + 1
      })
    })
    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
  }, [tickets])

  const getTopFiveTickets = useMemo(() => {
    const ticketCounts = {}
    tickets.forEach(ticket => {
      ticketCounts[ticket.title] = (ticketCounts[ticket.title] || 0) + 1
    })
    return Object.entries(ticketCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count], index) => ({ title, count, color: COLORS[index] }))
  }, [tickets])

  const getTopFiveCustomersBySLA = useMemo(() => {
    return getCustomerStats
      .sort((a, b) => b.slaPerformance - a.slaPerformance)
      .slice(0, 5)
      .map((customer, index) => ({
        name: customer.customer,
        value: customer.slaPerformance,
        color: COLORS[index]
      }))
  }, [getCustomerStats])

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <StyledCardContent>
                <ChartTitle variant="h6" gutterBottom>
                  <BarChartIcon color="primary" />
                  Customer Ticket Distribution
                </ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getCustomerTicketDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </StyledCardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledCard>
              <StyledCardContent>
                <ChartTitle variant="h6" gutterBottom>
                  <PieChartIcon color="primary" />
                  Top 5 Customers by SLA Performance
                </ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getTopFiveCustomersBySLA}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getTopFiveCustomersBySLA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </StyledCardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12}>
            <StyledCard>
              <StyledCardContent>
                <ChartTitle variant="h6" gutterBottom>
                  <Person color="primary" />
                  Customer Statistics
                </ChartTitle>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="customer stats table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Total Tickets</TableCell>
                        <TableCell align="right">Solved Tickets</TableCell>
                        <TableCell align="right">SLA Violations</TableCell>
                        <TableCell align="right">SLA Performance</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getCustomerStats.map((row) => (
                        <TableRow
                          key={row.customer}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>{row.customer[0]}</Avatar>
                              {row.customer}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{row.total}</TableCell>
                          <TableCell align="right">{row.solved}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={row.slaViolations}
                              color={row.slaViolations > 0 ? "error" : "success"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={row.slaPerformance} 
                                  color={row.slaPerformance > 80 ? "success" : row.slaPerformance > 50 ? "warning" : "error"}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">{`${Math.round(
                                  row.slaPerformance,
                                )}%`}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Tickets">
                              <IconButton onClick={() => handleCustomerClick(row.customer)}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </StyledCardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: theme.palette.background.default,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
            },
          }}
        >
          <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
            <Box display="flex" alignItems="center">
              <BugReport sx={{ mr: 1 }} />
              {`Tickets for ${selectedCustomer}`}
            </Box>
          </DialogTitle>
          <DialogContent>
            <List>
              {tickets
                .filter(ticket => ticket.domains.some(domain => domain.name === selectedCustomer))
                .map(ticket => (
                  <ListItem 
                    key={ticket.id}
                    sx={{
                      mb: 2,
                      bgcolor: 'background.paper',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {ticket.title}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Box display="flex" alignItems="center" mt={1}>
                            <Chip 
                              icon={ticket.ticketStatus === 'Resolved' ? <CheckCircle /> : <Error />}
                              label={ticket.ticketStatus}
                              color={ticket.ticketStatus === 'Resolved' ? 'success' : 'error'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              icon={<BugReport />}
                              label={ticket.type}
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              icon={<AccessTime />}
                              label={`Severity: ${ticket.severity}`}
                              color="warning"
                              size="small"
                            />
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))
              }
            </List>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}