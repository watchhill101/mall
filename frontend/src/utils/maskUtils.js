/**
 * 数据脱敏工具函数
 */

/**
 * 手机号脱敏处理
 * @param {string} phone - 手机号
 * @returns {string} 脱敏后的手机号
 */
export const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return phone || '-';
  }
  
  // 移除所有非数字字符
  const cleanPhone = phone.replace(/\D/g, '');
  
  // 如果不是11位手机号，直接返回
  if (cleanPhone.length !== 11) {
    return phone;
  }
  
  // 脱敏处理：显示前3位和后4位，中间用*号替代
  return `${cleanPhone.substring(0, 3)}****${cleanPhone.substring(7)}`;
};

/**
 * 邮箱脱敏处理
 * @param {string} email - 邮箱地址
 * @returns {string} 脱敏后的邮箱
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return email || '-';
  }
  
  const emailParts = email.split('@');
  if (emailParts.length !== 2) {
    return email;
  }
  
  const [localPart, domain] = emailParts;
  
  // 如果本地部分少于等于3个字符，只显示第一个字符
  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }
  
  // 显示前2位和后1位，中间用*号替代
  const maskedLocal = `${localPart.substring(0, 2)}***${localPart.substring(localPart.length - 1)}`;
  return `${maskedLocal}@${domain}`;
};

/**
 * 身份证号脱敏处理
 * @param {string} idCard - 身份证号
 * @returns {string} 脱敏后的身份证号
 */
export const maskIdCard = (idCard) => {
  if (!idCard || typeof idCard !== 'string') {
    return idCard || '-';
  }
  
  // 显示前6位和后4位，中间用*号替代
  if (idCard.length === 18) {
    return `${idCard.substring(0, 6)}********${idCard.substring(14)}`;
  } else if (idCard.length === 15) {
    return `${idCard.substring(0, 6)}*****${idCard.substring(11)}`;
  }
  
  return idCard;
};

/**
 * 银行卡号脱敏处理
 * @param {string} bankCard - 银行卡号
 * @returns {string} 脱敏后的银行卡号
 */
export const maskBankCard = (bankCard) => {
  if (!bankCard || typeof bankCard !== 'string') {
    return bankCard || '-';
  }
  
  const cleanCard = bankCard.replace(/\s/g, '');
  
  // 显示前6位和后4位，中间用*号替代
  if (cleanCard.length >= 10) {
    const maskedLength = cleanCard.length - 10;
    const stars = '*'.repeat(maskedLength);
    return `${cleanCard.substring(0, 6)}${stars}${cleanCard.substring(cleanCard.length - 4)}`;
  }
  
  return bankCard;
};

/**
 * 姓名脱敏处理
 * @param {string} name - 姓名
 * @returns {string} 脱敏后的姓名
 */
export const maskName = (name) => {
  if (!name || typeof name !== 'string') {
    return name || '-';
  }
  
  if (name.length === 1) {
    return name;
  } else if (name.length === 2) {
    return `${name[0]}*`;
  } else {
    // 显示第一个字符，其余用*替代
    return `${name[0]}${'*'.repeat(name.length - 1)}`;
  }
};

/**
 * 通用脱敏处理
 * @param {string} data - 需要脱敏的数据
 * @param {string} type - 脱敏类型 phone|email|idCard|bankCard|name
 * @returns {string} 脱敏后的数据
 */
export const maskData = (data, type) => {
  switch (type) {
    case 'phone':
      return maskPhone(data);
    case 'email':
      return maskEmail(data);
    case 'idCard':
      return maskIdCard(data);
    case 'bankCard':
      return maskBankCard(data);
    case 'name':
      return maskName(data);
    default:
      return data;
  }
};

export default {
  maskPhone,
  maskEmail,
  maskIdCard,
  maskBankCard,
  maskName,
  maskData
};
