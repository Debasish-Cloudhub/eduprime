import axios from 'axios';
import Cookies from 'js-cookie';

// Always use the Next.js proxy (/api/*) in the browser to avoid CORS.
// On the server side (SSR), use the direct backend URL.
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return '/api'; // browser → Next.js rewrite proxy
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  updateMe: (dto: any) => api.patch('/auth/me', dto),
  changePassword: (oldPassword: string, newPassword: string) => api.post('/auth/change-password', { oldPassword, newPassword }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (dto: any) => api.post('/auth/register', dto),
  me: () => api.get('/auth/me'),
};

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leadsApi = {
  getAll: (params?: any) => api.get('/leads', { params }),
  getOne: (id: string) => api.get(`/leads/${id}`),
  getBoard: () => api.get('/leads/board'),
  create: (dto: any) => api.post('/leads', dto),
  update: (id: string, dto: any) => api.put(`/leads/${id}`, dto),
  transition: (id: string, dto: any) => api.patch(`/leads/${id}/transition`, dto),
  assign: (id: string, agentId: string) => api.patch(`/leads/${id}/assign`, { agentId }),
  addNote: (id: string, note: string) => api.post(`/leads/${id}/notes`, { note }),
  getActivities: (id: string) => api.get(`/leads/${id}/activities`),
  incentivePreview: (id: string) => api.get(`/leads/${id}/incentive-preview`),
  delete: (id: string) => api.delete(`/leads/${id}`),
};

// ─── Courses ─────────────────────────────────────────────────────────────────
export const coursesApi = {
  getColleges: (params?: any) => api.get('/courses/colleges', { params }),
  getCollege: (id: string) => api.get(`/courses/colleges/${id}`),
  createCollege: (dto: any) => api.post('/courses/colleges', dto),
  updateCollege: (id: string, dto: any) => api.put(`/courses/colleges/${id}`, dto),
  deleteCollege: (id: string) => api.delete(`/courses/colleges/${id}`),
  getCourses: (params?: any) => api.get('/courses', { params }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  getStreams: () => api.get('/courses/streams'),
  createCourse: (dto: any) => api.post('/courses', dto),
  updateCourse: (id: string, dto: any) => api.put(`/courses/${id}`, dto),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
};

// ─── Incentives ───────────────────────────────────────────────────────────────
export const incentivesApi = {
  preview: (courseId: string) => api.get(`/incentives/preview/${courseId}`),
  myIncentives: (params?: any) => api.get('/incentives/my', { params }),
  getAll: (params?: any) => api.get('/incentives', { params }),
  markPaid:     (id: string, details?: any) => api.patch(`/incentives/${id}/mark-paid`, details || {}),
  approve:      (id: string)                  => api.patch(`/incentives/${id}/approve`),
  reject:       (id: string, reason: string)   => api.patch(`/incentives/${id}/reject`, { reason }),
  delete:       (id: string)                  => api.delete(`/incentives/${id}`),
  createManual: (dto: any)                     => api.post('/incentives', dto),
};

// ─── Expenses ────────────────────────────────────────────────────────────────
export const expensesApi = {
  getAll: (params?: any) => api.get('/expenses', { params }),
  getOne: (id: string) => api.get(`/expenses/${id}`),
  create: (dto: any) => api.post('/expenses', dto),
  delete:  (id: string) => api.delete(`/expenses/${id}`),
  approve: (id: string) => api.patch(`/expenses/${id}/approve`),
  reject: (id: string, reason: string) => api.patch(`/expenses/${id}/reject`, { reason }),
  getMonthlySummary: (year: number) => api.get('/expenses/monthly-summary', { params: { year } }),
  getMySummary: (month: number, year: number) => api.get('/expenses/my-summary', { params: { month, year } }),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: (params?: any) => api.get('/analytics/dashboard', { params }),
  funnel: (params?: any) => api.get('/analytics/funnel', { params }),
  conversionBySource: () => api.get('/analytics/conversion-by-source'),
  revenueVsExpense: (year: number) => api.get('/analytics/revenue-vs-expense', { params: { year } }),
  leaderboard: (params?: any) => api.get('/analytics/leaderboard', { params }),
  leadTrend: (params?: any) => api.get('/analytics/lead-trend', { params }),
};

// ─── Excel ────────────────────────────────────────────────────────────────────
export const excelApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/excel/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  downloadTemplate: () => api.get('/excel/template', { responseType: 'blob' }),
  getHistory:   (params?: any) => api.get('/excel/history', { params }),
  clearHistory: ()              => api.delete('/excel/history'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params?: any) => api.get('/users', { params }),
  getAgents: () => api.get('/users/agents'),
  create: (dto: any) => api.post('/users', dto),
  update: (id: string, dto: any) => api.put(`/users/${id}`, dto),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ─── Sulekha ─────────────────────────────────────────────────────────────────
export const sulekhaApi = {
  sync: () => api.post('/sulekha/sync'),
  getLogs: (params?: any) => api.get('/sulekha/logs', { params }),
};

// ─── SLA ─────────────────────────────────────────────────────────────────────
export const slaApi = {
  getSummary: () => api.get('/sla/summary'),
  getBreached: () => api.get('/sla/breached'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
};
