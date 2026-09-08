import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  otpSent: false,
  phone: '',

  setPhone: (phone) => set({ phone }),

  sendOTP: async (phone) => {
    const { data } = await api.post('/auth/send-otp', { phone });
    set({ otpSent: true, phone });
    return data;
  },

  verifyOTP: async (phone, code) => {
    const { data } = await api.post('/auth/verify-otp', { phone, code });
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    set({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
    });
    return data;
  },

  completeSignup: async (name, about) => {
    const { data } = await api.post('/auth/signup', { name, about });
    set({ user: data.user });
    return data;
  },

  checkAuth: async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: async (updates) => {
    const { data } = await api.put('/users/me', updates);
    set({ user: data.user });
    return data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    set({ user: data.user });
    return data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('accessToken');
    set({
      user: null,
      isAuthenticated: false,
      otpSent: false,
      phone: '',
    });
  },

  reset: () =>
    set({
      otpSent: false,
      phone: '',
    }),
}));

export default useAuthStore;
