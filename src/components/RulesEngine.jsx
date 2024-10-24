import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Fade,
  useTheme,
  alpha,
  Tooltip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RuleIcon from '@mui/icons-material/Rule';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import FlagIcon from '@mui/icons-material/Flag';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s',
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 40px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const RuleNumber = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: -15,
  right: -15,
  background: `${theme.palette.primary.main}`,
  color: theme.palette.primary.contrastText,
  borderRadius: '50%',
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const ConditionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  '& .MuiChip-label': {
    display: 'flex',
    alignItems: 'center',
  },
}));

const factOptions = ['lastUpdated', 'ticketStatus', 'notificationHistoriesLength', 'severity', 'tier', 'priority', 'createdAt'];
const operatorOptions = ['equal', 'notEqual', 'greaterThan', 'lessThan', 'greaterThanInclusive', 'lessThanInclusive'];
const eventTypeOptions = ['sendSlackPublicMessage', 'sendSlackPrivateMessage', 'escalateToManager'];

const getValueOptions = (fact) => {
  switch (fact) {
    case 'ticketStatus':
      return ['New', 'WIP', 'INV', 'RESOLVED', 'ONHOLD', 'CLOSED'];
    case 'notificationHistoriesLength':
      return ['0', '1', '2', '3', '4', '5'];
    case 'severity':
      return ['SEV0', 'SEV1', 'SEV2', 'SEV3'];
    case 'tier':
      return ['TIER1', 'TIER2', 'TIER3'];
    case 'priority':
      return ['Low', 'Medium', 'High', 'Highest'];
    default:
      return [];
  }
};

const convertToClosestTimeValue = (ms) => {
  const minutes = ms / 60000;
  const timeValues = [1, 3, 5, 10, 15, 30, 60];
  return timeValues.reduce((prev, curr) =>
    Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev
  );
};

const getFactIcon = (fact) => {
  switch (fact) {
    case 'lastUpdated':
    case 'createdAt':
      return <AccessTimeIcon fontSize="small" />;
    case 'ticketStatus':
      return <FlagIcon fontSize="small" />;
    case 'notificationHistoriesLength':
      return <NotificationsActiveIcon fontSize="small" />;
    case 'severity':
      return <PriorityHighIcon fontSize="small" />;
    case 'tier':
      return <SecurityIcon fontSize="small" />;
    case 'priority':
      return <SpeedIcon fontSize="small" />;
    default:
      return <RuleIcon fontSize="small" />;
  }
};

