import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

const FloatingElement = ({ delay, x, y, duration, size, color }: any) => (
  <motion.div
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at center, ${color}, transparent)`,
      filter: 'blur(15px)',
      left: x,
      top: y,
    }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      repeatType: "reverse",
      delay: delay,
      ease: "easeInOut",
    }}
  />
);

const Landing: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'Easy Class Management',
      description: 'Create and manage multiple classes with ease. Add students and track their attendance efficiently.',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: 'Real-time Attendance',
      description: 'Mark attendance in real-time with our intuitive interface. Works offline too!',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Detailed Analytics',
      description: 'Get comprehensive attendance reports and statistics for better decision making.',
    },
    {
      icon: <CloudSyncIcon sx={{ fontSize: 40 }} />,
      title: 'Offline Support',
      description: 'Continue marking attendance even without internet. Data syncs automatically when online.',
    },
  ];

  // Background elements configuration
  const backgroundElements = [
    { x: '10%', y: '20%', size: 200, color: alpha(theme.palette.primary.main, 0.15), duration: 8, delay: 0 },
    { x: '80%', y: '15%', size: 150, color: alpha(theme.palette.secondary.main, 0.1), duration: 10, delay: 1 },
    { x: '60%', y: '80%', size: 180, color: alpha(theme.palette.primary.light, 0.12), duration: 9, delay: 2 },
    { x: '5%', y: '70%', size: 160, color: alpha(theme.palette.secondary.light, 0.08), duration: 11, delay: 3 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
          theme.palette.primary.main,
          0.1
        )} 100%)`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Animated Background Elements */}
      {backgroundElements.map((element, index) => (
        <FloatingElement key={index} {...element} />
      ))}

      <Container 
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: { xs: 4, md: 8 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* Hero Section */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              mb: { xs: 6, md: 8 },
            }}
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3,
                  filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))',
                  maxWidth: '800px',
                }}
              >
                Smart Attendance System
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography
                variant="h5"
                color="text.secondary"
                paragraph
                sx={{
                  mb: 4,
                  maxWidth: '600px',
                  mx: 'auto',
                  px: { xs: 2, sm: 0 },
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                  lineHeight: 1.6,
                }}
              >
                Streamline your attendance management with our modern, efficient, and user-friendly system
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 3 }}
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 4 }}
              >
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      px: { xs: 6, sm: 4 },
                      py: 1.5,
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: { xs: '200px', sm: 'auto' },
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      px: { xs: 6, sm: 4 },
                      py: 1.5,
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: { xs: '200px', sm: 'auto' },
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>
          </Box>

          {/* Features Section */}
          <Box>
            <Divider sx={{ mb: { xs: 6, md: 8 } }} />
            <Grid 
              container 
              spacing={{ xs: 3, md: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.03,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                    style={{ height: '100%' }}
                  >
                    <Paper
                      sx={{
                        p: { xs: 3, md: 4 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(
                          theme.palette.background.paper,
                          0.95
                        )} 100%)`,
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        transition: 'all 0.3s ease-in-out',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'none',
                          boxShadow: `0 12px 40px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          '&::before': {
                            transform: 'translateX(100%)',
                          },
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
                          transition: 'transform 0.5s ease-in-out',
                        },
                      }}
                      elevation={0}
                    >
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -5, 5, -5, 0],
                          transition: { duration: 0.5, ease: "easeInOut" }
                        }}
                      >
                        <Box
                          sx={{
                            mb: 3,
                            color: theme.palette.primary.main,
                            transform: 'scale(1.2)',
                          }}
                        >
                          {feature.icon}
                        </Box>
                      </motion.div>
                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{ 
                          fontWeight: 700,
                          mb: 2,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ 
                          lineHeight: 1.7,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Landing; 