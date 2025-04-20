import React from 'react';
import { motion } from 'framer-motion';
import { Box, useTheme } from '@mui/material';

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
        background: 'linear-gradient(to bottom right, #0a192f 0%, #0a1222 100%)',
      }}
    >
      {/* Animated gradient circles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
            borderRadius: '50%',
            width: '60vw',
            height: '60vw',
            top: i === 0 ? '10%' : i === 1 ? '40%' : '70%',
            left: i === 0 ? '20%' : i === 1 ? '60%' : '30%',
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

      {/* Grid overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(${theme.palette.background.default}22 1px, transparent 1px),
                           linear-gradient(90deg, ${theme.palette.background.default}22 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          opacity: 0.4,
        }}
      />

      {/* Vignette effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(10, 25, 47, 0.4) 100%)',
        }}
      />
    </Box>
  );
};

export default AnimatedBackground; 