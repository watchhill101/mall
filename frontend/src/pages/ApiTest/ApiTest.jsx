import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spin } from 'antd';
import apiMap from '../../api/Product/index';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🧪 开始测试 API...');
      
      const response = await apiMap.Product.getList();
      console.log('🧪 API 测试结果:', response);
      
      setResult({
        success: true,
        data: response,
        message: '✅ API 调用成功！'
      });
    } catch (err) {
      console.error('🧪 API 测试失败:', err);
      setError(err.message);
      setResult({
        success: false,
        error: err,
        message: '❌ API 调用失败'
      });
    } finally {
      setLoading(false);
    }
  };

  const testLocalStorage = () => {
    const token = localStorage.getItem('ACCESS-TOKEN');
    const refreshToken = localStorage.getItem('REFRESH-TOKEN');
    
    console.log('🔑 Token 检查:', {
      hasToken: !!token,
      tokenLength: token?.length,
      hasRefreshToken: !!refreshToken
    });

    return {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      hasRefreshToken: !!refreshToken
    };
  };

  useEffect(() => {
    // 自动运行测试
    testApi();
  }, []);

  const authInfo = testLocalStorage();

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <Card title="🧪 商品 API 测试" style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Button type="primary" onClick={testApi} loading={loading}>
            重新测试 API
          </Button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <div>正在测试 API 连接...</div>
          </div>
        )}

        {result && !loading && (
          <Alert
            type={result.success ? 'success' : 'error'}
            message={result.message}
            description={
              <div>
                <div><strong>响应数据:</strong></div>
                <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            }
            showIcon
          />
        )}

        {error && (
          <Alert
            type="error"
            message="API 调用出现错误"
            description={error}
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>

      <Card title="🔑 身份验证信息" style={{ marginBottom: '20px' }}>
        <div>
          <p><strong>Token 状态:</strong> {authInfo.hasToken ? '✅ 已存在' : '❌ 不存在'}</p>
          <p><strong>Token 预览:</strong> {authInfo.tokenPreview}</p>
          <p><strong>Refresh Token:</strong> {authInfo.hasRefreshToken ? '✅ 已存在' : '❌ 不存在'}</p>
        </div>
      </Card>

      <Card title="📋 故障排除建议">
        <div>
          <h4>如果 API 调用失败，请检查：</h4>
          <ol>
            <li>后端服务是否正常运行 (端口 3000)</li>
            <li>用户是否已登录 (检查 Token)</li>
            <li>网络连接是否正常</li>
            <li>浏览器控制台是否有错误信息</li>
          </ol>
          
          <h4>解决方案：</h4>
          <ul>
            <li>如果没有 Token，请先登录系统</li>
            <li>如果后端未启动，运行: <code>cd backend && npm start</code></li>
            <li>检查浏览器 Network 标签页查看具体错误</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ApiTest;
