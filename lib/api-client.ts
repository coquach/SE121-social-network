// src/lib/api-client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_UR,
  headers: { 'Content-Type': 'application/json' },
});

export default api