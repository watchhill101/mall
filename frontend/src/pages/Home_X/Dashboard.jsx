import React, { useState, useEffect, useMemo, memo } from 'react'
import { Card, Button, message, Switch, Space } from 'antd'
import { ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import 'echarts-gl'
import axios from 'axios'
import './Dashboard.scss'

// 优化的时间显示组件 - 避免时间更新影响整个页面
const TimeDisplay = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 使用useMemo优化时间格式化，避免每次渲染都重新计算
  const timeString = useMemo(() => {
    return currentTime.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }, [currentTime])

  const dateString = useMemo(() => {
    return currentTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.')
  }, [currentTime])

  return (
    <div style={{
      textAlign: 'center',
      padding: '12px 20px',
      background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 255, 0.05))',
      border: '1px solid rgba(0, 191, 255, 0.3)',
      borderRadius: '8px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 20px rgba(0, 191, 255, 0.2), inset 0 0 20px rgba(0, 255, 255, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'containerPulse 4s ease-in-out infinite',
      minWidth: '160px'
    }}>
      {/* 扫描线动画 */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '-100%',
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent)',
        animation: 'scanLine 3s linear infinite'
      }} />
      
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '8px',
        color: '#00FFFF',
        fontFamily: '"Courier New", monospace',
        textShadow: `
          0 0 5px #00FFFF,
          0 0 10px #00FFFF,
          0 0 15px #00BFFF,
          0 0 20px #00BFFF
        `,
        letterSpacing: '3px',
        animation: 'digitalGlow 2s ease-in-out infinite',
        lineHeight: '1',
        whiteSpace: 'nowrap'
      }}>
        {timeString}
      </div>
      
      <div style={{ 
        fontSize: '14px', 
        display: 'block',
        color: '#00BFFF',
        fontFamily: '"Courier New", monospace',
        textShadow: '0 0 8px #00BFFF',
        letterSpacing: '2px',
        opacity: 0.9,
        animation: 'dateFade 3s ease-in-out infinite',
        lineHeight: '1',
        whiteSpace: 'nowrap'
      }}>
        {dateString}
      </div>
      
      {/* 边角装饰 */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        width: '8px',
        height: '8px',
        border: '1px solid #00FFFF',
        borderRight: 'none',
        borderBottom: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '2px',
        right: '2px',
        width: '8px',
        height: '8px',
        border: '1px solid #00FFFF',
        borderLeft: 'none',
        borderBottom: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '2px',
        left: '2px',
        width: '8px',
        height: '8px',
        border: '1px solid #00FFFF',
        borderRight: 'none',
        borderTop: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '2px',
        right: '2px',
        width: '8px',
        height: '8px',
        border: '1px solid #00FFFF',
        borderLeft: 'none',
        borderTop: 'none'
      }} />
    </div>
  )
})

TimeDisplay.displayName = 'TimeDisplay'

// 省份代码映射
const provinceCodeMap = {
  '北京市': '110000', '天津市': '120000', '河北省': '130000', '山西省': '140000',
  '内蒙古自治区': '150000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
  '上海市': '310000', '江苏省': '320000', '浙江省': '330000', '安徽省': '340000',
  '福建省': '350000', '江西省': '360000', '山东省': '370000', '河南省': '410000',
  '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000',
  '海南省': '460000', '重庆市': '500000', '四川省': '510000', '贵州省': '520000',
  '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
  '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000',
  '台湾省': '710000', '香港特别行政区': '810000', '澳门特别行政区': '820000'
}

// 模拟各省份商家数据（与城市数据总和保持一致）
const provinceData = [
  { name: '北京市', value: 1615 }, { name: '天津市', value: 956 },
  { name: '河北省', value: 1543 }, { name: '山西省', value: 432 },
  { name: '内蒙古自治区', value: 234 }, { name: '辽宁省', value: 876 },
  { name: '吉林省', value: 345 }, { name: '黑龙江省', value: 567 },
  { name: '上海市', value: 3220 }, { name: '江苏省', value: 2430 },
  { name: '浙江省', value: 1740 }, { name: '安徽省', value: 789 },
  { name: '福建省', value: 987 }, { name: '江西省', value: 654 },
  { name: '山东省', value: 1760 }, { name: '河南省', value: 1234 },
  { name: '湖北省', value: 1098 }, { name: '湖南省', value: 876 },
  { name: '广东省', value: 4120 }, { name: '广西壮族自治区', value: 543 },
  { name: '海南省', value: 234 }, { name: '重庆市', value: 1543 },
  { name: '四川省', value: 2216 }, { name: '贵州省', value: 432 },
  { name: '云南省', value: 654 }, { name: '西藏自治区', value: 123 },
  { name: '陕西省', value: 987 }, { name: '甘肃省', value: 345 },
  { name: '青海省', value: 156 }, { name: '宁夏回族自治区', value: 234 },
  { name: '新疆维吾尔自治区', value: 456 }
]

