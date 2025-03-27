import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
  export interface AxiosInstance {
    defaults: {
      baseURL: string;
    };
  }
  
  export interface AxiosRequestConfig {
    headers?: {
      Authorization?: string;
      'Content-Type'?: string;
    };
  }
} 