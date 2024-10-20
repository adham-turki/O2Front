import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Chip, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardContent, CircularProgress, LinearProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Person, BugReport, CheckCircle, Error, AccessTime } from '@mui/icons-material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#f50057',
        },
    },
});


export default function CustomerDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:1337/api/stats/CustomerDashboard`);
                const data = await response.json();
                setTickets(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching ticket data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // const getCustomerStats = () => {
    //     const stats = {};
    //     tickets.forEach(ticket => {
    //         if (!stats[ticket.customer]) {
    //             stats[ticket.customer] = { total: 0, solved: 0, slaViolations: 0 };
    //         }
    //         stats[ticket.customer].total += 1;
    //         if (ticket.isSolved) stats[ticket.customer].solved += 1;
    //         if (!ticket.SLA) stats[ticket.customer].slaViolations += 1;
    //     });
    //     return Object.entries(stats).map(([customer, data]) => ({
    //         customer,
    //         total: data.total,
    //         solved: data.solved,
    //         slaViolations: data.slaViolations,
    //         slaPerformance: ((data.total - data.slaViolations) / data.total) * 100
    //     })).sort((a, b) => b.total - a.total);
    // };

    // const getCustomerTicketDistribution = () => {
    //     const distribution = tickets.reduce((acc, ticket) => {
    //         acc[ticket.customer] = (acc[ticket.customer] || 0) + 1;
    //         return acc;
    //     }, {});
    //     return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    // };


    // const getAverageSLAPerformance = () => {
    //     const slaPerformances = tickets.CustomerStats.map(stat => stat.slaPerformance);
    //     return slaPerformances.reduce((a, b) => a + b, 0) / slaPerformances.length;
    // };

    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom component="div" sx={{ mb: 4 }}>
                    Customer Support Dashboard
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Tickets
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {tickets['tickets'].length}
                                </Typography>
                                <Typography color="textSecondary">
                                    <BugReport /> All time
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
                                    {tickets['tickets'].filter(ticket => !ticket.is_solved).length}
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
                                    {tickets['tickets'].filter(ticket => ticket.is_solved).length}
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
                                    {tickets.AverageSLAPerformance.toFixed(2)}%
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
                                <BarChart data={tickets.CustomerTicketDistribution}>
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
                                    {tickets.CustomerStats.map((row) => (
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
                            {tickets['tickets']
                                .filter(ticket => ticket.customer === selectedCustomer)
                                .map(ticket => (
                                    <ListItem key={ticket.id}>
                                        <ListItemText
                                            primary={ticket.issue}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        Status: {ticket.current_status}
                                                    </Typography>
                                                    {` — ${ticket.category}, Severity: ${ticket.severity}`}
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
    );
}