import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Paper,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { classApi } from '../services/api';

interface Class {
  _id: string;
  name: string;
  teacherId: string;
  isActive: boolean;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
}

const ClassManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classApi.getClasses,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: classApi.getStudents,
  });

  const { data: classStudents, isLoading: classStudentsLoading } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      return classApi.getClassStudents(selectedClass);
    },
    enabled: !!selectedClass,
  });

  const createClassMutation = useMutation({
    mutationFn: classApi.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setOpen(false);
      setClassName('');
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      classApi.addStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', selectedClass] });
      setAddStudentOpen(false);
      setSelectedStudent('');
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      classApi.removeStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', selectedClass] });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: classApi.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setDeleteDialogOpen(false);
      setClassToDelete(null);
      if (selectedClass === classToDelete) {
        setSelectedClass(null);
      }
    },
  });

  const handleCreateClass = () => {
    if (className.trim()) {
      createClassMutation.mutate(className);
    }
  };

  const handleAddStudent = () => {
    if (selectedClass && selectedStudent) {
      addStudentMutation.mutate({ classId: selectedClass, studentId: selectedStudent });
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    if (selectedClass) {
      removeStudentMutation.mutate({ classId: selectedClass, studentId });
    }
  };

  const handleDeleteClass = (classId: string) => {
    setClassToDelete(classId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (classToDelete) {
      deleteClassMutation.mutate(classToDelete);
    }
  };

  if (classesLoading || studentsLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Your Classes</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Create New Class
        </Button>
      </Box>

      {classes?.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary" align="center">
            No classes found. Create a new class to get started.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {classes?.map((classItem: Class) => (
              <React.Fragment key={classItem._id}>
                <ListItem
                  button
                  selected={selectedClass === classItem._id}
                  onClick={() => setSelectedClass(classItem._id)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(classItem._id);
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={classItem.name}
                    secondary={`Class ID: ${classItem._id}`}
                  />
                </ListItem>
                {selectedClass === classItem._id && (
                  <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1">Students</Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => setAddStudentOpen(true)}
                      >
                        Add Student
                      </Button>
                    </Box>
                    {classStudentsLoading ? (
                      <Typography>Loading students...</Typography>
                    ) : classStudents?.length === 0 ? (
                      <Typography color="text.secondary">
                        No students in this class
                      </Typography>
                    ) : (
                      <List>
                        {classStudents?.map((student: Student) => (
                          <ListItem
                            key={student._id}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveStudent(student._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={student.name}
                              secondary={`${student.email}${student.rollNumber ? ` | Roll No: ${student.rollNumber}` : ''}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateClass} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addStudentOpen} onClose={() => setAddStudentOpen(false)}>
        <DialogTitle>Add Student to Class</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudent}
              label="Select Student"
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students?.map((student: Student) => (
                <MenuItem key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentOpen(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this class? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteClassMutation.isPending}
          >
            {deleteClassMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagement; 