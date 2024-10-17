'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
    Box, Typography, Paper, Grid, Chip, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardContent, CircularProgress, LinearProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { ThemeProvider, createTheme, styled } from '@mui/material/styles'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Person, BugReport, CheckCircle, Error, AccessTime, FilterList } from '@mui/icons-material'
import { parseISO, subDays, subMonths, subYears, isAfter } from 'date-fns'

const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#f50057',
        },
    },
})

const StyledSelect = styled(Select)(({ theme }) => ({
    minWidth: 200,
    '& .MuiSelect-select': {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}))

export default function CustomerDashboard({ resolutions, tickets }) {
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [dateRange, setDateRange] = useState('all')

    useEffect(() => {
        if (resolutions && tickets) {
            setLoading(false)
        }
    }, [resolutions, tickets])

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

    const getCustomerStats = () => {
        const stats = {}
        filteredTickets.forEach(ticket => {
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
    }

    const getCustomerTicketDistribution = () => {
        const distribution = {}
        filteredTickets.forEach(ticket => {
            ticket.domains.forEach(domain => {
                distribution[domain.name] = (distribution[domain.name] || 0) + 1
            })
        })
        return Object.entries(distribution).map(([name, value]) => ({ name, value }))
    }

    const getAverageSLAPerformance = () => {
        const slaPerformances = getCustomerStats().map(stat => stat.slaPerformance)
        return slaPerformances.reduce((a, b) => a + b, 0) / slaPerformances.length
    }

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
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom component="div" sx={{ mb: 4 }}>
                    Customer Support Dashboard
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

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Tickets
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {filteredTickets.length}
                                </Typography>
                                <Typography color="textSecondary">
                                    <BugReport /> {dateRange === 'all' ? 'All time' : `Last ${dateRange.split('-')[1]}`}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Open Tickets
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {filteredTickets.filter(ticket => ticket.ticketStatus !== 'RESOLVED').length}
                                </Typography>
                                <Typography color="#ff6500">
                                    <Error /> Needs attention
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Resolved Tickets
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {filteredTickets.filter(ticket => ticket.ticketStatus === 'RESOLVED').length}
                                </Typography>
                                <Typography color="#2e7d32">
                                    <CheckCircle /> Successfully closed
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3} >
                        <Card >
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Average SLA Performance
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {getAverageSLAPerformance().toFixed(2)}%
                                </Typography>
                                <Typography color="">
                                    <AccessTime /> Across all customers
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} className='min-w-full'>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Customer Ticket Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={getCustomerTicketDistribution()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="customer stats table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Customer</TableCell>
                                        <TableCell align="right">Total Tickets</TableCell>
                                        <TableCell align="right">Solved Tickets</TableCell>
                                        <TableCell align="right">SLA Violations</TableCell>
                                        <TableCell align="right">SLA Performance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getCustomerStats().map((row) => (
                                        <TableRow
                                            key={row.customer}
                                            hover
                                            onClick={() => handleCustomerClick(row.customer)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ mr: 2 }}><Person /></Avatar>
                                                    {row.customer}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{row.total}</TableCell>
                                            <TableCell align="right">{row.solved}</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={row.slaViolations}
                                                    color={row.slaViolations > 0 ? "error" : "success"}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box sx={{ width: '100%', mr: 1 }}>
                                                        <LinearProgress variant="determinate" value={row.slaPerformance} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 35 }}>
                                                        <Typography variant="body2" color="text.secondary">{`${Math.round(
                                                            row.slaPerformance,
                                                        )}%`}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>{`Tickets for ${selectedCustomer}`}</DialogTitle>
                    <DialogContent>
                        <List>
                            {filteredTickets
                                .filter(ticket => ticket.domains.some(domain => domain.name === selectedCustomer))
                                .map(ticket => (
                                    <ListItem key={ticket.id}>
                                        <ListItemText
                                            primary={ticket.title}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        Status: {ticket.ticketStatus}
                                                    </Typography>
                                                    {` — ${ticket.type}, Severity: ${ticket.severity}`}
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