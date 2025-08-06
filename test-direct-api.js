const http = require('http');

const testAPI = (path, callback) => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: path, // 直接使用路径，不加/api前缀
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  console.log(`🔗 请求: http://localhost:3001${path}`);

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📥 状态码: ${res.statusCode}`);
      console.log(`📄 响应: ${data.substring(0, 200)}...`);

      try {
        const jsonData = JSON.parse(data);
        callback(null, jsonData);
      } catch (error) {
        callback(error, data);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ 请求错误: ${error.message}`);
    callback(error, null);
  });

  req.end();
};

console.log('🧪 测试后端API直连...\n');

// 测试基础连接
console.log('1️⃣ 测试基础路径...');
testAPI('/', (error, data) => {
  console.log('基础路径测试完成\n');

  console.log('2️⃣ 测试bill路径...');
  testAPI('/bill/test', (error, data) => {
    if (error && typeof data === 'string') {
      console.log('bill路径测试完成\n');
    } else if (data) {
      console.log('✅ bill API 响应成功:', data);
    }

    console.log('3️⃣ 测试其他已知路径...');
    testAPI('/merchant/test', (error, data) => {
      console.log('merchant路径测试完成\n');
      console.log('🎉 所有测试完成！');
    });
  });
}); 