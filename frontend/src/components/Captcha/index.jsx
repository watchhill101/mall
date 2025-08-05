import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spin, message } from "antd";
import captchaAPI from "@/api/captcha";
import styles from "./index.module.scss";

const CaptchaComponent = ({ onCaptchaChange, style = {}, refreshTrigger }) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const onCaptchaChangeRef = useRef(onCaptchaChange);
  const isRequestingRef = useRef(false); // 防止重复请求

  // 更新回调函数引用
  useEffect(() => {
    onCaptchaChangeRef.current = onCaptchaChange;
  }, [onCaptchaChange]);

  // 生成验证码
  const generateCaptcha = useCallback(async () => {
    if (isRequestingRef.current) {
      console.log("⏳ 验证码请求进行中，跳过重复请求");
      return;
    }

    console.log("🔄 开始生成验证码...");
    isRequestingRef.current = true;
    setLoading(true);

    try {
      const response = await captchaAPI.generate();
      if (response.code === 200) {
        console.log("✅ 验证码生成成功:", response.data.sessionId);
        setCaptchaData(response.data);
        // 通知父组件验证码数据变化
        if (onCaptchaChangeRef.current) {
          onCaptchaChangeRef.current({
            sessionId: response.data.sessionId,
            captchaSvg: response.data.captchaSvg,
          });
        }
      } else {
        console.error("❌ 验证码生成失败:", response);
        message.error("验证码生成失败");
      }
    } catch (error) {
      console.error("❌ 验证码生成异常:", error);
      message.error("验证码生成失败，请重试");
    } finally {
      setLoading(false);
      isRequestingRef.current = false;
    }
  }, []); // 移除依赖项，使用 ref 来访问最新的回调

  // 刷新验证码
  const refreshCaptcha = useCallback(async () => {
    if (isRequestingRef.current) {
      console.log("⏳ 验证码请求进行中，跳过重复刷新");
      return;
    }

    console.log("🔄 开始刷新验证码...");
    isRequestingRef.current = true;
    setLoading(true);

    try {
      // 直接调用生成新验证码，而不是刷新现有的
      const response = await captchaAPI.generate();
      if (response.code === 200) {
        console.log("✅ 验证码刷新成功:", response.data.sessionId);
        setCaptchaData(response.data);
        // 通知父组件验证码数据变化
        if (onCaptchaChangeRef.current) {
          onCaptchaChangeRef.current({
            sessionId: response.data.sessionId,
            captchaSvg: response.data.captchaSvg,
          });
        }
      } else {
        console.error("❌ 验证码刷新失败:", response);
        message.error("验证码刷新失败");
      }
    } catch (error) {
      console.error("❌ 验证码刷新异常:", error);
      message.error("验证码刷新失败，请重试");
    } finally {
      setLoading(false);
      isRequestingRef.current = false;
    }
  }, []); // 移除所有依赖项

  // 组件挂载时生成验证码
  useEffect(() => {
    generateCaptcha();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 监听外部刷新触发器
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log("🔄 外部触发验证码刷新:", refreshTrigger);
      refreshCaptcha();
    }
  }, [refreshCaptcha, refreshTrigger]); // 只依赖 refreshTrigger，移除 refreshCaptcha 依赖

  return (
    <div className={styles.captchaContainer} style={style}>
      {loading ? (
        <div className={styles.loading}>
          <Spin size="small" />
        </div>
      ) : (
        <div
          className={styles.captchaImage}
          dangerouslySetInnerHTML={{ __html: captchaData?.captchaSvg }}
          onClick={refreshCaptcha}
          title="点击刷新验证码"
        />
      )}
    </div>
  );
};

export default CaptchaComponent;
