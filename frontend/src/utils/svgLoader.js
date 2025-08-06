/**
 * SVG Sprite 加载工具
 * 用于动态加载SVG文件并生成SVG sprite
 */

// 创建SVG sprite容器
const createSvgSprite = () => {
  // 检查是否已经存在sprite容器
  let svgSprite = document.getElementById('svg-sprite');
  
  if (!svgSprite) {
    svgSprite = document.createElement('div');
    svgSprite.id = 'svg-sprite';
    svgSprite.style.position = 'absolute';
    svgSprite.style.width = '0';
    svgSprite.style.height = '0';
    svgSprite.style.overflow = 'hidden';
    svgSprite.innerHTML = '<svg><defs></defs></svg>';
    document.body.insertBefore(svgSprite, document.body.firstChild);
  }
  
  return svgSprite;
};

// 添加SVG symbol到sprite中
const addSvgSymbol = (id, svgContent) => {
  const sprite = createSvgSprite();
  const svg = sprite.querySelector('svg');
  
  // 检查是否已经存在相同的symbol
  if (svg.querySelector(`#${id}`)) {
    return;
  }
  
  // 解析SVG内容并提取path等元素
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = svgContent;
  const svgElement = tempDiv.querySelector('svg');
  
  if (svgElement) {
    // 创建symbol元素
    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    symbol.id = id;
    
    // 复制viewBox属性
    if (svgElement.getAttribute('viewBox')) {
      symbol.setAttribute('viewBox', svgElement.getAttribute('viewBox'));
    } else {
      symbol.setAttribute('viewBox', '0 0 24 24'); // 默认viewBox
    }
    
    // 复制SVG的内容到symbol中
    symbol.innerHTML = svgElement.innerHTML;
    
    // 添加到sprite中
    svg.appendChild(symbol);
  }
};

// 批量加载SVG文件
const loadSvgIcons = () => {
  // 使用require.context获取所有SVG文件
  const requireContext = require.context('@/assets/Icon/svg', false, /\.svg$/);
  
  requireContext.keys().forEach(path => {
    // 获取文件名（去掉路径和扩展名）
    const fileName = path.replace('./', '').replace('.svg', '');
    
    // 获取SVG内容
    const svgModule = requireContext(path);
    const svgContent = svgModule.default || svgModule;
    
    // 如果是字符串（SVG内容），直接使用
    if (typeof svgContent === 'string') {
      addSvgSymbol(fileName, svgContent);
    }
    // 如果是URL（webpack处理后的），需要fetch获取内容
    else if (typeof svgContent === 'string' && svgContent.startsWith('/')) {
      fetch(svgContent)
        .then(response => response.text())
        .then(text => addSvgSymbol(fileName, text))
        .catch(err => console.warn(`Failed to load SVG: ${fileName}`, err));
    }
  });
};

// 手动定义图标映射，确保图标能正确显示
const iconDefinitions = {
  'component': '<svg viewBox="0 0 1024 1024"><path d="M512 64l256 256v384L512 960 256 704V320L512 64z m0 128L384 320v256l128 128 128-128V320L512 192z"/></svg>',
  'shop': '<svg viewBox="0 0 1024 1024"><path d="M882 272.1V144c0-17.7-14.3-32-32-32H174c-17.7 0-32 14.3-32 32v128.1c-16.7 1-30 14.9-30 31.9v131.7a177 177 0 0 0 14.4 70.4c4.3 10.2 9.6 19.8 15.6 28.9v345c0 17.6 14.3 32 32 32h274V736h138v186h274c17.7 0 32-14.4 32-32V535a175 175 0 0 0 15.6-28.9A177 177 0 0 0 924 435.7V304c0-17-13.3-30.9-30-31.9z"/></svg>',
  'goods': '<svg viewBox="0 0 1024 1024"><path d="M832 312H696v-16c0-101.6-82.4-184-184-184s-184 82.4-184 184v16H192c-17.7 0-32 14.3-32 32v536c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V344c0-17.7-14.3-32-32-32zM398 296c0-62.8 51.2-114 114-114s114 51.2 114 114v16H398v-16zm434 586H192V384h128v88c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-88h240v88c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-88h128v498z"/></svg>',
  'orders': '<svg viewBox="0 0 1024 1024"><path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216v494z"/></svg>',
  'users': '<svg viewBox="0 0 1024 1024"><path d="M824.2 699.9a301.55 301.55 0 0 0-86.4-60.4C783.1 602.8 812 546.8 812 484c0-110.8-92.4-201.7-203.2-200-109.1 1.7-197 90.6-197 200 0 62.8 29 118.8 74.2 155.5a301.55 301.55 0 0 0-86.4 60.4C345 754.6 314 826.8 312 903.8a8 8 0 0 0 8 8.2h56c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5A226.62 226.62 0 0 1 612 684c60.9 0 118.2 23.7 161.3 66.8C814.5 792 838 846.3 839.9 904.3c.1 4.3 3.7 7.7 8 7.7h56a8 8 0 0 0 8-8.2c-2-77-33-149.2-87.7-203.9z"/></svg>'
};

// 初始化函数 - 手动创建图标sprite
const initSvgSprite = () => {
  createSvgSprite();
  
  // 添加手动定义的图标
  Object.entries(iconDefinitions).forEach(([name, svgContent]) => {
    addSvgSymbol(`icon-${name}`, svgContent);
  });
  
  // 尝试加载文件系统中的图标
  try {
    loadSvgIcons();
  } catch (error) {
    console.warn('无法动态加载SVG图标，使用预定义图标:', error);
  }
  
  console.log('SVG sprite 初始化完成');
};

export default initSvgSprite;
