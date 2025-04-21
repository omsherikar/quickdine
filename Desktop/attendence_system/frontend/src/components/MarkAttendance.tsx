import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import { format, subDays, isWeekend } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';

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
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch students in the class
  const { data: students } = useQuery({
    queryKey: ['students', classId],
    queryFn: async () => {
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    },
  });

  // Initialize attendance records with all students present
  useEffect(() => {
    if (students) {
      const initialRecords: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      students.forEach((student: Student) => {
        initialRecords[student._id] = 'PRESENT';
      });
      setAttendanceRecords(initialRecords);
    }
  }, [students]);

  const markAttendanceMutation = useMutation({
    mutationFn: async (records: AttendanceRecord[]) => {
      return await api.post('/attendance/bulk', {
        classId,
        date: selectedDate,
        records,
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
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

  const generateDateOptions = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      if (!isWeekend(date)) {
        dates.push(date);
      }
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack spacing={1}>
          <FormControl fullWidth>
            <Select
              value={selectedDate}
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