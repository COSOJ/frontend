export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const buildAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
