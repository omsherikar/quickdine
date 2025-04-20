import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MarkAttendance from '../components/MarkAttendance';
import ClassManagement from '../components/ClassManagement';
import AttendanceHistory from '../components/AttendanceHistory';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import AttendanceStats from '../components/AttendanceStats';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <motion.div
      role="tabpanel"
      hidden={value !== index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </motion.div>
  );
};

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const AnimatedBackground: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
            width: '60vw',
            height: '60vw',
          }}
          animate={{
            x: ['0vw', '10vw', '0vw'],
            y: ['0vh', '10vh', '0vh'],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 5,
          }}
          initial={false}
        />
      ))}
    </Box>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await api.get('/class');
      return response.data;
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(
          theme.palette.background.default,
          0.95
        )} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AnimatedBackground />
      
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(
              theme.palette.background.paper,
              0.6
            )})`,
            zIndex: -1,
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Attendance System
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {user?.role === 'teacher' && (
            <motion.div variants={itemVariants}>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12}>
                  <Paper 
                    sx={{ 
                      p: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(
                        theme.palette.background.paper,
                        0.95
                      )} 100%)`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel>Select Class</InputLabel>
                        <Select
                          value={selectedClassId}
                          label="Select Class"
                          onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                          {classes?.map((classItem: any) => (
                            <MenuItem key={classItem._id} value={classItem._id}>
                              {classItem.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Tabs
                      value={tabValue}
                      onChange={(_, newValue) => setTabValue(newValue)}
                      sx={{
                        '& .MuiTabs-indicator': {
                          height: 3,
                          borderRadius: '3px 3px 0 0',
                        },
                      }}
                    >
                      <Tab label="Classes" />
                      <Tab label="Mark Attendance" />
                      <Tab label="View History" />
                      <Tab label="Statistics" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                      <ClassManagement />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                      {selectedClassId ? (
                        <MarkAttendance classId={selectedClassId} />
                      ) : (
                        <Typography>Please select a class first</Typography>
                      )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                      {selectedClassId ? (
                        <AttendanceHistory classId={selectedClassId} />
                      ) : (
                        <Typography>Please select a class first</Typography>
                      )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={3}>
                      {selectedClassId ? (
                        <AttendanceStats classId={selectedClassId} />
                      ) : (
                        <Typography>Please select a class first</Typography>
                      )}
                    </TabPanel>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {user?.role === 'student' && (
            <motion.div variants={itemVariants}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper 
                    sx={{ 
                      p: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(
                        theme.palette.background.paper,
                        0.95
                      )} 100%)`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel>Select Class</InputLabel>
                        <Select
                          value={selectedClassId || ''}
                          label="Select Class"
                          onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                          <MenuItem value="">
                            <em>All Classes</em>
                          </MenuItem>
                          {classes?.map((classItem: any) => (
                            <MenuItem key={classItem._id} value={classItem._id}>
                              {classItem.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <AttendanceStats studentId={user.id} classId={selectedClassId || undefined} />
                      </Grid>
                      <Grid item xs={12}>
                        <AttendanceHistory studentId={user.id} classId={selectedClassId || undefined} />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard; 