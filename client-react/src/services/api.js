import axios from 'axios';

// Определяем базовый URL API из переменной окружения или используем текущий хост
const getApiBaseURL = () => {
  // В production используем переменную окружения или текущий хост
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Если запущено на том же домене, используем относительный путь
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    const port = window.location.port;
    // Если порт 3001 (dev) или нет порта (production через nginx), используем текущий хост
    if (port === '3001' || !port) {
      return window.location.origin;
    }
  }
  
  // Fallback на localhost для разработки
  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 30000, // 30 секунд для загрузки файлов
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Для загрузки файлов НЕ устанавливаем Content-Type - пусть браузер сам определит
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;