// 导入SVG加载器
import initSvgSprite from '@/utils/svgLoader';

// 使用 require.context 获取指定文件夹下的所有 SVG 文件
const importAll = (r) => {
  const svgs = {}
  r.keys().map((key) => {
    return (svgs[key] = r(key))
  })
  return Object.keys(svgs)
}

// ✅ 这行代码会自动导入所有 SVG 文件到 sprite 中
const iconList = importAll(require.context('@/assets/Icon/svg', false, /\.svg$/))

// 获取图标为icon-(*).svg名称数组, 例如[shouye, xitong, hedie, ...]
export const getNameList = () => {
  const regex = /icon-(.*?)\.svg/
  return iconList.map((item) => item.match(regex)[1])
}

// 初始化SVG sprite
initSvgSprite();
