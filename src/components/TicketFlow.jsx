import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Chip, Avatar, Grid, Paper, IconButton,
  Tooltip, ThemeProvider, createTheme
} from '@mui/material';
import {
  BugReport, AccessTime, CheckCircle, Error, Label, Person,
  Timeline as TimelineIcon, Lightbulb, Speed, PriorityHigh,
  Chat, Assignment, ExpandMore, ExpandLess,
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
    borderRadius: 8,
  },
});

const MotionBox = motion(Box);
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

const ticketData = {
  "id": 1,
  "type": "BUG",
  "title": "failed to login",
  "slackThreadId": "923539",
  "metSla": false,
  "reportedOn": "2024-10-13T21:15:00.000Z",
  "resolvedOn": "2024-10-11T21:15:00.000Z",
  "ticketStatus": "New",
  "sevirity": "SEV2",
  "priority": "Critical",
  "reportedBy": {
    "name": "Ahmad Seder",
    "email": "ahmad@525k.io",
  },
  "tags": [
    { "label": "BE" }
  ],
  "engagements": {
    "data": [
      {
        "id": 1,
        "engagedOn": "2024-10-08T06:45:00.000Z",
        "action": "Engage",
        "message": "first touch",
        "member": {
          "name": "Ahmad Seder",
        }
      },
      {
        "id": 2,
        "engagedOn": "2024-10-08T21:15:00.000Z",
        "action": "UpdateStatus",
        "message": "update the status",
        "member": {
          "name": "adham turki",
        }
      },
      {
        "id": 3,
        "engagedOn": "2024-10-09T21:00:00.000Z",
        "action": "EscalateToTier2",
        "message": "abudaqa escalated the ticket to tariq",
        "member": {
          "name": "Ahmad Abu Daqa",
        }
      },
      {
        "id": 4,
        "engagedOn": "2024-10-10T21:00:00.000Z",
        "action": "IncidentReporting",
        "message": "report incident",
        "member": {
          "name": "Ahmad Seder",
        }
      },
      {
        "id": 5,
        "engagedOn": "2024-10-10T21:15:00.000Z",
        "action": "RequestFulfillment",
        "message": "request fulfillment",
        "member": {
          "name": "Ahmad Seder",
        }
      },
      {
        "id": 6,
        "engagedOn": "2024-10-10T21:30:00.000Z",
        "action": "TaskAssignment",
        "message": "assign tasks",
        "member": {
          "name": "Ahmad Seder",
        }
      },
      {
        "id": 7,
        "engagedOn": "2024-10-10T21:45:00.000Z",
        "action": "Contribution",
        "message": "contribute",
        "member": {
          "name": "islam",
        }
      },
      {
        "id": 8,
        "engagedOn": "2024-10-11T21:00:00.000Z",
        "action": "CustomerFollowUp",
        "message": "update the status for the customer",
        "member": {
          "name": "Ahmad Abu Daqa",
        }
      }
    ]
  },
  "domains": [
    { "name": "alkhaldi" }
  ]
};

const incidentData = {
  "issue": "failed to login",
  "firstSeen": "2024-10-07T21:00:00.000Z",
  "lastSeen": "2024-10-13T21:15:00.000Z",
  "sevirity": "SEV1",
  "members": [
    {
      "name": "Ahmadosh",
      "email": "ahmad@gmail.com",
    }
  ],
  "solutions": [
    {
      "id": 1,
      "solution": "aksdbasdbb",
      "rootCause": "qsakjsbdaksbd"
    },
    {
      "id": 2,
      "solution": "change password every time in a while",
      "rootCause": "the password isnt changed from a year ago"
    }
  ],
};

