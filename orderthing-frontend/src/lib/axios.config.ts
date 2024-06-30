import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.DEV
        ? "http://localhost:8000"
        : import.meta.env.SERVER_URL,
    withCredentials: true,
});

export default axiosInstance;
