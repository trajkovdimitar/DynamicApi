import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7020/api',
});

api.interceptors.response.use(
    r => r,
    e => {
        console.error(e);
        return Promise.reject(e);
    }
);

export default api;
