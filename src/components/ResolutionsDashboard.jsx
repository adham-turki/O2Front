
import {
  Box,
  Grid,
  Typography,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  BugReport,
  Timeline,
  BarChart as BarChartIcon,
  AccessTime
} from '@mui/icons-material'
import PropTypes from 'prop-types'
import { StyledCardForResolutions as StyledCard } from './StyledCards';


const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',

        },
      },
    },
  },
})



const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
  },
  '& .MuiTableRow-root': {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: '50%',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}))

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  padding: theme.spacing(2),
}))

const StyledTableRow = styled(TableRow)(() => ({
  transition: 'background-color 0.3s ease',
}))

const ChartTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 500,
  color: theme.palette.text.primary,
}))

export default function ResolutionsDashboard  ({data})  {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <div className='flex items-center gap-3'>

                <IconWrapper>
                  <BugReport fontSize="large" />
                </IconWrapper>
                <ChartTitle variant="h5">
                  Top 10 Root Causes
                </ChartTitle>
              </div>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Root Cause</StyledTableCell>
                      <StyledTableCell align="right">Frequency</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.rootCauseFrequency.map((row) => (
                      <StyledTableRow key={row.cause}>
                        <StyledTableCell component="th" scope="row">
                          {row.cause}
                        </StyledTableCell>
                        <StyledTableCell align="right">{row.count}</StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <div className='flex items-center gap-3'>
                <IconWrapper>
                  <Timeline fontSize="large" />
                </IconWrapper>
                <ChartTitle variant="h5">
                  Average Resolution Time by Root Cause
                </ChartTitle>
              </div>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Root Cause</StyledTableCell>
                      <StyledTableCell align="right">Average Resolution Time (hours)</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.averageResolutionTimeByRootCause.map((row) => (
                      <StyledTableRow key={row.cause}>
                        <StyledTableCell component="th" scope="row">
                          {row.cause}
                        </StyledTableCell>
                        <StyledTableCell align="right">{row.avgResolutionTime.toFixed(2)}</StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <div className='flex items-center gap-3'>
                <IconWrapper>
                  <BarChartIcon fontSize="large" />
                </IconWrapper>
                <ChartTitle variant="h5">Top 10 Root Causes</ChartTitle>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.rootCauseFrequency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cause" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={theme.palette.primary.main} name="Frequency" />
                </BarChart>
              </ResponsiveContainer>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <div className='flex items-center gap-3'>
                <IconWrapper>
                  <AccessTime fontSize="large" />
                </IconWrapper>
                <ChartTitle variant="h5">Average Resolution Time by Root Cause</ChartTitle>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.averageResolutionTimeByRootCause}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cause" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgResolutionTime" fill={theme.palette.secondary.main} name="Avg Resolution Time (hours)" />
                </BarChart>
              </ResponsiveContainer>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  )
}
ResolutionsDashboard.propTypes = {
  data: PropTypes.array.isRequired,
}