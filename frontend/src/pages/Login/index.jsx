import React from "react";
import { Card } from "antd";
import styles from "./Login.module.scss";
import LoginMine from "@/components/Login/login";

const Login = () => {
  return (
    <div className={styles.login}>
      <div className={styles.loginContainer}>
        <Card
          title="用户登录"
          className={styles.loginCard}
          style={{ width: 400, margin: "0" }}
        >
          <div className={styles.loginContent}>
            <LoginMine />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
