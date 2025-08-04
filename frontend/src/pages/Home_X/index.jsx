import React, { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { CloseOutlined, PieChartOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import Dashboard from './Dashboard'
import './Dashboard.scss'

// 全局状态存储，页面刷新时会重置
let globalAnimationState = {
  startTime: null,
  targetValue: 2545124.24,
  currentValue: 0,
  isRunning: false,
  duration: 600000 // 10分钟
}

// 地区销售总额数据
const regionSalesData = {
  '全国': {
    totalSales: 2545124.24,
    regions: [
      { value: 16.8, name: '西北地区', itemStyle: { color: '#1890ff' }, sales: 427900.73 },
      { value: 15.2, name: '华北地区', itemStyle: { color: '#13c2c2' }, sales: 386858.88 },
      { value: 12.7, name: '东北地区', itemStyle: { color: '#52c41a' }, sales: 323230.78 },
      { value: 18.3, name: '华东地区', itemStyle: { color: '#faad14' }, sales: 465757.74 },
      { value: 14.5, name: '华中地区', itemStyle: { color: '#f759ab' }, sales: 369043.01 },
      { value: 13.9, name: '华南地区', itemStyle: { color: '#fa8c16' }, sales: 353772.27 },
      { value: 8.6, name: '西南地区', itemStyle: { color: '#722ed1' }, sales: 218561.83 }
    ]
  },
  '广东省': {
    totalSales: 456780.50,
    regions: [
      { value: 35.5, name: '深圳市', itemStyle: { color: '#1890ff' }, sales: 162157.08 },
      { value: 28.2, name: '广州市', itemStyle: { color: '#13c2c2' }, sales: 128812.11 },
      { value: 12.8, name: '东莞市', itemStyle: { color: '#52c41a' }, sales: 58467.90 },
      { value: 9.7, name: '佛山市', itemStyle: { color: '#faad14' }, sales: 44307.71 },
      { value: 6.5, name: '惠州市', itemStyle: { color: '#f759ab' }, sales: 29690.73 },
      { value: 4.2, name: '中山市', itemStyle: { color: '#fa8c16' }, sales: 19184.78 },
      { value: 3.1, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 14160.19 }
    ]
  },
  '江苏省': {
    totalSales: 398456.32,
    regions: [
      { value: 32.1, name: '苏州市', itemStyle: { color: '#1890ff' }, sales: 127925.48 },
      { value: 28.8, name: '南京市', itemStyle: { color: '#13c2c2' }, sales: 114755.42 },
      { value: 15.6, name: '无锡市', itemStyle: { color: '#52c41a' }, sales: 62159.19 },
      { value: 10.2, name: '常州市', itemStyle: { color: '#faad14' }, sales: 40642.54 },
      { value: 7.8, name: '南通市', itemStyle: { color: '#f759ab' }, sales: 31079.59 },
      { value: 3.5, name: '徐州市', itemStyle: { color: '#fa8c16' }, sales: 13945.97 },
      { value: 2.0, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 7948.13 }
    ]
  },
  '四川省': {
    totalSales: 325678.90,
    regions: [
      { value: 58.2, name: '成都市', itemStyle: { color: '#1890ff' }, sales: 189545.12 },
      { value: 12.8, name: '绵阳市', itemStyle: { color: '#13c2c2' }, sales: 41686.90 },
      { value: 8.5, name: '德阳市', itemStyle: { color: '#52c41a' }, sales: 27682.71 },
      { value: 6.2, name: '南充市', itemStyle: { color: '#faad14' }, sales: 20192.09 },
      { value: 5.1, name: '宜宾市', itemStyle: { color: '#f759ab' }, sales: 16609.62 },
      { value: 4.8, name: '乐山市', itemStyle: { color: '#fa8c16' }, sales: 15632.59 },
      { value: 4.4, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 14329.87 }
    ]
  },
  '北京市': {
    totalSales: 512890.75,
    regions: [
      { value: 25.8, name: '朝阳区', itemStyle: { color: '#1890ff' }, sales: 132325.81 },
      { value: 22.4, name: '海淀区', itemStyle: { color: '#13c2c2' }, sales: 114887.61 },
      { value: 18.6, name: '西城区', itemStyle: { color: '#52c41a' }, sales: 95397.68 },
      { value: 15.2, name: '东城区', itemStyle: { color: '#faad14' }, sales: 77959.39 },
      { value: 8.9, name: '丰台区', itemStyle: { color: '#f759ab' }, sales: 45647.28 },
      { value: 5.8, name: '通州区', itemStyle: { color: '#fa8c16' }, sales: 29747.66 },
      { value: 3.3, name: '其他区', itemStyle: { color: '#722ed1' }, sales: 16925.32 }
    ]
  },
  '上海市': {
    totalSales: 678945.23,
    regions: [
      { value: 28.5, name: '浦东新区', itemStyle: { color: '#1890ff' }, sales: 193499.39 },
      { value: 15.8, name: '黄浦区', itemStyle: { color: '#13c2c2' }, sales: 107273.35 },
      { value: 13.2, name: '徐汇区', itemStyle: { color: '#52c41a' }, sales: 89620.77 },
      { value: 11.7, name: '静安区', itemStyle: { color: '#faad14' }, sales: 79436.59 },
      { value: 10.4, name: '长宁区', itemStyle: { color: '#f759ab' }, sales: 70610.30 },
      { value: 9.8, name: '杨浦区', itemStyle: { color: '#fa8c16' }, sales: 66536.63 },
      { value: 10.6, name: '其他区', itemStyle: { color: '#722ed1' }, sales: 71968.20 }
    ]
  },
  '浙江省': {
    totalSales: 289345.67,
    regions: [
      { value: 45.2, name: '杭州市', itemStyle: { color: '#1890ff' }, sales: 130800.44 },
      { value: 28.6, name: '宁波市', itemStyle: { color: '#13c2c2' }, sales: 82792.86 },
      { value: 12.5, name: '温州市', itemStyle: { color: '#52c41a' }, sales: 36168.21 },
      { value: 6.8, name: '嘉兴市', itemStyle: { color: '#faad14' }, sales: 19675.51 },
      { value: 4.2, name: '台州市', itemStyle: { color: '#f759ab' }, sales: 12152.52 },
      { value: 2.7, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 7756.13 }
    ]
  },
  '山东省': {
    totalSales: 356789.12,
    regions: [
      { value: 32.5, name: '青岛市', itemStyle: { color: '#1890ff' }, sales: 115956.46 },
      { value: 28.1, name: '济南市', itemStyle: { color: '#13c2c2' }, sales: 100257.74 },
      { value: 15.8, name: '烟台市', itemStyle: { color: '#52c41a' }, sales: 56372.68 },
      { value: 10.2, name: '潍坊市', itemStyle: { color: '#faad14' }, sales: 36392.49 },
      { value: 7.6, name: '临沂市', itemStyle: { color: '#f759ab' }, sales: 27115.97 },
      { value: 5.8, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 20694.78 }
    ]
  },
  '河南省': {
    totalSales: 278456.34,
    regions: [
      { value: 38.5, name: '郑州市', itemStyle: { color: '#1890ff' }, sales: 107205.69 },
      { value: 22.3, name: '洛阳市', itemStyle: { color: '#13c2c2' }, sales: 62095.76 },
      { value: 15.6, name: '开封市', itemStyle: { color: '#52c41a' }, sales: 43439.19 },
      { value: 12.8, name: '新乡市', itemStyle: { color: '#faad14' }, sales: 35642.41 },
      { value: 6.9, name: '安阳市', itemStyle: { color: '#f759ab' }, sales: 19213.49 },
      { value: 3.9, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 10859.80 }
    ]
  },
  '湖北省': {
    totalSales: 312567.89,
    regions: [
      { value: 52.8, name: '武汉市', itemStyle: { color: '#1890ff' }, sales: 165035.84 },
      { value: 15.2, name: '宜昌市', itemStyle: { color: '#13c2c2' }, sales: 47510.32 },
      { value: 12.6, name: '襄阳市', itemStyle: { color: '#52c41a' }, sales: 39383.55 },
      { value: 8.9, name: '荆州市', itemStyle: { color: '#faad14' }, sales: 27818.54 },
      { value: 6.2, name: '黄石市', itemStyle: { color: '#f759ab' }, sales: 19379.21 },
      { value: 4.3, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 13440.43 }
    ]
  },
  '湖南省': {
    totalSales: 298765.43,
    regions: [
      { value: 48.6, name: '长沙市', itemStyle: { color: '#1890ff' }, sales: 145202.20 },
      { value: 18.7, name: '株洲市', itemStyle: { color: '#13c2c2' }, sales: 55869.14 },
      { value: 13.2, name: '湘潭市', itemStyle: { color: '#52c41a' }, sales: 39437.04 },
      { value: 9.8, name: '衡阳市', itemStyle: { color: '#faad14' }, sales: 29279.01 },
      { value: 5.9, name: '常德市', itemStyle: { color: '#f759ab' }, sales: 17627.16 },
      { value: 3.8, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 11350.88 }
    ]
  },
  '天津市': {
    totalSales: 189456.78,
    regions: [
      { value: 28.5, name: '滨海新区', itemStyle: { color: '#1890ff' }, sales: 54005.18 },
      { value: 22.3, name: '和平区', itemStyle: { color: '#13c2c2' }, sales: 42248.86 },
      { value: 18.7, name: '河西区', itemStyle: { color: '#52c41a' }, sales: 35418.42 },
      { value: 15.2, name: '南开区', itemStyle: { color: '#faad14' }, sales: 28797.43 },
      { value: 8.6, name: '河东区', itemStyle: { color: '#f759ab' }, sales: 16291.28 },
      { value: 6.7, name: '其他区', itemStyle: { color: '#722ed1' }, sales: 12695.61 }
    ]
  },
  '河北省': {
    totalSales: 267890.45,
    regions: [
      { value: 32.8, name: '石家庄市', itemStyle: { color: '#1890ff' }, sales: 87870.87 },
      { value: 26.4, name: '唐山市', itemStyle: { color: '#13c2c2' }, sales: 70722.48 },
      { value: 15.6, name: '保定市', itemStyle: { color: '#52c41a' }, sales: 41790.91 },
      { value: 12.2, name: '邯郸市', itemStyle: { color: '#faad14' }, sales: 32682.64 },
      { value: 8.5, name: '沧州市', itemStyle: { color: '#f759ab' }, sales: 22770.69 },
      { value: 4.5, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 12052.86 }
    ]
  },
  '山西省': {
    totalSales: 156789.23,
    regions: [
      { value: 42.8, name: '太原市', itemStyle: { color: '#1890ff' }, sales: 67105.79 },
      { value: 18.5, name: '大同市', itemStyle: { color: '#13c2c2' }, sales: 29005.99 },
      { value: 15.2, name: '运城市', itemStyle: { color: '#52c41a' }, sales: 23831.96 },
      { value: 11.8, name: '长治市', itemStyle: { color: '#faad14' }, sales: 18501.13 },
      { value: 7.3, name: '晋中市', itemStyle: { color: '#f759ab' }, sales: 11445.61 },
      { value: 4.4, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 6898.75 }
    ]
  },
  '内蒙古自治区': {
    totalSales: 98765.43,
    regions: [
      { value: 45.6, name: '呼和浩特市', itemStyle: { color: '#1890ff' }, sales: 45037.04 },
      { value: 32.8, name: '包头市', itemStyle: { color: '#13c2c2' }, sales: 32395.06 },
      { value: 12.5, name: '赤峰市', itemStyle: { color: '#52c41a' }, sales: 12345.68 },
      { value: 5.8, name: '通辽市', itemStyle: { color: '#faad14' }, sales: 5728.39 },
      { value: 2.3, name: '乌海市', itemStyle: { color: '#f759ab' }, sales: 2271.00 },
      { value: 1.0, name: '其他盟市', itemStyle: { color: '#722ed1' }, sales: 988.26 }
    ]
  },
  '辽宁省': {
    totalSales: 234567.89,
    regions: [
      { value: 38.5, name: '沈阳市', itemStyle: { color: '#1890ff' }, sales: 90308.64 },
      { value: 32.1, name: '大连市', itemStyle: { color: '#13c2c2' }, sales: 75336.29 },
      { value: 15.8, name: '鞍山市', itemStyle: { color: '#52c41a' }, sales: 37061.73 },
      { value: 8.2, name: '抚顺市', itemStyle: { color: '#faad14' }, sales: 19234.57 },
      { value: 3.6, name: '本溪市', itemStyle: { color: '#f759ab' }, sales: 8444.44 },
      { value: 1.8, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 4222.22 }
    ]
  },
  '吉林省': {
    totalSales: 123456.78,
    regions: [
      { value: 52.3, name: '长春市', itemStyle: { color: '#1890ff' }, sales: 64567.80 },
      { value: 28.7, name: '吉林市', itemStyle: { color: '#13c2c2' }, sales: 35432.20 },
      { value: 12.5, name: '四平市', itemStyle: { color: '#52c41a' }, sales: 15432.10 },
      { value: 4.2, name: '辽源市', itemStyle: { color: '#faad14' }, sales: 5185.18 },
      { value: 1.8, name: '通化市', itemStyle: { color: '#f759ab' }, sales: 2222.22 },
      { value: 0.5, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 617.28 }
    ]
  },
  '黑龙江省': {
    totalSales: 178901.23,
    regions: [
      { value: 48.2, name: '哈尔滨市', itemStyle: { color: '#1890ff' }, sales: 86250.39 },
      { value: 22.8, name: '齐齐哈尔市', itemStyle: { color: '#13c2c2' }, sales: 40789.48 },
      { value: 15.6, name: '大庆市', itemStyle: { color: '#52c41a' }, sales: 27908.59 },
      { value: 8.1, name: '佳木斯市', itemStyle: { color: '#faad14' }, sales: 14491.00 },
      { value: 3.8, name: '牡丹江市', itemStyle: { color: '#f759ab' }, sales: 6798.25 },
      { value: 1.5, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 2685.18 }
    ]
  },
  '安徽省': {
    totalSales: 245678.90,
    regions: [
      { value: 42.5, name: '合肥市', itemStyle: { color: '#1890ff' }, sales: 104413.54 },
      { value: 25.8, name: '芜湖市', itemStyle: { color: '#13c2c2' }, sales: 63385.16 },
      { value: 14.2, name: '蚌埠市', itemStyle: { color: '#52c41a' }, sales: 34886.40 },
      { value: 9.6, name: '淮南市', itemStyle: { color: '#faad14' }, sales: 23585.17 },
      { value: 5.3, name: '马鞍山市', itemStyle: { color: '#f759ab' }, sales: 13020.98 },
      { value: 2.6, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 6387.65 }
    ]
  },
  '福建省': {
    totalSales: 312456.78,
    regions: [
      { value: 35.8, name: '福州市', itemStyle: { color: '#1890ff' }, sales: 111859.53 },
      { value: 32.4, name: '厦门市', itemStyle: { color: '#13c2c2' }, sales: 101235.98 },
      { value: 18.6, name: '泉州市', itemStyle: { color: '#52c41a' }, sales: 58116.96 },
      { value: 8.7, name: '漳州市', itemStyle: { color: '#faad14' }, sales: 27183.74 },
      { value: 2.8, name: '莆田市', itemStyle: { color: '#f759ab' }, sales: 8748.79 },
      { value: 1.7, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 5311.78 }
    ]
  },
  '江西省': {
    totalSales: 198765.43,
    regions: [
      { value: 45.2, name: '南昌市', itemStyle: { color: '#1890ff' }, sales: 89842.17 },
      { value: 22.8, name: '赣州市', itemStyle: { color: '#13c2c2' }, sales: 45318.56 },
      { value: 15.6, name: '九江市', itemStyle: { color: '#52c41a' }, sales: 31007.41 },
      { value: 9.2, name: '吉安市', itemStyle: { color: '#faad14' }, sales: 18286.42 },
      { value: 4.8, name: '宜春市', itemStyle: { color: '#f759ab' }, sales: 9540.74 },
      { value: 2.4, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 4770.13 }
    ]
  },
  '广西壮族自治区': {
    totalSales: 167890.12,
    regions: [
      { value: 42.8, name: '南宁市', itemStyle: { color: '#1890ff' }, sales: 71856.97 },
      { value: 28.5, name: '柳州市', itemStyle: { color: '#13c2c2' }, sales: 47848.68 },
      { value: 15.2, name: '桂林市', itemStyle: { color: '#52c41a' }, sales: 25519.30 },
      { value: 8.6, name: '梧州市', itemStyle: { color: '#faad14' }, sales: 14438.55 },
      { value: 3.2, name: '北海市', itemStyle: { color: '#f759ab' }, sales: 5372.48 },
      { value: 1.7, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 2854.14 }
    ]
  },
  '海南省': {
    totalSales: 89123.45,
    regions: [
      { value: 68.5, name: '海口市', itemStyle: { color: '#1890ff' }, sales: 61049.56 },
      { value: 28.7, name: '三亚市', itemStyle: { color: '#13c2c2' }, sales: 25578.43 },
      { value: 2.1, name: '儋州市', itemStyle: { color: '#52c41a' }, sales: 1871.59 },
      { value: 0.5, name: '三沙市', itemStyle: { color: '#faad14' }, sales: 445.62 },
      { value: 0.2, name: '其他市县', itemStyle: { color: '#f759ab' }, sales: 178.25 }
    ]
  },
  '重庆市': {
    totalSales: 345678.90,
    regions: [
      { value: 52.8, name: '渝中区', itemStyle: { color: '#1890ff' }, sales: 182518.46 },
      { value: 18.5, name: '江北区', itemStyle: { color: '#13c2c2' }, sales: 63950.60 },
      { value: 12.3, name: '渝北区', itemStyle: { color: '#52c41a' }, sales: 42518.50 },
      { value: 8.7, name: '沙坪坝区', itemStyle: { color: '#faad14' }, sales: 30074.06 },
      { value: 4.9, name: '九龙坡区', itemStyle: { color: '#f759ab' }, sales: 16938.27 },
      { value: 2.8, name: '其他区县', itemStyle: { color: '#722ed1' }, sales: 9679.01 }
    ]
  },
  '贵州省': {
    totalSales: 134567.89,
    regions: [
      { value: 48.6, name: '贵阳市', itemStyle: { color: '#1890ff' }, sales: 65400.00 },
      { value: 22.8, name: '遵义市', itemStyle: { color: '#13c2c2' }, sales: 30681.48 },
      { value: 12.5, name: '六盘水市', itemStyle: { color: '#52c41a' }, sales: 16820.99 },
      { value: 8.9, name: '安顺市', itemStyle: { color: '#faad14' }, sales: 11976.54 },
      { value: 4.7, name: '毕节市', itemStyle: { color: '#f759ab' }, sales: 6324.69 },
      { value: 2.5, name: '其他州市', itemStyle: { color: '#722ed1' }, sales: 3364.19 }
    ]
  },
  '云南省': {
    totalSales: 198765.43,
    regions: [
      { value: 45.8, name: '昆明市', itemStyle: { color: '#1890ff' }, sales: 91054.57 },
      { value: 18.5, name: '曲靖市', itemStyle: { color: '#13c2c2' }, sales: 36771.60 },
      { value: 12.3, name: '红河州', itemStyle: { color: '#52c41a' }, sales: 24448.15 },
      { value: 9.8, name: '大理州', itemStyle: { color: '#faad14' }, sales: 19479.01 },
      { value: 7.2, name: '丽江市', itemStyle: { color: '#f759ab' }, sales: 14311.11 },
      { value: 6.4, name: '其他州市', itemStyle: { color: '#722ed1' }, sales: 12700.99 }
    ]
  },
  '西藏自治区': {
    totalSales: 45678.90,
    regions: [
      { value: 58.5, name: '拉萨市', itemStyle: { color: '#1890ff' }, sales: 26722.16 },
      { value: 18.7, name: '日喀则市', itemStyle: { color: '#13c2c2' }, sales: 8541.95 },
      { value: 12.8, name: '昌都市', itemStyle: { color: '#52c41a' }, sales: 5846.90 },
      { value: 6.2, name: '林芝市', itemStyle: { color: '#faad14' }, sales: 2832.09 },
      { value: 2.5, name: '山南市', itemStyle: { color: '#f759ab' }, sales: 1141.97 },
      { value: 1.3, name: '其他地区', itemStyle: { color: '#722ed1' }, sales: 593.83 }
    ]
  },
  '陕西省': {
    totalSales: 289012.34,
    regions: [
      { value: 52.8, name: '西安市', itemStyle: { color: '#1890ff' }, sales: 152598.52 },
      { value: 18.5, name: '宝鸡市', itemStyle: { color: '#13c2c2' }, sales: 53467.28 },
      { value: 12.8, name: '咸阳市', itemStyle: { color: '#52c41a' }, sales: 36993.58 },
      { value: 8.2, name: '渭南市', itemStyle: { color: '#faad14' }, sales: 23699.01 },
      { value: 4.9, name: '汉中市', itemStyle: { color: '#f759ab' }, sales: 14161.60 },
      { value: 2.8, name: '其他城市', itemStyle: { color: '#722ed1' }, sales: 8092.35 }
    ]
  },
  '甘肃省': {
    totalSales: 112345.67,
    regions: [
      { value: 48.5, name: '兰州市', itemStyle: { color: '#1890ff' }, sales: 54487.65 },
      { value: 18.8, name: '天水市', itemStyle: { color: '#13c2c2' }, sales: 21120.99 },
      { value: 12.5, name: '庆阳市', itemStyle: { color: '#52c41a' }, sales: 14043.21 },
      { value: 9.2, name: '平凉市', itemStyle: { color: '#faad14' }, sales: 10335.80 },
      { value: 6.8, name: '武威市', itemStyle: { color: '#f759ab' }, sales: 7639.51 },
      { value: 4.2, name: '其他州市', itemStyle: { color: '#722ed1' }, sales: 4718.51 }
    ]
  },
  '青海省': {
    totalSales: 67890.12,
    regions: [
      { value: 62.8, name: '西宁市', itemStyle: { color: '#1890ff' }, sales: 42635.36 },
      { value: 22.5, name: '海东市', itemStyle: { color: '#13c2c2' }, sales: 15275.28 },
      { value: 8.7, name: '海西州', itemStyle: { color: '#52c41a' }, sales: 5906.44 },
      { value: 3.8, name: '海北州', itemStyle: { color: '#faad14' }, sales: 2579.82 },
      { value: 1.5, name: '黄南州', itemStyle: { color: '#f759ab' }, sales: 1018.35 },
      { value: 0.7, name: '其他州', itemStyle: { color: '#722ed1' }, sales: 474.87 }
    ]
  },
  '宁夏回族自治区': {
    totalSales: 78901.23,
    regions: [
      { value: 58.5, name: '银川市', itemStyle: { color: '#1890ff' }, sales: 46157.22 },
      { value: 22.8, name: '吴忠市', itemStyle: { color: '#13c2c2' }, sales: 17993.48 },
      { value: 12.5, name: '石嘴山市', itemStyle: { color: '#52c41a' }, sales: 9862.65 },
      { value: 4.7, name: '固原市', itemStyle: { color: '#faad14' }, sales: 3708.36 },
      { value: 1.5, name: '中卫市', itemStyle: { color: '#f759ab' }, sales: 1183.52 }
    ]
  },
  '新疆维吾尔自治区': {
    totalSales: 156789.01,
    regions: [
      { value: 48.2, name: '乌鲁木齐市', itemStyle: { color: '#1890ff' }, sales: 75572.30 },
      { value: 15.8, name: '昌吉州', itemStyle: { color: '#13c2c2' }, sales: 24772.66 },
      { value: 12.5, name: '喀什地区', itemStyle: { color: '#52c41a' }, sales: 19598.63 },
      { value: 9.8, name: '阿克苏地区', itemStyle: { color: '#faad14' }, sales: 15365.32 },
      { value: 7.2, name: '伊犁州', itemStyle: { color: '#f759ab' }, sales: 11288.89 },
      { value: 6.5, name: '其他地区', itemStyle: { color: '#722ed1' }, sales: 10191.21 }
    ]
  }
}

// 数字滚动动画组件
const AnimatedNumber = ({ targetValue, duration = 600000, formatter = (val) => val, onValueUpdate }) => {
  const [currentValue, setCurrentValue] = useState(() => {
    // 如果有全局状态且动画正在运行，计算当前值
    if (globalAnimationState.isRunning && globalAnimationState.startTime) {
      const elapsedTime = Date.now() - globalAnimationState.startTime
      const progress = Math.min(elapsedTime / globalAnimationState.duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      return globalAnimationState.currentValue = 0 + (globalAnimationState.targetValue - 0) * easeOutQuart
    }
    return 0
  })

  React.useEffect(() => {
    let animationId
    
    // 如果动画没有开始，初始化全局状态
    if (!globalAnimationState.isRunning) {
      globalAnimationState.startTime = Date.now()
      globalAnimationState.isRunning = true
      globalAnimationState.currentValue = 0
      globalAnimationState.targetValue = targetValue // 更新目标值
    }
    
    const animate = () => {
      if (!globalAnimationState.startTime || !globalAnimationState.isRunning) return
      
      const elapsedTime = Date.now() - globalAnimationState.startTime
      const progress = Math.min(elapsedTime / globalAnimationState.duration, 1)
      
      // 使用更平缓的缓动函数让数字增长更慢
      const easeOutQuart = 1 - Math.pow(1 - progress, 4) // 更平缓的缓动
      const current = 0 + (globalAnimationState.targetValue - 0) * easeOutQuart
      
      globalAnimationState.currentValue = current
      setCurrentValue(current)
      
      // 通知父组件当前值（用于调试）
      if (onValueUpdate) {
        onValueUpdate(current, progress)
      }
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      } else {
        // 动画完成
        globalAnimationState.isRunning = false
      }
    }
    
    animationId = requestAnimationFrame(animate)
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [targetValue, duration, onValueUpdate])

  return formatter(currentValue)
}

// 销售总额圆环图组件
const SalesOverviewChart = ({ visible, onClose, selectedRegion = '全国', forceUpdate }) => {
  const [isVisible, setIsVisible] = useState(visible)
  const [animationProgress, setAnimationProgress] = useState(0)

  React.useEffect(() => {
    if (visible) {
      setIsVisible(true)
    } else {
      // 延迟隐藏以显示动画
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [visible])

  // 处理数值更新回调
  const handleValueUpdate = (currentValue, progress) => {
    setAnimationProgress(progress)
    // 调试输出，可以看到动画进度
    if (progress % 0.01 < 0.001) { // 每1%输出一次
      console.log(`💰 销售总额加载进度: ${(progress * 100).toFixed(1)}% - 当前值: ${currentValue.toFixed(2)}元`)
    }
  }

  // 根据选中地区更新全局动画目标值
  React.useEffect(() => {
    console.log(`🔄 selectedRegion 变化: ${selectedRegion}`)
    const regionData = regionSalesData[selectedRegion] || regionSalesData['全国']
    console.log(`📊 地区数据:`, regionData)
    
    if (globalAnimationState.targetValue !== regionData.totalSales) {
      globalAnimationState.targetValue = regionData.totalSales
      globalAnimationState.startTime = Date.now() // 重新开始动画
      globalAnimationState.isRunning = true
      console.log(`🎯 切换到${selectedRegion}，销售总额目标: ${regionData.totalSales.toFixed(2)}元`)
    } else {
      console.log(`⚠️ 目标值相同，无需更新: ${regionData.totalSales.toFixed(2)}元`)
    }
  }, [selectedRegion, forceUpdate])

  // 监听forceUpdate变化
  React.useEffect(() => {
    if (forceUpdate > 0) {
      console.log(`🔄 强制更新触发: ${forceUpdate}, 当前地区: ${selectedRegion}`)
    }
  }, [forceUpdate])

  if (!isVisible) return null;

  const regionData = regionSalesData[selectedRegion] || regionSalesData['全国']

  const chartOption = {
    animation: false, // 关闭动画，让环形图立即显示
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const salesValue = params.data.sales || 0
        return `${params.seriesName}<br/>${params.name}: ${params.percent}%<br/>销售额: ${salesValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}元`
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12
      }
    },
    title: [
      {
        text: selectedRegion,
        left: '25%',
        top: '12%',
        textAlign: 'center',
        textStyle: {
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 13,
          fontWeight: 'bold'
        }
      }
    ],
    legend: {
      orient: 'horizontal',
      bottom: '2%',
      left: 'center',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 8
      },
      itemWidth: 5,
      itemHeight: 5,
      itemGap: 6,
      width: '90%'
    },
    series: [
      {
        name: `${selectedRegion}业务占比`,
        type: 'pie',
        radius: ['28%', '48%'],
        center: ['25%', '45%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'outside',
          formatter: '{b}: {d}%',
          textStyle: {
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold'
          }
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            formatter: '{d}%',
            position: 'outside',
            textStyle: {
              color: '#fff',
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowBlur: 2
            }
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            borderColor: '#fff',
            borderWidth: 2
          }
        },
        labelLine: {
          show: false,
          emphasis: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.9)',
              width: 2,
              type: 'solid'
            },
            length: 10,
            length2: 15
          }
        },
        data: regionData.regions
      }
    ]
  }

      return (
     <div className="sales-overview-chart" style={{
              position: 'fixed',
              top: '210px',
              left: '260px',
                    zIndex: 1000,
      width: '320px',
      height: '220px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderRadius: '8px',
      padding: '10px',
      pointerEvents: 'auto',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
      transition: 'all 0.3s ease-in-out'
    }}>
            {/* 关闭按钮 */}
      <CloseOutlined 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10,
          padding: '4px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
          e.target.style.color = '#fff'
          e.target.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
          e.target.style.color = 'rgba(255, 255, 255, 0.8)'
          e.target.style.transform = 'scale(1)'
        }}
      />

      {/* 动画销售总额 */}
      <div style={{
        position: 'absolute',
        right: '3%',
        top: '45%',
        transform: 'translateY(-50%)',
        textAlign: 'center',
        zIndex: 5,
        pointerEvents: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '8px',
        padding: '10px 14px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        minWidth: '140px'
      }}>
        <div style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          marginBottom: '3px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          lineHeight: '1.2'
        }}>
          <AnimatedNumber 
            targetValue={regionData.totalSales} 
            duration={600000}
            onValueUpdate={handleValueUpdate}
            formatter={(val) => `${val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}元`}
          />
        </div>
        <div style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '11px',
          fontWeight: 'normal',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          marginBottom: '2px'
        }}>
          {selectedRegion}销售总额
        </div>
        {/* 显示加载进度 */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '8px',
          marginTop: '2px',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
        }}>
          {animationProgress > 0 && animationProgress < 1 && (
            `加载中: ${(animationProgress * 100).toFixed(1)}%`
          )}
          {animationProgress >= 1 && '✅ 加载完成'}
        </div>
      </div>

      
      <ReactECharts 
          key={`chart-${selectedRegion}-${forceUpdate}`}
          option={chartOption}
          style={{ 
            height: '100%', 
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}
          opts={{
            renderer: 'canvas'
          }}
          notMerge={true}
          onEvents={{
            mouseover: (params) => {
              // 鼠标悬停时的效果
              if (params.componentType === 'series') {
                console.log(`悬停在${params.name}: ${params.percent}%`)
              }
            },
            mouseout: (params) => {
              // 鼠标离开时的效果
              if (params.componentType === 'series') {
                console.log(`离开${params.name}`)
              }
            }
          }}
        />
    </div>
  )
}

