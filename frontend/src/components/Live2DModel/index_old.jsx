import React, { useEffect, useState, useCallback } from 'react';
import { DEFAULT_MODEL } from './config';
import ModelSwitcher from './ModelSwitcher';
import Live2DWorking from './Live2DWorking';

const Live2DModel = ({ onModelReady, modelConfig = DEFAULT_MODEL }) => {
  const [currentModel, setCurrentModel] = useState(modelConfig);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const initLive2D = useCallback(async (model) => {
    try {
      console.log('🎭 开始加载 Live2D 模型:', model.name, model.jsonPath);
      setLoadError(null);
      setIsModelLoaded(false);

      // 清理之前的实例
      const existingWidget = document.getElementById('live2d-widget');
      if (existingWidget) {
        existingWidget.remove();
        console.log('🧹 清理了之前的 Live2D 实例');
      }

      // 清理全局 Live2D 实例
      if (window.L2Dwidget) {
        try {
          window.L2Dwidget.captureFrame = null;
          delete window.L2Dwidget;
        } catch (e) {
          console.log('清理全局实例时出现错误:', e);
        }
      }

      // 动态导入 live2d-widget
      console.log('📦 导入 live2d-widget 包...');
      const L2Dwidget = await import('live2d-widget');
      console.log('✅ live2d-widget 包导入成功', L2Dwidget);

      if (!L2Dwidget.default || !L2Dwidget.default.init) {
        throw new Error('live2d-widget 导入失败或缺少 init 方法');
      }

      // 测试模型文件是否可访问
      console.log('🔗 测试模型文件访问:', model.jsonPath);
      try {
        const response = await fetch(model.jsonPath);
        if (!response.ok) {
          throw new Error(`模型文件无法访问: ${response.status} ${response.statusText}`);
        }
        const modelData = await response.json();
        console.log('✅ 模型文件访问成功:', modelData);
      } catch (fetchError) {
        console.error('❌ 模型文件访问失败:', fetchError);
        setLoadError(`模型文件无法访问: ${model.jsonPath}`);
        return;
      }

      // 配置 Live2D 参数
      const live2dConfig = {
        model: {
          jsonPath: model.jsonPath,
        },
        display: {
          position: 'relative', // 改为相对定位
          width: 150,
          height: 120,
          hOffset: 0,
          vOffset: 0,
        },
        mobile: {
          show: true,
          scale: 0.8,
        },
        name: {
          canvas: 'live2dcanvas',
          div: 'live2d-widget',
        },
        react: {
          opacity: 0.85,
        },
        dev: {
          border: false,
        },
        dialog: {
          enable: false,
        },
      };

      console.log('⚙️ Live2D 配置:', live2dConfig);

      // 初始化 Live2D 模型
      L2Dwidget.default.init(live2dConfig);

      // 监听模型加载状态
      let checkCount = 0;
      const maxChecks = 50; // 最多检查10秒
      
      const checkModelLoaded = () => {
        checkCount++;
        const widget = document.getElementById('live2d-widget');
        const canvas = document.getElementById('live2dcanvas');
        
        if (widget && canvas) {
          console.log('✅ Live2D 模型加载成功!', widget, canvas);
          setIsModelLoaded(true);
          if (onModelReady) {
            onModelReady();
          }
          
          // 确保模型显示在正确位置
          widget.style.position = 'absolute';
          widget.style.top = '50%';
          widget.style.left = '50%';
          widget.style.transform = 'translate(-50%, -50%)';
          widget.style.width = '150px';
          widget.style.height = '120px';
          widget.style.zIndex = '1';
          
        } else if (checkCount < maxChecks) {
          setTimeout(checkModelLoaded, 200);
        } else {
          console.error('❌ Live2D 模型加载超时');
          setLoadError('模型加载超时，请检查模型文件是否正确');
        }
      };

      // 开始检查模型加载状态
      setTimeout(checkModelLoaded, 500);

      console.log(`✅ Live2D 模型初始化完成: ${model.name}`);
      
    } catch (error) {
      console.error('❌ Live2D 模型初始化失败:', error);
      setLoadError(error.message || '模型加载失败');
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
