import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ProfileSection from '../components/ProfileSection';
import AnimatedBackground from '../components/AnimatedBackground';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <AnimatedBackground />
      <Box sx={{ 
        position: 'relative', 
        minHeight: '100vh',
        zIndex: 1,
        backgroundColor: 'transparent'
      }}>
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          <ProfileSection user={user} />
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" gutterBottom>
              Teacher Dashboard
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                    }
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                    Welcome to Your Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Here you can manage your classes, take attendance, and view student records.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default TeacherDashboard; 