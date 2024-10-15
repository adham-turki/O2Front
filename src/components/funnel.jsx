import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip, TextField, Button, Grid, useTheme, Collapse, Zoom } from '@mui/material';
import { ExpandMore, ExpandLess, Search, BugReport, NewReleases, Speed, Computer, Storage } from '@mui/icons-material';

// Extended mock data (unchanged)
const ticketData = [
  {
    "ticketId": 1,
    "platform": "BE",
    "issue": "Alkhaldi Unable to create Sabic shipments",
    "category": "Bug",
    "customer": "Ahmad Seder",
    "engagedTier": 1,
    "severity": "High",
    "currentStatus": "Closed",
    "impact": "Medium",
    "type": "Bug"
  },
  {
    "ticketId": 2,
    "platform": "FE",
    "issue": "Feature request: Dark mode",
    "category": "New Feature",
    "customer": "Fareed",
    "engagedTier": 1,
    "severity": "Medium",
    "currentStatus": "Open",
    "impact": "Low",
    "type": "New Feature"
  },
  {
    "ticketId": 3,
    "platform": "FE",
    "issue": "User registration failure",
    "category": "Bug",
    "customer": "Abood",
    "engagedTier": 1,
    "severity": "High",
    "currentStatus": "Closed",
    "impact": "Medium",
    "type": "Bug"
  },
  {
    "ticketId": 4,
    "platform": "BE",
    "issue": "NullPointerException in AddressUtil",
    "category": "Bug",
    "customer": "Abood",
    "engagedTier": 2,
    "severity": "Medium",
    "currentStatus": "Closed",
    "impact": "Low",
    "type": "Bug"
  },
  {
    "ticketId": 5,
    "platform": "FE",
    "issue": "UI layout issues on mobile",
    "category": "Bug",
    "customer": "Ahmad Seder",
    "engagedTier": 1,
    "severity": "Low",
    "currentStatus": "In Progress",
    "impact": "Low",
    "type": "Bug"
  },
  {
    "ticketId": 6,
    "platform": "BE",
    "issue": "Slow loading times",
    "category": "Bug",
    "customer": "Fareed",
    "engagedTier": 2,
    "severity": "Critical",
    "currentStatus": "Closed",
    "impact": "High",
    "type": "Bug"
  },
  {
    "ticketId": 7,
    "platform": "FE",
    "issue": "Payment form validation issues",
    "category": "Bug",
    "customer": "Nayef",
    "engagedTier": 1,
    "severity": "High",
    "currentStatus": "Closed",
    "impact": "Medium",
    "type": "Bug"
  },
  {
    "ticketId": 8,
    "platform": "BE",
    "issue": "Report generation failure",
    "category": "Bug",
    "customer": "Khalid",
    "engagedTier": 2,
    "severity": "Medium",
    "currentStatus": "Closed",
    "impact": "Low",
    "type": "Bug"
  },
  {
    "ticketId": 9,
    "platform": "FE",
    "issue": "Incorrect product price display",
    "category": "Bug",
    "customer": "Ayman",
    "engagedTier": 1,
    "severity": "Medium",
    "currentStatus": "Closed",
    "impact": "Medium",
    "type": "Bug"
  },
  {
    "ticketId": 10,
    "platform": "BE",
    "issue": "API response delay",
    "category": "Bug",
    "customer": "Abood",
    "engagedTier": 2,
    "severity": "Critical",
    "currentStatus": "Closed",
    "impact": "High",
    "type": "Bug"
  },
  {
    "ticketId": 11,
    "platform": "FE",
    "issue": "Cart items disappearing",
    "category": "Bug",
    "customer": "Layla",
    "engagedTier": 2,
    "severity": "High",
    "currentStatus": "In Progress",
    "impact": "High",
    "type": "Bug"
  },
  {
    "ticketId": 12,
    "platform": "BE",
    "issue": "Database connection timeout",
    "category": "Bug",
    "customer": "Omar",
    "engagedTier": 3,
    "severity": "Critical",
    "currentStatus": "Open",
    "impact": "High",
    "type": "Bug"
  },
  {
    "ticketId": 13,
    "platform": "FE",
    "issue": "Accessibility improvements needed",
    "category": "Enhancement",
    "customer": "Noor",
    "engagedTier": 2,
    "severity": "Medium",
    "currentStatus": "Open",
    "impact": "Medium",
    "type": "Enhancement"
  },
  {
    "ticketId": 14,
    "platform": "BE",
    "issue": "Memory leak in user session management",
    "category": "Bug",
    "customer": "Tariq",
    "engagedTier": 3,
    "severity": "High",
    "currentStatus": "In Progress",
    "impact": "High",
    "type": "Bug"
  },
  {
    "ticketId": 15,
    "platform": "FE",
    "issue": "Implement multi-language support",
    "category": "Feature",
    "customer": "Yasmin",
    "engagedTier": 2,
    "severity": "Low",
    "currentStatus": "Open",
    "impact": "Medium",
    "type": "Feature"
  }
];

