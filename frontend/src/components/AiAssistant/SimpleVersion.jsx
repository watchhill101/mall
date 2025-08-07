import React, { useState } from 'react';
import { Button, Card } from 'antd';
import { RobotOutlined, CloseOutlined } from '@ant-design/icons';
import './AiAssistant.scss';

const AiAssistantWithLive2D = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ai-assistant-container">
      {/* 主触发按钮 */}
      <div className="ai-assistant-trigger">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<RobotOutlined />}
          onClick={() => setIsOpen(!isOpen)}
          className="main-trigger-btn"
          title="AI助手小雪"
        />
      </div>

      {/* 聊天界面 */}
      {isOpen && (
        <Card
          className="ai-chat-card"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>AI助手小雪</span>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setIsOpen(false)}
                style={{ color: 'white' }}
              />
            </div>
          }
          bodyStyle={{ 
            padding: '16px', 
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <RobotOutlined style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px' }} />
            <p>AI助手正在加载中...</p>
            <p>请稍候，我们正在为您准备最佳的对话体验</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AiAssistantWithLive2D;
