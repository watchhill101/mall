import React from "react";
import styles from "./Login.module.scss";
import LoginMine from "@/components/Login/login";

const Login = () => {
  return (
    <div className={styles.login}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h2 className={styles.loginTitle}>后台管理系统</h2>
          </div>
          <div className={styles.loginContent}>
            <LoginMine />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