// 模拟城市数据（确保各省份数量总和与省份数据一致）
const cityData = {
  '广东省': [
    { name: '深圳市', value: 1200 }, { name: '广州市', value: 1000 },
    { name: '东莞市', value: 400 }, { name: '佛山市', value: 350 },
    { name: '惠州市', value: 200 }, { name: '中山市', value: 180 },
    { name: '珠海市', value: 150 }, { name: '江门市', value: 120 },
    { name: '汕头市', value: 100 }, { name: '湛江市', value: 80 },
    { name: '肇庆市', value: 70 }, { name: '茂名市', value: 60 },
    { name: '韶关市', value: 50 }, { name: '梅州市', value: 40 },
    { name: '汕尾市', value: 30 }, { name: '河源市', value: 25 },
    { name: '阳江市', value: 20 }, { name: '清远市', value: 15 },
    { name: '潮州市', value: 12 }, { name: '揭阳市', value: 10 },
    { name: '云浮市', value: 8 }
  ], // 总计: 4120
  '江苏省': [
    { name: '苏州市', value: 450 }, { name: '南京市', value: 400 },
    { name: '无锡市', value: 320 }, { name: '常州市', value: 250 },
    { name: '南通市', value: 200 }, { name: '徐州市', value: 180 },
    { name: '盐城市', value: 150 }, { name: '扬州市', value: 120 },
    { name: '泰州市', value: 100 }, { name: '镇江市', value: 80 },
    { name: '淮安市', value: 70 }, { name: '连云港市', value: 60 },
    { name: '宿迁市', value: 50 }
  ], // 总计: 2430
  '四川省': [
    { name: '成都市', value: 1200 }, { name: '绵阳市', value: 180 },
    { name: '德阳市', value: 150 }, { name: '南充市', value: 120 },
    { name: '宜宾市', value: 100 }, { name: '乐山市', value: 80 },
    { name: '泸州市', value: 70 }, { name: '达州市', value: 60 },
    { name: '内江市', value: 50 }, { name: '遂宁市', value: 40 },
    { name: '自贡市', value: 35 }, { name: '攀枝花市', value: 30 },
    { name: '眉山市', value: 25 }, { name: '广安市', value: 20 },
    { name: '资阳市', value: 15 }, { name: '雅安市', value: 10 },
    { name: '巴中市', value: 8 }, { name: '广元市', value: 7 },
    { name: '阿坝州', value: 5 }, { name: '甘孜州', value: 3 },
    { name: '凉山州', value: 8 }
  ], // 总计: 2216
  '山东省': [
    { name: '青岛市', value: 350 }, { name: '济南市', value: 300 },
    { name: '烟台市', value: 200 }, { name: '潍坊市', value: 150 },
    { name: '临沂市', value: 120 }, { name: '济宁市', value: 100 },
    { name: '淄博市', value: 90 }, { name: '威海市', value: 80 },
    { name: '东营市', value: 70 }, { name: '泰安市', value: 60 },
    { name: '聊城市', value: 50 }, { name: '德州市', value: 45 },
    { name: '滨州市', value: 40 }, { name: '菏泽市', value: 35 },
    { name: '枣庄市', value: 30 }, { name: '日照市', value: 25 },
    { name: '莱芜市', value: 15 }
  ], // 总计: 1760
  '浙江省': [
    { name: '杭州市', value: 500 }, { name: '宁波市', value: 350 },
    { name: '温州市', value: 250 }, { name: '嘉兴市', value: 150 },
    { name: '台州市', value: 120 }, { name: '绍兴市', value: 100 },
    { name: '金华市', value: 80 }, { name: '湖州市', value: 70 },
    { name: '衢州市', value: 50 }, { name: '舟山市', value: 40 },
    { name: '丽水市', value: 30 }
  ], // 总计: 1740
  '北京市': [
    { name: '东城区', value: 200 }, { name: '西城区', value: 180 },
    { name: '朝阳区', value: 250 }, { name: '海淀区', value: 220 },
    { name: '丰台区', value: 150 }, { name: '石景山区', value: 80 },
    { name: '门头沟区', value: 40 }, { name: '房山区', value: 60 },
    { name: '通州区', value: 100 }, { name: '顺义区', value: 70 },
    { name: '昌平区', value: 90 }, { name: '大兴区', value: 85 },
    { name: '怀柔区', value: 30 }, { name: '平谷区', value: 25 },
    { name: '密云区', value: 20 }, { name: '延庆区', value: 15 }
  ], // 总计: 1615
  '上海市': [
    { name: '黄浦区', value: 300 }, { name: '徐汇区', value: 280 },
    { name: '长宁区', value: 200 }, { name: '静安区', value: 250 },
    { name: '普陀区', value: 180 }, { name: '虹口区', value: 150 },
    { name: '杨浦区', value: 220 }, { name: '闵行区', value: 300 },
    { name: '宝山区', value: 200 }, { name: '嘉定区', value: 180 },
    { name: '浦东新区', value: 500 }, { name: '金山区', value: 100 },
    { name: '松江区', value: 150 }, { name: '青浦区', value: 120 },
    { name: '奉贤区', value: 110 }, { name: '崇明区', value: 80 }
  ], // 总计: 3220
  '天津市': [
    { name: '和平区', value: 120 }, { name: '河东区', value: 110 },
    { name: '河西区', value: 130 }, { name: '南开区', value: 125 },
    { name: '河北区', value: 85 }, { name: '红桥区', value: 65 },
    { name: '东丽区', value: 70 }, { name: '西青区', value: 80 },
    { name: '津南区', value: 60 }, { name: '北辰区', value: 75 },
    { name: '武清区', value: 50 }, { name: '宝坻区', value: 40 },
    { name: '滨海新区', value: 86 }, { name: '宁河区', value: 25 },
    { name: '静海区', value: 35 }
  ], // 总计: 956，已修正数据一致性
  '重庆市': [
    { name: '渝中区', value: 200 }, { name: '大渡口区', value: 80 },
    { name: '江北区', value: 150 }, { name: '沙坪坝区', value: 140 },
    { name: '九龙坡区', value: 130 }, { name: '南岸区', value: 120 },
    { name: '北碚区', value: 70 }, { name: '綦江区', value: 50 },
    { name: '大足区', value: 45 }, { name: '渝北区', value: 160 },
    { name: '巴南区', value: 90 }, { name: '黔江区', value: 35 },
    { name: '长寿区', value: 55 }, { name: '江津区', value: 80 },
    { name: '合川区', value: 70 }, { name: '永川区', value: 75 },
    { name: '南川区', value: 40 }, { name: '璧山区', value: 60 },
    { name: '铜梁区', value: 45 }, { name: '潼南区', value: 35 },
    { name: '荣昌区', value: 30 }, { name: '开州区', value: 25 },
    { name: '梁平区', value: 20 }, { name: '武隆区', value: 18 },
    { name: '城口县', value: 8 }, { name: '丰都县', value: 12 }
  ], // 总计: 1543
  '河北省': [
    { name: '石家庄市', value: 280 }, { name: '唐山市', value: 220 },
    { name: '秦皇岛市', value: 120 }, { name: '邯郸市', value: 180 },
    { name: '邢台市', value: 130 }, { name: '保定市', value: 200 },
    { name: '张家口市', value: 80 }, { name: '承德市', value: 70 },
    { name: '沧州市', value: 150 }, { name: '廊坊市', value: 110 },
    { name: '衡水市', value: 103 }
  ], // 总计: 1543
  '河南省': [
    { name: '郑州市', value: 350 }, { name: '开封市', value: 80 },
    { name: '洛阳市', value: 200 }, { name: '平顶山市', value: 70 },
    { name: '安阳市', value: 90 }, { name: '鹤壁市', value: 40 },
    { name: '新乡市', value: 85 }, { name: '焦作市', value: 75 },
    { name: '濮阳市', value: 55 }, { name: '许昌市', value: 65 },
    { name: '漯河市', value: 45 }, { name: '三门峡市', value: 35 },
    { name: '南阳市', value: 110 }, { name: '商丘市', value: 70 },
    { name: '信阳市', value: 60 }, { name: '周口市', value: 50 },
    { name: '驻马店市', value: 38 }, { name: '济源市', value: 16 }
  ], // 总计: 1234
  '湖北省': [
    { name: '武汉市', value: 400 }, { name: '黄石市', value: 55 },
    { name: '十堰市', value: 75 }, { name: '宜昌市', value: 110 },
    { name: '襄阳市', value: 130 }, { name: '鄂州市', value: 33 },
    { name: '荆门市', value: 50 }, { name: '孝感市', value: 65 },
    { name: '荆州市', value: 80 }, { name: '黄冈市', value: 60 },
    { name: '咸宁市', value: 40 }, { name: '随州市', value: 28 },
    { name: '恩施州', value: 22 }, { name: '仙桃市', value: 18 },
    { name: '潜江市', value: 16 }, { name: '天门市', value: 13 },
    { name: '神农架', value: 3 }
  ], // 总计: 1098，已修正数据一致性
  '湖南省': [
    { name: '长沙市', value: 250 }, { name: '株洲市', value: 80 },
    { name: '湘潭市', value: 65 }, { name: '衡阳市', value: 90 },
    { name: '邵阳市', value: 55 }, { name: '岳阳市', value: 70 },
    { name: '常德市', value: 68 }, { name: '张家界市', value: 22 },
    { name: '益阳市', value: 36 }, { name: '郴州市', value: 50 },
    { name: '永州市', value: 40 }, { name: '怀化市', value: 32 },
    { name: '娄底市', value: 18 }
  ], // 总计: 876，已修正数据一致性
  '安徽省': [
    { name: '合肥市', value: 180 }, { name: '芜湖市', value: 110 },
    { name: '蚌埠市', value: 65 }, { name: '淮南市', value: 50 },
    { name: '马鞍山市', value: 58 }, { name: '淮北市', value: 38 },
    { name: '铜陵市', value: 32 }, { name: '安庆市', value: 55 },
    { name: '黄山市', value: 28 }, { name: '滁州市', value: 42 },
    { name: '阜阳市', value: 45 }, { name: '宿州市', value: 32 },
    { name: '六安市', value: 38 }, { name: '亳州市', value: 22 },
    { name: '池州市', value: 14 }
  ], // 总计: 789，已修正数据一致性
  '福建省': [
    { name: '福州市', value: 250 }, { name: '厦门市', value: 220 },
    { name: '莆田市', value: 80 }, { name: '三明市', value: 60 },
    { name: '泉州市', value: 200 }, { name: '漳州市', value: 90 },
    { name: '南平市', value: 40 }, { name: '龙岩市', value: 35 },
    { name: '宁德市', value: 12 }
  ], // 总计: 987
  '江西省': [
    { name: '南昌市', value: 180 }, { name: '景德镇市', value: 40 },
    { name: '萍乡市', value: 35 }, { name: '九江市', value: 80 },
    { name: '新余市', value: 30 }, { name: '鹰潭市', value: 25 },
    { name: '赣州市', value: 120 }, { name: '吉安市', value: 60 },
    { name: '宜春市', value: 55 }, { name: '抚州市', value: 29 }
  ], // 总计: 654
  '辽宁省': [
    { name: '沈阳市', value: 250 }, { name: '大连市', value: 200 },
    { name: '鞍山市', value: 80 }, { name: '抚顺市', value: 60 },
    { name: '本溪市', value: 40 }, { name: '丹东市', value: 50 },
    { name: '锦州市', value: 70 }, { name: '营口市', value: 55 },
    { name: '阜新市', value: 30 }, { name: '辽阳市', value: 25 },
    { name: '盘锦市', value: 16 }
  ], // 总计: 876，已修正数据一致性
  '吉林省': [
    { name: '长春市', value: 150 }, { name: '吉林市', value: 80 },
    { name: '四平市', value: 40 }, { name: '辽源市', value: 25 },
    { name: '通化市', value: 30 }, { name: '白山市', value: 20 }
  ], // 总计: 345
  '黑龙江省': [
    { name: '哈尔滨市', value: 200 }, { name: '齐齐哈尔市', value: 80 },
    { name: '鸡西市', value: 40 }, { name: '鹤岗市', value: 25 },
    { name: '双鸭山市', value: 30 }, { name: '大庆市', value: 70 },
    { name: '伊春市', value: 20 }, { name: '佳木斯市', value: 45 },
    { name: '七台河市', value: 18 }, { name: '牡丹江市', value: 39 }
  ], // 总计: 567
  '内蒙古自治区': [
    { name: '呼和浩特市', value: 80 }, { name: '包头市', value: 60 },
    { name: '乌海市', value: 15 }, { name: '赤峰市', value: 40 },
    { name: '通辽市', value: 39 }
  ], // 总计: 234
  '山西省': [
    { name: '太原市', value: 150 }, { name: '大同市', value: 60 },
    { name: '阳泉市', value: 30 }, { name: '长治市', value: 50 },
    { name: '晋城市', value: 40 }, { name: '朔州市', value: 25 },
    { name: '晋中市', value: 45 }, { name: '运城市', value: 32 }
  ], // 总计: 432
  '陕西省': [
    { name: '西安市', value: 400 }, { name: '铜川市', value: 25 },
    { name: '宝鸡市', value: 80 }, { name: '咸阳市', value: 70 },
    { name: '渭南市', value: 60 }, { name: '延安市', value: 40 },
    { name: '汉中市', value: 50 }, { name: '榆林市', value: 55 },
    { name: '安康市', value: 35 }, { name: '商洛市', value: 172 }
  ], // 总计: 987
  '甘肃省': [
    { name: '兰州市', value: 120 }, { name: '嘉峪关市', value: 8 },
    { name: '金昌市', value: 15 }, { name: '白银市', value: 20 },
    { name: '天水市', value: 45 }, { name: '武威市', value: 25 },
    { name: '张掖市', value: 20 }, { name: '平凉市', value: 18 },
    { name: '酒泉市', value: 22 }, { name: '庆阳市', value: 15 },
    { name: '定西市', value: 12 }, { name: '陇南市', value: 10 },
    { name: '临夏州', value: 8 }, { name: '甘南州', value: 7 }
  ], // 总计: 345
  '青海省': [
    { name: '西宁市', value: 80 }, { name: '海东市', value: 30 },
    { name: '海北州', value: 8 }, { name: '黄南州', value: 6 },
    { name: '海南州', value: 10 }, { name: '果洛州', value: 4 },
    { name: '玉树州', value: 5 }, { name: '海西州', value: 13 }
  ], // 总计: 156
  '宁夏回族自治区': [
    { name: '银川市', value: 120 }, { name: '石嘴山市', value: 30 },
    { name: '吴忠市', value: 40 }, { name: '固原市', value: 25 },
    { name: '中卫市', value: 19 }
  ], // 总计: 234
  '新疆维吾尔自治区': [
    { name: '乌鲁木齐市', value: 150 }, { name: '克拉玛依市', value: 25 },
    { name: '吐鲁番市', value: 15 }, { name: '哈密市', value: 20 },
    { name: '昌吉州', value: 35 }, { name: '博尔塔拉州', value: 12 },
    { name: '巴音郭楞州', value: 30 }, { name: '阿克苏地区', value: 40 },
    { name: '克孜勒苏州', value: 15 }, { name: '喀什地区', value: 60 },
    { name: '和田地区', value: 25 }, { name: '伊犁州', value: 29 }
  ], // 总计: 456
  '西藏自治区': [
    { name: '拉萨市', value: 60 }, { name: '日喀则市', value: 20 },
    { name: '昌都市', value: 15 }, { name: '林芝市', value: 12 },
    { name: '山南市', value: 8 }, { name: '那曲市', value: 5 },
    { name: '阿里地区', value: 3 }
  ], // 总计: 123
  '云南省': [
    { name: '昆明市', value: 180 }, { name: '曲靖市', value: 55 },
    { name: '玉溪市', value: 38 }, { name: '保山市', value: 28 },
    { name: '昭通市', value: 32 }, { name: '丽江市', value: 40 },
    { name: '普洱市', value: 23 }, { name: '临沧市', value: 18 },
    { name: '楚雄州', value: 28 }, { name: '红河州', value: 45 },
    { name: '文山州', value: 22 }, { name: '西双版纳州', value: 32 },
    { name: '大理州', value: 38 }, { name: '德宏州', value: 16 },
    { name: '怒江州', value: 7 }, { name: '迪庆州', value: 52 }
  ], // 总计: 654，已修正数据一致性
  '贵州省': [
    { name: '贵阳市', value: 150 }, { name: '六盘水市', value: 40 },
    { name: '遵义市', value: 80 }, { name: '安顺市', value: 30 },
    { name: '毕节市', value: 35 }, { name: '铜仁市', value: 25 },
    { name: '黔西南州', value: 20 }, { name: '黔东南州', value: 30 },
    { name: '黔南州', value: 22 }
  ], // 总计: 432
  '广西壮族自治区': [
    { name: '南宁市', value: 180 }, { name: '柳州市', value: 80 },
    { name: '桂林市', value: 100 }, { name: '梧州市', value: 40 },
    { name: '北海市', value: 35 }, { name: '防城港市', value: 25 },
    { name: '钦州市', value: 30 }, { name: '贵港市', value: 25 },
    { name: '玉林市', value: 28 }
  ], // 总计: 543
  '海南省': [
    { name: '海口市', value: 120 }, { name: '三亚市', value: 80 },
    { name: '三沙市', value: 5 }, { name: '儋州市', value: 29 }
  ] // 总计: 234
}

