export interface User {
  username: string;
  password: string;
  createdAt: Date;
}

export type PostInner = {
  title: string;
  tags: string[];
  summary: string;
  html: string;
  text: string;
  image?: string;
  slug?: string;
  publishedAt?: Date;
  version?: number;
};

export interface Post {
  createdAt: Date;
  updatedAt: Date;
  draft?: PostInner;
  published?: PostInner;
}
