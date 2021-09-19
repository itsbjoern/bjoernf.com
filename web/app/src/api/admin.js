import { get, post } from 'app/api'

export const login = (username, password) => {
  return post('/admin/login', { username, password })
}

export const getPosts = () => {
  return get('/admin/posts')
}
