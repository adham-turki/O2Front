import {
    Paper, styled
} from '@mui/material'

export const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
}))
export const StyledPaperForTickets = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      boxShadow: theme.shadows[10],
    
  }));
