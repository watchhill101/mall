import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Spin, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import captchaAPI from '@/api/captcha';
import styles from './index.module.scss';

const CaptchaComponent = ({ onCaptchaChange, style = {}, refreshTrigger }) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const onCaptchaChangeRef = useRef(onCaptchaChange);

  // 更新回调函数引用
  useEffect(() => {
    onCaptchaChangeRef.current = onCaptchaChange;
  }, [onCaptchaChange]);

  // 生成验证码
  const generateCaptcha = useCallback(async () => {
    console.log('🔄 开始生成验证码...');
    setLoading(true);
    try {
      const response = await captchaAPI.generate();
      if (response.code === 200) {
        console.log('✅ 验证码生成成功:', response.data.sessionId);
        setCaptchaData(response.data);
        // 通知父组件验证码数据变化
        if (onCaptchaChangeRef.current) {
          onCaptchaChangeRef.current({
            sessionId: response.data.sessionId,
            captchaSvg: response.data.captchaSvg
          });
        }
      } else {
        console.error('❌ 验证码生成失败:', response);
        message.error('验证码生成失败');
      }
    } catch (error) {
      console.error('❌ 验证码生成异常:', error);
      message.error('验证码生成失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []); // 移除依赖项，使用 ref 来访问最新的回调

  // 刷新验证码
  const refreshCaptcha = useCallback(async () => {
    console.log('🔄 开始刷新验证码...', captchaData?.sessionId);
    setLoading(true);
    try {
      const response = await captchaAPI.refresh({
        sessionId: captchaData?.sessionId
      });
      if (response.code === 200) {
        console.log('✅ 验证码刷新成功:', response.data.sessionId);
        setCaptchaData(response.data);
        // 通知父组件验证码数据变化
        if (onCaptchaChangeRef.current) {
          onCaptchaChangeRef.current({
            sessionId: response.data.sessionId,
            captchaSvg: response.data.captchaSvg
          });
        }
      } else {
        console.error('❌ 验证码刷新失败:', response);
        message.error('验证码刷新失败');
      }
    } catch (error) {
      console.error('❌ 验证码刷新异常:', error);
      message.error('验证码刷新失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [captchaData?.sessionId]); // 只依赖 sessionId

  // 组件挂载时生成验证码
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]); // 空依赖数组，只在组件挂载时执行一次

  // 监听外部刷新触发器
  useEffect(() => {
    if (refreshTrigger) {
      refreshCaptcha();
    }
  }, [refreshTrigger, refreshCaptcha]);

  return (
    <div className={styles.captchaContainer} style={style}>
      <div className={styles.captchaImage}>
        {loading ? (
          <div className={styles.loading}>
            <Spin size="small" />
          </div>
        ) : (
          <div
            className={styles.svgContainer}
            dangerouslySetInnerHTML={{ __html: captchaData?.captchaSvg }}
            onClick={refreshCaptcha}
            title="点击刷新验证码"
          />
        )}
      </div>
      <div className={styles.refreshButton}>
        <ReloadOutlined 
          onClick={refreshCaptcha} 
          className={styles.refreshIcon}
          title="刷新验证码"
        />
      </div>
    </div>
  );
};

export default CaptchaComponent;