import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("goodscore_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "Something went wrong.";
    return Promise.reject(new Error(message));
  }
);

export default client;
