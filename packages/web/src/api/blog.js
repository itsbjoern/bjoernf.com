import { get } from 'src/api';

export const getPosts = ({
  page = 1,
  limit = 10,
  search = '',
  preview = false,
} = {}) => {
  return get(
    `/blog/posts?page=${page}&limit=${limit}&search=${search}&preview=${preview}`
  );
};

export const getPost = (id) => {
  return get(`/blog/posts/${id}`);
};

export const getTags = () => {
  return get(`/blog/tags`);
};
