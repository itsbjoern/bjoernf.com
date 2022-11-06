import { get, post, del } from 'src/api';

import { PostBody } from './schemaUtils';

export const login = (username: string, password: string) => {
  return post('/admin/index/login', { username, password });
};

export const changePassword = (password: string) => {
  return post('/admin/index/changePassword', { password });
};

export const getDrafts = ({ page = 1, limit = 10 } = {}) => {
  return get(`/admin/blog/posts`, { page, limit });
};

export const createPost = () => {
  return post('/admin/blog/posts');
};

export const updatePost = (
  postId: string,
  data: PostBody<'/admin/blog/posts/post/edit'>
) => {
  return post(`/admin/blog/posts/${postId}/edit`, data);
};

export const publishPost = (postId: string) => {
  return post(`/admin/blog/posts/${postId}/publish`);
};

export const unpublishPost = (postId: string) => {
  return post(`/admin/blog/posts/${postId}/unpublish`);
};

export const deletePost = (postId: string) => {
  return del(`/admin/blog/posts/${postId}/edit`);
};

export const deleteDraft = (postId: string) => {
  return del(`/admin/blog/posts/${postId}/draft`);
};

export const upload = (
  postId: string,
  file: File,
  options: {
    ext?: string;
    max_size?: string;
    quality?: string;
  } = {}
) => {
  const formData = new FormData();
  formData.append('data', file);

  return post(`/admin/blog/posts/${postId}/upload`, formData, options);
};
