'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    Box, Typography, Grid, Paper, CircularProgress, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, Tabs, Tab, ThemeProvider, createTheme, CssBaseline, styled,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { Sunburst } from '@nivo/sunburst'
import { motion } from 'framer-motion'
import ForceGraph2D from 'react-force-graph-2d'
import { parseISO, subDays, subMonths, subYears, isAfter } from 'date-fns'

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F3A683', '#F7D794', '#778BEB', '#786FA6', '#F8A5C2'
]

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
})

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
}))

const StyledSelect = styled(Select)(({ theme }) => ({
    minWidth: 200,
    '& .MuiSelect-select': {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
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

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                <p><strong>{data.name}</strong></p>
                <p>Avg Solution Time: {data.avgSolutionTime.toFixed(2)} h</p>
                <p>Avg Severity: {data.avgSeverity.toFixed(2)}</p>
                <p>Total Tickets: {data.totalTickets}</p>
            </div>
        )
    }
    return null
}

export default function EngineersDashboard({ tickets, resolutions }) {
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState(0)
    const [dateRange, setDateRange] = useState('all')

    useEffect(() => {
        if (tickets && resolutions) {
            setLoading(false)
        }
    }, [tickets, resolutions])

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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        )
    }

    // Data processing functions (using filteredTickets instead of tickets)
    const processOnCallLeaderboard = () => {
        const onCallCounts = filteredTickets.reduce((acc, ticket) => {
            const owner = ticket.owner.name
            acc[owner] = (acc[owner] || 0) + 1
            return acc
        }, {})
        return Object.entries(onCallCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
    }

    const processParticipationNetwork = () => {
        const nodes = new Set()
        const links = []
        filteredTickets.forEach(ticket => {
            const engineers = ticket.engagements.map(engagement => engagement.member.name)
            engineers.forEach((engineer, i) => {
                nodes.add(engineer)
                engineers.forEach((otherEngineer, j) => {
                    if (i !== j) {
                        links.push({ source: engineer, target: otherEngineer })
                    }
                })
            })
        })
        return {
            nodes: Array.from(nodes).map(id => ({ id })),
            links
        }
    }

    const processTopContributors = () => {
        const contributorData = filteredTickets.reduce((acc, ticket) => {
            const addContribution = (user, role) => {
                if (!acc[user]) acc[user] = { onCall: 0, participant: 0, solver: 0 }
                acc[user][role]++
            }

            addContribution(ticket.owner.name, 'onCall')
            ticket.engagements.forEach(engagement => addContribution(engagement.member.name, 'participant'))
            if (ticket.resolvedOn) addContribution(ticket.owner.name, 'solver')

            return acc
        }, {})

        return Object.entries(contributorData).map(([name, roles]) => ({
            name,
            ...roles,
            total: roles.onCall + roles.participant + roles.solver
        })).sort((a, b) => b.total - a.total).slice(0, 10)
    }

    const processEfficiencyRadar = () => {
        const userData = filteredTickets.reduce((acc, ticket) => {
            const user = ticket.owner.name
            if (!acc[user]) {
                acc[user] = { name: user, solved: 0, avgSolutionTime: 0, onCall: 0, collaborations: 0 }
            }
            acc[user].onCall++
            acc[user].collaborations += ticket.engagements.length
            if (ticket.resolvedOn) {
                acc[user].solved++
                const solutionTime = (new Date(ticket.resolvedOn) - new Date(ticket.reportedOn)) / (1000 * 60 * 60)
                acc[user].avgSolutionTime = (acc[user].avgSolutionTime * (acc[user].solved - 1) + solutionTime) / acc[user].solved
            }
            return acc
        }, {})

        return Object.values(userData)
    }

    const processSolversEfficiencyScoreboard = () => {
        const solverData = filteredTickets.reduce((acc, ticket) => {
            if (ticket.resolvedOn) {
                const solver = ticket.owner.name
                if (!acc[solver]) {
                    acc[solver] = { name: solver, avgSolutionTime: 0, avgSeverity: 0, totalTickets: 0 }
                }
                const solutionTime = (new Date(ticket.resolvedOn) - new Date(ticket.reportedOn)) / (1000 * 60 * 60)
                const severityValue = { SEV0: 4, SEV1: 3, SEV2: 2, SEV3: 1 }[ticket.severity]
                acc[solver].avgSolutionTime = (acc[solver].avgSolutionTime * acc[solver].totalTickets + solutionTime) / (acc[solver].totalTickets + 1)
                acc[solver].avgSeverity = (acc[solver].avgSeverity * acc[solver].totalTickets + severityValue) / (acc[solver].totalTickets + 1)
                acc[solver].totalTickets++
            }
            return acc
        }, {})

        return Object.values(solverData)
    }

    const processProblemSolversTree = () => {
        const solverData = filteredTickets.reduce((acc, ticket) => {
            if (ticket.resolvedOn) {
                const solver = ticket.owner.name
                if (!acc[solver]) {
                    acc[solver] = { name: solver, children: {} }
                }
                if (!acc[solver].children[ticket.type]) {
                    acc[solver].children[ticket.type] = { name: ticket.type, value: 0 }
                }
                acc[solver].children[ticket.type].value++
            }
            return acc
        }, {})

        return {
            name: 'Problem Solvers',
            children: Object.values(solverData).map(solver => ({
                name: solver.name,
                children: Object.values(solver.children)
            }))
        }
    }

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
    )

    const renderParticipationNetwork = () => {
        const graphData = processParticipationNetwork()
        return (
            <ForceGraph2D
                graphData={graphData}
                nodeAutoColorBy="id"
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.id
                    const fontSize = 12 / globalScale
                    ctx.font = `${fontSize}px Sans-Serif`
                    const textWidth = ctx.measureText(label).width
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)

                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions)

                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillStyle = node.color
                    ctx.fillText(label, node.x, node.y)
                }}
                nodeRelSize={5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={d => d.value * 0.001}
                width={600}
                height={400}
            />
        )
    }

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
    )

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
    )

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
                        <Cell key={`cell-${index}`}   fill={COLORS[index % COLORS.length]} />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    )

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
    )

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 'bold',
                                fontSize: '1rem',
                            },
                        }}
                    >
                        <Tab label="Overview" />
                        <Tab label="Efficiency" />
                        <Tab label="Problem Solving" />
                    </Tabs>
                    <FormControl variant="outlined">
                        <InputLabel id="date-range-label">Date Range</InputLabel>
                        <StyledSelect
                            labelId="date-range-label"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            label="Date Range"
                        >
                            <MenuItem value="all">All Time</MenuItem>
                            <MenuItem value="last-week">Last Week</MenuItem>
                            <MenuItem value="last-month">Last Month</MenuItem>
                            <MenuItem value="last-6-months">Last 6 Months</MenuItem>
                            <MenuItem value="last-year">Last Year</MenuItem>
                        </StyledSelect>
                    </FormControl>
                </Box>

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
    )
}