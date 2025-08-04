import React, { useState, useCallback } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAsync } from "@/store/reducers/userSlice";
import CaptchaComponent from "@/components/Captcha";
import styles from "./login.module.scss"; // 引入样式模块

const LoginMine = () => {
  const [formSheet, setFormSheet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
      
      // 登录失败后刷新验证码
      setRefreshTrigger(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <>
      <div className={styles.loginTip}>
        <span
          className={styles.loginSpan}
          onClick={() => {
            setFormSheet(true);
          }}
        >
          密码登录
        </span>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <span
          className={styles.loginSpan}
          onClick={() => {
            setFormSheet(false);
          }}
        >
          手机号码登录
        </span>
      </div>
      {formSheet ? (
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{
            remember: true,
            username: "admin",
            password: "123456",
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className={styles.loginForm}
        >
          <Form.Item
            label="账&nbsp;号"
            name="username"
            rules={[{ required: true, message: "请输入账号!" }]}
          >
            <Input placeholder="请输入登录账号" />
          </Form.Item>

          <Form.Item
            label="密&nbsp;码"
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            label="验证码"
            name="captcha"
            rules={[{ required: true, message: "请输入验证码!" }]}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Input 
                placeholder="请输入验证码" 
                style={{ flex: 1 }}
                maxLength={4}
              />
              <CaptchaComponent 
                onCaptchaChange={handleCaptchaChange}
                refreshTrigger={refreshTrigger}
                style={{ flexShrink: 0 }}
              />
            </div>
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" label={null}>
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form
          name="phoneLogin"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={(values) => {
            message.info("手机号登录功能暂未开放，请使用密码登录");
          }}
          autoComplete="off"
          className={styles.loginForm}
        >
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: "请输入手机号!" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号格式!" },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            label="验证码"
            name="code"
            rules={[{ required: true, message: "请输入验证码!" }]}
          >
            <Input.Group compact>
              <Input style={{ width: "60%" }} placeholder="请输入验证码" />
              <Button type="primary" style={{ width: "40%" }} disabled>
                获取验证码
              </Button>
            </Input.Group>
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" label={null}>
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" block>
              登录 (暂未开放)
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};

export default LoginMine;
