import { useState } from 'react';
import {
  Box, Tooltip, Zoom, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, ThemeProvider, createTheme, CssBaseline, styled
} from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, Support as SupportIcon, AutoAwesome } from '@mui/icons-material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { motion, AnimatePresence } from 'framer-motion';
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

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: -drawerWidth,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
}));

const AnimatedListItemIcon = motion(ListItemIcon);

const dashboards = [
  { name: 'Main Dashboard', icon: <DashboardIcon />, path: '/main-dashboard' },
  { name: 'Tickets', icon: <SupportIcon />, path: '/table-dashboard' },
  { name: 'Tickets Funnel', icon: <FilterAltIcon />, path: '/tickets-funnel' },
  { name: 'Advanced Tickets Funnel', icon: <AutoAwesome />, path: '/advanced-tickets-funnel' },
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
              525K
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          sx={{
            position: 'absolute',  // Ensure the drawer is positioned absolutely
            top: 0,  // Align with the top of the window
            height: '100%',  // Full height of the window
            zIndex: (theme) => theme.zIndex.drawer,  // Ensure it appears above other components
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
              color: 'white',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2, cursor: 'pointer' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 600 }}>
              525K
            </Typography>
            <List>
              <AnimatePresence>
                {dashboards.map((dashboard) => (
                  <motion.div
                    key={dashboard.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Tooltip
                      title={dashboard.name}
                      placement="right"
                      TransitionComponent={Zoom}
                      arrow
                    >
                      <StyledListItem
                        button
                        onClick={() => handleDashboardChange(dashboard.path)}
                        selected={location.pathname === dashboard.path}
                      >
                        <AnimatedListItemIcon
                          transition={{ duration: 0.3 }}
                          sx={{ color: 'white' }}
                        >
                          {dashboard.icon}
                        </AnimatedListItemIcon>
                        <ListItemText primary={dashboard.name} />
                      </StyledListItem>
                    </Tooltip>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          </Box>
        </Drawer>
        <Main>
          <Toolbar />
          {/* Main content goes here */}
        </Main>
      </Box>
    </ThemeProvider>
  );
}
