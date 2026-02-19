import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoApi = {
  // get all todos
  getAll: async (params = {}) => {
    const response = await api.get('/todos', { params });
    return response.data;
  },

  // get single todo
  getById: async (id) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  // create a todo
  create: async (todo) => {
    const response = await api.post('/todos', todo);
    return response.data;
  },

  // update a todo
  update: async (id, todo) => {
    const response = await api.put(`/todos/${id}`, todo);
    return response.data;
  },

  // delete a todo
  delete: async (id) => {
    await api.delete(`/todos/${id}`);
    return id;
  },

  // get stats
  getStats: async () => {
    const response = await api.get('/todos/stats');
    return response.data;
  },
};

export default api;
