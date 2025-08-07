// Live2D 模型预设管理器
import { LIVE2D_MODELS } from './config';

// 用户喜好存储键
const STORAGE_KEY = 'live2d_user_preferences';

// 获取用户偏好设置
export const getUserPreferences = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      favoriteModel: LIVE2D_MODELS.LOCAL.shizuku,
      modelHistory: [],
      autoSwitch: false,
      switchInterval: 30000, // 30秒
    };
  } catch (error) {
    console.error('获取用户偏好失败:', error);
    return {
      favoriteModel: LIVE2D_MODELS.LOCAL.shizuku,
      modelHistory: [],
      autoSwitch: false,
      switchInterval: 30000,
    };
  }
};

// 保存用户偏好设置
export const saveUserPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('保存用户偏好失败:', error);
  }
};

// 添加模型到历史记录
export const addToHistory = (model) => {
  const preferences = getUserPreferences();
  const history = preferences.modelHistory || [];
  
  // 移除重复项
  const filteredHistory = history.filter(item => item.jsonPath !== model.jsonPath);
  
  // 添加到开头，限制历史记录数量
  const newHistory = [model, ...filteredHistory].slice(0, 10);
  
  saveUserPreferences({
    ...preferences,
    modelHistory: newHistory,
  });
};

// 设置收藏模型
export const setFavoriteModel = (model) => {
  const preferences = getUserPreferences();
  saveUserPreferences({
    ...preferences,
    favoriteModel: model,
  });
};

// 获取推荐模型列表（基于历史使用）
export const getRecommendedModels = () => {
  const preferences = getUserPreferences();
  const history = preferences.modelHistory || [];
  
  // 如果历史记录少于3个，返回默认推荐
  if (history.length < 3) {
    return [
      LIVE2D_MODELS.LOCAL.shizuku,
      LIVE2D_MODELS.LOCAL.catBlack,
      LIVE2D_MODELS.LOCAL.bilibili22,
    ];
  }
  
  // 返回最近使用的前3个
  return history.slice(0, 3);
};

// 获取所有本地模型的使用统计
export const getModelStats = () => {
  const preferences = getUserPreferences();
  const history = preferences.modelHistory || [];
  
  const stats = {};
  Object.values(LIVE2D_MODELS.LOCAL).forEach(model => {
    stats[model.jsonPath] = {
      model,
      usageCount: history.filter(item => item.jsonPath === model.jsonPath).length,
      lastUsed: history.find(item => item.jsonPath === model.jsonPath)?.timestamp || null,
    };
  });
  
  return stats;
};

// 根据时间获取推荐模型（早晚不同风格）
export const getTimeBasedRecommendation = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    // 早晨：选择活泼可爱的模型
    return LIVE2D_MODELS.LOCAL.catWhite || LIVE2D_MODELS.LOCAL.shizuku;
  } else if (hour >= 12 && hour < 18) {
    // 下午：选择清新自然的模型
    return LIVE2D_MODELS.LOCAL.bilibili22 || LIVE2D_MODELS.LOCAL.catBlack;
  } else if (hour >= 18 && hour < 22) {
    // 傍晚：选择成熟稳重的模型
    return LIVE2D_MODELS.LOCAL.hk416 || LIVE2D_MODELS.LOCAL.xisitina;
  } else {
    // 夜晚：选择温和安静的模型
    return LIVE2D_MODELS.LOCAL.catBlack || LIVE2D_MODELS.LOCAL.shizuku;
  }
};
