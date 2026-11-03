import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', headers: { 'Content-Type': 'application/json' } });

export const getAuthToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

export const setAuthToken = (token: string | null) => {
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete api.defaults.headers.common['Authorization'];
};

// Restore either a remembered or session-only login before the first API request.
if (typeof window !== 'undefined') {
    setAuthToken(getAuthToken());
}

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && getAuthToken()) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('role');
            setAuthToken(null);
            if (window.location.pathname !== '/login') window.location.assign('/login?session=expired');
        }
        return Promise.reject(error);
    },
);
