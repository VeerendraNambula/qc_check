import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', headers: { 'Content-Type': 'application/json' } });

export const setAuthToken = (token: string | null) => {
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete api.defaults.headers.common['Authorization'];
};

// Restore the saved session before components can issue their first API requests.
if (typeof window !== 'undefined') {
    setAuthToken(window.localStorage.getItem('token'));
}

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            setAuthToken(null);
            if (window.location.pathname !== '/login') window.location.assign('/login?session=expired');
        }
        return Promise.reject(error);
    },
);
