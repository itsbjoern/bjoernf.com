import { get, post, deleteCall, postRaw } from 'app/api';

export const login = (username, password) => {
  return post('/admin/index/login', { username, password });
};

export const changePassword = (password) => {
  return post('/admin/index/changePassword', { password });
};

export const getDrafts = ({ page = 1, limit = 10 } = {}) => {
  return get(`/admin/blog/posts?page=${page}&limit=${limit}`);
};

export const createPost = () => {
  return post('/admin/blog/posts');
};

export const updatePost = (postId, data) => {
  return post(`/admin/blog/posts/${postId}`, data);
};

export const publishPost = (postId) => {
  return post(`/admin/blog/posts/${postId}/publish`);
};

export const unpublishPost = (postId) => {
  return post(`/admin/blog/posts/${postId}/unpublish`);
};

export const deletePost = (postId) => {
  return deleteCall(`/admin/blog/posts/${postId}`);
};

export const deleteDraft = (postId) => {
  return deleteCall(`/admin/blog/posts/${postId}/draft`);
};

export const upload = (postId, file) => {
  const formData = new FormData();
  formData.append('data', file);

  return postRaw(`/admin/blog/posts/${postId}/upload`, formData);
};

export const getViews = (days = 14) => {
  return get(`/admin/analytics/views?days=${days}`);
};
