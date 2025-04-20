import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';

interface AttendanceHistoryProps {
  classId?: string;
  studentId?: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  studentName?: string;
  studentRollNumber?: string;
  updatedBy: string;
  className?: string;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ classId, studentId }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const tableRef = useRef<HTMLDivElement>(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ['attendance-history', classId, studentId, selectedMonth],
    queryFn: async () => {
      const startDate = format(startOfMonth(new Date(selectedMonth)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(selectedMonth)), 'yyyy-MM-dd');
      
      if (classId && studentId) {
        // Get class-specific attendance for student
        const response = await api.get(
          `/attendance/student/${studentId}?startDate=${startDate}&endDate=${endDate}&classId=${classId}`
        );
        return response.data;
      } else if (classId) {
        // Get all students' attendance for class
        const response = await api.get(
          `/attendance/class/${classId}/history?startDate=${startDate}&endDate=${endDate}`
        );
        return response.data;
      } else if (studentId) {
        // Get all attendance for student
        const response = await api.get(
          `/attendance/student/${studentId}?startDate=${startDate}&endDate=${endDate}`
        );
        return response.data;
      }
      return [];
    },
    enabled: Boolean(classId || studentId),
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, 'yyyy-MM');
  });

  const handleDownloadPDF = async () => {
    if (!tableRef.current) return;

    const canvas = await html2canvas(tableRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`attendance-history-${selectedMonth}.pdf`);
  };

  if (isLoading) {
    return <Typography>Loading attendance history...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {studentId ? 'My Attendance History' : 'Class Attendance History'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {format(new Date(month + '-01'), 'MMMM yyyy')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={!history?.length}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} ref={tableRef}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              {!studentId && (
                <>
                  <TableCell>Roll No.</TableCell>
                  <TableCell>Student</TableCell>
                </>
              )}
              {studentId && <TableCell>Class</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell>Marked By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={studentId ? 4 : 5} align="center">
                  No attendance records found for this month
                </TableCell>
              </TableRow>
            ) : (
              history?.map((record: AttendanceRecord) => (
                <TableRow key={record._id}>
                  <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                  {!studentId && (
                    <>
                      <TableCell>{record.studentRollNumber || '-'}</TableCell>
                      <TableCell>{record.studentName}</TableCell>
                    </>
                  )}
                  {studentId && <TableCell>{record.className || 'N/A'}</TableCell>}
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: record.status === 'PRESENT' 
                          ? 'success.light'
                          : record.status === 'ABSENT'
                          ? 'error.light'
                          : 'warning.light',
                        color: 'white',
                      }}
                    >
                      {record.status}
                    </Box>
                  </TableCell>
                  <TableCell>{record.updatedBy}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceHistory; 