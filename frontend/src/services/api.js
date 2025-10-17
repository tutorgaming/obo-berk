import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Users
export const getUsers = () => api.get('/users');
export const createUser = (userData) => api.post('/users', userData);
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Projects
export const getProjects = () => api.get('/projects');
export const getProjectsByUser = (userId) => api.get(`/projects/user/${userId}`);
export const createProject = (projectData) => api.post('/projects', projectData);
export const getProject = (id) => api.get(`/projects/${id}`);
export const updateProject = (id, projectData) => api.put(`/projects/${id}`, projectData);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Expenses
export const getExpensesByProject = (projectId, type) => {
  const params = type ? { type } : {};
  return api.get(`/expenses/project/${projectId}`, { params });
};
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const createExpense = (formData) => {
  return api.post('/expenses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const updateExpense = (id, formData) => {
  return api.put(`/expenses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Export
export const exportProjectPDF = (projectId, type) => {
  const params = type ? { type } : {};
  return api.get(`/export/project/${projectId}/pdf`, {
    params,
    responseType: 'blob'
  });
};

export default api;
