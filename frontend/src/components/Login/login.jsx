import React, { useState, useCallback, useRef } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAsync } from "@/store/reducers/userSlice";
import CaptchaComponent from "@/components/Captcha";
import styles from "./login.module.scss"; // 引入样式模块

const LoginMine = () => {
  const [loading, setLoading] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 处理验证码变化
  const handleCaptchaChange = useCallback((data) => {
    console.log('🎯 验证码数据更新:', data);
    setCaptchaData(data);
  }, []);

  // 处理登录提交
  const onFinish = async (values) => {
    // 验证码验证
    if (!captchaData || !captchaData.sessionId) {
      message.error('请先获取验证码');
      return;
    }

    if (!values.captcha) {
      message.error('请输入验证码');
      return;
    }

    setLoading(true);
    console.log("🔐 开始登录:", values);

    try {
      const result = await dispatch(
        loginAsync({
          loginAccount: values.username,
          password: values.password,
          captcha: values.captcha,
          sessionId: captchaData.sessionId
        })
      );

      console.log("✅ 登录成功:", result);
      message.success("登录成功！");

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("❌ 登录失败:", error);
      message.error(error.message || "登录失败，请检查用户名和密码");
      
      // 登录失败后刷新验证码（防抖处理）
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        console.log('🔄 登录失败，触发验证码刷新');
        setRefreshTrigger(prev => prev + 1);
      }, 100); // 100ms 防抖
      
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // 组件卸载时清理定时器
  React.useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  return (
    <div className={styles.loginForm}>
        <Form
          name="basic"
          layout="vertical"
          initialValues={{
            remember: true,
            username: "",
            password: "",
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className={styles.form}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名!" }]}
          >
            <Input 
              placeholder="请输入用户名" 
              size="large"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input.Password 
              placeholder="请输入密码" 
              size="large"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="验证码"
            name="captcha"
            rules={[{ required: true, message: "请输入验证码!" }]}
          >
            <div className={styles.captchaInputContainer}>
              <Input 
                placeholder="请输入验证码" 
                size="large"
                maxLength={4}
                className={styles.captchaInput}
              />
              <div className={styles.captchaImageContainer}>
                <CaptchaComponent 
                  onCaptchaChange={handleCaptchaChange}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox className={styles.checkbox}>记住密码</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              block
              className={styles.submitButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
    </div>
  );
};

export default LoginMine;
