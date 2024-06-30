import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.DEV
        ? "http://localhost:8000"
        : "https://orderthing-server.up.railway.app",
    withCredentials: true,
});

export default axiosInstance;
