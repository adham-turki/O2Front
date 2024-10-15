import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, ThemeProvider, createTheme, CssBaseline, styled } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, Support as SupportIcon, Engineering as EngineeringIcon, Business as BusinessIcon, BarChart as BarChartIcon, Assignment as AssignmentIcon, Person as PersonIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: { main: '#3f51b5' },
    secondary: { main: '#f50057' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .icon': {
      scale: 1.2,
      rotate: 360,
    },
  },
}));

const AnimatedListItemIcon = motion(ListItemIcon);

const dashboards = [
  { name: 'Main Dashboard', icon: <DashboardIcon />, path: '/main-dashboard' },
  { name: 'Tickets Dashboard', icon: <SupportIcon />, path: '/ticket-dashboard' },
  { name: 'Engineers Dashboard', icon: <EngineeringIcon />, path: '/engineers-dashboard' },
  { name: 'Manager Dashboard', icon: <BusinessIcon />, path: '/manager-dashboard' },
  { name: 'Custom Dashboard', icon: <BarChartIcon />, path: '/custom-dashboard' },
  { name: 'Ticket Workflow', icon: <AssignmentIcon />, path: '/ticket-flow' },
  { name: 'Customer Dashboard', icon: <PersonIcon />, path: '/customer-dashboard' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDashboardChange = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              525K Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
              color: 'white',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2,cursor:'pointer' }}>
            <List>
              {dashboards.map((dashboard) => (
                <StyledListItem
                  button
                  key={dashboard.name}
                  onClick={() => handleDashboardChange(dashboard.path)}
                  selected={location.pathname === dashboard.path}
                >
                  <AnimatedListItemIcon
                    className="icon"
                    transition={{ duration: 0.3 }}
                    sx={{ color: 'white' }}
                  >
                    {dashboard.icon}
                  </AnimatedListItemIcon>
                  <ListItemText primary={dashboard.name} />
                </StyledListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Main open={open}>
          <Toolbar />
        </Main>
      </Box>
    </ThemeProvider>
  );
}