import { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, CircularProgress, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, Tabs, Tab, ThemeProvider, createTheme, CssBaseline, styled
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Sunburst } from '@nivo/sunburst';
import { motion } from 'framer-motion';
import ForceGraph2D from 'react-force-graph-2d';
import PropTypes from 'prop-types';


const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F3A683', '#F7D794', '#778BEB', '#786FA6', '#F8A5C2'
];

const theme = createTheme({
    palette: {
        primary: {
            main: '#4ECDC4',
        },
        secondary: {
            main: '#FF6B6B',
        },
        background: {
            default: '#F0F4F8',
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: 'Poppins, sans-serif',
    },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    background: '#FFFFFF',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
    },
}));

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

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                <p><strong>{data.name}</strong></p>
                <p>Avg Solution Time: {data.avgSolutionTime.toFixed(2)} h</p>
                <p>Avg Severity: {data.avgSeverity.toFixed(2)}</p>
                <p>Total Tickets: {data.totalTickets}</p>
            </div>
        );
    }
    return null;
};
// probs validation for the CustomTooltip
CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
};


export default function EngineersDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const apiUrl = import.meta.env.VITE_API_HOST;


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/stats/EngineersDashboard`);
                const data = await response.json();
                setTickets(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching ticket data:", error);
                setLoading(false);
            }
        };

        fetchData();
        console.log(tickets);
        
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Data processing functions
    const processOnCallLeaderboard = () => {
        // log(tickets.processOnCallLeaderboard);
        return tickets.processOnCallLeaderboard
    };

    const processParticipationNetwork = () => {
    return tickets.processParticipationNetwork
    };

    const processTopContributors = () => {
       return tickets.processTopContributors
    };

    const processEfficiencyRadar = () => {
      return tickets.processEfficiencyRadar
    };

    const processSolversEfficiencyScoreboard = () => {
        return tickets.processSolversEfficiencyScoreboard
    };

    const processProblemSolversTree = () => {
        return tickets.processProblemSolversTree
    };

    // Render functions for each chart
    const renderOnCallLeaderboard = () => (
        <List>
            {processOnCallLeaderboard().map((user, index) => (
                <ListItem key={user.name}>
                    <ListItemAvatar>
                        <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>{user.name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={user.name}
                        secondary={
                            <Typography variant="body2">
                                Tickets: <AnimatedNumber value={user.count} />
                            </Typography>
                        }
                    />
                </ListItem>
            ))}
        </List>
    );

    const renderParticipationNetwork = () => {
        const graphData = processParticipationNetwork();
        console.log(graphData);
        
        return (
            <ForceGraph2D
                graphData={graphData}
                nodeAutoColorBy="id"
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.id;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.color;
                    ctx.fillText(label, node.x, node.y);
                }}
                nodeRelSize={5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={d => d.value * 0.001}
                width={600}
                height={400}
            />
        );
    };

    const renderTopContributors = () => (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processTopContributors()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="onCall" stackId="a" fill={COLORS[0]} />
                <Bar dataKey="participant" stackId="a" fill={COLORS[1]} />
                <Bar dataKey="solver" stackId="a" fill={COLORS[2]} />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderEfficiencyRadar = () => (
        <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={processEfficiencyRadar()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                <Radar name="Solved" dataKey="solved" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                <Radar name="Avg Solution Time" dataKey="avgSolutionTime" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
                <Radar name="On Call" dataKey="onCall" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
                <Radar name="Collaborations" dataKey="collaborations" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.6} />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );

    const renderSolversEfficiencyScoreboard = () => (
        <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="avgSolutionTime" name="Avg Solution Time" unit="h" />
                <YAxis type="number" dataKey="avgSeverity" name="Avg Severity" domain={[0, 4]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Legend />
                <Scatter name="Solvers" data={processSolversEfficiencyScoreboard()} fill="#8884d8">
                    {processSolversEfficiencyScoreboard().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    );

    const renderProblemSolversTree = () => (
        <ResponsiveContainer width="100%" height={400}>
            <Sunburst
                data={processProblemSolversTree()}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                id="name"
                value="value"
                cornerRadius={2}
                borderColor={{ theme: 'background' }}
                colors={{ scheme: 'nivo' }}
                childColor={{ from: 'color', modifiers: [['brighter', 0.1]] }}
                enableArcLabels={true}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
            />
        </ResponsiveContainer>
    );

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1, p: 3, background: theme.palette.background.default }}>
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h3" gutterBottom align="center" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 4 }}>
                        Engineers Dashboard
                    </Typography>
                </motion.div>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    centered
                    sx={{ mb: 4 }}
                >
                    <Tab label="Overview" />
                    <Tab label="Efficiency" />
                    <Tab label="Problem Solving" />
                </Tabs>

                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <motion.div whileHover={{ scale: 1.05 }} >
                                <StyledPaper>
                                    <Typography variant="h6" gutterBottom>On-Call Leaderboard</Typography>
                                    {renderOnCallLeaderboard()}
                                </StyledPaper>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <motion.div whileHover={{ scale: 1.05 }} >
                                <StyledPaper>
                                    <Typography variant="h6" gutterBottom>Participation Network</Typography>
                                    {renderParticipationNetwork()}
                                </StyledPaper>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12}>
                            <motion.div whileHover={{ scale: 1.02 }} >
                                <StyledPaper>
                                    <Typography variant="h6" gutterBottom>Top Contributors</Typography>
                                    {renderTopContributors()}
                                </StyledPaper>
                            </motion.div>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <motion.div whileHover={{ scale: 1.05 }} >
                                <StyledPaper>
                                    <Typography variant="h6" gutterBottom>Efficiency Radar</Typography>
                                    {renderEfficiencyRadar()}
                                </StyledPaper>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <motion.div whileHover={{ scale: 1.05 }} >
                                <StyledPaper>
                                    <Typography variant="h6" gutterBottom>Solvers Efficiency Scoreboard</Typography>
                                    {renderSolversEfficiencyScoreboard()}
                                </StyledPaper>
                            </motion.div>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <motion.div whileHover={{ scale: 1.02 }} >
                                <StyledPaper>
                                    <Typography variant="h6" gutterBottom>Problem Solvers Tree</Typography>
                                    {renderProblemSolversTree()}
                                </StyledPaper>
                            </motion.div>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </ThemeProvider>
    );
}