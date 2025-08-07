import React from "react";
import styles from "./Login.module.scss";
import LoginMine from "@/components/Login/login";

const Login = () => {
  return (
    <div className={styles.login}>
      {/* 动态背景元素 */}
      <div className={styles.backgroundElements}>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
      </div>
      
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h2 className={styles.loginTitle}>后台管理系统</h2>
            <p className={styles.loginSubtitle}>欢迎回来，请登录您的账户</p>
          </div>
          <div className={styles.loginContent}>
            <LoginMine />
          </div>
          <div className={styles.loginFooter}>
            <p className={styles.footerText}>
              © 2025 Mall Admin System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
