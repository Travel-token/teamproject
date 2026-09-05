export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.123.4:8080';
export function apiImageUrl(url: string) { return url.startsWith('https://') || url.startsWith('http://') ? url : API_BASE_URL + (url.startsWith('/') ? '' : '/') + url; }