const severityColors = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#f44336',
  Critical: '#9c27b0'
};

const statusIcons = {
  Open: <BugReport />,
  'In Progress': <Speed />,
  Closed: <NewReleases />,
};

const TicketFunnel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTickets, setExpandedTickets] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    1: { FE: true, BE: true },
    2: { FE: true, BE: true },
    3: { FE: true, BE: true }
  });
  const theme = useTheme();

  const filteredTickets = useMemo(() => {
    return ticketData.filter(ticket =>
      Object.values(ticket).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const groupedTickets = useMemo(() => {
    const grouped = {
      1: { FE: [], BE: [] },
      2: { FE: [], BE: [] },
      3: { FE: [], BE: [] }
    };

    filteredTickets.forEach(ticket => {
      const tier = ticket.engagedTier > 3 ? 3 : ticket.engagedTier;
      grouped[tier][ticket.platform].push(ticket);
    });

    return grouped;
  }, [filteredTickets]);

  const toggleExpand = (ticketId) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const toggleSection = (tier, platform) => {
    setExpandedSections(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [platform]: !prev[tier][platform]
      }
    }));
  };

  const renderTicket = (ticket) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }} key={ticket.ticketId}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: theme.palette.background.paper,
          borderLeft: `5px solid ${severityColors[ticket.severity]}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={10}>
            <Typography variant="subtitle1" fontWeight="bold">
              {ticket.issue}
            </Typography>
          </Grid>
          <Grid item xs={2} container justifyContent="flex-end">
            <Chip 
              icon={statusIcons[ticket.currentStatus]} 
              label={ticket.severity} 
              size="small"
              sx={{ 
                backgroundColor: severityColors[ticket.severity], 
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white',
                },
              }} 
            />
          </Grid>
        </Grid>
        <Box mt={1}>
          <Typography variant="body2" color="text.secondary">
            Status: {ticket.currentStatus} | Impact: {ticket.impact}
          </Typography>
        </Box>
        <Collapse in={expandedTickets[ticket.ticketId]}>
          <Box mt={2}>
            <Typography variant="body2">
              Customer: {ticket.customer}<br />
              Category: {ticket.category}<br />
              Type: {ticket.type}
            </Typography>
          </Box>
        </Collapse>
        <Button
          size="small"
          onClick={() => toggleExpand(ticket.ticketId)}
          endIcon={expandedTickets[ticket.ticketId] ? <ExpandLess /> : <ExpandMore />}
          sx={{ mt: 1 }}
        >
          {expandedTickets[ticket.ticketId] ? 'Less' : 'More'}
        </Button>
      </Paper>
    </Zoom>
  );

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main }}>
        Ticket Funnel Visualization
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Search sx={{ color: theme.palette.text.secondary, mr: 1 }} />
        <TextField
          fullWidth
          variant="standard"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            disableUnderline: true,
          }}
        />
      </Paper>
      {[1, 2, 3].map((tier) => (
        <Paper
          key={tier}
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: theme.palette.grey[100],
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            Tier {tier}
          </Typography>
          <Grid container spacing={2}>
            {['FE', 'BE'].map((platform) => (
              <Grid item xs={12} md={6} key={platform}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {platform === 'FE' ? (
                        <Computer sx={{ color: theme.palette.primary.main, mr: 1 }} />
                      ) : (
                        <Storage sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                      )}
                      <Typography variant="h6" sx={{ color: platform === 'FE' ? theme.palette.primary.main : theme.palette.secondary.main }}>
                        {platform === 'FE' ? 'Frontend' : 'Backend'}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => toggleSection(tier, platform)}
                      endIcon={expandedSections[tier][platform] ? <ExpandLess /> : <ExpandMore />}
                    >
                      {expandedSections[tier][platform] ? 'Collapse' : 'Expand'}
                    </Button>
                  </Box>
                  <Collapse in={expandedSections[tier][platform]}>
                    {groupedTickets[tier][platform].map(renderTicket)}
                  </Collapse>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

export default function Component() {
  return <TicketFunnel />;
}