import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Application, ApplicationFormData, AIParseResponse } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post<{ token: string; user: { id: string; email: string; name: string } }>(
      '/auth/register',
      { email, password, name }
    );
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: { id: string; email: string; name: string } }>(
      '/auth/login',
      { email, password }
    );
    return data;
  },
};

export const applicationsApi = {
  getAll: async (): Promise<Application[]> => {
    const { data } = await api.get<Application[]>('/applications');
    return data;
  },
  create: async (payload: Partial<ApplicationFormData>): Promise<Application> => {
    const { data } = await api.post<Application>('/applications', payload);
    return data;
  },
  update: async (id: string, payload: Partial<ApplicationFormData>): Promise<Application> => {
    const { data } = await api.put<Application>(`/applications/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
  },
  parseJD: async (jobDescription: string): Promise<AIParseResponse> => {
    const { data } = await api.post<AIParseResponse>('/applications/parse-jd', { jobDescription });
    return data;
  },
};

export default api;