export default function RuleEngine() {
  const theme = useTheme();
  const [rules, setRules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editedRule, setEditedRule] = useState({
    conditions: [],
    event: { type: '', params: { message: '' } },
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingRule, setDeletingRule] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    const anyEmpty = editedRule.conditions.some(condition => !condition.fact || !condition.operator || !condition.value) || !editedRule.event.type;
    setIsButtonDisabled(anyEmpty);
  }, [editedRule.conditions, editedRule.event.type]);

  const fetchRules = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/rules');
      const data = await response.json();
      setRules(data.data);
    } catch (error) {
      console.error("Error fetching rules data:", error);
    }
  };

  const handleEditRule = (rule) => {
    const convertedRule = {
      ...rule,
      conditions: rule.conditions.map(condition => ({
        ...condition,
        value: condition.fact === 'lastUpdated' || condition.fact === 'createdAt'
          ? convertToClosestTimeValue(parseInt(condition.value)).toString()
          : condition.value
      }))
    };
    setEditingRule(rule);
    setEditedRule(convertedRule);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRule(null);
    setEditedRule({
      conditions: [],
      event: { type: '', params: { message: '' } },
    });
  };

  const handleSaveRule = async () => {
    try {
      const convertedRule = {
        conditions: editedRule.conditions.map(condition => ({
          fact: condition.fact,
          operator: condition.operator,
          value: condition.fact === 'lastUpdated' || condition.fact === 'createdAt'
            ? (parseInt(condition.value) * 60000).toString()
            : condition.value
        })),
        event: {
          type: editedRule.event.type,
          params: {
            message: editedRule.event.params.message,
            secondMessage: editedRule.event.params.secondMessage
          }
        }
      };

      let response;
      if (editingRule && editingRule.id) {
        // Update existing rule
        response = await fetch(`http://localhost:1337/api/rules/${editingRule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: convertedRule }),
        });
      } else {
        // Create new rule
        response = await fetch('http://localhost:1337/api/rules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: convertedRule }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${editingRule ? 'update' : 'create'} rule: ${errorText}`);
      }

      fetchRules();
      handleCloseDialog();
    } catch (error) {
      console.error(`Error ${editingRule ? 'updating' : 'creating'} rule:`, error);
    }
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setEditedRule({
      conditions: [],
      event: { type: '', params: { message: '' } },
    });
    setOpenDialog(true);
  };

  const handleAddCondition = () => {
    setEditedRule(prevRule => ({
      ...prevRule,
      conditions: [...prevRule.conditions, { fact: '', operator: '', value: '' }],
    }));
  };

  const handleRemoveCondition = (index) => {
    setEditedRule(prevRule => ({
      ...prevRule,
      conditions: prevRule.conditions.filter((_, i) => i !== index),
    }));
  };

  const handleConditionChange = (index, field, value) => {
    setEditedRule(prevRule => ({
      ...prevRule,
      conditions: prevRule.conditions.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  const handleDeleteRule = (rule) => {
    setDeletingRule(rule);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/rules/${deletingRule.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete rule');
      }

      fetchRules();
      setOpenDeleteDialog(false);
      setDeletingRule(null);
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  const renderConditionChip = (condition) => (
    <ConditionChip
      icon={getFactIcon(condition.fact)}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Fact">
            <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 0.5 }}>{condition.fact}</Typography>
          </Tooltip>
          <Tooltip title="Operator">
            <Typography variant="body2" sx={{ mx: 0.5 }}>{condition.operator}</Typography>
          </Tooltip>
          <Tooltip title="Value">
            <Typography variant="body2" sx={{ ml: 0.5, fontStyle: 'italic' }}>
              {condition.fact === 'lastUpdated' || condition.fact === 'createdAt'
                ? `${parseInt(condition.value)/60000} ${parseInt(condition.value)/60000 === 60 ? 'hour' : 'minutes'}`
                : condition.value}
            </Typography>
          </Tooltip>
        </Box>
      }
    />
  );

  const timeValueOptions = ['1', '3', '5', '10', '15', '30', '60'];

  return (
    <Box sx={{ flexGrow: 1, p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)` }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: theme.palette.primary.main, textShadow: `2px 2px 4px ${alpha(theme.palette.primary.main, 0.2)}` }}>
        Enhanced Rules Engine
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddRule}
        sx={{ mb: 3 }}
      >
        Add New Rule
      </Button>
      <Grid container spacing={3}>
        {rules.map((rule, index) => (
          <Fade in={true} timeout={500 + index * 100} key={rule.id}>
            <Grid item xs={12} sm={6} md={4}>
              <StyledCard>
                <CardContent sx={{ position: 'relative' }}>
                  <RuleNumber>{index + 1}</RuleNumber>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RuleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" component="div" sx={{ color: theme.palette.primary.main }}>
                      Rule {index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>
                    Conditions:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {rule.conditions.map((condition, condIndex) => (
                      <React.Fragment key={condIndex}>
                        {renderConditionChip(condition)}
                        {condIndex < rule.conditions.length - 1 && (
                          <Chip label="AND" size="small" variant="outlined" sx={{ m: 0.5, borderColor: theme.palette.primary.main, color: theme.palette.primary.main }} />
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                  <Divider sx={{ my: 2, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>
                      Event:
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.primary }}>
                    Type: {rule.event.type}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, mb: 2, color: theme.palette.text.primary }}>
                    Message: {rule.event.params.message}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEditRule(rule)}
                      sx={{
                        flex: 1,
                        mr: 1,
                        background: `${theme.palette.primary.main}`,
                        transition: 'all 0.5s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteRule(rule)}
                      sx={{
                        flex: 1,
                        ml: 1,
                        transition: 'all 0.5s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 6px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Fade>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" 
        fullWidth PaperProps={{ style: { borderRadius: 16, background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)` } }}>
        <DialogTitle sx={{ background: `${theme.palette.primary.main}`, color: theme.palette.primary.contrastText, borderRadius: '16px 16px 0 0' }}>
          {editingRule ? 'Edit Rule' : 'Add New Rule'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>Conditions</Typography>
          {editedRule.conditions.map((condition, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FormControl sx={{ mr: 1, minWidth: 120 }}>
                <InputLabel>Fact</InputLabel>
                <Select
                  value={condition.fact}
                  onChange={(e) => handleConditionChange(index, 'fact', e.target.value)}
                  label="Fact"
                >
                  {factOptions.map((fact) => (
                    <MenuItem key={fact} value={fact}>{fact}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ mr: 1, minWidth: 120 }}>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={condition.operator}
                  onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                  label="Operator"
                >
                  {operatorOptions.map((op) => (
                    <MenuItem key={op} value={op}>{op}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ mr: 1, minWidth: 120 }}>
                <InputLabel>Value</InputLabel>
                {condition.fact === 'lastUpdated' || condition.fact === 'createdAt' ? (
                  <Select
                    value={condition.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    label="Value"
                  >
                    {timeValueOptions.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value === '60' ? '1 hour' : `${value} minutes`}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Select
                    value={condition.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    label="Value"
                  >
                    {getValueOptions(condition.fact).map((value) => (
                      <MenuItem key={value} value={value}>{value}</MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
              <IconButton onClick={() => handleRemoveCondition(index)} sx={{ color: theme.palette.error.main }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={handleAddCondition} sx={{ mb: 2, color: theme.palette.primary.main }}>
            Add Condition
          </Button>

          <Typography variant="h6" sx={{ mt: 2, color: theme.palette.primary.main }}>Event</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Event Type</InputLabel>
            <Select
              value={editedRule.event.type}
              onChange={(e) => setEditedRule(prevRule => ({
                ...prevRule,
                event: { ...prevRule.event, type: e.target.value },
              }))}
              label="Event Type"
            >
              {eventTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Event Message"
            value={editedRule.event.params.message}
            onChange={(e) => setEditedRule(prevRule => ({
              ...prevRule,
              event: {
                ...prevRule.event,
                params: { ...prevRule.event.params, message: e.target.value },
              },
            }))}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}>Cancel</Button>
          <Button
            onClick={handleSaveRule}
            disabled={editedRule.conditions.length === 0 || isButtonDisabled}
            variant="contained"
            sx={{
              background: `${theme.palette.primary.main}`,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            }}
          >
            {editingRule ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            Are you sure you want to delete this rule?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}