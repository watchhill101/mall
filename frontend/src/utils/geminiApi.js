import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyAwl5nQoO4nz-3N-0dvc2dNdyNwUO2cs6k');

/**
 * 与 Gemini AI 对话
 * @param {string} message - 用户输入的消息
 * @returns {Promise<string>} - AI 回复的消息
 */
export async function askGemini(message) {
  try {
    console.log('🤖 发送消息给 Gemini:', message);
    
    // 添加系统提示，让AI更像一个可爱的助手
    const prompt = `你是一个可爱友善的AI助手，请用温暖、亲切的语气回答用户的问题。用户问题：${message}`;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini 回复:', text);
    return text;
  } catch (error) {
    console.error('❌ Gemini API 调用失败:', error);
    
    // 根据错误类型返回不同的友好提示
    if (error.message?.includes('API key')) {
      return '抱歉，API密钥有问题，请联系管理员检查配置。';
    } else if (error.message?.includes('quota')) {
      return '抱歉，今日API调用次数已达上限，请明天再试。';
    } else if (error.message?.includes('network')) {
      return '网络连接有问题，请检查网络后重试。';
    } else {
      return '抱歉，我暂时无法回答您的问题，请稍后再试。';
    }
  }
}

/**
 * 语音转文字（如果需要的话）
 * @param {Blob} audioBlob - 音频数据
 * @returns {Promise<string>} - 转换后的文字
 */
export async function speechToText(audioBlob) {
  // 这里可以集成语音识别API
  // 暂时返回占位符
  return '语音转文字功能待实现';
}

/**
 * 文字转语音（如果需要的话）
 * @param {string} text - 要转换的文字
 * @returns {Promise<void>}
 */
export async function textToSpeech(text) {
  try {
    // 使用浏览器内置的语音合成API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; // 设置中文
      utterance.rate = 0.9; // 语速
      utterance.pitch = 1.1; // 音调，稍微高一点显得更可爱
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error('❌ 文字转语音失败:', error);
  }
}
