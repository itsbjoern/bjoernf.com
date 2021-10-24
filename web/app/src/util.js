// eslint-disable-next-line no-undef
export const isDev = process.env.NODE_ENV === 'development'

// eslint-disable-next-line no-undef
export const isSSR = typeof window === 'undefined'

export const publicUrl = process.env.PUBLIC_URL
export const imageUrl = process.env.IMAGE_URL
