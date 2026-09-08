import { create } from 'zustand';
import api from '../utils/api';

const useContactStore = create((set, get) => ({
  contacts: [],
  isLoading: false,
  searchResult: null,
  searchLoading: false,

  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/contacts');
      set({ contacts: data.contacts, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  searchByPhone: async (phone) => {
    set({ searchLoading: true, searchResult: null });
    try {
      const { data } = await api.get(`/users/search?phone=${encodeURIComponent(phone)}`);
      set({ searchResult: data, searchLoading: false });
      return data;
    } catch (error) {
      set({ searchLoading: false });
      throw error;
    }
  },

  addContact: async (phone, savedName) => {
    const { data } = await api.post('/contacts', { phone, savedName });
    const { contacts } = get();
    set({ contacts: [...contacts, data.contact], searchResult: null });
    return data.contact;
  },

  deleteContact: async (contactId) => {
    await api.delete(`/contacts/${contactId}`);
    const { contacts } = get();
    set({ contacts: contacts.filter((c) => c._id !== contactId) });
  },

  clearSearch: () => set({ searchResult: null }),
}));

export default useContactStore;
