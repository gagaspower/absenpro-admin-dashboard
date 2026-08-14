import axios from "axios"
import { storage } from "./storage"

export const api = axios.create({
  baseURL: "https://literally-characterized-manitoba-containers.trycloudflare.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
})

// Request — inject token jika ada
api.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response — handle 401: clear auth + redirect login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearAuth()
      window.location.replace("/login")
    }
    return Promise.reject(error)
  }
)
