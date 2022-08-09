import { get } from 'app/api';

export const getPosts = ({ page = 1, limit = 10, search = '' } = {}) => {
  return get(`/blog/posts?page=${page}&limit=${limit}&search=${search}`);
};

export const getPost = (id) => {
  return get(`/blog/posts/${id}`);
};

export const getTags = () => {
  return get(`/blog/tags`);
};
