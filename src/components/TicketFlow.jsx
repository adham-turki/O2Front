import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Chip, Avatar, Grid, Paper,
  Tooltip, ThemeProvider, createTheme, Zoom, Fade, Grow
} from '@mui/material';
import {
  BugReport, AccessTime, CheckCircle, Error, Label, Person,
  Timeline as TimelineIcon, Lightbulb, Speed, PriorityHigh,
   Assignment, 
  TouchApp, Update, ArrowUpward, ReportProblem, AssignmentTurnedIn,
  AssignmentInd, EmojiObjects, Phone
} from '@mui/icons-material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import PropTypes from 'prop-types';

const theme = createTheme({
  palette: {
    primary: { main: '#3a86ff' },
    secondary: { main: '#ff006e' },
    error: { main: '#ff595e' },
    warning: { main: '#ffca3a' },
    success: { main: '#8ac926' },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f0f0f0)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

const MotionPaper = motion(Paper);

const severityColors = {
  SEV1: theme.palette.error.main,
  SEV2: theme.palette.warning.main,
  SEV3: theme.palette.success.main,
  SEV4: theme.palette.primary.main,
};

const priorityIcons = {
  Low: <Speed style={{ color: theme.palette.success.main }} />,
  Medium: <Speed style={{ color: theme.palette.warning.main }} />,
  High: <PriorityHigh style={{ color: theme.palette.error.main }} />,
  Critical: <PriorityHigh style={{ color: theme.palette.error.main }} />,
};

const engagementIcons = {
  Engage: <TouchApp />,
  UpdateStatus: <Update />,
  EscalateToTier2: <ArrowUpward />,
  IncidentReporting: <ReportProblem />,
  RequestFulfillment: <AssignmentTurnedIn />,
  TaskAssignment: <AssignmentInd />,
  Contribution: <EmojiObjects />,
  CustomerFollowUp: <Phone />,
};

const InfoCard = ({ title, children, icon }) => {

  return (
    <Grow in={true} timeout={800}>
      <MotionPaper
        elevation={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 3,
          height: 'auto' ,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            {React.cloneElement(icon, { sx: { mr: 1, fontSize: 28 } })}
            {title}
          </Typography>
          
        </Box>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </MotionPaper>
    </Grow>
  );
};

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
};

export default function EnhancedTicketWorkflow() {
  const location = useLocation();
  const { selectedTicket, ticketResolutions } = location.state || {};
  const firstResolution = ticketResolutions?.[0] || {};
  const hasResolutions = ticketResolutions && ticketResolutions.length > 0;

  const timelineEvents = [
    { date: selectedTicket.reportedOn || new Date(), title: "Ticket Reported", icon: <BugReport />, color: theme.palette.primary.main },
    ...selectedTicket.engagements.map(eng => ({
      date: eng.engagedOn || new Date(),
      title: eng.action,
      description: eng.message,
      icon: engagementIcons[eng.action] || <AccessTime />,
      color: theme.palette.secondary.main,
      members: eng.members[0]?.name || 'Unknown'
    })),
  ];

  if (selectedTicket.resolvedOn) {
    timelineEvents.push({
      date: selectedTicket.resolvedOn,
      title: "Ticket Resolved",
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    });
  }

  timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 4, bgcolor: 'background.default' }}>
        <Fade in={true} timeout={1000}>
          <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            Ticket Workflow Visualization
          </Typography>
        </Fade>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <InfoCard title="Ticket Details" icon={<Assignment />} >
              <Typography><strong>ID:</strong> {selectedTicket.id}</Typography>
              <Typography><strong>Type:</strong> {selectedTicket.type}</Typography>
              <Typography><strong>Title:</strong> {selectedTicket.title}</Typography>
              <Typography><strong>Status:</strong> {selectedTicket.ticketStatus}</Typography>
              <Typography>
                <strong>Severity:</strong>
                <Chip
                  label={selectedTicket?.severity || 'N/A'}
                  size="small"
                  sx={{ ml: 1, bgcolor: severityColors[selectedTicket?.severity] || 'grey', color: 'white' }}
                />
              </Typography>
              <Typography>
                <strong>Priority:</strong>
                <Chip
                  icon={priorityIcons[selectedTicket?.priority] || <Speed />}
                  label={selectedTicket?.priority || 'N/A'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography><strong>Reported By:</strong> {selectedTicket?.reportedBy?.name || 'N/A'}</Typography>
              <Box mt={2}>
                <Typography variant="subtitle2" >Tags:</Typography>
                {selectedTicket?.tags?.map((tag, index) => (
                  <Tooltip title={tag.label} key={index}>
                    <Chip
                      label={tag.label}
                      icon={<Label />}
                      size="small"
                      variant="outlined"
                      sx={{ m: 0.5 }}
                      color="secondary"
                    />
                  </Tooltip>
                )) || 'No tags'}
              </Box>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard title="Incident Information" icon={<Error />}>
              <Typography><strong>Issue:</strong> {firstResolution.issue || 'N/A'}</Typography>
              <Typography><strong>First Seen:</strong> {new Date(firstResolution.firstSeen || new Date()).toLocaleString()}</Typography>
              <Typography><strong>Last Seen:</strong> {new Date(firstResolution.lastSeen || new Date()).toLocaleString()}</Typography>
              <Typography>
                <strong>Severity:</strong>
                <Chip
                  label={firstResolution.severity || 'N/A'}
                  size="small"
                  sx={{ ml: 1, bgcolor: severityColors[firstResolution.severity] || 'grey', color: 'white' }}
                />
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle2">Involved Members:</Typography>
                {firstResolution.members?.map((members, index) => (
                  <Tooltip title={members.name} key={index}>
                    <Chip
                      avatar={<Avatar>{members.name[0]}</Avatar>}
                      label={members.name}
                      variant="outlined"
                      sx={{ m: 0.5 }}
                      color="primary"
                    />
                  </Tooltip>
                )) || 'No members involved'}
              </Box>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard title="Domains Affected" icon={<Person />}>
              {selectedTicket?.domains?.map((domain, index) => (
                <Tooltip title={domain.name} key={index}>
                  <Chip
                    label={domain.name}
                    icon={<Person />}
                    variant="outlined"
                    sx={{ m: 0.5 }}
                    color="primary"
                  />
                </Tooltip>
              )) || 'No affected domains'}
            </InfoCard>
          </Grid>
        </Grid>

        <Grid className='mt-4'>
          <InfoCard title="Solutions and Root Causes" icon={<Lightbulb />}>
            <Box mt={2}>
              {hasResolutions && firstResolution.solutions?.map((solution, index) => (
                <Zoom in={true} style={{ transitionDelay: `${index * 150}ms` }} key={index}>
                  <Paper elevation={3} sx={{ p: 2, mb: 2, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>Root Cause {index + 1}:</Typography>
                    <Typography variant="body2" color="text.secondary">{solution.rootCause}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main', mt: 1 }}>Solution:</Typography>
                    <Typography variant="body2" color="text.secondary">{solution.solution}</Typography>
                  </Paper>
                </Zoom>
              )) || 'No solutions available'}
            </Box>
          </InfoCard>
        </Grid>

        <MotionPaper elevation={6} sx={{ mt: 4, p: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            <TimelineIcon sx={{ mr: 1 }} />
            Ticket Timeline
          </Typography>
          <Box sx={{ position: 'relative', mt: 4 }}>
            <Timeline position="alternate">
              {timelineEvents.map((event, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: event.color }}>
                      {event.icon}
                    </TimelineDot>
                    {index < timelineEvents.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1000}>
                      <MotionPaper
                        elevation={3}
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease-in-out',
                          
                        }}
                      >
                        <Typography variant="h6" component="div" sx={{ color: event.color }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.date).toLocaleString()}
                        </Typography>
                        {event.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {event.description}
                          </Typography>
                        )}
                        {event.members && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            by: {event.members}
                          </Typography>
                        )}
                      </MotionPaper>
                    </Grow>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
        </MotionPaper>
      </Box>
    </ThemeProvider>
  );
}