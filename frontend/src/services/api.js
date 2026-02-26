import axiosInstance from './axios';

// Auth APIs
export const authAPI = {
  register: (data, config) => axiosInstance.post('/auth/register', data, config),
  login: (data, config) => axiosInstance.post('/auth/login', data, config),
  getProfile: (config) => axiosInstance.get('/auth/profile', config),
  updateProfile: (data, config) => axiosInstance.put('/auth/profile', data, config),
};

// Product APIs
export const productAPI = {
  getAll: (params, config) => axiosInstance.get('/products', { ...config, params }),
  getById: (id, config) => axiosInstance.get("/products/" + id, config),
  getFeatured: (config) => axiosInstance.get('/products/featured', config),
  getByCategory: (categoryId, config) => axiosInstance.get("/products/category/" + categoryId, config),
  create: (data, config) => axiosInstance.post('/products', data, config),
  update: (id, data, config) => axiosInstance.put("/products/" + id, data, config),
  delete: (id, config) => axiosInstance.delete("/products/" + id, config),
};

// Category APIs
export const categoryAPI = {
  getAll: (config) => axiosInstance.get('/categories', config),
  getById: (id, config) => axiosInstance.get("/categories/" + id, config),
  create: (data, config) => axiosInstance.post('/categories', data, config),
  update: (id, data, config) => axiosInstance.put("/categories/" + id, data, config),
  delete: (id, config) => axiosInstance.delete("/categories/" + id, config),
};

// Order APIs
export const orderAPI = {
  getAll: (config) => axiosInstance.get('/orders/all', config),
  getUserOrders: (config) => axiosInstance.get('/orders', config),
  getById: (id, config) => axiosInstance.get("/orders/" + id, config),
  create: (data, config) => axiosInstance.post('/orders', data, config),
  updateStatus: (id, status, config) => axiosInstance.put("/orders/" + id + "/status", { status }, config),
  cancel: (id, config) => axiosInstance.put("/orders/" + id + "/cancel", {}, config),
};

// Review APIs
export const reviewAPI = {
  getByProduct: (productId, config) => axiosInstance.get("/reviews/product/" + productId, config),
  getUserReview: (productId, config) => axiosInstance.get("/reviews/user/" + productId, config),
  create: (data, config) => axiosInstance.post('/reviews', data, config),
  update: (id, data, config) => axiosInstance.put("/reviews/" + id, data, config),
  delete: (id, config) => axiosInstance.delete("/reviews/" + id, config),
};

// Contact API
export const contactAPI = {
  submit: (data, config) => axiosInstance.post('/contact', data, config),
  getAll: (params, config) => axiosInstance.get('/contact', { ...config, params }),
  getById: (id, config) => axiosInstance.get(`/contact/${id}`, config),
  reply: (id, data, config) => axiosInstance.post(`/contact/${id}/reply`, data, config),
  updateStatus: (id, status, config) => axiosInstance.patch(`/contact/${id}/status`, { status }, config),
  delete: (id, config) => axiosInstance.delete(`/contact/${id}`, config),
};

// User APIs (Admin)
export const userAPI = {
  getAll: (config) => axiosInstance.get('/users', config),
  getById: (id, config) => axiosInstance.get("/users/" + id, config),
  update: (id, data, config) => axiosInstance.put("/users/" + id, data, config),
  delete: (id, config) => axiosInstance.delete("/users/" + id, config),
};

// Offer APIs (Admin)
export const offerAPI = {
  getAll: (config) => axiosInstance.get('/offers', config),
  getActive: (config) => axiosInstance.get('/offers/active', config),
  getById: (id, config) => axiosInstance.get("/offers/" + id, config),
  create: (data, config) => axiosInstance.post('/offers', data, config),
  update: (id, data, config) => axiosInstance.put("/offers/" + id, data, config),
  toggle: (id, config) => axiosInstance.patch("/offers/" + id + "/toggle", {}, config),
  delete: (id, config) => axiosInstance.delete("/offers/" + id, config),
};

// Email APIs (Admin)
export const emailAPI = {
  sendPromotional: (data, config) => axiosInstance.post('/email/promotional', data, config),
};

// Upload APIs
export const uploadAPI = {
  uploadImage: (formData, config) => axiosInstance.post('/upload/image', formData, {
    ...config,
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadProductImages: (formData, config) => axiosInstance.post('/upload/products', formData, {
    ...config,
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadCategoryImage: (formData, config) => axiosInstance.post('/upload/category', formData, {
    ...config,
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
