import axios from "axios";

axios.defaults.baseURL = "http://localhost:3001";
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});
