import React, { useState } from "react";
import { Button, Checkbox, Form, Input } from "antd";
import styles from "./login.module.scss"; // 引入样式模块

const LoginMine = () => {
  const [formSheet, setFormSheet] = useState(true);
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
          initialValues={{ remember: true }}
          // onFinish={onFinish}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
          className={styles.loginForm}
        >
          <Form.Item
            label="账&nbsp;号"
            name="username"
            rules={[{ required: true, message: "请输入账号!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密&nbsp;码"
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" label={null}>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          // onFinish={onFinish}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
          className={styles.loginForm}
        >
          <Form.Item
            label="手机号"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="验证码"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input style={{ width: "40%" }} />
            <Button type="primary">获取验证码</Button>
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" label={null}>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};

export default LoginMine;
