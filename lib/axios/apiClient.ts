import axios from "axios";

const apiEndpoint = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: apiEndpoint,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem("token");
      // window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
