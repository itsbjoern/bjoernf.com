import { post } from 'app/api'

export const heartbeat = (payload) => {
  return post('/heartbeat', payload)
}
