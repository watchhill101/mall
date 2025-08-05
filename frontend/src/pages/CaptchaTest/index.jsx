import React, { useState } from 'react';
import { Card, Input, Button, message, Space } from 'antd';
import CaptchaComponent from '@/components/Captcha';
import captchaAPI from '@/api/captcha';

const CaptchaTest = () => {
  const [captchaData, setCaptchaData] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = (data) => {
    setCaptchaData(data);
    console.log('验证码数据:', data);
  };

  const handleVerify = async () => {
    if (!captchaData || !inputValue) {
      message.error('请输入验证码');
      return;
    }

    setLoading(true);
    try {
      const response = await captchaAPI.verify({
        sessionId: captchaData.sessionId,
        captcha: inputValue
      });

      if (response.code === 200) {
        message.success('验证码验证成功！');
      } else {
        message.error('验证码验证失败');
      }
    } catch (error) {
      message.error('验证码验证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <Card title="验证码功能测试">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4>验证码显示：</h4>
            <CaptchaComponent onCaptchaChange={handleCaptchaChange} />
          </div>
          
          <div>
            <h4>输入验证码：</h4>
            <Input
              placeholder="请输入验证码"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              maxLength={4}
              style={{ width: '200px' }}
            />
          </div>
          
          <div>
            <Button 
              type="primary" 
              onClick={handleVerify}
              loading={loading}
            >
              验证
            </Button>
          </div>
          
          <div>
            <h4>调试信息：</h4>
            <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              {JSON.stringify(captchaData, null, 2)}
            </pre>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default CaptchaTest;