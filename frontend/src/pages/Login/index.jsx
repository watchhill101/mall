import React from "react";
import { Card } from "antd";
import styles from "./Login.module.scss";
import SvgIcon from "../../components/SvgIcon";
import { getNameList } from "../../assets/Icon";
import LoginMine from "@/components/Login/login";

const Login = () => {
  const iconNames = getNameList();
  console.log("可用图标:", iconNames); // 调试信息
  console.log("第一个图标:", iconNames[0]); // 调试信息

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
