import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  useTheme,
  alpha,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

interface ProfileSectionProps {
  user: {
    name: string;
    email: string;
    role: string;
    rollNumber?: string;
    photoUrl?: string;
  };
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user }) => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.photoUrl || null);
  const [showSuccess, setShowSuccess] = useState(false);

  const updatePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await api.post('/auth/update-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setPreviewUrl(data.photoUrl);
      setShowSuccess(true);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      updatePhotoMutation.mutate(file);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(
          theme.palette.background.paper,
          0.95
        )} 100%)`,
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
        <Box position="relative">
          <Avatar
            src={previewUrl || undefined}
            alt={user.name}
            sx={{
              width: 120,
              height: 120,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              background: alpha(theme.palette.background.paper, 0.8),
            }}
          />
          <input
            accept="image/*"
            type="file"
            id="photo-upload"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <label htmlFor="photo-upload">
            <Tooltip title="Change photo">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: alpha(theme.palette.primary.main, 0.9),
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    transform: 'scale(1.1)',
                  },
                  transition: 'transform 0.2s',
                  backdropFilter: 'blur(4px)',
                }}
                size="small"
              >
                <PhotoCamera />
              </IconButton>
            </Tooltip>
          </label>
        </Box>

        <Stack spacing={1} flex={1}>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
            {user.name}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: alpha(theme.palette.text.primary, 0.7),
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {user.email}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.primary.main,
              textTransform: 'capitalize',
              fontWeight: 500,
              background: alpha(theme.palette.primary.main, 0.1),
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              display: 'inline-block',
              alignSelf: 'flex-start',
            }}
          >
            {user.role.toLowerCase()}
          </Typography>
          {user.rollNumber && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: alpha(theme.palette.text.primary, 0.7),
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Roll Number: {user.rollNumber}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success"
          sx={{
            backdropFilter: 'blur(10px)',
            background: alpha(theme.palette.success.main, 0.9),
            color: theme.palette.success.contrastText,
          }}
        >
          Profile photo updated successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProfileSection; 