const http = require("http");

// 测试登录API
const postData = JSON.stringify({
  loginAccount: "admin",
  password: "123456",
});

const options = {
  hostname: "localhost",
  port: 3001,
  path: "/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

console.log("🧪 测试后端API...");

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("响应数据:", data);
    try {
      const jsonData = JSON.parse(data);
      console.log("✅ API 测试成功:", jsonData);
    } catch (e) {
      console.log("❌ 响应不是有效的JSON:", data);
    }
  });
});

req.on("error", (e) => {
  console.error(`❌ 请求错误: ${e.message}`);
});

req.write(postData);
req.end();
