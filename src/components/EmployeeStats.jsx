import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid,  CircularProgress, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, createTheme, ThemeProvider, styled, CssBaseline,SvgIcon 
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import ForceGraph2D from 'react-force-graph-2d'
import { EmojiEvents, Speed, Radar as RadarIcon, Group, EmojiPeople } from '@mui/icons-material';
import PropTypes from 'prop-types'
import { StyledPaper } from './StyledPaper';
import { set } from 'date-fns';


const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F3A683', '#F7D794', '#778BEB', '#786FA6', '#F8A5C2'
]
  
  const ResolutionRateIcon = (props) => (
    <SvgIcon {...props}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H8v-2h2V9h2v2h2v2h-2v4zm3-8h-1V7h1v2zm0-4h-1V3h1v2zm4 0h-3V3h3v2z"/>
    </SvgIcon>
  );
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
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
})



const ChartTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.primary.main,
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
//add props validation for AnimatedNumber
AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired,
}

const LeaderboardItem = styled(ListItem)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}))

export default function EngineersDashboard({ tickets, resolutions }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState()
  const apiUrl = import.meta.env.VITE_API_HOST;

  useEffect(() => {
   const fetchData = async () => {
    const response = await fetch(`${apiUrl}/api/stats/EngineersDashboard`)
    const res = await response.json()
    setData(res)
    setLoading(false)
    console.log(res);
    
   }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }



  const onCallLeaderboard =    data.processOnCallLeaderboard
  const participationNetwork = data.processParticipationNetwork
  const topContributors =      data.processTopContributors
  const engineerData =         data.processEngineerData

  const ChartTitleWithIcon = ({ title, icon: Icon }) => (
    <ChartTitle variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
      <span className='text-[#2a2a2a]'>{title }</span>
    </ChartTitle>
  );
  ChartTitleWithIcon.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <StyledPaper elevation={3}>
            <ChartTitleWithIcon title="On-Call Leaderboard" icon={EmojiEvents} />
            <List>
                {onCallLeaderboard.map((user, index) => (
                  <LeaderboardItem key={user.name}>
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
                  </LeaderboardItem>
                ))}
              </List>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={9}>
            <StyledPaper elevation={3}>
              <ChartTitleWithIcon title="Top Engineers by Resolution Rate" icon={ResolutionRateIcon} />
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={engineerData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="engineer" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolutionRate" fill={theme.palette.primary.main} name="Resolution Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
            <ChartTitleWithIcon title="Engineer Efficiency" icon={Speed} />
            <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="avgResolutionTime" name="Avg Resolution Time (hours)" />
                  <YAxis type="number" dataKey="resolutionRate" name="Resolution Rate (%)" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Engineers" data={engineerData} fill={theme.palette.primary.main}>
                    {engineerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
            <ChartTitleWithIcon title="Engineer Performance Radar" icon={RadarIcon} />
            <ResponsiveContainer width="100%" height={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={engineerData.slice(0, 5)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="engineer" />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                  <Radar name="Total Tickets" dataKey="total" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                  <Radar name="Resolved Tickets" dataKey="resolved" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
                  <Radar name="Avg Resolution Time" dataKey="avgResolutionTime" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
            <ChartTitleWithIcon title="Participation Network" icon={Group} />
            <Box sx={{ height: 400 }}>
                <ForceGraph2D
                  graphData={participationNetwork}
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
              </Box>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
            <ChartTitleWithIcon title="Top Contributors" icon={EmojiPeople} />
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topContributors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onCall" stackId="a" fill={COLORS[0]} name="On-Call" />
                  <Bar dataKey="participant" stackId="a" fill={COLORS[1]} name="Participant" />
                  <Bar dataKey="solver" stackId="a" fill={COLORS[2]} name="Solver" />
                </BarChart>
              </ResponsiveContainer>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  )
}
//add props validation for EngineersDashboard
EngineersDashboard.propTypes = {
  tickets: PropTypes.array.isRequired,
  resolutions: PropTypes.array.isRequired,
}
