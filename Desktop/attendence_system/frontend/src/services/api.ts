import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const classApi = {
  getClasses: async () => {
    const response = await api.get('/class');
    return response.data;
  },
  createClass: async (name: string) => {
    const response = await api.post('/class', { name });
    return response.data;
  },
  getClassStudents: async (classId: string) => {
    const response = await api.get(`/class/${classId}/students`);
    return response.data;
  },
  deleteClass: async (classId: string) => {
    const response = await api.delete(`/class/${classId}`);
    return response.data;
  },
  addStudent: async (classId: string, studentId: string) => {
    const response = await api.post(`/class/${classId}/students`, { studentId });
    return response.data;
  },
  removeStudent: async (classId: string, studentId: string) => {
    const response = await api.delete(`/class/${classId}/students/${studentId}`);
    return response.data;
  },
  getStudents: async () => {
    const response = await api.get('/auth/users?role=student');
    return response.data;
  },
};

export const attendance = {
  markAttendance: async (data: {
    studentId: string;
    classId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    date?: string;
  }) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },
  markBulkAttendance: async (data: {
    classId: string;
    date: string;
    records: Array<{
      studentId: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE';
    }>;
  }) => {
    const response = await api.post('/attendance/bulk', data);
    return response.data;
  },
  getClassAttendance: async (classId: string, date: string) => {
    const response = await api.get(`/attendance/class/${classId}?date=${date}`);
    return response.data;
  },
  getStudentAttendance: async (studentId: string) => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
  },
  getClassHistory: async (classId: string, month: string) => {
    const response = await api.get(`/attendance/class/${classId}/history?month=${month}`);
    return response.data;
  },
  getStudentHistory: async (studentId: string, month: string) => {
    const response = await api.get(`/attendance/student/${studentId}/history?month=${month}`);
    return response.data;
  },
};

export default api; 