// 测试脱敏功能
import { maskPhone, maskEmail, maskIdCard, maskBankCard, maskName } from './maskUtils';

// 测试数据
const testData = {
  phones: ['13812345678', '15987654321', '18666666666', '', null, undefined],
  emails: ['test@example.com', 'user@gmail.com', 'admin@company.cn', '', null],
  idCards: ['110101199001011234', '123456789012345678', '', null],
  bankCards: ['6225123456789012345', '4367123456789012', '', null],
  names: ['张三', '李四丰', '王小明', '欧阳修', '', null]
};

console.log('=== 手机号脱敏测试 ===');
testData.phones.forEach(phone => {
  console.log(`原始: ${phone} => 脱敏: ${maskPhone(phone)}`);
});

console.log('\n=== 邮箱脱敏测试 ===');
testData.emails.forEach(email => {
  console.log(`原始: ${email} => 脱敏: ${maskEmail(email)}`);
});

console.log('\n=== 身份证脱敏测试 ===');
testData.idCards.forEach(idCard => {
  console.log(`原始: ${idCard} => 脱敏: ${maskIdCard(idCard)}`);
});

console.log('\n=== 银行卡脱敏测试 ===');
testData.bankCards.forEach(bankCard => {
  console.log(`原始: ${bankCard} => 脱敏: ${maskBankCard(bankCard)}`);
});

console.log('\n=== 姓名脱敏测试 ===');
testData.names.forEach(name => {
  console.log(`原始: ${name} => 脱敏: ${maskName(name)}`);
});
