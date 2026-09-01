import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Admin Auth
export const adminLogin = (email: string, password: string) => api.post('/admin/login', { email, password });
export const getAdminProfile = () => api.get('/admin/me');
export const adminLogout = () => api.post('/admin/logout');

// Student Auth
export const requestOtp = (studentId: string, email: string) => api.post('/auth/request-otp', { studentId, email });
export const verifyOtp = (studentId: string, email: string, otp: string) => api.post('/auth/verify-otp', { studentId, email, otp });
export const getStudentProfile = () => api.get('/auth/me');
export const studentLogout = () => api.post('/auth/logout');

// Elections
export const getElections = (params?: any) => api.get('/elections', { params });
export const getElection = (id: string) => api.get(`/elections/${id}`);
export const createElection = (data: any) => api.post('/elections', data);
export const updateElection = (id: string, data: any) => api.put(`/elections/${id}`, data);
export const activateElection = (id: string) => api.post(`/elections/${id}/activate`);
export const closeElection = (id: string) => api.post(`/elections/${id}/close`);
export const setResultsMode = (id: string, mode: string) => api.put(`/elections/${id}/results-mode`, { mode });

// Voters
export const uploadVoters = (formData: FormData) => api.post('/voters/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getVoters = (params?: any) => api.get('/voters', { params });
export const getVoterStats = () => api.get('/voters/stats');
export const getFaculties = () => api.get('/voters/faculties');

// Candidates
export const getCandidates = (electionId: string) => api.get(`/candidates/election/${electionId}`);
export const createCandidate = (formData: FormData) => api.post('/candidates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCandidate = (id: string, formData: FormData) => api.put(`/candidates/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCandidate = (id: string) => api.delete(`/candidates/${id}`);

// Voting
export const castVote = (data: { electionId: string; selections: any[] }) => api.post('/votes', data);
export const checkVoteStatus = (electionId: string) => api.get(`/votes/check/${electionId}`);

// Results
export const getResults = (electionId: string) => api.get(`/results/${electionId}`);

// Analytics
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getElectionAnalytics = (id: string) => api.get(`/analytics/election/${id}`);
export const getAuditLogs = (params?: any) => api.get('/analytics/audit-logs', { params });

export default api;
