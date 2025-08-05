// 前端正确调用merchant API的示例

import axios from 'axios';
import { useState, useEffect } from 'react';
import { message } from 'antd';

// 1. 设置axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
});

// 2. 请求拦截器 - 自动添加Token
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取Token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器 - 处理401错误
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('认证失败，请重新登录');
      // 清除Token并跳转到登录页
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4. 使用示例
export const merchantAPI = {
  // 获取商户列表
  async getMerchantList(params) {
    try {
      const response = await api.get('/merchant/list', { params });
      return response.data;
    } catch (error) {
      console.error('获取商户列表失败:', error);
      throw error;
    }
  },

  // 创建商户
  async createMerchant(data) {
    try {
      const response = await api.post('/merchant/create', data);
      return response.data;
    } catch (error) {
      console.error('创建商户失败:', error);
      throw error;
    }
  }
};

// 5. 在React组件中使用
export const MerchantComponent = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const result = await merchantAPI.getMerchantList({
        page: 1,
        pageSize: 10
      });

      if (result.code === 200) {
        setMerchants(result.data.list);
      }
    } catch (error) {
      message.error('加载失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? '加载中...' : ''}
      {merchants.map(merchant => (
        <div key={merchant._id}>{merchant.name}</div>
      ))}
    </div>
  );
}; 