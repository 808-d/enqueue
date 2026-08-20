// get data from .env
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const endpoints = {
  signup: `${API_BASE_URL}/signup`,
  login: `${API_BASE_URL}/login`,
  refresh: `${API_BASE_URL}/refresh`,
  logout: `${API_BASE_URL}/logout`,
  posts: `${API_BASE_URL}/posts`,
  users: `${API_BASE_URL}/users`,
  verify: `${API_BASE_URL}/verify`,
  verifyEmailChange: `${API_BASE_URL}/verify-email-change`,
  me: `${API_BASE_URL}/me`,
  likes: `${API_BASE_URL}/likes`,
  comments: `${API_BASE_URL}/comments`,
  changePassword: `${API_BASE_URL}/password`,
  forgotPassword: `${API_BASE_URL}/forgot-password`,
  resetPassword: `${API_BASE_URL}/reset-password`,
};
