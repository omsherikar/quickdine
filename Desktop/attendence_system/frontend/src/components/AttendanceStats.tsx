import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';

interface AttendanceStatsProps {
  studentId?: string;
  classId?: string;
}

interface Stats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  attendancePercentage: number;
  name: string;
}

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div">
        {typeof value === 'number' && title.includes('Percentage')
          ? `${value.toFixed(1)}%`
          : value}
      </Typography>
    </CardContent>
  </Card>
);

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ studentId, classId }) => {
  const statsRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['attendanceStats', studentId, classId],
    queryFn: async () => {
      if (studentId) {
        const response = await api.get(`/attendance/student/${studentId}/stats`);
        return response.data;
      } else if (classId) {
        const response = await api.get(`/attendance/class/${classId}/stats`);
        return response.data;
      }
      return null;
    },
  });

  const handleDownloadPDF = async () => {
    if (!statsRef.current) return;

    const canvas = await html2canvas(statsRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`attendance-stats-${studentId || classId || 'all'}.pdf`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading attendance statistics
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info">
        No attendance data available
      </Alert>
    );
  }

  const stats: Stats[] = Array.isArray(data) ? data : [data];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {studentId ? 'My Attendance Statistics' : 'Class Attendance Statistics'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          disabled={!data}
        >
          Download PDF
        </Button>
      </Box>
      
      <Box ref={statsRef}>
        {stats.map((stat, index) => (
          <Box key={index} mb={3}>
            <Typography variant="h6" gutterBottom>
              {stat.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard title="Total Days" value={stat.totalDays} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard title="Present" value={stat.present} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard title="Absent" value={stat.absent} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard title="Late" value={stat.late} />
              </Grid>
              <Grid item xs={12} sm={4} md={4}>
                <StatCard title="Attendance Percentage" value={stat.attendancePercentage} />
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AttendanceStats; 