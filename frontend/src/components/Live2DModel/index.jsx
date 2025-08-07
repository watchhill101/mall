import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DEFAULT_MODEL, LIVE2D_CONFIG } from './config';
import ModelSwitcher from './ModelSwitcher';

const Live2DModel = ({ onModelReady, modelConfig = DEFAULT_MODEL }) => {
  const containerRef = useRef(null);
  const [currentModel, setCurrentModel] = useState(modelConfig);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const initLive2D = useCallback(async (model) => {
    try {
      // 清理之前的实例
      const existingWidget = document.getElementById('live2d-widget');
      if (existingWidget) {
        existingWidget.remove();
      }

      // 动态导入 live2d-widget 避免 SSR 问题
      const L2Dwidget = await import('live2d-widget');
      
      // 清理之前的实例
      if (window.L2Dwidget) {
        window.L2Dwidget.init = L2Dwidget.default.init;
      }

      // 初始化 Live2D 模型
      L2Dwidget.default.init({
        model: {
          jsonPath: model.jsonPath,
        },
        ...LIVE2D_CONFIG,
      });

      // 模型加载完成后的回调
      setTimeout(() => {
        setIsModelLoaded(true);
        if (onModelReady) {
          onModelReady();
        }
      }, 2000); // 等待模型加载完成

      console.log(`✅ Live2D 模型初始化成功: ${model.name}`);
    } catch (error) {
      console.error('❌ Live2D 模型初始化失败:', error);
      setIsModelLoaded(false);
    }
  }, [onModelReady]);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      initLive2D(currentModel);
    }

    // 清理函数
    return () => {
      mounted = false;
      // 清理 Live2D 实例
      const live2dElement = document.getElementById('live2d-widget');
      if (live2dElement) {
        live2dElement.remove();
      }
    };
  }, [currentModel, initLive2D]);

  const handleModelChange = useCallback(async (newModel) => {
    setIsModelLoaded(false);
    setCurrentModel(newModel);
  }, []);

  return (
    <div 
      ref={containerRef}
      id="live2d-container"
      style={{
        width: '200px',
        height: '300px',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Live2D 模型会在这里渲染 */}
      
      {/* 模型信息和切换按钮 */}
      <div 
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '12px',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          width: '100%',
          padding: '0 8px',
        }}
      >
        <div style={{ marginBottom: '4px' }}>
          {currentModel.name}
        </div>
        {!isModelLoaded && (
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            模型加载中...
          </div>
        )}
      </div>

      {/* 模型切换器 */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          pointerEvents: 'auto',
        }}
      >
        <ModelSwitcher 
          onModelChange={handleModelChange}
          currentModel={currentModel}
        />
      </div>
    </div>
  );
};

export default Live2DModel;
