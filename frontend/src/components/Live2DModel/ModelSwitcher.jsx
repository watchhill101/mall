import React, { useState } from 'react';
import { Button, Dropdown, Space, message } from 'antd';
import { SwapOutlined, DownOutlined } from '@ant-design/icons';
import { LIVE2D_MODELS, getRandomModel } from './config';

const ModelSwitcher = ({ onModelChange, currentModel }) => {
  const [loading, setLoading] = useState(false);

  // 创建模型菜单项
  const createMenuItems = () => {
    const items = [];
    
    // 在线模型
    items.push({
      type: 'group',
      label: '在线模型',
      children: Object.entries(LIVE2D_MODELS.ONLINE).map(([key, model]) => ({
        key: `online-${key}`,
        label: model.name,
        onClick: () => handleModelChange(model),
      })),
    });
    
    // 本地模型
    items.push({
      type: 'group',
      label: '本地模型',
      children: Object.entries(LIVE2D_MODELS.LOCAL).map(([key, model]) => ({
        key: `local-${key}`,
        label: model.name,
        onClick: () => handleModelChange(model),
      })),
    });
    
    // 随机模型
    items.push({
      type: 'divider',
    });
    items.push({
      key: 'random',
      label: '🎲 随机本地模型',
      onClick: handleRandomModel,
    });
    
    return items;
  };

  const handleModelChange = async (model) => {
    if (model.jsonPath === currentModel?.jsonPath) {
      message.info('当前已是此模型');
      return;
    }
    
    setLoading(true);
    try {
      await onModelChange(model);
      message.success(`已切换到 ${model.name}`);
    } catch (error) {
      console.error('模型切换失败:', error);
      message.error('模型切换失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomModel = () => {
    const randomModel = getRandomModel('LOCAL');
    handleModelChange(randomModel);
  };

  return (
    <Dropdown
      menu={{ items: createMenuItems() }}
      trigger={['click']}
      placement="topRight"
    >
      <Button 
        type="text" 
        size="small" 
        loading={loading}
        style={{ color: 'rgba(255,255,255,0.8)' }}
      >
        <Space>
          <SwapOutlined />
          切换模型
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default ModelSwitcher;
