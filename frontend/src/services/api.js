import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  verifyToken: () => api.get('/api/auth/verify'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/api/auth/reset-password/${token}`, { password }),
  logout: () => api.post('/api/auth/logout'),
  changePassword: (data) => api.post('/api/auth/change-password', data)
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => api.get('/api/jobs', { params }),
  getFeaturedJobs: (params) => api.get('/api/jobs/featured', { params }),
  getJob: (id) => api.get(`/api/jobs/${id}`),
  applyToJob: (id, data) => api.post(`/api/jobs/${id}/apply`, data),
  saveJob: (id) => api.post(`/api/jobs/${id}/save`),
  unsaveJob: (id) => api.delete(`/api/jobs/${id}/save`),
  getSavedJobs: () => api.get('/api/jobs/saved'),
  getRecommendedJobs: () => api.get('/api/jobs/recommended'),
  postJob: (data) => api.post('/api/jobs', data),
  updateJob: (id, data) => api.put(`/api/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/api/jobs/${id}`),
  getJobApplications: (id) => api.get(`/api/jobs/${id}/applications`),
  getJobAnalytics: (id) => api.get(`/api/jobs/${id}/analytics`),
  generateInterviewQuestions: (id) => api.get(`/api/jobs/${id}/interview-questions`)
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  uploadResume: (formData) => api.post('/api/users/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadAvatar: (formData) => api.post('/api/users/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getApplications: () => api.get('/api/users/applications'),
  getSkillGapAnalysis: () => api.get('/api/users/skill-gap-analysis'),
  getSavedSearches: () => api.get('/api/users/saved-searches'),
  saveSearch: (data) => api.post('/api/users/save-search', data),
  deleteSavedSearch: (id) => api.delete(`/api/users/saved-searches/${id}`),
  updateSkills: (skills) => api.put('/api/users/skills', { skills }),
  updatePreferences: (preferences) => api.put('/api/users/preferences', preferences),
  getNotifications: () => api.get('/api/users/notifications'),
  markNotificationAsRead: (id) => api.put(`/api/users/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/api/users/notifications/${id}`)
};

// Employers API
export const employersAPI = {
  getDashboard: () => api.get('/api/employers/dashboard'),
  getPostedJobs: () => api.get('/api/employers/jobs'),
  getCandidates: (jobId) => api.get(`/api/employers/jobs/${jobId}/candidates`),
  shortlistCandidate: (jobId, userId) => api.post(`/api/employers/jobs/${jobId}/shortlist/${userId}`),
  rejectCandidate: (jobId, userId) => api.post(`/api/employers/jobs/${jobId}/reject/${userId}`),
  scheduleInterview: (data) => api.post('/api/employers/schedule-interview', data),
  getInterviews: () => api.get('/api/employers/interviews'),
  updateInterview: (id, data) => api.put(`/api/employers/interviews/${id}`, data),
  cancelInterview: (id) => api.delete(`/api/employers/interviews/${id}`),
  getCompanyProfile: () => api.get('/api/employers/company'),
  updateCompanyProfile: (data) => api.put('/api/employers/company', data),
  getAnalytics: () => api.get('/api/employers/analytics'),
  downloadResume: (userId) => api.get(`/api/employers/resume/${userId}`, { responseType: 'blob' })
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  suspendUser: (id) => api.post(`/api/admin/users/${id}/suspend`),
  verifyEmployer: (id) => api.post(`/api/admin/employers/${id}/verify`),
  getJobs: (params) => api.get('/api/admin/jobs', { params }),
  approveJob: (id) => api.post(`/api/admin/jobs/${id}/approve`),
  rejectJob: (id) => api.post(`/api/admin/jobs/${id}/reject`),
  getAnalytics: () => api.get('/api/admin/analytics'),
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (data) => api.put('/api/admin/settings', data),
  getReports: () => api.get('/api/admin/reports'),
  exportData: (type) => api.get(`/api/admin/export/${type}`, { responseType: 'blob' })
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/api/chat/conversations'),
  getMessages: (conversationId) => api.get(`/api/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, message) => api.post(`/api/chat/conversations/${conversationId}/messages`, { message }),
  createConversation: (userId) => api.post('/api/chat/conversations', { userId }),
  markAsRead: (conversationId) => api.put(`/api/chat/conversations/${conversationId}/read`),
  deleteMessage: (messageId) => api.delete(`/api/chat/messages/${messageId}`),
  getOnlineUsers: () => api.get('/api/chat/online-users'),
  typingIndicator: (conversationId) => api.post(`/api/chat/conversations/${conversationId}/typing`)
};

// AI API
export const aiAPI = {
  analyzeResume: (file) => api.post('/api/ai/analyze-resume', file, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSkillRecommendations: (skills) => api.post('/api/ai/skill-recommendations', { skills }),
  analyzeJobMatch: (userId, jobId) => api.get(`/api/ai/job-match/${userId}/${jobId}`),
  generateCoverLetter: (jobId, userData) => api.post('/api/ai/generate-cover-letter', { jobId, userData }),
  getCareerPath: (userId) => api.get(`/api/ai/career-path/${userId}`),
  getSalaryInsights: (role, location, experience) => api.get('/api/ai/salary-insights', {
    params: { role, location, experience }
  })
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
  subscribeToPush: (subscription) => api.post('/api/notifications/subscribe', subscription),
  unsubscribeFromPush: () => api.delete('/api/notifications/unsubscribe')
};

// Search API
export const searchAPI = {
  searchJobs: (query) => api.get('/api/search/jobs', { params: query }),
  searchUsers: (query) => api.get('/api/search/users', { params: query }),
  searchCompanies: (query) => api.get('/api/search/companies', { params: query }),
  getSearchSuggestions: (query) => api.get('/api/search/suggestions', { params: query }),
  saveSearch: (searchData) => api.post('/api/search/save', searchData),
  getSavedSearches: () => api.get('/api/search/saved'),
  deleteSavedSearch: (id) => api.delete(`/api/search/saved/${id}`)
};

// Utility functions
export const apiUtils = {
  // Handle file upload progress
  uploadWithProgress: (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    });
  },
  
  // Cancel request
  cancelRequest: (cancelToken) => {
    return api.get('/api/data', { cancelToken });
  },
  
  // Retry failed request
  retryRequest: (config, retries = 3) => {
    return api(config).catch(error => {
      if (retries > 0 && error.response?.status >= 500) {
        return apiUtils.retryRequest(config, retries - 1);
      }
      throw error;
    });
  }
};

export default api;