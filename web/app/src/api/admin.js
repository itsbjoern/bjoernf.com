import { get, post, postRaw } from 'app/api'

export const login = (username, password) => {
  return post('/admin/login', { username, password })
}

export const getDrafts = ({ page = 1, limit = 10 } = {}) => {
  return get(`/admin/posts?page=${page}&limit=${limit}`)
}

export const createPost = () => {
  return post('/admin/posts')
}

export const updatePost = (postId, data) => {
  return post(`/admin/posts/${postId}`, data)
}

export const publishPost = (postId) => {
  return post(`/admin/posts/${postId}/publish`)
}

export const unpublishPost = (postId) => {
  return post(`/admin/posts/${postId}/unpublish`)
}

export const upload = (postId, file) => {
  const formData = new FormData()
  formData.append('data', file)

  return postRaw(`/admin/posts/${postId}/upload`, formData)
}
