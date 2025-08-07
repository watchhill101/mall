// Live2D 模型配置
export const LIVE2D_MODELS = {
  // 在线模型
  ONLINE: {
    shizuku: {
      name: '雪花 (Shizuku)',
      jsonPath: 'https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json',
      description: '可爱活泼的小女孩'
    },
    koharu: {
      name: '小春 (Koharu)', 
      jsonPath: 'https://unpkg.com/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json',
      description: '清新自然的少女'
    },
    hijiki: {
      name: '海藻 (Hijiki)',
      jsonPath: 'https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json', 
      description: '成熟稳重的女性'
    },
    tororo: {
      name: '多萝萝 (Tororo)',
      jsonPath: 'https://unpkg.com/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json',
      description: '活泼开朗的女孩'
    },
    izumi: {
      name: '泉水 (Izumi)',
      jsonPath: 'https://unpkg.com/live2d-widget-model-izumi@1.0.5/assets/izumi.model.json',
      description: '温柔可人的少女'
    }
  },
  
  // 本地模型（基于 public/live2d/ 目录中的实际资源）
  LOCAL: {
    shizuku: {
      name: '雪花 (Shizuku)',
      jsonPath: '/live2d/shizuku/shizuku.model.json',
      description: '可爱活泼的雪花少女'
    },
    bilibili22: {
      name: 'B站看板娘 22',
      jsonPath: '/live2d/bilibili-22/index.json',
      description: 'B站经典看板娘角色'
    },
    bilibili33: {
      name: 'B站看板娘 33',
      jsonPath: '/live2d/bilibili-33/index.json',
      description: 'B站另一款看板娘角色'
    },
    catBlack: {
      name: '黑猫',
      jsonPath: '/live2d/cat-black/model.json',
      description: '可爱的黑色小猫咪'
    },
    catWhite: {
      name: '白猫',
      jsonPath: '/live2d/cat-white/model.json',
      description: '纯洁的白色小猫咪'
    },
    hk416: {
      name: 'HK416',
      jsonPath: '/live2d/HK416-2-normal/model.json',
      description: '少女前线角色 HK416'
    },
    xisitina: {
      name: '希丝汀娜',
      jsonPath: '/live2d/xisitina/model.json',
      description: '优雅的希丝汀娜'
    }
  }
};

// 默认模型配置 - 使用本地雪花模型
export const DEFAULT_MODEL = LIVE2D_MODELS.LOCAL.shizuku;

// Live2D 显示配置
export const LIVE2D_CONFIG = {
  display: {
    position: 'fixed',
    width: 200,
    height: 300,
    hOffset: 0,
    vOffset: 0,
  },
  mobile: {
    show: true,
    scale: 0.8,
  },
  name: {
    canvas: 'live2dcanvas',
    div: 'live2d-widget',
  },
  react: {
    opacity: 0.8,
  },
  dev: {
    border: false,
  },
  dialog: {
    enable: false, // 禁用默认对话框，我们自己实现
  },
};

// 获取随机模型
export const getRandomModel = (modelType = 'ONLINE') => {
  const models = Object.values(LIVE2D_MODELS[modelType]);
  return models[Math.floor(Math.random() * models.length)];
};

// 根据名称获取模型
export const getModelByName = (name, modelType = 'ONLINE') => {
  return LIVE2D_MODELS[modelType][name] || DEFAULT_MODEL;
};