const Home = () => {
  const [chartVisible, setChartVisible] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('全国')
  const [forceUpdate, setForceUpdate] = useState(0)

  const handleCloseChart = () => {
    console.log('📊 销售总额图表已关闭，动画继续在后台运行')
    setChartVisible(false)
  }

  const handleShowChart = () => {
    console.log('📊 重新显示销售总额图表，从当前进度继续')
    setChartVisible(true)
  }

  // 处理地图点击事件
  const handleMapRegionClick = (regionName) => {
    console.log(`🗺️ 地图点击事件触发: ${regionName}`)
    console.log(`📍 当前selectedRegion: ${selectedRegion}`)
    console.log(`📊 可用地区数据:`, Object.keys(regionSalesData))
    
    // 所有地区都有销售数据
    console.log(`✅ 找到地区数据: ${regionName}`)
    setSelectedRegion(regionName)
    setForceUpdate(prev => prev + 1) // 强制更新
    console.log(`🔄 设置selectedRegion为: ${regionName}`)
    
    // 如果图表被关闭，自动显示
    if (!chartVisible) {
      console.log(`📈 自动显示图表`)
      setChartVisible(true)
    }
  }

  // 页面加载时输出提示信息
  React.useEffect(() => {
    console.log('🏠 首页已加载，环形图立即显示，销售总额数据开始10分钟平缓加载动画')
    console.log('💡 提示：刷新页面将重新开始动画，关闭/打开图表会继续当前进度')
    console.log('🗺️ 点击地图上的地区可切换环形图显示对应地区的销售数据')
    console.log('📊 已为全国所有34个省份/直辖市/自治区添加销售数据，点击任何地区都有对应的环形图')
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <Dashboard onRegionClick={handleMapRegionClick} />
      <SalesOverviewChart 
        visible={chartVisible} 
        onClose={handleCloseChart}
        selectedRegion={selectedRegion}
        forceUpdate={forceUpdate}
      />
      
      {/* 显示图表按钮 */}
      {!chartVisible && (
        <Button
          type="primary"
          icon={<PieChartOutlined />}
          onClick={handleShowChart}
          style={{
            position: 'fixed',
            top: '210px',
            left: '260px',
            zIndex: 1000,
            borderRadius: '8px',
            backgroundColor: 'rgba(24, 144, 255, 0.9)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInScale 0.3s ease-out',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.05)'
            e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          显示{selectedRegion}销售统计
        </Button>
      )}
    </div>
  )
}

export default Home