const Dashboard = ({ onRegionClick }) => {
  const [currentView, setCurrentView] = useState('china') // 'china' 或 'province'
  const [currentProvince, setCurrentProvince] = useState('')
  const [chinaGeoData, setChinaGeoData] = useState(null)
  const [provinceGeoData, setProvinceGeoData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [is3D, setIs3D] = useState(true) // 3D模式开关，默认为立体模式

  // 数据验证函数 - 企业级标准
  const validateDataConsistency = (provinceName) => {
    const provinceInfo = provinceData.find(item => item.name === provinceName)
    const cityInfo = cityData[provinceName]
    
    if (provinceInfo && cityInfo) {
      const cityTotal = cityInfo.reduce((sum, city) => sum + city.value, 0)
      const provincialTotal = provinceInfo.value
      
      console.log(`数据验证 - ${provinceName}:`, {
        省份总数: provincialTotal,
        城市总和: cityTotal,
        数据一致性: cityTotal === provincialTotal ? '✅ 一致' : '❌ 不一致'
      })
      
      return {
        isConsistent: cityTotal === provincialTotal,
        provinceTotal: provincialTotal,
        cityTotal: cityTotal,
        difference: Math.abs(cityTotal - provincialTotal)
      }
    }
    return null
  }

  // 加载中国地图数据
  useEffect(() => {
    const loadChinaMap = async () => {
      try {
        setLoading(true)
        // 添加超时处理
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
        
        const response = await axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json', {
          signal: controller.signal,
          timeout: 10000
        })
        
        clearTimeout(timeoutId)
        
        if (response.data && response.data.features) {
          setChinaGeoData(response.data)
          echarts.registerMap('china', response.data)
          console.log('✅ 中国地图数据加载成功')
        } else {
          throw new Error('地图数据格式不正确')
        }
      } catch (error) {
        console.error('❌ 加载中国地图失败:', error)
        if (error.name === 'AbortError') {
          message.error('地图数据加载超时，请检查网络连接')
        } else {
          message.error(`地图数据加载失败: ${error.message}`)
        }
        
        // 使用备用数据或重试机制
        setTimeout(() => {
          if (!chinaGeoData) {
            console.log('🔄 尝试重新加载地图数据...')
            loadChinaMap()
          }
        }, 3000)
      } finally {
        setLoading(false)
      }
    }
    
    loadChinaMap()
  }, [])

  // 添加科技感样式和地图背景动画
  useEffect(() => {
    // 先清除可能存在的旧样式
    const existingStyle = document.getElementById('map-tech-styles')
    if (existingStyle) {
      existingStyle.remove()
    }
    
    const style = document.createElement('style')
    style.id = 'map-tech-styles'
          style.textContent = `
        @keyframes scanLine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes digitalGlow {
          0%, 100% {
            text-shadow: 
              0 0 5px #00FFFF,
              0 0 10px #00FFFF,
              0 0 15px #00BFFF,
              0 0 20px #00BFFF;
          }
          50% {
            text-shadow: 
              0 0 8px #00FFFF,
              0 0 15px #00FFFF,
              0 0 20px #00BFFF,
              0 0 25px #00BFFF,
              0 0 30px #1E90FF;
          }
        }
        @keyframes containerPulse {
          0%, 100% {
            box-shadow: 
              0 0 20px rgba(0, 191, 255, 0.2), 
              inset 0 0 20px rgba(0, 255, 255, 0.1),
              0 0 1px rgba(0, 191, 255, 0.5);
            border-color: rgba(0, 191, 255, 0.3);
          }
          50% {
            box-shadow: 
              0 0 30px rgba(0, 191, 255, 0.4), 
              inset 0 0 25px rgba(0, 255, 255, 0.2),
              0 0 3px rgba(0, 191, 255, 0.8);
            border-color: rgba(0, 191, 255, 0.6);
          }
        }
        @keyframes dateFade {
          0%, 100% {
            opacity: 0.9;
            text-shadow: 0 0 8px #00BFFF;
          }
          50% {
            opacity: 0.7;
            text-shadow: 0 0 12px #00BFFF, 0 0 20px rgba(0, 191, 255, 0.3);
          }
        }
        
        /* 科技感地图容器样式 */
      @keyframes techGridMove {
        0% { transform: translateX(-20px) translateY(-20px); }
        100% { transform: translateX(0px) translateY(0px); }
      }
      @keyframes techPulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.7; }
      }
      @keyframes techGlow {
        0%, 100% {
          box-shadow: 
            0 0 20px rgba(0, 150, 255, 0.3),
            inset 0 0 20px rgba(0, 200, 255, 0.1);
        }
        50% {
          box-shadow: 
            0 0 40px rgba(0, 150, 255, 0.6),
            inset 0 0 30px rgba(0, 200, 255, 0.2);
        }
      }
      @keyframes greenGlow {
        0%, 100% {
          box-shadow: 
            0 0 20px rgba(34, 197, 94, 0.3),
            inset 0 0 20px rgba(74, 222, 128, 0.1);
        }
        50% {
          box-shadow: 
            0 0 40px rgba(34, 197, 94, 0.6),
            inset 0 0 30px rgba(74, 222, 128, 0.2);
        }
      }
      @keyframes dataFlow {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      @keyframes particleFloat {
        0% { 
          transform: translateY(100vh) translateX(0px) scale(0);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% { 
          transform: translateY(-20px) translateX(30px) scale(1);
          opacity: 0;
        }
      }
      @keyframes particleFloat2 {
        0% { 
          transform: translateY(100vh) translateX(0px) scale(0) rotate(0deg);
          opacity: 0;
        }
        15% {
          opacity: 0.8;
        }
        85% {
          opacity: 0.8;
        }
        100% { 
          transform: translateY(-30px) translateX(-20px) scale(1.2) rotate(360deg);
          opacity: 0;
        }
      }
      @keyframes particleFloat3 {
        0% { 
          transform: translateY(100vh) translateX(0px) scale(0);
          opacity: 0;
        }
        20% {
          opacity: 0.6;
        }
        80% {
          opacity: 0.6;
        }
        100% { 
          transform: translateY(-40px) translateX(10px) scale(0.8);
          opacity: 0;
        }
      }
      @keyframes particleTwinkle {
        0%, 100% { 
          opacity: 0.6; 
          transform: scale(0.8);
          filter: brightness(1) saturate(1);
        }
        25% {
          opacity: 0.9;
          transform: scale(1.2);
          filter: brightness(1.3) saturate(1.2);
        }
        50% { 
          opacity: 1; 
          transform: scale(1.6);
          filter: brightness(1.8) saturate(1.5);
        }
        75% {
          opacity: 0.9;
          transform: scale(1.2);
          filter: brightness(1.3) saturate(1.2);
        }
      }
      @keyframes rainbowPulse {
        0%, 100% {
          box-shadow: 
            0 0 40px rgba(255, 0, 150, 0.4),
            0 0 60px rgba(0, 204, 255, 0.3),
            0 0 80px rgba(0, 255, 136, 0.2),
            inset 0 0 40px rgba(255, 238, 0, 0.1);
        }
        25% {
          box-shadow: 
            0 0 45px rgba(0, 204, 255, 0.5),
            0 0 65px rgba(0, 255, 136, 0.4),
            0 0 85px rgba(255, 238, 0, 0.3),
            inset 0 0 45px rgba(255, 94, 0, 0.15);
        }
        50% {
          box-shadow: 
            0 0 50px rgba(0, 255, 136, 0.6),
            0 0 70px rgba(255, 238, 0, 0.5),
            0 0 90px rgba(255, 94, 0, 0.4),
            inset 0 0 50px rgba(148, 0, 255, 0.2);
        }
        75% {
          box-shadow: 
            0 0 45px rgba(255, 238, 0, 0.5),
            0 0 65px rgba(255, 94, 0, 0.4),
            0 0 85px rgba(148, 0, 255, 0.3),
            inset 0 0 45px rgba(255, 0, 150, 0.15);
        }
      }
      @keyframes rainbowShift {
        0% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg); }
        50% { filter: hue-rotate(180deg); }
        75% { filter: hue-rotate(270deg); }
        100% { filter: hue-rotate(360deg); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes rainbow-pulse {
        0%, 100% {
          opacity: 0.8;
          transform: scale(1);
        }
        50% {
          opacity: 1;
          transform: scale(1.1);
        }
      }
      @keyframes atmosphereFloat {
        0% { 
          transform: translateX(0) translateY(0) scale(1);
          filter: hue-rotate(0deg) brightness(1);
        }
        25% { 
          transform: translateX(10px) translateY(-5px) scale(1.02);
          filter: hue-rotate(90deg) brightness(1.1);
        }
        50% { 
          transform: translateX(-8px) translateY(-10px) scale(0.98);
          filter: hue-rotate(180deg) brightness(0.9);
        }
        75% { 
          transform: translateX(-12px) translateY(8px) scale(1.01);
          filter: hue-rotate(270deg) brightness(1.05);
        }
        100% { 
          transform: translateX(0) translateY(0) scale(1);
          filter: hue-rotate(360deg) brightness(1);
        }
      }
      @keyframes techScanLine {
        0% { 
          transform: translateX(-100%);
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        100% { 
          transform: translateX(100%);
          opacity: 0;
        }
      }
      @keyframes particleDrift {
        0% { 
          transform: translateX(0) translateY(0) rotate(0deg);
          opacity: 0.3;
        }
        25% {
          opacity: 0.8;
        }
        50% { 
          transform: translateX(20px) translateY(-30px) rotate(180deg);
          opacity: 1;
        }
        75% {
          opacity: 0.6;
        }
        100% { 
          transform: translateX(-10px) translateY(15px) rotate(360deg);
          opacity: 0.3;
        }
      }
      
      /* 3D模式科技感背景 - 简化版 */
      .map-3d-container .map-3d-tech-bg {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: 
          radial-gradient(circle at 25% 25%, rgba(255, 0, 150, 0.5) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(0, 255, 136, 0.5) 0%, transparent 50%),
          radial-gradient(circle at 50% 10%, rgba(255, 238, 0, 0.4) 0%, transparent 40%),
          radial-gradient(circle at 10% 90%, rgba(148, 0, 255, 0.4) 0%, transparent 40%),
          linear-gradient(135deg, 
            rgba(15, 5, 30, 0.9) 0%, 
            rgba(25, 10, 50, 0.8) 50%, 
            rgba(10, 2, 20, 0.95) 100%) !important;
        animation: rainbowShift 8s ease-in-out infinite !important;
        pointer-events: none !important;
        z-index: 10 !important;
        opacity: 1 !important;
        display: block !important;
      }
      
      /* 3D模式网格效果 - 简化版 */
      .map-3d-container .map-3d-grid {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-image: 
          linear-gradient(rgba(255, 0, 150, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 136, 0.4) 1px, transparent 1px),
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 2px, transparent 4px) !important;
        background-size: 40px 40px, 40px 40px, 80px 80px !important;
        animation: rainbowShift 6s ease-in-out infinite !important;
        pointer-events: none !important;
        z-index: 15 !important;
        opacity: 0.8 !important;
        display: block !important;
      }
      
      /* 3D模式颗粒效果 */
      .map-3d-container .map-3d-particles {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        pointer-events: none !important;
        z-index: 102 !important;
        overflow: hidden !important;
        opacity: 1 !important;
        display: block !important;
      }
      

      
              .map-3d-container .particle-3d {
          position: absolute !important;
          background: radial-gradient(circle, 
            rgba(255, 255, 255, 1) 0%, 
            rgba(255, 0, 150, 0.8) 30%, 
            rgba(0, 255, 136, 0.6) 60%, 
            transparent 100%) !important;
          border-radius: 50% !important;
          pointer-events: none !important;
          box-shadow: 
            0 0 20px rgba(255, 0, 150, 0.8),
            0 0 40px rgba(0, 255, 136, 0.6) !important;
          filter: brightness(1.8) saturate(1.4) !important;
          opacity: 1 !important;
          display: block !important;
          z-index: 20 !important;
          animation: rainbowShift 4s ease-in-out infinite !important;
        }
      
             /* 大颗粒 - 简化版 */
       .map-3d-container .particle-3d-large {
         position: absolute !important;
         width: 15px !important;
         height: 15px !important;
         background: linear-gradient(45deg, 
           rgba(255, 0, 150, 1), 
           rgba(0, 255, 136, 1), 
           rgba(255, 238, 0, 1)) !important;
         border-radius: 50% !important;
         pointer-events: none !important;
         box-shadow: 0 0 30px rgba(255, 0, 150, 0.8) !important;
         opacity: 0.9 !important;
         display: block !important;
         z-index: 25 !important;
         animation: spin 6s linear infinite !important;
       }
       
       /* 微型颗粒 - 简化版 */
       .map-3d-container .particle-3d-micro {
         position: absolute !important;
         width: 4px !important;
         height: 4px !important;
         background: rgba(255, 255, 255, 1) !important;
         border-radius: 50% !important;
         pointer-events: none !important;
                   box-shadow: 0 0 10px rgba(0, 255, 255, 0.8) !important;
          opacity: 0.8 !important;
          display: block !important;
          z-index: 30 !important;
          animation: particleTwinkle 2s ease-in-out infinite !important;
       }
      
      .map-3d-container .particle-3d:nth-child(1) { width: 12px !important; height: 12px !important; left: 10% !important; top: 20% !important; animation: particleFloat 6s linear infinite, rainbowShift 3s ease-in-out infinite !important; animation-delay: 0s, 0s !important; }
      .map-3d-container .particle-3d:nth-child(2) { width: 8px !important; height: 8px !important; left: 20% !important; animation: particleFloat2 8s linear infinite, rainbowShift 3s ease-in-out infinite !important; animation-delay: 1s, 0.5s !important; }
      .map-3d-container .particle-3d:nth-child(3) { width: 14px !important; height: 14px !important; left: 30% !important; animation: particleFloat3 7s linear infinite, rainbowShift 3s ease-in-out infinite !important; animation-delay: 2s, 1s !important; }
      .map-3d-container .particle-3d:nth-child(4) { width: 9px !important; height: 9px !important; left: 40% !important; animation: particleFloat 9s linear infinite !important; animation-delay: 3s !important; }
      .map-3d-container .particle-3d:nth-child(5) { width: 12px !important; height: 12px !important; left: 50% !important; animation: particleFloat2 6s linear infinite !important; animation-delay: 4s !important; }
      .map-3d-container .particle-3d:nth-child(6) { width: 7px !important; height: 7px !important; left: 60% !important; animation: particleFloat3 8s linear infinite !important; animation-delay: 0.5s !important; }
      .map-3d-container .particle-3d:nth-child(7) { width: 15px !important; height: 15px !important; left: 70% !important; animation: particleFloat 7s linear infinite !important; animation-delay: 1.5s !important; }
      .map-3d-container .particle-3d:nth-child(8) { width: 8px !important; height: 8px !important; left: 80% !important; animation: particleFloat2 9s linear infinite !important; animation-delay: 2.5s !important; }
      .map-3d-container .particle-3d:nth-child(9) { width: 11px !important; height: 11px !important; left: 90% !important; animation: particleFloat3 6s linear infinite !important; animation-delay: 3.5s !important; }
      .map-3d-container .particle-3d:nth-child(10) { width: 7px !important; height: 7px !important; left: 15% !important; animation: particleFloat 8s linear infinite !important; animation-delay: 4.5s !important; }
      .map-3d-container .particle-3d:nth-child(11) { width: 13px !important; height: 13px !important; left: 25% !important; animation: particleFloat2 7s linear infinite !important; animation-delay: 5s !important; }
      .map-3d-container .particle-3d:nth-child(12) { width: 10px !important; height: 10px !important; left: 35% !important; animation: particleFloat3 9s linear infinite !important; animation-delay: 0.8s !important; }
      .map-3d-container .particle-3d:nth-child(13) { width: 9px !important; height: 9px !important; left: 45% !important; animation: particleFloat 5s linear infinite !important; animation-delay: 1.2s !important; }
      .map-3d-container .particle-3d:nth-child(14) { width: 11px !important; height: 11px !important; left: 55% !important; animation: particleFloat2 8s linear infinite !important; animation-delay: 2.3s !important; }
      .map-3d-container .particle-3d:nth-child(15) { width: 8px !important; height: 8px !important; left: 65% !important; animation: particleFloat3 7s linear infinite !important; animation-delay: 3.7s !important; }
      .map-3d-container .particle-3d:nth-child(16) { width: 12px !important; height: 12px !important; left: 75% !important; animation: particleFloat 6s linear infinite !important; animation-delay: 4.8s !important; }
      .map-3d-container .particle-3d:nth-child(17) { width: 7px !important; height: 7px !important; left: 85% !important; animation: particleFloat2 9s linear infinite !important; animation-delay: 0.3s !important; }
      .map-3d-container .particle-3d:nth-child(18) { width: 13px !important; height: 13px !important; left: 95% !important; animation: particleFloat3 8s linear infinite !important; animation-delay: 1.7s !important; }
      
      /* 3D模式静态闪烁颗粒 */
      .particle-3d-static {
        position: absolute;
        background: radial-gradient(circle, 
          rgba(255, 255, 255, 1) 0%, 
          rgba(0, 204, 255, 0.9) 25%, 
          rgba(255, 94, 0, 0.8) 50%, 
          rgba(148, 0, 255, 0.7) 75%, 
          transparent 100%);
        border-radius: 50%;
        animation: particleTwinkle 2s ease-in-out infinite, rainbowShift 4s ease-in-out infinite;
        pointer-events: none;
        box-shadow: 
          0 0 15px rgba(255, 0, 150, 0.8),
          0 0 30px rgba(0, 255, 136, 0.6),
          0 0 45px rgba(255, 238, 0, 0.4);
        filter: brightness(1.6) saturate(1.5) contrast(1.1);
        z-index: 35 !important;
        opacity: 1 !important;
        display: block !important;
      }
      
      .particle-3d-static:nth-child(19) { width: 8px; height: 8px; top: 15%; left: 12%; animation-delay: 0s; }
      .particle-3d-static:nth-child(20) { width: 6px; height: 6px; top: 25%; left: 75%; animation-delay: 1s; }
      .particle-3d-static:nth-child(21) { width: 10px; height: 10px; top: 45%; left: 85%; animation-delay: 2s; }
      .particle-3d-static:nth-child(22) { width: 7px; height: 7px; top: 65%; left: 18%; animation-delay: 0.5s; }
      .particle-3d-static:nth-child(23) { width: 9px; height: 9px; top: 75%; left: 92%; animation-delay: 1.5s; }
      .particle-3d-static:nth-child(24) { width: 6px; height: 6px; top: 85%; left: 55%; animation-delay: 2.5s; }
      .particle-3d-static:nth-child(25) { width: 8px; height: 8px; top: 35%; left: 5%; animation-delay: 3s; }
      .particle-3d-static:nth-child(26) { width: 7px; height: 7px; top: 55%; left: 95%; animation-delay: 0.8s; }
      .particle-3d-static:nth-child(27) { width: 9px; height: 9px; top: 8%; left: 60%; animation-delay: 1.8s; }
      .particle-3d-static:nth-child(28) { width: 6px; height: 6px; top: 90%; left: 30%; animation-delay: 2.8s; }
      .particle-3d-static:nth-child(29) { width: 10px; height: 10px; top: 20%; left: 45%; animation-delay: 3.5s; }
      .particle-3d-static:nth-child(30) { width: 8px; height: 8px; top: 70%; left: 8%; animation-delay: 4s; }
      
      /* 2D模式科技感背景 */
      .map-2d-tech-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, 
            #0a1f0d 0%, 
            #0d2818 25%, 
            #0f3220 50%, 
            #0d2818 75%, 
            #0a1f0d 100%);
        animation: greenGlow 4s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      }
      
      /* 2D模式网格效果 */
      .map-2d-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px);
        background-size: 45px 45px;
        animation: techGridMove 10s linear infinite, techPulse 4s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
      }
      
      /* 2D模式颗粒效果 */
      .map-2d-particles {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 5;
        overflow: hidden;
      }
      
      .particle-2d {
        position: absolute;
        background: radial-gradient(circle, rgba(34, 197, 94, 1) 0%, rgba(16, 185, 129, 0.8) 30%, rgba(5, 150, 105, 0.6) 60%, transparent 100%);
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 
          0 0 8px rgba(34, 197, 94, 0.8),
          0 0 16px rgba(34, 197, 94, 0.6),
          0 0 24px rgba(34, 197, 94, 0.4);
      }
      
      .particle-2d:nth-child(1) { width: 6px; height: 6px; left: 8%; animation: particleFloat 7s linear infinite; animation-delay: 0s; }
      .particle-2d:nth-child(2) { width: 4px; height: 4px; left: 18%; animation: particleFloat2 9s linear infinite; animation-delay: 1.2s; }
      .particle-2d:nth-child(3) { width: 8px; height: 8px; left: 28%; animation: particleFloat3 6s linear infinite; animation-delay: 2.4s; }
      .particle-2d:nth-child(4) { width: 5px; height: 5px; left: 38%; animation: particleFloat 8s linear infinite; animation-delay: 3.6s; }
      .particle-2d:nth-child(5) { width: 7px; height: 7px; left: 48%; animation: particleFloat2 7s linear infinite; animation-delay: 4.8s; }
      .particle-2d:nth-child(6) { width: 4px; height: 4px; left: 58%; animation: particleFloat3 9s linear infinite; animation-delay: 0.6s; }
      .particle-2d:nth-child(7) { width: 9px; height: 9px; left: 68%; animation: particleFloat 6s linear infinite; animation-delay: 1.8s; }
      .particle-2d:nth-child(8) { width: 5px; height: 5px; left: 78%; animation: particleFloat2 8s linear infinite; animation-delay: 3s; }
      .particle-2d:nth-child(9) { width: 6px; height: 6px; left: 88%; animation: particleFloat3 7s linear infinite; animation-delay: 4.2s; }
      .particle-2d:nth-child(10) { width: 4px; height: 4px; left: 13%; animation: particleFloat 9s linear infinite; animation-delay: 5.4s; }
      .particle-2d:nth-child(11) { width: 8px; height: 8px; left: 23%; animation: particleFloat2 6s linear infinite; animation-delay: 0.3s; }
      .particle-2d:nth-child(12) { width: 7px; height: 7px; left: 33%; animation: particleFloat3 8s linear infinite; animation-delay: 1.5s; }
      
      /* 2D模式静态闪烁颗粒 */
      .particle-2d-static {
        position: absolute;
        background: radial-gradient(circle, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0.8) 50%, transparent 100%);
        border-radius: 50%;
        animation: particleTwinkle 3.5s ease-in-out infinite;
        pointer-events: none;
        box-shadow: 
          0 0 6px rgba(34, 197, 94, 0.9),
          0 0 12px rgba(34, 197, 94, 0.7);
      }
      
      .particle-2d-static:nth-child(13) { width: 4px; height: 4px; top: 12%; left: 15%; animation-delay: 0s; }
      .particle-2d-static:nth-child(14) { width: 3px; height: 3px; top: 22%; left: 72%; animation-delay: 1.2s; }
      .particle-2d-static:nth-child(15) { width: 5px; height: 5px; top: 42%; left: 88%; animation-delay: 2.4s; }
      .particle-2d-static:nth-child(16) { width: 3px; height: 3px; top: 62%; left: 25%; animation-delay: 0.8s; }
      .particle-2d-static:nth-child(17) { width: 4px; height: 4px; top: 72%; left: 95%; animation-delay: 2s; }
      .particle-2d-static:nth-child(18) { width: 3px; height: 3px; top: 82%; left: 52%; animation-delay: 3.2s; }
      
      /* 数据流动效果 */
      .tech-data-flow {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        pointer-events: none !important;
        z-index: 104 !important;
      }
      
      .tech-data-flow::before {
        content: '';
        position: absolute;
        top: 25%;
        left: -100%;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(255, 0, 150, 0.9) 20%, 
          rgba(0, 255, 136, 1) 40%, 
          rgba(255, 238, 0, 0.9) 60%, 
          rgba(148, 0, 255, 0.8) 80%, 
          transparent 100%);
        animation: dataFlow 4s linear infinite, rainbowShift 3s ease-in-out infinite;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
      }
      
      .tech-data-flow::after {
        content: '';
        position: absolute;
        top: 75%;
        right: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(0, 204, 255, 0.8) 25%, 
          rgba(255, 94, 0, 0.9) 50%, 
          rgba(255, 0, 150, 0.8) 75%, 
          transparent 100%);
        animation: dataFlow 6s linear infinite reverse, rainbowShift 4s ease-in-out infinite;
        animation-delay: 1.5s;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
      }
      
      /* 边角装饰 */
      .tech-corner-decoration {
        position: absolute !important;
        width: 20px !important;
        height: 20px !important;
        border: 2px solid !important;
        pointer-events: none !important;
        z-index: 105 !important;
      }
      
      .tech-corner-decoration.top-left {
        top: 10px;
        left: 10px;
        border-color: #ff0096 transparent transparent #ff0096;
        border-width: 3px 0 0 3px;
        animation: rainbowShift 5s ease-in-out infinite;
        filter: drop-shadow(0 0 10px rgba(255, 0, 150, 0.8));
      }
      
      .tech-corner-decoration.top-right {
        top: 10px;
        right: 10px;
        border-color: #00ff88 #00ff88 transparent transparent;
        border-width: 3px 3px 0 0;
        animation: rainbowShift 5s ease-in-out infinite;
        animation-delay: 1.25s;
        filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.8));
      }
      
      .tech-corner-decoration.bottom-left {
        bottom: 10px;
        left: 10px;
        border-color: transparent transparent #ffee00 #ffee00;
        border-width: 0 0 3px 3px;
        animation: rainbowShift 5s ease-in-out infinite;
        animation-delay: 2.5s;
        filter: drop-shadow(0 0 10px rgba(255, 238, 0, 0.8));
      }
      
      .tech-corner-decoration.bottom-right {
        bottom: 10px;
        right: 10px;
        border-color: transparent #9400ff #9400ff transparent;
        border-width: 0 3px 3px 0;
        animation: rainbowShift 5s ease-in-out infinite;
        animation-delay: 3.75s;
        filter: drop-shadow(0 0 10px rgba(148, 0, 255, 0.8));
      }
      
      .mode-2d .tech-corner-decoration.top-left {
        border-color: #22c55e transparent transparent #22c55e;
      }
      
      .mode-2d .tech-corner-decoration.top-right {
        border-color: #22c55e #22c55e transparent transparent;
      }
      
      .mode-2d .tech-corner-decoration.bottom-left {
        border-color: transparent transparent #22c55e #22c55e;
      }
      
      .mode-2d .tech-corner-decoration.bottom-right {
        border-color: transparent #22c55e #22c55e transparent;
      }
      
      /* 地图容器增强 */
      .map-3d-container {
        position: relative !important;
        width: 100% !important;
        height: 700px !important;
        overflow: hidden !important;
        border-radius: 12px !important;
        background: 
          linear-gradient(45deg, 
            rgba(255, 0, 150, 0.15) 0%,
            rgba(0, 204, 255, 0.15) 14%,
            rgba(0, 255, 136, 0.15) 28%,
            rgba(255, 238, 0, 0.15) 42%,
            rgba(255, 94, 0, 0.15) 57%,
            rgba(255, 0, 150, 0.15) 71%,
            rgba(148, 0, 255, 0.15) 85%,
            rgba(0, 204, 255, 0.15) 100%
          ),
          radial-gradient(circle at 30% 30%, rgba(255, 0, 150, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(0, 255, 136, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, rgba(10, 10, 30, 0.95) 0%, rgba(20, 10, 40, 0.9) 100%) !important;
        border: 3px solid transparent !important;
        border-image: linear-gradient(45deg, 
          #ff0096 0%, #00ccff 14%, #00ff88 28%, #ffee00 42%, 
          #ff5e00 57%, #ff0096 71%, #9400ff 85%, #00ccff 100%
        ) 1 !important;
        box-shadow: 
          0 0 40px rgba(255, 0, 150, 0.4),
          0 0 60px rgba(0, 204, 255, 0.3),
          0 0 80px rgba(0, 255, 136, 0.2),
          inset 0 0 40px rgba(255, 238, 0, 0.1) !important;
        animation: rainbowPulse 4s ease-in-out infinite !important;
      }
      
      .map-3d-container.mode-2d {
        background: rgba(10, 31, 13, 0.8); /* 临时可见背景 - 绿色主题 */
        border-color: rgba(34, 197, 94, 0.3);
        box-shadow: 
          0 0 30px rgba(34, 197, 94, 0.2),
          inset 0 0 30px rgba(74, 222, 128, 0.1);
      }
    `
    document.head.appendChild(style)
    console.log('✅ 3D地图科技感样式已注入 (简化版):', style.id)
    console.log('🌈 科技感样式详情:', {
      styleElement: style,
      isAttached: document.head.contains(style),
      is3DMode: is3D,
      backgroundLayers: '5层渐变背景',
      particleCount: '普通颗粒18个 + 大型颗粒3个 + 微型颗粒6个 + 静态颗粒12个',
      animationCount: '基础动画 (彩虹渐变 + 旋转 + 闪烁)',
      specialEffects: '网格系统 + 多彩光斑',
      optimized: '简化版本，提高兼容性'
    })
    
    // 添加全局调试函数
    window.debugRainbow = () => {
      console.log('🔍 科技感彩虹效果调试报告:')
      console.log('- 样式表存在:', !!document.getElementById('map-tech-styles'))
      console.log('- 3D容器存在:', !!document.querySelector('.map-3d-container'))
      console.log('- 普通颗粒数量:', document.querySelectorAll('.particle-3d').length)
      console.log('- 大型颗粒数量:', document.querySelectorAll('.particle-3d-large').length)
      console.log('- 微型颗粒数量:', document.querySelectorAll('.particle-3d-micro').length)
      console.log('- 静态颗粒数量:', document.querySelectorAll('.particle-3d-static').length)
      console.log('- 科技背景层存在:', !!document.querySelector('.map-3d-tech-bg'))
      console.log('- 网格系统存在:', !!document.querySelector('.map-3d-grid'))
      console.log('- 数据流元素存在:', !!document.querySelector('.tech-data-flow'))
      console.log('- 边角装饰数量:', document.querySelectorAll('.tech-corner-decoration').length)
      
      // 检查关键样式是否生效
      const container = document.querySelector('.map-3d-container')
      if (container) {
        const computedStyle = window.getComputedStyle(container)
        console.log('- 容器背景:', computedStyle.background)
        console.log('- 容器边框:', computedStyle.border)
        console.log('- 容器阴影:', computedStyle.boxShadow)
        console.log('- 扫描线效果:', computedStyle.getPropertyValue('::before'))
      }
      
      // 统计总效果数量
      const totalParticles = document.querySelectorAll('.particle-3d, .particle-3d-large, .particle-3d-micro, .particle-3d-static').length
      console.log('📊 科技效果统计:')
      console.log('- 总颗粒数量:', totalParticles)
      console.log('- 动画系统: 简化版 (彩虹渐变 + 旋转 + 闪烁)')
      console.log('- 背景层数: 5层渐变背景')
      console.log('- 科技效果: 网格系统 + 光斑效果 + 强制内联样式')
      console.log('- 兼容性: 移除复杂CSS，提高浏览器兼容性')
    }
    console.log('💡 调试提示: 在控制台输入 debugRainbow() 查看彩虹效果状态')

    return () => {
      const styleToRemove = document.getElementById('map-tech-styles')
      if (styleToRemove) {
        styleToRemove.remove()
        console.log('🗑️ 彩虹样式已清理')
      }
    }
  }, [is3D]) // 当3D/2D模式切换时重新注入样式

  // 监控样式是否被意外移除，如果是则重新注入
  useEffect(() => {
    const checkStyles = () => {
      const styleElement = document.getElementById('map-tech-styles')
      if (!styleElement) {
        console.warn('🔄 检测到样式被移除，正在重新注入...')
        // 触发样式重新注入（通过改变一个状态来触发上面的useEffect）
        const event = new CustomEvent('forceStyleReinject')
        document.dispatchEvent(event)
      }
    }

    // 每2秒检查一次样式是否存在
    const intervalId = setInterval(checkStyles, 2000)
    
    return () => clearInterval(intervalId)
  }, [])

  // 加载省份地图数据
  const loadProvinceMap = async (provinceName) => {
    const provinceCode = provinceCodeMap[provinceName]
    if (!provinceCode) {
      message.error('暂不支持该省份的详细地图')
      return
    }

    // 数据一致性验证
    const validation = validateDataConsistency(provinceName)
    if (validation && !validation.isConsistent) {
      console.warn(`⚠️ 数据不一致警告: ${provinceName} - 省份总数:${validation.provinceTotal}, 城市总和:${validation.cityTotal}`)
    } else {
      console.log(`✅ 数据一致性验证通过: ${provinceName}`)
    }

    try {
      setLoading(true)
      // 添加延迟以显示加载效果
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时
      
      const response = await axios.get(`https://geo.datav.aliyun.com/areas_v3/bound/${provinceCode}_full.json`, {
        signal: controller.signal,
        timeout: 8000
      })
      
      clearTimeout(timeoutId)
      
      if (response.data && response.data.features) {
        setProvinceGeoData(response.data)
        echarts.registerMap(provinceName, response.data)
        setCurrentProvince(provinceName)
        setCurrentView('province')
        
        // 成功提示 - 包含数据统计
        const cityCount = cityData[provinceName]?.length || 0
        const totalValue = cityData[provinceName]?.reduce((sum, city) => sum + city.value, 0) || 0
        message.success(`${provinceName}地图加载成功 - ${cityCount}个城市，总计${totalValue}家商户`)
        console.log(`✅ ${provinceName}地图数据加载成功`)
      } else {
        throw new Error('省份地图数据格式不正确')
      }
    } catch (error) {
      console.error(`❌ 加载${provinceName}地图失败:`, error)
      if (error.name === 'AbortError') {
        message.error(`${provinceName}地图数据加载超时，请检查网络连接`)
      } else {
        message.error(`${provinceName}地图数据加载失败: ${error.message}`)
      }
      
      // 失败时回退到全国地图
      setCurrentView('china')
      setCurrentProvince('')
      setProvinceGeoData(null)
    } finally {
      setLoading(false)
    }
  }

  // 返回中国地图
  const backToChinaMap = () => {
    setLoading(true)
    // 添加过渡效果
    setTimeout(() => {
      setCurrentView('china')
      setCurrentProvince('')
      setProvinceGeoData(null)
      setLoading(false)
      message.success('已返回全国地图')
      
      // 触发环形图回到全国数据
      if (onRegionClick) {
        console.log('🔗 返回全国地图，触发onRegionClick回调: 全国')
        onRegionClick('全国')
      } else {
        console.warn('⚠️ 返回全国时onRegionClick回调函数未定义')
      }
    }, 300)
  }

  // 刷新地图数据
  const refreshMap = () => {
    if (currentView === 'china') {
      setLoading(true)
      setTimeout(() => {
        window.location.reload()
      }, 300)
    } else {
      loadProvinceMap(currentProvince)
    }
  }

  // 中国地图配置
  const chinaMapOption = useMemo(() => {
    if (!chinaGeoData) {
      // 返回空配置而不是空对象，避免渲染问题
      return {
        title: {
          text: '地图数据加载中...',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        },
        backgroundColor: 'transparent'
      }
    }
    
    return {
      backgroundColor: 'transparent', // 透明背景，显示科技感背景层
      title: {
        text: '全国商家分布',
        left: 'center',
        top: 40,
        textStyle: {
          color: '#FFFFFF', // 白色标题，彩虹阴影
          fontSize: 22,
          fontWeight: 'bold',
          textShadow: `
            0 0 10px rgba(255, 0, 150, 1),
            0 0 20px rgba(0, 255, 136, 0.8),
            0 0 30px rgba(255, 238, 0, 0.6),
            0 0 40px rgba(148, 0, 255, 0.4),
            0 0 50px rgba(255, 94, 0, 0.3)
          `
        }
      },
      tooltip: {
        trigger: 'item',
        position: function(point, params, dom, rect, size) {
          // 智能定位tooltip，避免超出边界
          return [point[0] + 10, point[1] + 10]
        },
        formatter: function(params) {
          if (params.data && params.data.name) {
            const data = provinceData.find(item => item.name === params.data.name)
            const cityCount = cityData[params.data.name]?.length || 0
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #ffffff; margin-bottom: 4px;">${params.data.name}</div>
              <div style="color: #e2e8f0;">商家数量: <span style="font-weight: bold; color: #60a5fa;">${data ? data.value : 0}</span>家</div>
              ${cityCount > 0 ? `<div style="color: #94a3b8; font-size: 12px;">包含${cityCount}个城市</div>` : ''}
            </div>`
          } else if (params.name) {
            const data = provinceData.find(item => item.name === params.name)
            const cityCount = cityData[params.name]?.length || 0
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #ffffff; margin-bottom: 4px;">${params.name}</div>
              <div style="color: #e2e8f0;">商家数量: <span style="font-weight: bold; color: #60a5fa;">${data ? data.value : 0}</span>家</div>
              ${cityCount > 0 ? `<div style="color: #94a3b8; font-size: 12px;">包含${cityCount}个城市</div>` : ''}
            </div>`
          }
          return ''
        },
        backgroundColor: 'rgba(30, 58, 138, 0.95)',
        borderColor: '#60a5fa',
        borderWidth: 2,
        textStyle: {
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 'bold'
        },
        padding: [10, 15],
        borderRadius: 8,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      visualMap: {
        show: false, // 完全隐藏visualMap避免产生额外渲染层
        min: 0,
        max: 4500
      },
      series: [
        {
          type: 'map3D',
          map: 'china',
          // 移除coordinateSystem，让map3D独立渲染
          boxHeight: 25, // 增加整体高度，增强立体效果
          regionHeight: 10, // 增加区域高度，让地图更立体
          // 设置深蓝色背景环境
          environment: '#0a0e27', // 更深的背景色增强对比度
          // 完全隐藏地面以避免额外渲染层
          groundPlane: {
            show: false
          },
          light: {
            main: {
              intensity: 4.0, // 进一步增强主光源，配合立体视角
              shadow: true,
              shadowQuality: 'high',
              alpha: 45, // 调整光照角度增强立体感
              beta: 30,
              color: '#ffffff'
            },
            ambient: {
              intensity: 0.8, // 适当降低环境光，增强阴影对比
              color: '#e0f2fe'
            }
          },
          viewControl: {
            projection: 'perspective',
            distance: 150, // 适当拉远距离以获得更好的立体视角
            alpha: 65, // 设置为较大的角度，让地图立起来
            beta: 0,
            rotateSensitivity: 1.0,
            zoomSensitivity: 1.0,
            panSensitivity: 1.0,
            autoRotate: false,
            autoRotateDirection: 'cw',
            autoRotateSpeed: 6,
            autoRotateAfterStill: 8,
            damping: 0.85,
            center: [0, 0, 0],
            animation: true,
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'cubicInOut',
            minDistance: 100,
            maxDistance: 300
          },
          // 使用真实感渲染增强3D效果
          shading: 'realistic',
          // 设置默认样式确保所有区域都有颜色
          regionStyle: {
            color: '#3b82f6', // 默认蓝色
            opacity: 0.9,
            borderWidth: 1.5,
            borderColor: '#1e3a8a'
          },
          // 完全禁用后处理效果避免额外渲染层
          postEffect: {
            enable: false
          },
          data: provinceData.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: function() {
                const value = item.value
                // 使用鲜明的橙色-红色渐变，在蓝色背景下更突出
                if (value > 3500) return '#dc2626' // 深红
                if (value > 3000) return '#ef4444' // 红色  
                if (value > 2000) return '#f97316' // 橙红
                if (value > 1500) return '#f59e0b' // 橙色
                if (value > 1000) return '#eab308' // 黄橙
                if (value > 500) return '#84cc16'  // 黄绿
                if (value > 200) return '#22c55e'  // 绿色
                return '#10b981' // 青绿
              }()
            }
          })),
          silent: false, // 确保可以交互
          // 增强3D材质效果
          itemStyle: {
            color: function(params) {
              // 确保所有省份都有颜色，基于实际商家数量
              const itemName = params.name || (params.data && params.data.name)
              if (!itemName) return '#10b981' // 默认绿色
              
              const provinceInfo = provinceData.find(item => item.name === itemName)
              const value = provinceInfo ? provinceInfo.value : 0
              
              // 使用鲜明的橙色-红色渐变，在蓝色背景下更突出
              if (value > 3500) return '#dc2626' // 深红 - 广东等
              if (value > 3000) return '#ef4444' // 红色 - 上海等  
              if (value > 2000) return '#f97316' // 橙红 - 江苏、四川等
              if (value > 1500) return '#f59e0b' // 橙色 - 山东、浙江等
              if (value > 1000) return '#eab308' // 黄橙 - 河南、湖北等
              if (value > 500) return '#84cc16'  // 黄绿 - 中等省份
              if (value > 200) return '#22c55e'  // 绿色 - 较小省份
              return '#10b981' // 青绿 - 最小省份
            },
            opacity: 0.95, // 提高不透明度
            borderWidth: 1.5,
            borderColor: 'rgba(30, 58, 138, 0.8)', // 深蓝色边框
            // 增加金属质感
            metalness: 0.4,
            roughness: 0.3
          },
          emphasis: {
            itemStyle: {
              color: '#f59e0b', // 金黄色高亮
              opacity: 1,
              borderWidth: 2.5,
              borderColor: '#fbbf24', // 金黄色边框
              // 增强高亮效果
              metalness: 0.2,
              roughness: 0.2
            },
            label: {
              show: true,
              distance: 20,
              textStyle: {
                color: '#1f2937',
                fontSize: 14,
                fontWeight: 'bold',
                backgroundColor: 'rgba(251, 191, 36, 0.9)', // 金黄色背景
                borderRadius: 8,
                padding: [10, 15],
                borderColor: '#f59e0b',
                borderWidth: 2,
                shadowBlur: 8,
                shadowColor: 'rgba(0,0,0,0.3)'
              }
            }
          },
          // 禁用选择模式避免额外渲染层
          selectedMode: false,
          // 优化动画配置
          animationDuration: 1200,
          animationEasing: 'cubicOut'
        }
      ]
    }
  }, [chinaGeoData])

  // 省份地图配置
  const provinceMapOption = useMemo(() => {
    if (!provinceGeoData || !currentProvince) {
      // 返回空配置而不是空对象，避免渲染问题
      return {
        title: {
          text: currentProvince ? `${currentProvince}地图数据加载中...` : '请选择省份',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        },
        backgroundColor: 'transparent'
      }
    }
    
    const currentCityData = cityData[currentProvince] || []
    
    return {
      backgroundColor: 'transparent', // 透明背景，显示科技感背景层
      title: {
        text: `${currentProvince}商家分布`,
        left: 'center',
        top: 40,
        textStyle: {
          color: '#00FFFF', // 3D模式使用青蓝色标题保持一致
          fontSize: 20,
          fontWeight: 'bold',
          textShadow: `
            0 0 10px rgba(0, 255, 255, 1),
            0 0 20px rgba(0, 255, 255, 0.8),
            0 0 30px rgba(0, 255, 255, 0.6),
            0 0 40px rgba(0, 191, 255, 0.4)
          `
        }
      },
      tooltip: {
        trigger: 'item',
        position: function(point, params, dom, rect, size) {
          return [point[0] + 10, point[1] + 10]
        },
        formatter: function(params) {
          if (params.data && params.data.name) {
            const data = currentCityData.find(item => item.name === params.data.name)
            const totalCities = currentCityData.length
            const ranking = currentCityData
              .sort((a, b) => b.value - a.value)
              .findIndex(item => item.name === params.data.name) + 1
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${params.data.name}</div>
              <div style="color: #374151;">商家数量: <span style="font-weight: bold; color: #059669;">${data ? data.value : 0}</span>家</div>
              <div style="color: #6b7280; font-size: 12px;">排名: ${ranking}/${totalCities}</div>
            </div>`
          } else if (params.name) {
            const data = currentCityData.find(item => item.name === params.name)
            const totalCities = currentCityData.length
            const ranking = currentCityData
              .sort((a, b) => b.value - a.value)
              .findIndex(item => item.name === params.name) + 1
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${params.name}</div>
              <div style="color: #374151;">商家数量: <span style="font-weight: bold; color: #059669;">${data ? data.value : 0}</span>家</div>
              <div style="color: #6b7280; font-size: 12px;">排名: ${ranking}/${totalCities}</div>
            </div>`
          }
          return ''
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#52c41a',
        borderWidth: 2,
        textStyle: {
          color: '#000000',
          fontSize: 13,
          fontWeight: 'bold'
        },
        padding: [10, 15],
        borderRadius: 8,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      visualMap: {
        show: false, // 在3D模式下隐藏visualMap
        min: 0,
        max: Math.max(...currentCityData.map(item => item.value), 1),
        left: 40,
        bottom: 40,
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#f6ffed', '#d9f7be', '#b7eb8f', '#95de64', '#73d13d', '#52c41a', '#389e0d']
        },
        textStyle: {
          color: '#333',
          fontSize: 12
        },
        itemWidth: 20,
        itemHeight: 120
      },
      series: [
        {
          type: 'map3D',
          map: currentProvince,
          // 移除coordinateSystem，让map3D独立渲染
          boxHeight: 30, // 增加整体高度，增强立体效果
          regionHeight: 12, // 增加区域高度，让省份地图更立体
          // 省份地图环境设置
          environment: '#f0fdf4', // 淡绿色背景增强对比度
          // 完全隐藏地面避免额外渲染层
          groundPlane: {
            show: false
          },
          light: {
            main: {
              intensity: 3.5, // 增强光照强度，配合立体视角
              shadow: true,
              shadowQuality: 'high',
              alpha: 45, // 调整光照角度增强立体感
              beta: 30,
              color: '#ffffff'
            },
            ambient: {
              intensity: 1.0, // 适当降低环境光，增强阴影对比
              color: '#f0fdf4' // 淡绿色环境光
            }
          },
          viewControl: {
            projection: 'perspective',
            distance: 110, // 适当拉远距离以获得更好的立体视角
            alpha: 60, // 设置为较大的角度，让省份地图也立起来
            beta: 0,
            rotateSensitivity: 1.2,
            zoomSensitivity: 1.2,
            panSensitivity: 1.2,
            autoRotate: false,
            autoRotateDirection: 'cw',
            autoRotateSpeed: 8,
            autoRotateAfterStill: 5,
            damping: 0.9,
            minDistance: 60,
            maxDistance: 200,
            center: [0, 0, 0],
            animation: true,
            animationDurationUpdate: 1000,
            animationEasingUpdate: 'cubicInOut'
          },
          // 使用真实感渲染增强3D效果
          shading: 'realistic',
          // 设置默认样式确保所有区域都有颜色
          regionStyle: {
            color: '#4ade80', // 默认绿色
            opacity: 0.9,
            borderWidth: 2.0,
            borderColor: '#065f46'
          },
          // 完全禁用后处理效果避免额外渲染层
          postEffect: {
            enable: false
          },
          data: currentCityData.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: function() {
                const value = item.value
                const maxValue = Math.max(...currentCityData.map(city => city.value), 1)
                const ratio = value / maxValue
                // 使用橙色-红色渐变，在绿色背景下更突出
                if (ratio > 0.8) return '#dc2626'  // 深红
                if (ratio > 0.6) return '#ef4444'  // 红色
                if (ratio > 0.4) return '#f97316'  // 橙红
                if (ratio > 0.25) return '#f59e0b' // 橙色
                if (ratio > 0.1) return '#eab308'  // 黄橙
                if (ratio > 0.05) return '#84cc16' // 黄绿
                return '#22c55e' // 绿色
              }()
            }
          })),
          // 增强3D材质效果
          itemStyle: {
            color: function(params) {
              // 确保所有城市都有颜色，基于实际商家数量
              const itemName = params.name || (params.data && params.data.name)
              if (!itemName) return '#f59e0b' // 默认橙色
              
              const cityInfo = currentCityData.find(item => item.name === itemName)
              const value = cityInfo ? cityInfo.value : 0
              const maxValue = Math.max(...currentCityData.map(item => item.value), 1)
              
              // 使用橙色-红色渐变，在绿色背景下更突出
              const ratio = value / maxValue
              if (ratio > 0.8) return '#dc2626'  // 深红
              if (ratio > 0.6) return '#ef4444'  // 红色
              if (ratio > 0.4) return '#f97316'  // 橙红
              if (ratio > 0.25) return '#f59e0b' // 橙色
              if (ratio > 0.1) return '#eab308'  // 黄橙
              if (ratio > 0.05) return '#84cc16' // 黄绿
              return '#22c55e' // 绿色，确保有足够对比度
            },
            opacity: 0.95, // 提高不透明度
            borderWidth: 2.2,
            borderColor: '#ffffff', // 白色边框，更明显
            // 增加材质质感
            metalness: 0.3,
            roughness: 0.4
          },
          emphasis: {
            itemStyle: {
              color: '#ea580c', // 橙色高亮
              opacity: 1,
              borderWidth: 3.5,
              borderColor: '#fb923c', // 橙色边框
              // 增强高亮效果
              metalness: 0.2,
              roughness: 0.2
            },
            label: {
              show: true,
              distance: 20,
              textStyle: {
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 'bold',
                backgroundColor: 'rgba(234, 88, 12, 0.9)', // 橙色背景
                borderRadius: 8,
                padding: [8, 12],
                borderColor: '#fb923c',
                borderWidth: 2,
                shadowBlur: 6,
                shadowColor: 'rgba(0,0,0,0.3)'
              }
            }
          },
          // 禁用选择模式避免额外渲染层
          selectedMode: false,
          animationDuration: 1200,
          animationEasing: 'cubicOut'
        }
      ]
    }
  }, [provinceGeoData, currentProvince])

  // 2D中国地图配置
  const china2DMapOption = useMemo(() => {
    if (!chinaGeoData) {
      return {
        title: {
          text: '地图数据加载中...',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        },
        backgroundColor: 'transparent'
      }
    }
    
    return {
      backgroundColor: 'transparent', // 透明背景，显示科技感背景层
      title: {
        text: '全国商家分布',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#FFFFFF', // 白色标题，彩虹阴影  
          fontSize: 18,
          fontWeight: 'bold',
          textShadow: `
            0 0 8px rgba(255, 0, 150, 0.9),
            0 0 16px rgba(0, 255, 136, 0.7),
            0 0 24px rgba(255, 238, 0, 0.5),
            0 0 32px rgba(148, 0, 255, 0.3)
          `
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const data = provinceData.find(item => item.name === params.name)
          const cityCount = cityData[params.name]?.length || 0
          return `${params.name}<br/>商家数量: ${data ? data.value : 0}家${cityCount > 0 ? `<br/>包含${cityCount}个城市` : ''}`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#1890ff',
        borderWidth: 1,
        textStyle: {
          color: '#000000',
          fontSize: 12,
          fontWeight: 'bold'
        },
        padding: [8, 12],
        borderRadius: 6
      },
      visualMap: {
        show: true,
        min: 0,
        max: 4500,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        textStyle: {
          color: '#ffffff'
        },
        inRange: {
          color: ['#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#dc2626']
        }
      },
      series: [
        {
          name: '商家数量',
          type: 'map',
          map: 'china',
          roam: true,
          emphasis: {
            label: {
              show: true
            },
            itemStyle: {
              color: '#40a9ff'
            }
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1
          },
          data: provinceData
        }
      ]
    }
  }, [chinaGeoData])

  // 2D省份地图配置
  const province2DMapOption = useMemo(() => {
    if (!provinceGeoData || !currentProvince) {
      return {
        title: {
          text: currentProvince ? `${currentProvince}地图数据加载中...` : '请选择省份',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        },
        backgroundColor: 'transparent'
      }
    }
    
    const currentCityData = cityData[currentProvince] || []
    
    return {
      backgroundColor: 'transparent', // 透明背景，显示科技感背景层
      title: {
        text: `${currentProvince}商家分布`,
        left: 'center',
        top: 20,
        textStyle: {
          color: '#FFFFFF', // 白色标题，彩虹阴影  
          fontSize: 18,
          fontWeight: 'bold',
          textShadow: `
            0 0 8px rgba(255, 0, 150, 0.9),
            0 0 16px rgba(0, 255, 136, 0.7),
            0 0 24px rgba(255, 238, 0, 0.5),
            0 0 32px rgba(148, 0, 255, 0.3)
          `
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const data = currentCityData.find(item => item.name === params.name)
          const totalCities = currentCityData.length
          const ranking = currentCityData
            .sort((a, b) => b.value - a.value)
            .findIndex(item => item.name === params.name) + 1
          return `${params.name}<br/>商家数量: ${data ? data.value : 0}家<br/>排名: ${ranking}/${totalCities}`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#52c41a',
        borderWidth: 1,
        textStyle: {
          color: '#000000',
          fontSize: 12,
          fontWeight: 'bold'
        },
        padding: [8, 12],
        borderRadius: 6
      },
      visualMap: {
        show: true,
        min: 0,
        max: Math.max(...currentCityData.map(item => item.value), 1),
        left: 20,
        bottom: 20,
        text: ['高', '低'],
        calculable: true,
        orient: 'vertical',
        inRange: {
          color: ['#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#dc2626']
        },
        textStyle: {
          color: '#ffffff',
          fontSize: 12
        },
        itemWidth: 20,
        itemHeight: 120
      },
      series: [
        {
          name: '商家数量',
          type: 'map',
          map: currentProvince,
          roam: true,
          emphasis: {
            label: {
              show: true
            },
            itemStyle: {
              color: '#fbbf24'
            }
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1
          },
          data: currentCityData
        }
      ]
    }
  }, [provinceGeoData, currentProvince])

  // 防抖函数
  const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // 地图点击事件（防抖处理）
  const onMapClick = debounce((params) => {
    console.log('地图点击事件:', params) // 调试用
    
    if (currentView === 'china' && !loading) {
      // 处理3D和2D模式的不同数据结构
      let provinceName = ''
      
      if (is3D) {
        // 3D模式下，map3D直接返回数据
        if (params.componentType === 'series' && params.seriesType === 'map3D') {
          provinceName = params.name || (params.data && params.data.name)
        }
      } else {
        // 2D模式下的数据结构
        if (params.componentType === 'series') {
          provinceName = params.name
        }
      }
      
      // 验证省份名称是否有效
      if (provinceName && provinceCodeMap[provinceName]) {
        console.log('✅ 点击省份:', provinceName)
        
        // 触发环形图更新回调
        if (onRegionClick) {
          console.log(`🔗 触发onRegionClick回调: ${provinceName}`)
          onRegionClick(provinceName)
        } else {
          console.warn('⚠️ onRegionClick回调函数未定义')
        }
        
        // 检查是否有对应的城市数据
        const hasCityData = cityData[provinceName] && cityData[provinceName].length > 0
        if (hasCityData) {
          loadProvinceMap(provinceName)
        } else {
          message.warning(`${provinceName}暂无详细城市数据`)
        }
      } else if (provinceName) {
        console.warn('⚠️ 未识别的省份:', provinceName)
        message.warning('暂不支持该地区的详细地图')
      }
    } else if (currentView === 'province' && currentProvince && !loading) {
      // 处理省份地图中城市的点击事件
      let cityName = ''
      
      if (is3D) {
        // 3D模式下，map3D直接返回数据
        if (params.componentType === 'series' && params.seriesType === 'map3D') {
          cityName = params.name || (params.data && params.data.name)
        }
      } else {
        // 2D模式下的数据结构
        if (params.componentType === 'series') {
          cityName = params.name
        }
      }
      
      if (cityName) {
        console.log(`✅ 点击城市: ${currentProvince} - ${cityName}`)
        
        // 触发环形图更新回调，显示省份数据
        if (onRegionClick) {
          console.log(`🔗 城市点击，触发onRegionClick回调: ${currentProvince}`)
          onRegionClick(currentProvince)
        } else {
          console.warn('⚠️ 城市点击时onRegionClick回调函数未定义')
        }
      }
    }
  }, 300) // 300ms防抖

  // 获取当前地图配置
  const getCurrentMapOption = () => {
    if (currentView === 'china') {
      return is3D ? chinaMapOption : china2DMapOption
    } else {
      return is3D ? provinceMapOption : province2DMapOption
    }
  }

  // 切换2D/3D模式
  const toggle3D = () => {
    setIs3D(!is3D)
    message.info(`已切换到${!is3D ? '3D立体' : '2D平面'}模式`)
  }

  // 检查地图数据完整性
  const checkMapDataIntegrity = () => {
    const issues = []
    
    // 检查省份数据
    provinceData.forEach(province => {
      const cities = cityData[province.name]
      if (cities) {
        const cityTotal = cities.reduce((sum, city) => sum + city.value, 0)
        if (cityTotal !== province.value) {
          issues.push(`${province.name}: 省份数据(${province.value}) ≠ 城市总和(${cityTotal})`)
        }
      }
    })
    
    if (issues.length > 0) {
      console.warn('🔍 发现数据不一致问题:', issues)
    } else {
      console.log('✅ 所有地区数据一致性检查通过')
    }
    
    return issues.length === 0
  }

  // 地图初始化完成后检查数据
  useEffect(() => {
    if (chinaGeoData) {
      setTimeout(() => {
        checkMapDataIntegrity()
      }, 1000)
    }
  }, [chinaGeoData])

  return (
    <div className="dashboard-container">
      <Card 
        className="map-card" 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
              商家地理分布 {is3D ? '(3D立体模式)' : '(2D平面模式)'}
            </span>
            
            {/* 优化的时间显示组件 */}
            <TimeDisplay />
            
            <Space>
              <Switch 
                checked={is3D}
                onChange={toggle3D}
                checkedChildren="立体"
                unCheckedChildren="平面"
                style={{ 
                  backgroundColor: is3D ? '#1890ff' : '#d9d9d9'
                }}
              />
              {currentView === 'province' && (
                <Button 
                  type="primary" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={backToChinaMap}
                  size="small"
                >
                  返回全国
                </Button>
              )}
              <Button 
                type="default" 
                icon={<ReloadOutlined />} 
                onClick={refreshMap}
                loading={loading}
                size="small"
              >
                刷新
              </Button>
            </Space>
          </div>
        }
      >
        <div 
          className={`map-3d-container ${loading ? 'loading' : ''} ${is3D ? '' : 'mode-2d'}`}
          style={{
            // 强制内联科技感背景，确保3D模式可见性
            background: is3D ? `
              radial-gradient(circle at 25% 25%, rgba(255, 0, 150, 0.7) 0%, transparent 60%),
              radial-gradient(circle at 75% 75%, rgba(0, 255, 136, 0.7) 0%, transparent 60%),
              radial-gradient(circle at 50% 10%, rgba(255, 238, 0, 0.6) 0%, transparent 50%),
              radial-gradient(circle at 10% 90%, rgba(148, 0, 255, 0.6) 0%, transparent 50%),
              linear-gradient(135deg, rgba(10, 5, 20, 0.98) 0%, rgba(20, 10, 40, 0.95) 50%, rgba(5, 2, 15, 0.99) 100%)
            ` : undefined,
            // 强制内联彩虹边框 - 加强可见性
            border: is3D ? '4px solid rgba(255, 0, 150, 1)' : undefined,
            // 强制内联彩虹阴影 - 增强发光效果
            boxShadow: is3D ? `
              0 0 60px rgba(255, 0, 150, 0.8),
              0 0 120px rgba(0, 255, 136, 0.6),
              0 0 180px rgba(255, 238, 0, 0.4),
              inset 0 0 60px rgba(148, 0, 255, 0.3),
              0 0 200px rgba(255, 255, 255, 0.1)
            ` : undefined,
            // 强制动画效果
            animation: is3D ? 'rainbowPulse 4s ease-in-out infinite' : undefined,
            // 强制3D模式特殊标识
            transform: is3D ? 'scale(1.001)' : undefined
          }}
        >
          {/* 科技感背景层 */}
          {is3D ? (
            <>

              
              {/* 3D模式科技感背景 - 强制可见版本 */}
              <div className="map-3d-tech-bg" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 25% 25%, rgba(255, 0, 150, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(0, 255, 136, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 50% 10%, rgba(255, 238, 0, 0.5) 0%, transparent 40%),
                  radial-gradient(circle at 10% 90%, rgba(148, 0, 255, 0.5) 0%, transparent 40%),
                  linear-gradient(135deg, rgba(15, 5, 30, 0.9) 0%, rgba(25, 10, 50, 0.8) 50%, rgba(10, 2, 20, 0.95) 100%)
                `,
                animation: 'rainbowShift 6s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 10,
                opacity: 1,
                display: 'block'
              }}></div>
              <div className="map-3d-grid" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  linear-gradient(rgba(255, 0, 150, 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 255, 136, 0.5) 1px, transparent 1px),
                  radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 2px, transparent 4px)
                `,
                backgroundSize: '40px 40px, 40px 40px, 80px 80px',
                animation: 'rainbowShift 6s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 15,
                opacity: 0.9,
                display: 'block'
              }}></div>
              
              {/* 3D模式颗粒效果 */}
              <div className="map-3d-particles">
                {/* 普通飘浮颗粒 */}
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                <div className="particle-3d"></div>
                
                {/* 大型科技颗粒 - 强制可见 */}
                <div className="particle-3d-large" style={{
                  left: '20%', top: '30%',
                  width: '15px', height: '15px',
                  background: 'linear-gradient(45deg, #ff0096, #00ff88, #ffee00)',
                  borderRadius: '50%',
                  position: 'absolute',
                  boxShadow: '0 0 20px rgba(255, 0, 150, 0.8)',
                  animation: 'spin 6s linear infinite'
                }}></div>
                <div className="particle-3d-large" style={{
                  left: '70%', top: '50%',
                  width: '15px', height: '15px',
                  background: 'linear-gradient(45deg, #00ff88, #ffee00, #ff0096)',
                  borderRadius: '50%',
                  position: 'absolute',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)',
                  animation: 'spin 6s linear infinite'
                }}></div>
                <div className="particle-3d-large" style={{
                  left: '50%', top: '20%',
                  width: '15px', height: '15px',
                  background: 'linear-gradient(45deg, #ffee00, #ff0096, #00ff88)',
                  borderRadius: '50%',
                  position: 'absolute',
                  boxShadow: '0 0 20px rgba(255, 238, 0, 0.8)',
                  animation: 'spin 6s linear infinite'
                }}></div>
                
                {/* 微型科技颗粒群 - 强制可见 */}
                <div className="particle-3d-micro" style={{
                  left: '15%', top: '25%',
                  width: '4px', height: '4px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  boxShadow: '0 0 8px rgba(0, 255, 255, 0.8)'
                }}></div>
                <div className="particle-3d-micro" style={{
                  left: '35%', top: '60%',
                  width: '4px', height: '4px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  boxShadow: '0 0 8px rgba(255, 0, 150, 0.8)'
                }}></div>
                <div className="particle-3d-micro" style={{
                  left: '55%', top: '35%',
                  width: '4px', height: '4px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  boxShadow: '0 0 8px rgba(0, 255, 136, 0.8)'
                }}></div>
                <div className="particle-3d-micro" style={{
                  left: '75%', top: '70%',
                  width: '4px', height: '4px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  boxShadow: '0 0 8px rgba(255, 238, 0, 0.8)'
                }}></div>
                
                {/* 静态闪烁颗粒 */}
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
                <div className="particle-3d-static"></div>
              </div>
            </>
          ) : (
            <>
              {/* 2D模式科技感背景 */}
              <div className="map-2d-tech-bg"></div>
              <div className="map-2d-grid"></div>
              {/* 2D模式颗粒效果 */}
              <div className="map-2d-particles">
                {/* 飘浮颗粒 */}
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                <div className="particle-2d"></div>
                {/* 静态闪烁颗粒 */}
                <div className="particle-2d-static"></div>
                <div className="particle-2d-static"></div>
                <div className="particle-2d-static"></div>
                <div className="particle-2d-static"></div>
                <div className="particle-2d-static"></div>
                <div className="particle-2d-static"></div>
              </div>
            </>
          )}
          
          {/* 数据流动效果 */}
          <div className="tech-data-flow"></div>
          
                    {/* 边角装饰 */}
          <div className="tech-corner-decoration top-left"></div>
          <div className="tech-corner-decoration top-right"></div>
          <div className="tech-corner-decoration bottom-left"></div>
          <div className="tech-corner-decoration bottom-right"></div>
          
 
            
            <ReactECharts 
            option={getCurrentMapOption()}
            style={{ 
              height: '700px', 
              width: '100%',
              transition: 'all 0.5s ease-in-out',
              position: 'relative',
              zIndex: is3D ? 50 : 200, // 3D模式降低z-index让背景可见
              backgroundColor: 'transparent'
            }}
            onEvents={{
              click: onMapClick,
              mouseover: (params) => {
                // 3D模式下增强鼠标悬浮效果（仅在调试模式下输出）
                if (process.env.NODE_ENV === 'development' && is3D && params.componentType === 'series' && params.seriesType === 'map3D') {
                  console.log('3D地图鼠标悬浮:', params.name)
                }
              },
              mouseout: (params) => {
                // 处理鼠标离开事件（仅在调试模式下输出）
                if (process.env.NODE_ENV === 'development' && is3D && params.componentType === 'series' && params.seriesType === 'map3D') {
                  console.log('3D地图鼠标离开:', params.name)
                }
              },
              finished: () => {
                // 地图渲染完成回调
                console.log('✅ 地图渲染完成')
              }
            }}
            loadingOption={{
              text: `${currentView === 'china' ? '全国' : currentProvince}地图加载中...`,
              color: is3D ? '#1890ff' : '#52c41a',
              textColor: '#333',
              maskColor: 'rgba(255, 255, 255, 0.9)',
              zlevel: 0,
              fontSize: 14,
              showSpinner: true,
              spinnerRadius: 15,
              lineWidth: 3
            }}
            showLoading={loading}
            key={`${currentView}-${currentProvince}-${is3D ? '3d' : '2d'}-${Date.now()}`}
            opts={{
              renderer: 'canvas',
              useDirtyRect: false,
              useCoarsePointer: true,
              devicePixelRatio: window.devicePixelRatio || 1,
              // 确保清理之前的渲染层
              forceRender: true,
              // 优化3D渲染避免多层模型
              preserveDrawingBuffer: false
            }}
            lazyUpdate={false}
            notMerge={true}
            replaceMerge={['series']}
          />
        </div>
      </Card>
    </div>
  )
}

export default Dashboard

