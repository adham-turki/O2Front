import { 
     styled, Card,Paper
  } from '@mui/material';
  import { motion } from 'framer-motion'

export const StyledCardFortickets = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: theme.shadows[10],
  }));
  export const StyledCardForCustomers = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: theme.shadows[10],
}))
export const StyledCardForResolutions = styled(motion(Paper))(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  }))