const InfoCard = ({ title, children, icon }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <MotionPaper
      elevation={3}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        p: 3,
        height: expanded ? 'auto' : '300px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          {React.cloneElement(icon, { sx: { mr: 1 } })}
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
  );
};
// props validation for info card
InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
};
export default function EnhancedTicketWorkflow() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const timelineEvents = [
    { date: incidentData.firstSeen, title: "Incident First Seen", icon: <Error />, color: theme.palette.error.main },
    { date: ticketData.reportedOn, title: "Ticket Reported", icon: <BugReport />, color: theme.palette.primary.main },
    ...ticketData.engagements.data.map(eng => ({
      date: eng.engagedOn,
      title: eng.action,
      description: eng.message,
      icon: engagementIcons[eng.action] || <AccessTime />,
      color: theme.palette.secondary.main,
      member: eng.member.name
    })),
    { date: incidentData.lastSeen, title: "Incident Last Seen", icon: <Error />, color: theme.palette.error.main },
    { date: ticketData.resolvedOn, title: "Ticket Resolved", icon: <CheckCircle />, color: theme.palette.success.main }
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 4, bgcolor: 'background.default' }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Ticket Workflow Visualization
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <InfoCard title="Ticket Details" icon={<Assignment />} >
              <Typography><strong>ID:</strong> {ticketData.id}</Typography>
              <Typography><strong>Type:</strong> {ticketData.type}</Typography>
              <Typography><strong>Title:</strong> {ticketData.title}</Typography>
              <Typography><strong>Status:</strong> {ticketData.ticketStatus}</Typography>
              <Typography>
                <strong>Severity:</strong>
                <Chip
                  label={ticketData.sevirity}
                  size="small"
                  sx={{ ml: 1, bgcolor: severityColors[ticketData.sevirity], color: 'white' }}
                />
              </Typography>
              <Typography>
                <strong>Priority:</strong>
                <Chip
                  icon={priorityIcons[ticketData.priority]}
                  label={ticketData.priority}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography><strong>Reported By:</strong> {ticketData.reportedBy.name}</Typography>
              <Box mt={2}>
                <Typography variant="subtitle2" >Tags:</Typography>
                {ticketData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag.label}
                    icon={<Label />}
                    size="small"
                    variant="outlined"
                    sx={{ m: 0.5 }}
                    color="secondary"

                  />
                ))}
              </Box>
            </InfoCard>
          </Grid>


          <Grid item xs={12} md={4}>
            <InfoCard title="Incident Information" icon={<Error />}>
              <Typography><strong>Issue:</strong> {incidentData.issue}</Typography>
              <Typography><strong>First Seen:</strong> {new Date(incidentData.firstSeen).toLocaleString()}</Typography>
              <Typography><strong>Last Seen:</strong> {new Date(incidentData.lastSeen).toLocaleString()}</Typography>
              <Typography>
                <strong>Severity:</strong>
                <Chip
                  label={incidentData.sevirity}
                  size="small"
                  sx={{ ml: 1, bgcolor: severityColors[incidentData.sevirity], color: 'white' }}
                />
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle2">Involved Members:</Typography>
                {incidentData.members.map((member, index) => (
                  <Chip 
                    key={index}
                    avatar={<Avatar>{member.name[0]}</Avatar>}
                    label={member.name}
                    variant="outlined"
                    sx={{ m: 0.5 }}
                    color="primary"
                    
                  />
                ))}
              </Box>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard title="Domains Affected" icon={<Person />}>
              {ticketData.domains.map((domain, index) => (
                <Chip
                  key={index}
                  label={domain.name}
                  icon={<Person />}
                  variant="outlined"
                  sx={{ m: 0.5 }}
                  color="primary"

                />
              ))}
            </InfoCard>
          </Grid>
        </Grid>
        <Grid className='mt-4'>
        <InfoCard title="Solutions and Root Causes" icon={<Lightbulb />}>
          {/* New Section for Solution and Root Cause */}
          <Box mt={2}>
                {incidentData.solutions.map((solution, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>Root Cause {index + 1}:</Typography>
                    <Typography variant="body2" color="text.secondary">{solution.rootCause}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Solution :</Typography>
                    <Typography variant="body2" color="text.secondary">{solution.solution}</Typography>
                  </Paper>
                ))}
              </Box>
              </InfoCard>
        </Grid>

        <MotionPaper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
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
                    <MotionPaper
                      elevation={3}
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
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
                      {event.member && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                          by: {event.member}
                        </Typography>
                      )}
                    </MotionPaper>
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