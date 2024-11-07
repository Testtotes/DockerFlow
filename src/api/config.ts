export const API_BASE_URL = 'http://52.70.78.31:3000/api';

export const endpoints = {
  containers: {
    list: '/containers',
    start: (id: string) => `/containers/${id}/start`,
    stop: (id: string) => `/containers/${id}/stop`,
    remove: (id: string) => `/containers/${id}/remove`,
  },
  images: {
    list: '/images',
    pull: '/images/pull',
    remove: (id: string) => `/images/${id}/remove`,
  }
};