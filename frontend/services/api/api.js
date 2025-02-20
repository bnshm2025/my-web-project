// api.js
import axios from 'axios';

const API_URL = 'https://bns911.com/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export default api;
