import React from "react";
import { useTranslation } from 'react-i18next';
import styles from "./Login.module.scss";
import LoginMine from "@/components/Login/login";

const Login = () => {
  const { t } = useTranslation();

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
            <h2 className={styles.loginTitle}>{t('common.backendManagementSystem')}</h2>
            <p className={styles.loginSubtitle}>{t('login.welcomeBack')}</p>
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
