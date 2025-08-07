// 测试所有组件导入
import React from 'react';

// 测试 Live2DModel 导入
try {
  const Live2DModel = require('../Live2DModel');
  console.log('✅ Live2DModel 导入成功:', Live2DModel);
} catch (error) {
  console.error('❌ Live2DModel 导入失败:', error);
}

// 测试 geminiApi 导入
try {
  const geminiApi = require('../../utils/geminiApi');
  console.log('✅ geminiApi 导入成功:', geminiApi);
} catch (error) {
  console.error('❌ geminiApi 导入失败:', error);
}

// 简单的测试组件
const TestComponent = () => {
  return <div>导入测试</div>;
};

export default TestComponent;
