import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  CircularProgress,
  TextField,
} from '@mui/material';
import { format, subDays, isWeekend, startOfMonth } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useWebSocket } from '../services/websocket';

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

const MarkAttendance: React.FC<{ classId: string }> = ({ classId }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOfflineSuccess, setShowOfflineSuccess] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const { isConnected, addToSyncQueue } = useWebSocket();
  const [isOffline, setIsOffline] = useState(true);
  const [pendingSync, setPendingSync] = useState(false);

  const { data: students } = useQuery({
    queryKey: ['students', classId],
    queryFn: async () => {
      const response = await api.get(`/class/${classId}/students`);
      return response.data;
    },
  });

  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});

  useEffect(() => {
    if (students) {
      const initialRecords: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      students.forEach((student: Student) => {
        initialRecords[student._id] = 'PRESENT';
      });
      setAttendanceRecords(initialRecords);
    }
  }, [students]);

  // Update offline status when connection changes
  useEffect(() => {
    const updateOfflineStatus = () => {
      const wasOffline = isOffline;
      const isCurrentlyOffline = !isConnected;
      console.log('Connection status update - Was offline:', wasOffline, 'Is offline:', isCurrentlyOffline);
      setIsOffline(isCurrentlyOffline);

      // If we're coming back online and had pending sync
      if (wasOffline && !isCurrentlyOffline && pendingSync) {
        console.log('Connection restored, will sync pending data');
        setTimeout(() => {
          setPendingSync(false);
          setShowSyncSuccess(true);
        }, 2000);
      }
    };

    updateOfflineStatus();
  }, [isConnected, isOffline, pendingSync]);

  const markAttendanceMutation = useMutation({
    mutationFn: async (records: AttendanceRecord[]) => {
      const currentlyOffline = !isConnected;
      console.log('Marking attendance - Offline status:', currentlyOffline);
      
      if (currentlyOffline) {
        console.log('Saving attendance offline');
        // Add to sync queue if offline
        addToSyncQueue('attendance', {
          classId,
          date: selectedDate,
          records,
        });
        setPendingSync(true);
        return { success: true, offline: true };
      }

      console.log('Saving attendance online');
      const response = await api.post('/attendance/bulk', {
        classId,
        date: selectedDate,
        records,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.offline) {
        setShowOfflineSuccess(true);
      } else {
        setShowSuccess(true);
      }
    },
  });

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = () => {
    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    markAttendanceMutation.mutate(records);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseOfflineSuccess = () => {
    setShowOfflineSuccess(false);
  };

  const handleCloseSyncSuccess = () => {
    setShowSyncSuccess(false);
  };

  // Generate dates for the dropdown (last 30 days, excluding weekends)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    const monthStart = startOfMonth(today);
    
    for (let i = 0; i <= 30; i++) {
      const date = subDays(today, i);
      // Only include dates from the start of the month and exclude weekends
      if (date >= monthStart && !isWeekend(date)) {
        dates.push(date);
      }
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mark Attendance
        </Typography>
        {isOffline && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are currently offline. Attendance will be synced when you're back online.
          </Alert>
        )}
        {pendingSync && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Syncing offline attendance data...
            </Box>
          </Alert>
        )}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Date</InputLabel>
            <Select
              value={selectedDate}
              label="Date"
              onChange={(e) => setSelectedDate(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {dateOptions.map((date) => (
                <MenuItem 
                  key={format(date, 'yyyy-MM-dd')} 
                  value={format(date, 'yyyy-MM-dd')}
                >
                  {format(date, 'EEEE, MMMM d, yyyy')}
                  {format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && ' (Today)'}
                  {format(date, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd') && ' (Yesterday)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary">
            * Weekends are excluded
          </Typography>
        </Stack>
      </Box>

      {markAttendanceMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to mark attendance. Please try again.
        </Alert>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Attendance marked successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showOfflineSuccess}
        autoHideDuration={3000}
        onClose={handleCloseOfflineSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseOfflineSuccess} severity="success" sx={{ width: '100%' }}>
          Attendance saved offline. It will be synced when you're back online.
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSyncSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSyncSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSyncSuccess} severity="success" sx={{ width: '100%' }}>
          Offline attendance data has been synced successfully!
        </Alert>
      </Snackbar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Roll No.</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell width="300px">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students?.sort((a: Student, b: Student) => {
              // Sort by roll number if available, otherwise by name
              if (a.rollNumber && b.rollNumber) {
                return a.rollNumber.localeCompare(b.rollNumber);
              }
              return a.name.localeCompare(b.name);
            }).map((student: Student) => (
              <TableRow key={student._id}>
                <TableCell>{student.rollNumber || '-'}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <FormControl>
                    <RadioGroup
                      row
                      value={attendanceRecords[student._id] || 'PRESENT'}
                      onChange={(e) => handleStatusChange(student._id, e.target.value as 'PRESENT' | 'ABSENT' | 'LATE')}
                    >
                      <Stack direction="row" spacing={1}>
                        <FormControlLabel
                          value="PRESENT"
                          control={
                            <Radio 
                              sx={{
                                color: 'success.main',
                                '&.Mui-checked': {
                                  color: 'success.main',
                                },
                              }}
                            />
                          }
                          label="Present"
                        />
                        <FormControlLabel
                          value="ABSENT"
                          control={
                            <Radio 
                              sx={{
                                color: 'error.main',
                                '&.Mui-checked': {
                                  color: 'error.main',
                                },
                              }}
                            />
                          }
                          label="Absent"
                        />
                        <FormControlLabel
                          value="LATE"
                          control={
                            <Radio 
                              sx={{
                                color: 'warning.main',
                                '&.Mui-checked': {
                                  color: 'warning.main',
                                },
                              }}
                            />
                          }
                          label="Late"
                        />
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={markAttendanceMutation.isPending || !students?.length}
        >
          {markAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
        </Button>
      </Box>
    </Box>
  );
};

export default MarkAttendance; 