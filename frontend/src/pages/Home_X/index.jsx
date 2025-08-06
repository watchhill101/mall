import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import {
  CloseOutlined,
  PieChartOutlined,
  GlobalOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CompressOutlined,
  ExpandOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import "./Dashboard.scss";

// 全局状态存储，页面刷新时会重置
let globalAnimationState = {
  startTime: null,
  targetValue: 2545124.24,
  currentValue: 0,
  isRunning: false,
  duration: 20000, // 20秒
};

// ECharts 图表拖拽配置
const DRAGGABLE_CONFIG = {
  symbolSize: 15,
  zLevel: 100,
  dragSensitivity: 5,
};

// 地区销售总额数据
const regionSalesData = {
  全国: {
    totalSales: 2545124.24,
    regions: [
      {
        value: 16.8,
        name: "西北地区",
        itemStyle: { color: "#1890ff" },
        sales: 427900.73,
      },
      {
        value: 15.2,
        name: "华北地区",
        itemStyle: { color: "#13c2c2" },
        sales: 386858.88,
      },
      {
        value: 12.7,
        name: "东北地区",
        itemStyle: { color: "#52c41a" },
        sales: 323230.78,
      },
      {
        value: 18.3,
        name: "华东地区",
        itemStyle: { color: "#faad14" },
        sales: 465757.74,
      },
      {
        value: 14.5,
        name: "华中地区",
        itemStyle: { color: "#f759ab" },
        sales: 369043.01,
      },
      {
        value: 13.9,
        name: "华南地区",
        itemStyle: { color: "#fa8c16" },
        sales: 353772.27,
      },
      {
        value: 8.6,
        name: "西南地区",
        itemStyle: { color: "#722ed1" },
        sales: 218561.83,
      },
    ],
  },
  广东省: {
    totalSales: 456780.5,
    regions: [
      {
        value: 35.5,
        name: "深圳市",
        itemStyle: { color: "#1890ff" },
        sales: 162157.08,
      },
      {
        value: 28.2,
        name: "广州市",
        itemStyle: { color: "#13c2c2" },
        sales: 128812.11,
      },
      {
        value: 12.8,
        name: "东莞市",
        itemStyle: { color: "#52c41a" },
        sales: 58467.9,
      },
      {
        value: 9.7,
        name: "佛山市",
        itemStyle: { color: "#faad14" },
        sales: 44307.71,
      },
      {
        value: 6.5,
        name: "惠州市",
        itemStyle: { color: "#f759ab" },
        sales: 29690.73,
      },
      {
        value: 4.2,
        name: "中山市",
        itemStyle: { color: "#fa8c16" },
        sales: 19184.78,
      },
      {
        value: 3.1,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 14160.19,
      },
    ],
  },
  江苏省: {
    totalSales: 398456.32,
    regions: [
      {
        value: 32.1,
        name: "苏州市",
        itemStyle: { color: "#1890ff" },
        sales: 127925.48,
      },
      {
        value: 28.8,
        name: "南京市",
        itemStyle: { color: "#13c2c2" },
        sales: 114755.42,
      },
      {
        value: 15.6,
        name: "无锡市",
        itemStyle: { color: "#52c41a" },
        sales: 62159.19,
      },
      {
        value: 10.2,
        name: "常州市",
        itemStyle: { color: "#faad14" },
        sales: 40642.54,
      },
      {
        value: 7.8,
        name: "南通市",
        itemStyle: { color: "#f759ab" },
        sales: 31079.59,
      },
      {
        value: 3.5,
        name: "徐州市",
        itemStyle: { color: "#fa8c16" },
        sales: 13945.97,
      },
      {
        value: 2.0,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 7948.13,
      },
    ],
  },
  四川省: {
    totalSales: 325678.9,
    regions: [
      {
        value: 58.2,
        name: "成都市",
        itemStyle: { color: "#1890ff" },
        sales: 189545.12,
      },
      {
        value: 12.8,
        name: "绵阳市",
        itemStyle: { color: "#13c2c2" },
        sales: 41686.9,
      },
      {
        value: 8.5,
        name: "德阳市",
        itemStyle: { color: "#52c41a" },
        sales: 27682.71,
      },
      {
        value: 6.2,
        name: "南充市",
        itemStyle: { color: "#faad14" },
        sales: 20192.09,
      },
      {
        value: 5.1,
        name: "宜宾市",
        itemStyle: { color: "#f759ab" },
        sales: 16609.62,
      },
      {
        value: 4.8,
        name: "乐山市",
        itemStyle: { color: "#fa8c16" },
        sales: 15632.59,
      },
      {
        value: 4.4,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 14329.87,
      },
    ],
  },
  北京市: {
    totalSales: 512890.75,
    regions: [
      {
        value: 25.8,
        name: "朝阳区",
        itemStyle: { color: "#1890ff" },
        sales: 132325.81,
      },
      {
        value: 22.4,
        name: "海淀区",
        itemStyle: { color: "#13c2c2" },
        sales: 114887.61,
      },
      {
        value: 18.6,
        name: "西城区",
        itemStyle: { color: "#52c41a" },
        sales: 95397.68,
      },
      {
        value: 15.2,
        name: "东城区",
        itemStyle: { color: "#faad14" },
        sales: 77959.39,
      },
      {
        value: 8.9,
        name: "丰台区",
        itemStyle: { color: "#f759ab" },
        sales: 45647.28,
      },
      {
        value: 5.8,
        name: "通州区",
        itemStyle: { color: "#fa8c16" },
        sales: 29747.66,
      },
      {
        value: 3.3,
        name: "其他区",
        itemStyle: { color: "#722ed1" },
        sales: 16925.32,
      },
    ],
  },
  上海市: {
    totalSales: 678945.23,
    regions: [
      {
        value: 28.5,
        name: "浦东新区",
        itemStyle: { color: "#1890ff" },
        sales: 193499.39,
      },
      {
        value: 15.8,
        name: "黄浦区",
        itemStyle: { color: "#13c2c2" },
        sales: 107273.35,
      },
      {
        value: 13.2,
        name: "徐汇区",
        itemStyle: { color: "#52c41a" },
        sales: 89620.77,
      },
      {
        value: 11.7,
        name: "静安区",
        itemStyle: { color: "#faad14" },
        sales: 79436.59,
      },
      {
        value: 10.4,
        name: "长宁区",
        itemStyle: { color: "#f759ab" },
        sales: 70610.3,
      },
      {
        value: 9.8,
        name: "杨浦区",
        itemStyle: { color: "#fa8c16" },
        sales: 66536.63,
      },
      {
        value: 10.6,
        name: "其他区",
        itemStyle: { color: "#722ed1" },
        sales: 71968.2,
      },
    ],
  },
  浙江省: {
    totalSales: 289345.67,
    regions: [
      {
        value: 45.2,
        name: "杭州市",
        itemStyle: { color: "#1890ff" },
        sales: 130800.44,
      },
      {
        value: 28.6,
        name: "宁波市",
        itemStyle: { color: "#13c2c2" },
        sales: 82792.86,
      },
      {
        value: 12.5,
        name: "温州市",
        itemStyle: { color: "#52c41a" },
        sales: 36168.21,
      },
      {
        value: 6.8,
        name: "嘉兴市",
        itemStyle: { color: "#faad14" },
        sales: 19675.51,
      },
      {
        value: 4.2,
        name: "台州市",
        itemStyle: { color: "#f759ab" },
        sales: 12152.52,
      },
      {
        value: 2.7,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 7756.13,
      },
    ],
  },
  山东省: {
    totalSales: 356789.12,
    regions: [
      {
        value: 32.5,
        name: "青岛市",
        itemStyle: { color: "#1890ff" },
        sales: 115956.46,
      },
      {
        value: 28.1,
        name: "济南市",
        itemStyle: { color: "#13c2c2" },
        sales: 100257.74,
      },
      {
        value: 15.8,
        name: "烟台市",
        itemStyle: { color: "#52c41a" },
        sales: 56372.68,
      },
      {
        value: 10.2,
        name: "潍坊市",
        itemStyle: { color: "#faad14" },
        sales: 36392.49,
      },
      {
        value: 7.6,
        name: "临沂市",
        itemStyle: { color: "#f759ab" },
        sales: 27115.97,
      },
      {
        value: 5.8,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 20694.78,
      },
    ],
  },
  河南省: {
    totalSales: 278456.34,
    regions: [
      {
        value: 38.5,
        name: "郑州市",
        itemStyle: { color: "#1890ff" },
        sales: 107205.69,
      },
      {
        value: 22.3,
        name: "洛阳市",
        itemStyle: { color: "#13c2c2" },
        sales: 62095.76,
      },
      {
        value: 15.6,
        name: "开封市",
        itemStyle: { color: "#52c41a" },
        sales: 43439.19,
      },
      {
        value: 12.8,
        name: "新乡市",
        itemStyle: { color: "#faad14" },
        sales: 35642.41,
      },
      {
        value: 6.9,
        name: "安阳市",
        itemStyle: { color: "#f759ab" },
        sales: 19213.49,
      },
      {
        value: 3.9,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 10859.8,
      },
    ],
  },
  湖北省: {
    totalSales: 312567.89,
    regions: [
      {
        value: 52.8,
        name: "武汉市",
        itemStyle: { color: "#1890ff" },
        sales: 165035.84,
      },
      {
        value: 15.2,
        name: "宜昌市",
        itemStyle: { color: "#13c2c2" },
        sales: 47510.32,
      },
      {
        value: 12.6,
        name: "襄阳市",
        itemStyle: { color: "#52c41a" },
        sales: 39383.55,
      },
      {
        value: 8.9,
        name: "荆州市",
        itemStyle: { color: "#faad14" },
        sales: 27818.54,
      },
      {
        value: 6.2,
        name: "黄石市",
        itemStyle: { color: "#f759ab" },
        sales: 19379.21,
      },
      {
        value: 4.3,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 13440.43,
      },
    ],
  },
  湖南省: {
    totalSales: 298765.43,
    regions: [
      {
        value: 48.6,
        name: "长沙市",
        itemStyle: { color: "#1890ff" },
        sales: 145202.2,
      },
      {
        value: 18.7,
        name: "株洲市",
        itemStyle: { color: "#13c2c2" },
        sales: 55869.14,
      },
      {
        value: 13.2,
        name: "湘潭市",
        itemStyle: { color: "#52c41a" },
        sales: 39437.04,
      },
      {
        value: 9.8,
        name: "衡阳市",
        itemStyle: { color: "#faad14" },
        sales: 29279.01,
      },
      {
        value: 5.9,
        name: "常德市",
        itemStyle: { color: "#f759ab" },
        sales: 17627.16,
      },
      {
        value: 3.8,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 11350.88,
      },
    ],
  },
  天津市: {
    totalSales: 189456.78,
    regions: [
      {
        value: 28.5,
        name: "滨海新区",
        itemStyle: { color: "#1890ff" },
        sales: 54005.18,
      },
      {
        value: 22.3,
        name: "和平区",
        itemStyle: { color: "#13c2c2" },
        sales: 42248.86,
      },
      {
        value: 18.7,
        name: "河西区",
        itemStyle: { color: "#52c41a" },
        sales: 35418.42,
      },
      {
        value: 15.2,
        name: "南开区",
        itemStyle: { color: "#faad14" },
        sales: 28797.43,
      },
      {
        value: 8.6,
        name: "河东区",
        itemStyle: { color: "#f759ab" },
        sales: 16291.28,
      },
      {
        value: 6.7,
        name: "其他区",
        itemStyle: { color: "#722ed1" },
        sales: 12695.61,
      },
    ],
  },
  河北省: {
    totalSales: 267890.45,
    regions: [
      {
        value: 32.8,
        name: "石家庄市",
        itemStyle: { color: "#1890ff" },
        sales: 87870.87,
      },
      {
        value: 26.4,
        name: "唐山市",
        itemStyle: { color: "#13c2c2" },
        sales: 70722.48,
      },
      {
        value: 15.6,
        name: "保定市",
        itemStyle: { color: "#52c41a" },
        sales: 41790.91,
      },
      {
        value: 12.2,
        name: "邯郸市",
        itemStyle: { color: "#faad14" },
        sales: 32682.64,
      },
      {
        value: 8.5,
        name: "沧州市",
        itemStyle: { color: "#f759ab" },
        sales: 22770.69,
      },
      {
        value: 4.5,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 12052.86,
      },
    ],
  },
  山西省: {
    totalSales: 156789.23,
    regions: [
      {
        value: 42.8,
        name: "太原市",
        itemStyle: { color: "#1890ff" },
        sales: 67105.79,
      },
      {
        value: 18.5,
        name: "大同市",
        itemStyle: { color: "#13c2c2" },
        sales: 29005.99,
      },
      {
        value: 15.2,
        name: "运城市",
        itemStyle: { color: "#52c41a" },
        sales: 23831.96,
      },
      {
        value: 11.8,
        name: "长治市",
        itemStyle: { color: "#faad14" },
        sales: 18501.13,
      },
      {
        value: 7.3,
        name: "晋中市",
        itemStyle: { color: "#f759ab" },
        sales: 11445.61,
      },
      {
        value: 4.4,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 6898.75,
      },
    ],
  },
  内蒙古自治区: {
    totalSales: 98765.43,
    regions: [
      {
        value: 45.6,
        name: "呼和浩特市",
        itemStyle: { color: "#1890ff" },
        sales: 45037.04,
      },
      {
        value: 32.8,
        name: "包头市",
        itemStyle: { color: "#13c2c2" },
        sales: 32395.06,
      },
      {
        value: 12.5,
        name: "赤峰市",
        itemStyle: { color: "#52c41a" },
        sales: 12345.68,
      },
      {
        value: 5.8,
        name: "通辽市",
        itemStyle: { color: "#faad14" },
        sales: 5728.39,
      },
      {
        value: 2.3,
        name: "乌海市",
        itemStyle: { color: "#f759ab" },
        sales: 2271.0,
      },
      {
        value: 1.0,
        name: "其他盟市",
        itemStyle: { color: "#722ed1" },
        sales: 988.26,
      },
    ],
  },
  辽宁省: {
    totalSales: 234567.89,
    regions: [
      {
        value: 38.5,
        name: "沈阳市",
        itemStyle: { color: "#1890ff" },
        sales: 90308.64,
      },
      {
        value: 32.1,
        name: "大连市",
        itemStyle: { color: "#13c2c2" },
        sales: 75336.29,
      },
      {
        value: 15.8,
        name: "鞍山市",
        itemStyle: { color: "#52c41a" },
        sales: 37061.73,
      },
      {
        value: 8.2,
        name: "抚顺市",
        itemStyle: { color: "#faad14" },
        sales: 19234.57,
      },
      {
        value: 3.6,
        name: "本溪市",
        itemStyle: { color: "#f759ab" },
        sales: 8444.44,
      },
      {
        value: 1.8,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 4222.22,
      },
    ],
  },
  吉林省: {
    totalSales: 123456.78,
    regions: [
      {
        value: 52.3,
        name: "长春市",
        itemStyle: { color: "#1890ff" },
        sales: 64567.8,
      },
      {
        value: 28.7,
        name: "吉林市",
        itemStyle: { color: "#13c2c2" },
        sales: 35432.2,
      },
      {
        value: 12.5,
        name: "四平市",
        itemStyle: { color: "#52c41a" },
        sales: 15432.1,
      },
      {
        value: 4.2,
        name: "辽源市",
        itemStyle: { color: "#faad14" },
        sales: 5185.18,
      },
      {
        value: 1.8,
        name: "通化市",
        itemStyle: { color: "#f759ab" },
        sales: 2222.22,
      },
      {
        value: 0.5,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 617.28,
      },
    ],
  },
  黑龙江省: {
    totalSales: 178901.23,
    regions: [
      {
        value: 48.2,
        name: "哈尔滨市",
        itemStyle: { color: "#1890ff" },
        sales: 86250.39,
      },
      {
        value: 22.8,
        name: "齐齐哈尔市",
        itemStyle: { color: "#13c2c2" },
        sales: 40789.48,
      },
      {
        value: 15.6,
        name: "大庆市",
        itemStyle: { color: "#52c41a" },
        sales: 27908.59,
      },
      {
        value: 8.1,
        name: "佳木斯市",
        itemStyle: { color: "#faad14" },
        sales: 14491.0,
      },
      {
        value: 3.8,
        name: "牡丹江市",
        itemStyle: { color: "#f759ab" },
        sales: 6798.25,
      },
      {
        value: 1.5,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 2685.18,
      },
    ],
  },
  安徽省: {
    totalSales: 245678.9,
    regions: [
      {
        value: 42.5,
        name: "合肥市",
        itemStyle: { color: "#1890ff" },
        sales: 104413.54,
      },
      {
        value: 25.8,
        name: "芜湖市",
        itemStyle: { color: "#13c2c2" },
        sales: 63385.16,
      },
      {
        value: 14.2,
        name: "蚌埠市",
        itemStyle: { color: "#52c41a" },
        sales: 34886.4,
      },
      {
        value: 9.6,
        name: "淮南市",
        itemStyle: { color: "#faad14" },
        sales: 23585.17,
      },
      {
        value: 5.3,
        name: "马鞍山市",
        itemStyle: { color: "#f759ab" },
        sales: 13020.98,
      },
      {
        value: 2.6,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 6387.65,
      },
    ],
  },
  福建省: {
    totalSales: 312456.78,
    regions: [
      {
        value: 35.8,
        name: "福州市",
        itemStyle: { color: "#1890ff" },
        sales: 111859.53,
      },
      {
        value: 32.4,
        name: "厦门市",
        itemStyle: { color: "#13c2c2" },
        sales: 101235.98,
      },
      {
        value: 18.6,
        name: "泉州市",
        itemStyle: { color: "#52c41a" },
        sales: 58116.96,
      },
      {
        value: 8.7,
        name: "漳州市",
        itemStyle: { color: "#faad14" },
        sales: 27183.74,
      },
      {
        value: 2.8,
        name: "莆田市",
        itemStyle: { color: "#f759ab" },
        sales: 8748.79,
      },
      {
        value: 1.7,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 5311.78,
      },
    ],
  },
  江西省: {
    totalSales: 198765.43,
    regions: [
      {
        value: 45.2,
        name: "南昌市",
        itemStyle: { color: "#1890ff" },
        sales: 89842.17,
      },
      {
        value: 22.8,
        name: "赣州市",
        itemStyle: { color: "#13c2c2" },
        sales: 45318.56,
      },
      {
        value: 15.6,
        name: "九江市",
        itemStyle: { color: "#52c41a" },
        sales: 31007.41,
      },
      {
        value: 9.2,
        name: "吉安市",
        itemStyle: { color: "#faad14" },
        sales: 18286.42,
      },
      {
        value: 4.8,
        name: "宜春市",
        itemStyle: { color: "#f759ab" },
        sales: 9540.74,
      },
      {
        value: 2.4,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 4770.13,
      },
    ],
  },
  广西壮族自治区: {
    totalSales: 167890.12,
    regions: [
      {
        value: 42.8,
        name: "南宁市",
        itemStyle: { color: "#1890ff" },
        sales: 71856.97,
      },
      {
        value: 28.5,
        name: "柳州市",
        itemStyle: { color: "#13c2c2" },
        sales: 47848.68,
      },
      {
        value: 15.2,
        name: "桂林市",
        itemStyle: { color: "#52c41a" },
        sales: 25519.3,
      },
      {
        value: 8.6,
        name: "梧州市",
        itemStyle: { color: "#faad14" },
        sales: 14438.55,
      },
      {
        value: 3.2,
        name: "北海市",
        itemStyle: { color: "#f759ab" },
        sales: 5372.48,
      },
      {
        value: 1.7,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 2854.14,
      },
    ],
  },
  海南省: {
    totalSales: 89123.45,
    regions: [
      {
        value: 68.5,
        name: "海口市",
        itemStyle: { color: "#1890ff" },
        sales: 61049.56,
      },
      {
        value: 28.7,
        name: "三亚市",
        itemStyle: { color: "#13c2c2" },
        sales: 25578.43,
      },
      {
        value: 2.1,
        name: "儋州市",
        itemStyle: { color: "#52c41a" },
        sales: 1871.59,
      },
      {
        value: 0.5,
        name: "三沙市",
        itemStyle: { color: "#faad14" },
        sales: 445.62,
      },
      {
        value: 0.2,
        name: "其他市县",
        itemStyle: { color: "#f759ab" },
        sales: 178.25,
      },
    ],
  },
  重庆市: {
    totalSales: 345678.9,
    regions: [
      {
        value: 52.8,
        name: "渝中区",
        itemStyle: { color: "#1890ff" },
        sales: 182518.46,
      },
      {
        value: 18.5,
        name: "江北区",
        itemStyle: { color: "#13c2c2" },
        sales: 63950.6,
      },
      {
        value: 12.3,
        name: "渝北区",
        itemStyle: { color: "#52c41a" },
        sales: 42518.5,
      },
      {
        value: 8.7,
        name: "沙坪坝区",
        itemStyle: { color: "#faad14" },
        sales: 30074.06,
      },
      {
        value: 4.9,
        name: "九龙坡区",
        itemStyle: { color: "#f759ab" },
        sales: 16938.27,
      },
      {
        value: 2.8,
        name: "其他区县",
        itemStyle: { color: "#722ed1" },
        sales: 9679.01,
      },
    ],
  },
  贵州省: {
    totalSales: 134567.89,
    regions: [
      {
        value: 48.6,
        name: "贵阳市",
        itemStyle: { color: "#1890ff" },
        sales: 65400.0,
      },
      {
        value: 22.8,
        name: "遵义市",
        itemStyle: { color: "#13c2c2" },
        sales: 30681.48,
      },
      {
        value: 12.5,
        name: "六盘水市",
        itemStyle: { color: "#52c41a" },
        sales: 16820.99,
      },
      {
        value: 8.9,
        name: "安顺市",
        itemStyle: { color: "#faad14" },
        sales: 11976.54,
      },
      {
        value: 4.7,
        name: "毕节市",
        itemStyle: { color: "#f759ab" },
        sales: 6324.69,
      },
      {
        value: 2.5,
        name: "其他州市",
        itemStyle: { color: "#722ed1" },
        sales: 3364.19,
      },
    ],
  },
  云南省: {
    totalSales: 198765.43,
    regions: [
      {
        value: 45.8,
        name: "昆明市",
        itemStyle: { color: "#1890ff" },
        sales: 91054.57,
      },
      {
        value: 18.5,
        name: "曲靖市",
        itemStyle: { color: "#13c2c2" },
        sales: 36771.6,
      },
      {
        value: 12.3,
        name: "红河州",
        itemStyle: { color: "#52c41a" },
        sales: 24448.15,
      },
      {
        value: 9.8,
        name: "大理州",
        itemStyle: { color: "#faad14" },
        sales: 19479.01,
      },
      {
        value: 7.2,
        name: "丽江市",
        itemStyle: { color: "#f759ab" },
        sales: 14311.11,
      },
      {
        value: 6.4,
        name: "其他州市",
        itemStyle: { color: "#722ed1" },
        sales: 12700.99,
      },
    ],
  },
  西藏自治区: {
    totalSales: 45678.9,
    regions: [
      {
        value: 58.5,
        name: "拉萨市",
        itemStyle: { color: "#1890ff" },
        sales: 26722.16,
      },
      {
        value: 18.7,
        name: "日喀则市",
        itemStyle: { color: "#13c2c2" },
        sales: 8541.95,
      },
      {
        value: 12.8,
        name: "昌都市",
        itemStyle: { color: "#52c41a" },
        sales: 5846.9,
      },
      {
        value: 6.2,
        name: "林芝市",
        itemStyle: { color: "#faad14" },
        sales: 2832.09,
      },
      {
        value: 2.5,
        name: "山南市",
        itemStyle: { color: "#f759ab" },
        sales: 1141.97,
      },
      {
        value: 1.3,
        name: "其他地区",
        itemStyle: { color: "#722ed1" },
        sales: 593.83,
      },
    ],
  },
  陕西省: {
    totalSales: 289012.34,
    regions: [
      {
        value: 52.8,
        name: "西安市",
        itemStyle: { color: "#1890ff" },
        sales: 152598.52,
      },
      {
        value: 18.5,
        name: "宝鸡市",
        itemStyle: { color: "#13c2c2" },
        sales: 53467.28,
      },
      {
        value: 12.8,
        name: "咸阳市",
        itemStyle: { color: "#52c41a" },
        sales: 36993.58,
      },
      {
        value: 8.2,
        name: "渭南市",
        itemStyle: { color: "#faad14" },
        sales: 23699.01,
      },
      {
        value: 4.9,
        name: "汉中市",
        itemStyle: { color: "#f759ab" },
        sales: 14161.6,
      },
      {
        value: 2.8,
        name: "其他城市",
        itemStyle: { color: "#722ed1" },
        sales: 8092.35,
      },
    ],
  },
  甘肃省: {
    totalSales: 112345.67,
    regions: [
      {
        value: 48.5,
        name: "兰州市",
        itemStyle: { color: "#1890ff" },
        sales: 54487.65,
      },
      {
        value: 18.8,
        name: "天水市",
        itemStyle: { color: "#13c2c2" },
        sales: 21120.99,
      },
      {
        value: 12.5,
        name: "庆阳市",
        itemStyle: { color: "#52c41a" },
        sales: 14043.21,
      },
      {
        value: 9.2,
        name: "平凉市",
        itemStyle: { color: "#faad14" },
        sales: 10335.8,
      },
      {
        value: 6.8,
        name: "武威市",
        itemStyle: { color: "#f759ab" },
        sales: 7639.51,
      },
      {
        value: 4.2,
        name: "其他州市",
        itemStyle: { color: "#722ed1" },
        sales: 4718.51,
      },
    ],
  },
  青海省: {
    totalSales: 67890.12,
    regions: [
      {
        value: 62.8,
        name: "西宁市",
        itemStyle: { color: "#1890ff" },
        sales: 42635.36,
      },
      {
        value: 22.5,
        name: "海东市",
        itemStyle: { color: "#13c2c2" },
        sales: 15275.28,
      },
      {
        value: 8.7,
        name: "海西州",
        itemStyle: { color: "#52c41a" },
        sales: 5906.44,
      },
      {
        value: 3.8,
        name: "海北州",
        itemStyle: { color: "#faad14" },
        sales: 2579.82,
      },
      {
        value: 1.5,
        name: "黄南州",
        itemStyle: { color: "#f759ab" },
        sales: 1018.35,
      },
      {
        value: 0.7,
        name: "其他州",
        itemStyle: { color: "#722ed1" },
        sales: 474.87,
      },
    ],
  },
  宁夏回族自治区: {
    totalSales: 78901.23,
    regions: [
      {
        value: 58.5,
        name: "银川市",
        itemStyle: { color: "#1890ff" },
        sales: 46157.22,
      },
      {
        value: 22.8,
        name: "吴忠市",
        itemStyle: { color: "#13c2c2" },
        sales: 17993.48,
      },
      {
        value: 12.5,
        name: "石嘴山市",
        itemStyle: { color: "#52c41a" },
        sales: 9862.65,
      },
      {
        value: 4.7,
        name: "固原市",
        itemStyle: { color: "#faad14" },
        sales: 3708.36,
      },
      {
        value: 1.5,
        name: "中卫市",
        itemStyle: { color: "#f759ab" },
        sales: 1183.52,
      },
    ],
  },
  新疆维吾尔自治区: {
    totalSales: 156789.01,
    regions: [
      {
        value: 48.2,
        name: "乌鲁木齐市",
        itemStyle: { color: "#1890ff" },
        sales: 75572.3,
      },
      {
        value: 15.8,
        name: "昌吉州",
        itemStyle: { color: "#13c2c2" },
        sales: 24772.66,
      },
      {
        value: 12.5,
        name: "喀什地区",
        itemStyle: { color: "#52c41a" },
        sales: 19598.63,
      },
      {
        value: 9.8,
        name: "阿克苏地区",
        itemStyle: { color: "#faad14" },
        sales: 15365.32,
      },
      {
        value: 7.2,
        name: "伊犁州",
        itemStyle: { color: "#f759ab" },
        sales: 11288.89,
      },
      {
        value: 6.5,
        name: "其他地区",
        itemStyle: { color: "#722ed1" },
        sales: 10191.21,
      },
    ],
  },
};

// 状态监控面板组件 - 现在通过ECharts拖拽管理
const StatusMonitorPanel = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    business: { count: 7, trend: "up" },
    stores: { count: 24, trend: "up" },
    outlets: { count: 120, trend: "up" },
  });

  const [monitorData, setMonitorData] = useState([
    { id: 1, name: "店端测控指挥中心", value: "1240Mb" },
    { id: 2, name: "店端测控指挥中心", value: "1240Mb" },
    { id: 3, name: "店端测控指挥中心", value: "1240Mb" },
    { id: 4, name: "店端测控指挥中心监控中心", value: "1240Mb" },
    { id: 5, name: "店端测控指挥中心", value: "1240Mb" },
  ]);

  // 数据更新效果
  useEffect(() => {
    const interval = setInterval(() => {
      // 随机更新统计数据
      setStats((prev) => ({
        business: {
          count: prev.business.count + Math.floor(Math.random() * 3),
          trend: "up",
        },
        stores: {
          count: prev.stores.count + Math.floor(Math.random() * 2),
          trend: "up",
        },
        outlets: {
          count: prev.outlets.count + Math.floor(Math.random() * 5),
          trend: "up",
        },
      }));

      // 随机更新监控数据
      setMonitorData((prev) =>
        prev.map((item) => ({
          ...item,
          value: `${1200 + Math.floor(Math.random() * 100)}Mb`,
        }))
      );
    }, 3000); // 每3秒更新一次

    return () => clearInterval(interval);
  }, []);

  // 点击事件处理函数
  const handleStatsClick = () => {
    console.log("📊 点击统计面板，跳转到lbt页面");
    console.log("🔍 当前路径:", window.location.pathname);
    try {
      navigate("/system/carousel", {
        state: {
          type: "stats",
          title: "业务统计监控中心",
          data: stats,
          centerData: {
            name: "业务统计监控中心",
            value: `${
              stats.business.count + stats.stores.count + stats.outlets.count
            }`,
            ranking: 1,
            totalCenters: 5,
            images: ["/1.jpg", "/2.jpg", "/3.jpg"],
            description:
              "业务统计监控中心负责实时监控和分析各项业务数据指标，为决策提供数据支持。该中心整合了全渠道业务数据，提供实时的业务洞察和趋势分析。",
            details: {
              location: "数据中心大楼B座5层",
              capacity: `${
                stats.business.count + stats.stores.count + stats.outlets.count
              }`,
              status: "正常运行",
              uptime: "99.95%",
              lastUpdate: new Date().toLocaleString("zh-CN"),
              features: [
                "实时业务数据监控",
                "智能数据分析",
                "趋势预测报告",
                "异常数据告警",
                "多维度数据展示",
              ],
              performance: {
                cpuUsage: 35,
                memoryUsage: 48,
                diskUsage: 42,
                networkSpeed: 1500,
              },
            },
          },
        },
      });
      console.log("✅ 跳转命令已执行");
    } catch (error) {
      console.error("❌ 跳转失败:", error);
    }
  };

  const handleMonitorClick = () => {
    console.log("📈 点击监控排行榜，跳转到lbt页面");
    navigate("/system/carousel", {
      state: {
        type: "monitor",
        title: "监控排行榜中心",
        data: monitorData,
        centerData: {
          name: "监控排行榜中心",
          value: `${monitorData.length}个中心`,
          ranking: 1,
          totalCenters: 5,
          images: ["/1.jpg", "/2.jpg", "/3.jpg"],
          description:
            "监控排行榜中心提供各个指挥中心的实时排名和性能对比，帮助管理者了解各中心的运行状态和效率表现。该中心采用先进的数据聚合和分析技术。",
          details: {
            location: "数据中心大楼C座4层",
            capacity: `${monitorData.length}个监控中心`,
            status: "正常运行",
            uptime: "99.8%",
            lastUpdate: new Date().toLocaleString("zh-CN"),
            features: [
              "实时排名监控",
              "性能对比分析",
              "历史趋势追踪",
              "异常中心告警",
              "自动报告生成",
            ],
            performance: {
              cpuUsage: 28,
              memoryUsage: 55,
              diskUsage: 33,
              networkSpeed: 1350,
            },
          },
        },
      },
    });
  };

  // 点击具体指挥中心项目的处理函数
  const handleCommandCenterClick = (item, index) => {
    console.log(`🏢 点击指挥中心: ${item.name}`);
    navigate("/lbt", {
      state: {
        type: "commandCenter",
        title: item.name,
        id: item.id,
        ranking: index + 1,
        value: item.value,
        centerData: {
          name: item.name,
          value: item.value,
          ranking: index + 1,
          totalCenters: monitorData.length,
          images: ["/1.jpg", "/2.jpg", "/3.jpg"],
          description: `${item.name}是我们重要的数据监控与指挥调度中心，负责实时监控各项业务指标，确保系统稳定运行。该中心配备了先进的监控设备和专业的技术团队，7x24小时不间断为您提供服务。`,
          details: {
            location: "数据中心大楼A座3层",
            capacity: item.value,
            status: "正常运行",
            uptime: "99.9%",
            lastUpdate: new Date().toLocaleString("zh-CN"),
            features: [
              "实时数据监控",
              "智能告警系统",
              "自动故障恢复",
              "24小时值守服务",
              "数据安全保障",
            ],
            performance: {
              cpuUsage: Math.floor(Math.random() * 30) + 20,
              memoryUsage: Math.floor(Math.random() * 40) + 30,
              diskUsage: Math.floor(Math.random() * 50) + 25,
              networkSpeed: Math.floor(Math.random() * 500) + 800,
            },
          },
        },
      },
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "260px",
        right: "35px", 
        zIndex: 998, // 低于ECharts拖拽层级
        background: "rgba(45, 55, 72, 0.85)",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid rgba(129, 140, 248, 0.4)",
        backdropFilter: "blur(15px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        pointerEvents: "none", // 让ECharts层处理交互
        animation: "slideInFromRight 0.8s ease-out",
        isolation: "isolate",
        userSelect: "none",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
        }}
      >
        {/* 左侧统计面板 */}
        <div
          style={{
            width: "200px",
            background: "rgba(55, 65, 82, 0.6)",
            borderRadius: "8px",
            padding: "20px",
            border: "1px solid rgba(129, 140, 248, 0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onClick={handleStatsClick}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(55, 65, 82, 0.8)";
            e.target.style.transform = "scale(1.02)";
            e.target.style.boxShadow = "0 8px 24px rgba(129, 140, 248, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(55, 65, 82, 0.6)";
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
        >
          {/* 业务统计 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(129, 140, 248, 0.2)",
            }}
          >
            <span
              style={{
                color: "#E2E8F0",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              业务
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  color: "#60A5FA",
                  fontSize: "24px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  textShadow: "0 0 10px rgba(96, 165, 250, 0.5)",
                  transition: "all 0.3s ease",
                }}
              >
                {stats.business.count}
              </span>
              <span
                style={{
                  color: "#10B981",
                  fontSize: "12px",
                }}
              >
                ↑
              </span>
            </div>
          </div>

          {/* 店铺统计 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(129, 140, 248, 0.2)",
            }}
          >
            <span
              style={{
                color: "#E2E8F0",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              店铺
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  color: "#34D399",
                  fontSize: "24px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  textShadow: "0 0 10px rgba(52, 211, 153, 0.5)",
                  transition: "all 0.3s ease",
                }}
              >
                {stats.stores.count}
              </span>
              <span
                style={{
                  color: "#10B981",
                  fontSize: "12px",
                }}
              >
                ↑
              </span>
            </div>
          </div>

          {/* 网点统计 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: "#E2E8F0",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              网点
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  color: "#10B981",
                  fontSize: "24px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  textShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
                  transition: "all 0.3s ease",
                }}
              >
                {stats.outlets.count}
              </span>
              <span
                style={{
                  color: "#10B981",
                  fontSize: "12px",
                }}
              >
                ↑
              </span>
            </div>
          </div>
        </div>

        {/* 右侧监控排行榜 */}
        <div
          style={{
            width: "280px",
            background: "rgba(55, 65, 82, 0.6)",
            borderRadius: "8px",
            padding: "16px",
            border: "1px solid rgba(129, 140, 248, 0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onClick={handleMonitorClick}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(55, 65, 82, 0.8)";
            e.target.style.transform = "scale(1.02)";
            e.target.style.boxShadow = "0 8px 24px rgba(129, 140, 248, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(55, 65, 82, 0.6)";
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
        >
          {/* 标题 */}
          <div
            style={{
              color: "#E2E8F0",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid rgba(129, 140, 248, 0.3)",
              textAlign: "center",
            }}
          >
            店端监控排行榜
          </div>

          {/* 监控数据列表 */}
          <div
            style={{
              height: "130px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                animation: "autoScroll 15s linear infinite",
                paddingBottom: "130px", // 添加底部填充以确保循环平滑
              }}
            >
              {/* 原始数据 */}
              {monitorData.map((item, index) => (
                <div
                  key={`original-${item.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(129, 140, 248, 0.1)",
                    minHeight: "32px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    borderRadius: "4px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止冒泡到父级
                    handleCommandCenterClick(item, index);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(129, 140, 248, 0.1)";
                    e.target.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        color: "#60A5FA",
                        fontSize: "12px",
                        fontWeight: "bold",
                        minWidth: "16px",
                        textShadow: "0 0 5px rgba(96, 165, 250, 0.4)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      style={{
                        color: "#CBD5E0",
                        fontSize: "11px",
                        maxWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#10B981",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      fontWeight: "600",
                      textShadow: "0 0 5px rgba(16, 185, 129, 0.4)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
              {/* 重复数据以实现无缝循环 */}
              {monitorData.map((item, index) => (
                <div
                  key={`duplicate-${item.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(129, 140, 248, 0.1)",
                    minHeight: "32px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    borderRadius: "4px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止冒泡到父级
                    handleCommandCenterClick(item, index);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(129, 140, 248, 0.1)";
                    e.target.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        color: "#60A5FA",
                        fontSize: "12px",
                        fontWeight: "bold",
                        minWidth: "16px",
                        textShadow: "0 0 5px rgba(96, 165, 250, 0.4)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      style={{
                        color: "#CBD5E0",
                        fontSize: "11px",
                        maxWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#10B981",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      fontWeight: "600",
                      textShadow: "0 0 5px rgba(16, 185, 129, 0.4)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3D可拖拽地球组件
const Interactive3DEarth = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [autoRotation, setAutoRotation] = useState(0);
  const earthRef = useRef(null);

  // 自动旋转
  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        setAutoRotation((prev) => prev + 0.5);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isDragging]);

  // 鼠标事件处理
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotation((prev) => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, lastMousePos]);

  return (
    <div
      ref={earthRef}
      style={{
        width: "140px",
        height: "140px",
        position: "relative",
        cursor: isDragging ? "grabbing" : "grab",
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 地球球体 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          position: "relative",
          transform: `rotateX(${rotation.x}deg) rotateY(${
            rotation.y + autoRotation
          }deg)`,
          transformStyle: "preserve-3d",
          transition: isDragging ? "none" : "transform 0.1s ease-out",
          background: `
            radial-gradient(ellipse 70% 40% at 30% 25%, 
              rgba(135, 206, 250, 1) 0%,
              rgba(100, 180, 255, 0.95) 8%,
              rgba(70, 150, 255, 0.8) 20%,
              rgba(50, 120, 200, 0.6) 35%,
              transparent 50%
            ),
            radial-gradient(ellipse 120% 80% at 50% 50%, 
              rgba(30, 144, 255, 1) 0%,
              rgba(25, 120, 220, 1) 15%,
              rgba(20, 100, 180, 1) 30%,
              rgba(15, 80, 150, 1) 45%,
              rgba(10, 60, 120, 1) 60%,
              rgba(8, 45, 90, 1) 75%,
              rgba(5, 30, 60, 1) 90%,
              rgba(3, 20, 40, 1) 100%
            ),
            radial-gradient(ellipse 50% 30% at 75% 75%, 
              transparent 0%,
              rgba(0, 30, 60, 0.4) 30%,
              rgba(0, 20, 50, 0.8) 70%,
              rgba(0, 10, 30, 0.95) 100%
            )
          `,
          boxShadow: `
            0 0 60px rgba(100, 180, 255, 0.6),
            0 0 120px rgba(135, 206, 250, 0.3),
            0 0 200px rgba(30, 144, 255, 0.2),
            0 30px 60px rgba(0, 0, 0, 0.7),
            inset -35px -35px 70px rgba(0, 30, 80, 0.8),
            inset 25px 25px 50px rgba(135, 206, 250, 0.2),
            inset -60px -60px 120px rgba(0, 0, 0, 0.6),
            inset 8px 8px 25px rgba(100, 180, 255, 0.3)
          `,
          filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6))",
        }}
      >
        {/* 地球纬线 */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "5%",
            width: "90%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 10%, rgba(100,180,255,0.3) 50%, transparent 90%)",
            borderRadius: "50%",
            opacity: 0.5,
            transform: "perspective(200px) rotateX(60deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "3%",
            width: "94%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 5%, rgba(135,206,250,0.4) 50%, transparent 95%)",
            borderRadius: "50%",
            opacity: 0.6,
            transform: "perspective(200px) rotateX(0deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "65%",
            left: "5%",
            width: "90%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 10%, rgba(100,180,255,0.3) 50%, transparent 90%)",
            borderRadius: "50%",
            opacity: 0.5,
            transform: "perspective(200px) rotateX(-60deg)",
          }}
        />

        {/* 地球大陆轮廓 */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `
            radial-gradient(ellipse 20% 30% at 30% 40%, 
              rgba(34, 139, 34, 0.6) 0%,
              rgba(85, 107, 47, 0.8) 50%,
              transparent 70%
            ),
            radial-gradient(ellipse 15% 25% at 70% 30%, 
              rgba(139, 69, 19, 0.5) 0%,
              rgba(160, 82, 45, 0.7) 50%,
              transparent 70%
            ),
            radial-gradient(ellipse 25% 35% at 60% 70%, 
              rgba(34, 139, 34, 0.6) 0%,
              rgba(85, 107, 47, 0.8) 50%,
              transparent 70%
            )
          `,
            opacity: 0.6,
            mixBlendMode: "multiply",
          }}
        />

        {/* 白色云层 */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `
            radial-gradient(ellipse 15% 20% at 40% 30%, 
              rgba(255, 255, 255, 0.7) 0%,
              rgba(255, 255, 255, 0.3) 50%,
              transparent 70%
            ),
            radial-gradient(ellipse 12% 18% at 70% 60%, 
              rgba(255, 255, 255, 0.6) 0%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 70%
            ),
            radial-gradient(ellipse 18% 25% at 25% 70%, 
              rgba(255, 255, 255, 0.5) 0%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 70%
            )
          `,
            opacity: 0.8,
            mixBlendMode: "normal",
          }}
        />

        {/* 地球核心光点 */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "45%",
            width: "6px",
            height: "6px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9), rgba(135,206,250,0.6))",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 12px rgba(135,206,250,0.6)",
            opacity: 0.8,
          }}
        />

        {/* 地球高光 */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "30%",
            width: "40px",
            height: "30px",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "rotate(-20deg)",
            opacity: 0.8,
          }}
        />
      </div>

      {/* 拖拽提示 */}
      {!isDragging && (
        <div
          style={{
            position: "absolute",
            bottom: "-25px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(135, 206, 250, 0.8)",
            fontSize: "10px",
            fontFamily: "monospace",
            textAlign: "center",
            pointerEvents: "none",
            animation: "neonPulse 3s ease-in-out infinite",
          }}
        >
          🖱️ 拖拽旋转
        </div>
      )}
    </div>
  );
};

// 数字滚动动画组件
const AnimatedNumber = ({
  targetValue,
  duration = 20000,
  formatter = (val) => val,
  onValueUpdate,
}) => {
  const [currentValue, setCurrentValue] = useState(() => {
    // 如果有全局状态且动画正在运行，计算当前值
    if (globalAnimationState.isRunning && globalAnimationState.startTime) {
      const elapsedTime = Date.now() - globalAnimationState.startTime;
      const progress = Math.min(elapsedTime / globalAnimationState.duration, 1);

      // 如果动画已经完成，返回目标值
      if (progress >= 1) {
        globalAnimationState.isRunning = false;
        return globalAnimationState.targetValue;
      }

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      return (globalAnimationState.currentValue =
        0 + (globalAnimationState.targetValue - 0) * easeOutQuart);
    }

    // 如果动画不在运行且有保存的当前值，使用保存的值
    if (globalAnimationState.currentValue > 0) {
      return globalAnimationState.currentValue;
    }

    return 0;
  });

  React.useEffect(() => {
    let animationId;

    // 如果动画没有开始，并且当前值还没有达到目标值，初始化全局状态
    if (
      !globalAnimationState.isRunning &&
      globalAnimationState.currentValue < targetValue
    ) {
      globalAnimationState.startTime = Date.now();
      globalAnimationState.isRunning = true;
      globalAnimationState.currentValue = 0;
      globalAnimationState.targetValue = targetValue; // 更新目标值
      console.log(
        `🚀 开始销售总额动画，目标值: ${targetValue.toFixed(2)}元，预计20秒完成`
      );
    }

    const animate = () => {
      if (!globalAnimationState.startTime || !globalAnimationState.isRunning)
        return;

      const elapsedTime = Date.now() - globalAnimationState.startTime;
      const progress = Math.min(elapsedTime / globalAnimationState.duration, 1);

      // 检查是否已经完成动画
      if (progress >= 1) {
        // 动画完成，设置最终值
        globalAnimationState.currentValue = globalAnimationState.targetValue;
        setCurrentValue(globalAnimationState.targetValue);
        globalAnimationState.isRunning = false;

        // 通知父组件动画完成
        if (onValueUpdate) {
          onValueUpdate(globalAnimationState.targetValue, 1);
        }

        console.log(
          `💰 销售总额动画完成，最终值: ${globalAnimationState.targetValue.toFixed(
            2
          )}元`
        );
        return; // 直接返回，不再继续动画
      }

      // 使用更平缓的缓动函数让数字增长更慢
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // 更平缓的缓动
      const current = 0 + (globalAnimationState.targetValue - 0) * easeOutQuart;

      globalAnimationState.currentValue = current;
      setCurrentValue(current);

      // 通知父组件当前值（用于调试）
      if (onValueUpdate) {
        onValueUpdate(current, progress);
      }

      // 继续动画
      animationId = requestAnimationFrame(animate);
    };

    // 只有在动画正在运行时才启动requestAnimationFrame
    if (globalAnimationState.isRunning) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [targetValue, duration, onValueUpdate]);

  return formatter(currentValue);
};

// 销售总额圆环图组件
const SalesOverviewChart = ({
  visible,
  onClose,
  selectedRegion = "全国",
  forceUpdate,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [animationProgress, setAnimationProgress] = useState(0);

  React.useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else {
      // 延迟隐藏以显示动画
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // 处理数值更新回调
  const handleValueUpdate = (currentValue, progress) => {
    setAnimationProgress(progress);
    // 调试输出，可以看到动画进度
    if (progress % 0.01 < 0.001) {
      // 每1%输出一次
      console.log(
        `💰 销售总额加载进度: ${(progress * 100).toFixed(
          1
        )}% - 当前值: ${currentValue.toFixed(2)}元`
      );
    }
  };

  // 根据选中地区更新全局动画目标值
  React.useEffect(() => {
    console.log(`🔄 selectedRegion 变化: ${selectedRegion}`);
    const regionData =
      regionSalesData[selectedRegion] || regionSalesData["全国"];

    if (globalAnimationState.targetValue !== regionData.totalSales) {
      globalAnimationState.targetValue = regionData.totalSales;
      globalAnimationState.startTime = Date.now(); // 重新开始动画
      globalAnimationState.isRunning = true;
      console.log(
        `🎯 切换到${selectedRegion}，销售总额目标: ${regionData.totalSales.toFixed(
          2
        )}元`
      );
    } else {
      console.log(
        `⚠️ 目标值相同，无需更新: ${regionData.totalSales.toFixed(2)}元`
      );
    }
  }, [selectedRegion, forceUpdate]);

  // 监听forceUpdate变化
  React.useEffect(() => {
    if (forceUpdate > 0) {
      console.log(
        `🔄 强制更新触发: ${forceUpdate}, 当前地区: ${selectedRegion}`
      );
    }
  }, [forceUpdate]);

  if (!isVisible) return null;

  const regionData = regionSalesData[selectedRegion] || regionSalesData["全国"];

  const chartOption = {
    animation: false, // 关闭动画，让环形图立即显示
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        const salesValue = params.data.sales || 0;
        return `${params.seriesName}<br/>${params.name}: ${
          params.percent
        }%<br/>销售额: ${salesValue
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}元`;
      },
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
      textStyle: {
        color: "#fff",
        fontSize: 12,
      },
    },
    title: [
      {
        text: selectedRegion,
        left: "25%",
        top: "12%",
        textAlign: "center",
        textStyle: {
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: 13,
          fontWeight: "bold",
        },
      },
    ],
    legend: {
      orient: "horizontal",
      bottom: "2%",
      left: "center",
      textStyle: {
        color: "rgba(255, 255, 255, 0.9)",
        fontSize: 8,
      },
      itemWidth: 5,
      itemHeight: 5,
      itemGap: 6,
      width: "90%",
    },
    series: [
      {
        name: `${selectedRegion}业务占比`,
        type: "pie",
        radius: ["28%", "48%"],
        center: ["25%", "45%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "outside",
          formatter: "{b}: {d}%",
          textStyle: {
            color: "#fff",
            fontSize: 11,
            fontWeight: "bold",
          },
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          label: {
            show: true,
            fontSize: 13,
            fontWeight: "bold",
            formatter: "{d}%",
            position: "outside",
            textStyle: {
              color: "#fff",
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowBlur: 2,
            },
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.6)",
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
        labelLine: {
          show: false,
          emphasis: {
            show: true,
            lineStyle: {
              color: "rgba(255, 255, 255, 0.9)",
              width: 2,
              type: "solid",
            },
            length: 10,
            length2: 15,
          },
        },
        data: regionData.regions,
      },
    ],
  };

  return (
    <div
      className="sales-overview-chart"
      style={{
        position: "fixed",
        top: "250px",
        left: "280px",
        zIndex: 1000,
        width: "320px",
        height: "220px",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        borderRadius: "8px",
        padding: "10px",
        pointerEvents: "auto",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(-10px) scale(0.95)",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* 关闭按钮 */}
      <CloseOutlined
        onClick={onClose}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "12px",
          cursor: "pointer",
          zIndex: 10,
          padding: "4px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          width: "18px",
          height: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
          e.target.style.color = "#fff";
          e.target.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
          e.target.style.color = "rgba(255, 255, 255, 0.8)";
          e.target.style.transform = "scale(1)";
        }}
      />

      {/* 动画销售总额 */}
      <div
        style={{
          position: "absolute",
          right: "3%",
          top: "45%",
          transform: "translateY(-50%)",
          textAlign: "center",
          zIndex: 5,
          pointerEvents: "none",
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          borderRadius: "8px",
          padding: "10px 14px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          minWidth: "140px",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            fontFamily: "Arial, sans-serif",
            marginBottom: "3px",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
            lineHeight: "1.2",
          }}
        >
          <AnimatedNumber
            targetValue={regionData.totalSales}
            duration={20000}
            onValueUpdate={handleValueUpdate}
            formatter={(val) =>
              `${val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}元`
            }
          />
        </div>
        <div
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "11px",
            fontWeight: "normal",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
            marginBottom: "2px",
          }}
        >
          {selectedRegion}销售总额
        </div>
        {/* 显示加载进度 */}
        <div
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "8px",
            marginTop: "2px",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
          }}
        >
          {globalAnimationState.isRunning &&
            animationProgress > 0 &&
            animationProgress < 1 &&
            `加载中: ${(animationProgress * 100).toFixed(1)}%`}
          {(!globalAnimationState.isRunning || animationProgress >= 1) &&
            "✅ 加载完成"}
        </div>
      </div>

      <ReactECharts
        key={`chart-${selectedRegion}-${forceUpdate}`}
        option={chartOption}
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
        opts={{
          renderer: "canvas",
        }}
        notMerge={true}
        onEvents={{
          mouseover: (params) => {
            // 鼠标悬停时的效果
            if (params.componentType === "series") {
              console.log(`悬停在${params.name}: ${params.percent}%`);
            }
          },
          mouseout: (params) => {
            // 鼠标离开时的效果
            if (params.componentType === "series") {
              console.log(`离开${params.name}`);
            }
          },
        }}
      />
    </div>
  );
};

// 3D地球组件
const Globe3D = ({ visible, onClose, onToggleFullscreen, isFullscreen }) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // 超现代化CSS动画样式
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes cyberGlobeRotate {
        from { transform: perspective(1000px) rotateX(12deg) rotateY(0deg) rotateZ(-3deg); }
        to { transform: perspective(1000px) rotateX(12deg) rotateY(360deg) rotateZ(-3deg); }
      }
      @keyframes neonPulse {
        0%, 100% { 
          filter: hue-rotate(0deg) brightness(1.2) saturate(1.5);
          transform: scale(1);
          box-shadow: 
            0 0 30px #00d4ff,
            0 0 60px #00d4ff,
            0 0 90px #00d4ff,
            0 0 120px rgba(0, 212, 255, 0.5);
        }
        25% {
          filter: hue-rotate(60deg) brightness(1.4) saturate(1.8);
          transform: scale(1.03);
          box-shadow: 
            0 0 35px #40ff00,
            0 0 70px #40ff00,
            0 0 105px #40ff00,
            0 0 140px rgba(64, 255, 0, 0.5);
        }
        50% { 
          filter: hue-rotate(120deg) brightness(1.3) saturate(1.6);
          transform: scale(1.05);
          box-shadow: 
            0 0 40px #ff4000,
            0 0 80px #ff4000,
            0 0 120px #ff4000,
            0 0 160px rgba(255, 64, 0, 0.5);
        }
        75% {
          filter: hue-rotate(180deg) brightness(1.4) saturate(1.8);
          transform: scale(1.03);
          box-shadow: 
            0 0 35px #ff00d4,
            0 0 70px #ff00d4,
            0 0 105px #ff00d4,
            0 0 140px rgba(255, 0, 212, 0.5);
        }
      }
      @keyframes circuitFlow {
        0% { 
          stroke-dashoffset: 1500;
          opacity: 0.4;
          filter: drop-shadow(0 0 3px currentColor);
        }
        50% {
          opacity: 1;
          filter: drop-shadow(0 0 8px currentColor);
        }
        100% { 
          stroke-dashoffset: 0;
          opacity: 0.4;
          filter: drop-shadow(0 0 3px currentColor);
        }
      }
      @keyframes digitalRain {
        0% { 
          transform: translateY(-120px) scale(0.3);
          opacity: 0;
        }
        10% {
          opacity: 1;
          transform: translateY(-90px) scale(0.8);
        }
        90% {
          opacity: 1;
          transform: translateY(200px) scale(1.2);
        }
        100% { 
          transform: translateY(240px) scale(1.5);
          opacity: 0;
        }
      }
      @keyframes electroSpin {
        from { 
          transform: rotate(0deg) scale(1);
          opacity: 0.7;
        }
        50% {
          transform: rotate(180deg) scale(1.15);
          opacity: 1;
        }
        to { 
          transform: rotate(360deg) scale(1);
          opacity: 0.7;
        }
      }
      @keyframes dataPacket {
        0% { 
          transform: rotate(0deg) translateX(90px) rotate(0deg) scale(0);
          opacity: 0;
        }
        10% {
          opacity: 1;
          transform: rotate(30deg) translateX(90px) rotate(-30deg) scale(1.2);
        }
        90% {
          opacity: 1;
          transform: rotate(330deg) translateX(90px) rotate(-330deg) scale(1.2);
        }
        100% { 
          transform: rotate(360deg) translateX(90px) rotate(-360deg) scale(0);
          opacity: 0;
        }
      }
      @keyframes quantumFlicker {
        0%, 100% { 
          transform: translate(0) scale(1);
          filter: hue-rotate(0deg) brightness(1);
        }
        3% { 
          transform: translate(-1px, 2px) scale(1.02);
          filter: hue-rotate(45deg) brightness(1.3);
        }
        6% { 
          transform: translate(2px, -1px) scale(0.98);
          filter: hue-rotate(90deg) brightness(0.8);
        }
        9% { 
          transform: translate(0) scale(1);
          filter: hue-rotate(0deg) brightness(1);
        }
      }
      @keyframes energyWave {
        0% { 
          transform: scale(0.5);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.3;
        }
        100% { 
          transform: scale(2);
          opacity: 0;
        }
      }
      .cyber-globe-main {
        animation: cyberGlobeRotate 20s linear infinite;
      }
      .cyber-neon-field {
        animation: neonPulse 2.5s ease-in-out infinite;
      }
      .cyber-circuit-line {
        animation: circuitFlow 3s linear infinite;
      }
      .cyber-rain-drop {
        animation: digitalRain 2.5s linear infinite;
      }
      .cyber-electro-ring {
        animation: electroSpin 6s linear infinite;
      }
      .cyber-data-packet {
        animation: dataPacket 4s linear infinite;
      }
      .cyber-glitch {
        animation: quantumFlicker 4s infinite;
      }
      .energy-wave {
        animation: energyWave 3s ease-out infinite;
      }
      @keyframes slideInFromRight {
        0% {
          transform: translateX(100px);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes autoScroll {
        0% {
          transform: translateY(0);
        }
        100% {
          transform: translateY(-50%);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // 赛博朋克风格3D地球
  const createCyberGlobeCSS = () => {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `
          linear-gradient(135deg, 
            rgba(5, 15, 35, 0.95) 0%, 
            rgba(10, 25, 50, 0.98) 25%,
            rgba(15, 35, 65, 0.99) 50%,
            rgba(8, 20, 45, 0.98) 75%,
            rgba(5, 15, 35, 0.95) 100%
          ),
          radial-gradient(circle at 25% 75%, rgba(0, 212, 255, 0.2) 0%, transparent 60%),
          radial-gradient(circle at 75% 25%, rgba(64, 255, 0, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(255, 64, 0, 0.12) 0%, transparent 70%)
        `,
          overflow: "hidden",
        }}
      >
        {/* 电子雨背景 */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`rain-${i}`}
            className="cyber-rain-drop"
            style={{
              position: "absolute",
              left: `${3 + i * 6.5}%`,
              top: "-120px",
              width: "2px",
              height: "25px",
              background: `linear-gradient(180deg, transparent, ${
                ["#00d4ff", "#40ff00", "#ff4000", "#ff00d4"][i % 4]
              }, transparent)`,
              borderRadius: "1px",
              animationDelay: `${i * 0.2}s`,
              opacity: 0.8,
              filter: `drop-shadow(0 0 3px ${
                ["#00d4ff", "#40ff00", "#ff4000", "#ff00d4"][i % 4]
              })`,
            }}
          />
        ))}

        {/* 电路网格背景 */}
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
          viewBox="0 0 320 220"
        >
          {/* 电路线条 */}
          <path
            d="M 0,50 L 100,50 L 100,100 L 200,100 L 200,150 L 320,150"
            stroke="#00d4ff"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="8,4"
            className="cyber-circuit-line"
            style={{ animationDelay: "0s" }}
          />
          <path
            d="M 0,170 L 80,170 L 80,120 L 180,120 L 180,70 L 320,70"
            stroke="#40ff00"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6,6"
            className="cyber-circuit-line"
            style={{ animationDelay: "1s" }}
          />
          <path
            d="M 50,0 L 50,80 L 150,80 L 150,180 L 250,180 L 250,220"
            stroke="#ff4000"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="10,2"
            className="cyber-circuit-line"
            style={{ animationDelay: "2s" }}
          />
          <path
            d="M 320,30 L 220,30 L 220,110 L 120,110 L 120,190 L 0,190"
            stroke="#ff00d4"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4,8"
            className="cyber-circuit-line"
            style={{ animationDelay: "1.5s" }}
          />

          {/* 电路节点 */}
          {[
            { x: 100, y: 50 },
            { x: 200, y: 100 },
            { x: 80, y: 170 },
            { x: 180, y: 120 },
            { x: 50, y: 80 },
            { x: 150, y: 180 },
          ].map((node, i) => (
            <circle
              key={`node-${i}`}
              cx={node.x}
              cy={node.y}
              r="3"
              fill="#ffffff"
              style={{
                filter: "drop-shadow(0 0 5px #ffffff)",
                animation: `neonPulse 2s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </svg>

        {/* 外层电子环 */}
        <div
          className="cyber-electro-ring"
          style={{
            position: "absolute",
            width: "240px",
            height: "240px",
            border: "2px dashed #00d4ff",
            borderRadius: "50%",
            opacity: 0.7,
            boxShadow: "0 0 15px rgba(0, 212, 255, 0.4)",
          }}
        />

        {/* 中层霓虹环 */}
        <div
          className="cyber-neon-field"
          style={{
            position: "absolute",
            width: "190px",
            height: "190px",
            border: "1.5px solid #40ff00",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, transparent 70%, rgba(64,255,0,0.15) 100%)",
            boxShadow: "0 0 25px #40ff00, inset 0 0 15px rgba(64,255,0,0.1)",
          }}
        />

        {/* 内层能量环 */}
        <div
          className="energy-wave"
          style={{
            position: "absolute",
            width: "160px",
            height: "160px",
            border: "1px solid #ff4000",
            borderRadius: "50%",
            opacity: 0.6,
            background:
              "radial-gradient(circle, transparent 80%, rgba(255,64,0,0.1) 100%)",
            boxShadow: "0 0 20px rgba(255, 64, 0, 0.3)",
          }}
        />

        {/* 3D可拖拽地球 */}
        <Interactive3DEarth />

        {/* 彩虹能量光芒 */}
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={`ray-${index}`}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "3px",
              height: "50px",
              background: `linear-gradient(0deg, transparent, ${
                [
                  "rgba(255,20,147,0.8)",
                  "rgba(138,43,226,0.8)",
                  "rgba(0,191,255,0.8)",
                  "rgba(50,205,50,0.8)",
                  "rgba(255,215,0,0.8)",
                  "rgba(255,165,0,0.8)",
                  "rgba(255,69,0,0.8)",
                  "rgba(75,0,130,0.8)",
                ][index % 8]
              }, transparent)`,
              transformOrigin: "1.5px 0px",
              transform: `translate(-50%, -25px) rotate(${index * 22.5}deg)`,
              opacity: 0.8,
              filter: "blur(0.3px)",
              animation: "neonPulse 2.5s ease-in-out infinite",
              animationDelay: `${index * 0.08}s`,
              boxShadow: `0 0 8px ${
                [
                  "rgba(255,20,147,0.4)",
                  "rgba(138,43,226,0.4)",
                  "rgba(0,191,255,0.4)",
                  "rgba(50,205,50,0.4)",
                  "rgba(255,215,0,0.4)",
                  "rgba(255,165,0,0.4)",
                  "rgba(255,69,0,0.4)",
                  "rgba(75,0,130,0.4)",
                ][index % 8]
              }`,
            }}
          />
        ))}

        {/* 多彩能量环 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "190px",
            height: "190px",
            transform: "translate(-50%, -50%)",
            border: "2px solid transparent",
            borderImage:
              "linear-gradient(45deg, rgba(255,20,147,0.6), rgba(138,43,226,0.6), rgba(0,191,255,0.6), rgba(50,205,50,0.6), rgba(255,215,0,0.6), rgba(255,165,0,0.6)) 1",
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, rgba(255,20,147,0.1), rgba(138,43,226,0.1), rgba(0,191,255,0.1), rgba(50,205,50,0.1), rgba(255,215,0,0.1), rgba(255,165,0,0.1), rgba(255,20,147,0.1))",
            opacity: 0.7,
            animation: "electroSpin 12s linear infinite",
          }}
        />

        {/* 外层光环 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "220px",
            height: "220px",
            transform: "translate(-50%, -50%)",
            border: "1px dashed rgba(255,255,255,0.3)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, transparent 85%, rgba(255,255,255,0.1) 100%)",
            opacity: 0.5,
            animation: "electroSpin 20s linear infinite reverse",
          }}
        />

        {/* 魔法轨道环 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "300px",
            height: "90px",
            transform: "translate(-50%, -50%) rotateX(75deg)",
            border: "2px solid transparent",
            borderImage:
              "conic-gradient(from 0deg, rgba(255,20,147,0.4), rgba(138,43,226,0.4), rgba(0,191,255,0.4), rgba(50,205,50,0.4), rgba(255,215,0,0.4)) 1",
            borderRadius: "50%",
            opacity: 0.6,
            background: "transparent",
            boxShadow: "0 0 20px rgba(255,255,255,0.2)",
          }}
        />

        {/* 彩虹卫星 */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`satellite-${index}`}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "10px",
              height: "10px",
              background: `radial-gradient(circle, rgba(255,255,255,1) 0%, ${
                [
                  "rgba(255,20,147,0.8)",
                  "rgba(0,191,255,0.8)",
                  "rgba(50,205,50,0.8)",
                  "rgba(255,215,0,0.8)",
                ][index]
              } 50%, ${
                [
                  "rgba(138,43,226,0.6)",
                  "rgba(75,0,130,0.6)",
                  "rgba(255,165,0,0.6)",
                  "rgba(255,69,0,0.6)",
                ][index]
              } 100%)`,
              borderRadius: "50%",
              transformOrigin: "0 0",
              transform: `rotate(${
                index * 90
              }deg) translateX(150px) translateY(-45px)`,
              boxShadow: `0 0 15px ${
                [
                  "rgba(255,20,147,0.8)",
                  "rgba(0,191,255,0.8)",
                  "rgba(50,205,50,0.8)",
                  "rgba(255,215,0,0.8)",
                ][index]
              }, 0 0 30px ${
                [
                  "rgba(138,43,226,0.4)",
                  "rgba(75,0,130,0.4)",
                  "rgba(255,165,0,0.4)",
                  "rgba(255,69,0,0.4)",
                ][index]
              }`,
              opacity: 0.9,
              animation: "dataPacket 6s linear infinite",
              animationDelay: `${index * 1.5}s`,
              border: `1px solid ${
                [
                  "rgba(255,20,147,0.6)",
                  "rgba(0,191,255,0.6)",
                  "rgba(50,205,50,0.6)",
                  "rgba(255,215,0,0.6)",
                ][index]
              }`,
            }}
          />
        ))}

        {/* 赛博朋克信息面板 */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            right: "8px",
            height: "35px",
            background:
              "linear-gradient(90deg, rgba(0,212,255,0.25), rgba(64,255,0,0.25), rgba(255,64,0,0.25))",
            border: "1px solid #00d4ff",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 15px rgba(0, 212, 255, 0.3)",
          }}
        >
          <div
            style={{
              color: "#00d4ff",
              fontSize: "10px",
              fontFamily: "monospace",
              textShadow: "0 0 10px #00d4ff",
              fontWeight: "bold",
            }}
          >
            ▸ QUANTUM EARTH NEXUS ◂ NET.STATUS: ONLINE ◂ UPLINK: 99.9%
          </div>
        </div>

        {/* 左上角数据显示 */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            color: "#40ff00",
            fontSize: "9px",
            fontFamily: "monospace",
            textShadow: "0 0 8px #40ff00",
            lineHeight: "12px",
          }}
        >
          <div>▲ SYS.VER: 3.2.1</div>
          <div>▲ CPU: 92.7%</div>
          <div>▲ MEM: 76.4%</div>
          <div>▲ NET: 2.4GB/s</div>
        </div>

        {/* 右上角量子代码 */}
        <div
          className="cyber-glitch"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            color: "#ff00d4",
            fontSize: "8px",
            fontFamily: "monospace",
            textShadow: "0 0 8px #ff00d4",
            lineHeight: "10px",
          }}
        >
          <div>Q_FLUX_OK</div>
          <div>SYNC_WAVE</div>
          <div>MATRIX_ON</div>
        </div>
      </div>
    );
  };

  // 如果不可见则不渲染
  if (!isVisible) return null;

  const containerSize = isFullscreen
    ? { width: "80vw", height: "80vh" }
    : { width: "320px", height: "220px" };

  return (
    <div
      className="globe-3d-container"
      style={{
        position: "fixed",
        top: isFullscreen ? "50%" : "250px",
        right: isFullscreen ? "50%" : "240px",
        transform: isFullscreen ? "translate(50%, -50%)" : "none",
        zIndex: isFullscreen ? 2000 : 1000,
        ...containerSize,
        backgroundColor: "rgba(20, 0, 40, 0.95)",
        borderRadius: "12px",
        padding: "10px",
        pointerEvents: "auto",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255, 0, 128, 0.4)",
        boxShadow: `
           0 8px 32px rgba(255, 0, 128, 0.3),
           inset 0 1px 0 rgba(255, 0, 128, 0.1)
         `,
        opacity: visible ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {isVisible && (
        <>
          {/* 标题栏 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              padding: "8px 10px",
              background: "rgba(255, 0, 128, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 0, 128, 0.1)",
            }}
          >
            <span
              style={{
                color: "#ff0080",
                fontSize: "16px",
                fontWeight: "bold",
                textShadow: "0 0 12px rgba(255, 0, 128, 0.8)",
                fontFamily: "monospace",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                height: "32px",
              }}
            >
              ▸ CYBER EARTH ◂
            </span>
            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <Button
                type="text"
                icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={onToggleFullscreen}
                style={{
                  color: "#ff0080",
                  border: "1px solid rgba(255, 0, 128, 0.4)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  background: "rgba(255, 0, 128, 0.15)",
                  minWidth: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(255, 0, 128, 0.2)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.1)";
                  e.target.style.background = "rgba(255, 0, 128, 0.25)";
                  e.target.style.boxShadow =
                    "0 4px 16px rgba(255, 0, 128, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.background = "rgba(255, 0, 128, 0.15)";
                  e.target.style.boxShadow = "0 2px 8px rgba(255, 0, 128, 0.2)";
                }}
                size="small"
              />
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onClose}
                style={{
                  color: "#ff0080",
                  border: "1px solid rgba(255, 0, 128, 0.4)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  background: "rgba(255, 0, 128, 0.15)",
                  minWidth: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(255, 0, 128, 0.2)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.1)";
                  e.target.style.background = "rgba(255, 32, 32, 0.25)";
                  e.target.style.color = "#ff4444";
                  e.target.style.borderColor = "rgba(255, 32, 32, 0.5)";
                  e.target.style.boxShadow =
                    "0 4px 16px rgba(255, 32, 32, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.background = "rgba(255, 0, 128, 0.15)";
                  e.target.style.color = "#ff0080";
                  e.target.style.borderColor = "rgba(255, 0, 128, 0.4)";
                  e.target.style.boxShadow = "0 2px 8px rgba(255, 0, 128, 0.2)";
                }}
                size="small"
              />
            </div>
          </div>

          {/* 3D地球主体 */}
          <div
            style={{
              width: "100%",
              height: "calc(100% - 50px)",
              position: "relative",
            }}
          >
            {createCyberGlobeCSS()}
          </div>
        </>
      )}
    </div>
  );
};

const Home = () => {
  const [chartVisible, setChartVisible] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("全国");
  const [forceUpdate, setForceUpdate] = useState(0);
  const [globeVisible, setGlobeVisible] = useState(false);
  const [globeFullscreen, setGlobeFullscreen] = useState(false);

  // ECharts 拖拽相关状态
  const [draggableElements, setDraggableElements] = useState(() => [
    { id: 'chart-toggle', x: 280, y: 250, width: 180, height: 40, type: 'button', label: '销售统计', visible: !chartVisible },
    { id: 'globe-toggle', x: (typeof window !== 'undefined' ? window.innerWidth : 1920) - 420, y: 250, width: 160, height: 40, type: 'button', label: '赛博地球', visible: !globeVisible },
    { id: 'stats-panel', x: (typeof window !== 'undefined' ? window.innerWidth : 1920) - 285, y: (typeof window !== 'undefined' ? window.innerHeight : 1080) - 360, width: 250, height: 300, type: 'panel', label: '监控面板', visible: true }
  ]);
  const chartRef = useRef(null);
  const draggingElement = useRef(null);

  const handleCloseChart = () => {
    console.log("📊 销售总额图表已关闭，动画继续在后台运行");
    setChartVisible(false);
  };

  // ECharts 拖拽实现 - 简化版本，避免运行时错误
  const initializeDraggableChart = useCallback(() => {
    if (!chartRef.current) return;
    
    const myChart = chartRef.current;
    
    // 简化的图表配置，仅用于占位
    const draggableOption = {
      animation: false,
      grid: { left: 0, top: 0, right: 0, bottom: 0, show: false },
      xAxis: { 
        type: 'value', 
        show: false, 
        min: 0, 
        max: window.innerWidth
      },
      yAxis: { 
        type: 'value', 
        show: false, 
        min: 0, 
        max: window.innerHeight
      },
      series: [{
        type: 'scatter',
        data: [[100, 100]],
        symbolSize: 0,
        itemStyle: { opacity: 0 }
      }]
    };
    
    myChart.setOption(draggableOption);
    console.log('ECharts 拖拽图表已初始化（简化版本）');
  }, []);

  // 优化的拖拽实现
  const [isDragging, setIsDragging] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef(0);

  const handleMouseDown = useCallback((e, elementId) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 记录拖拽开始时间，用于区分点击和拖拽
    dragStartTime.current = Date.now();
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    setIsDragging(elementId);
    
    const rect = e.target.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    // 改变光标样式和视觉反馈
    e.target.style.cursor = 'grabbing';
    e.target.style.transform = 'scale(1.02) rotate(1deg)';
    e.target.style.zIndex = '9999';
    e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
    
    console.log(`🎮 开始拖拽: ${elementId}`);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    
    // 获取拖拽元素信息
    const element = draggableElements.find(el => el.id === isDragging);
    if (!element) return;
    
    // 优化的边界限制 - 允许部分超出边界
    const margin = 20; // 允许20px的缓冲区
    const minX = -element.width * 0.7; // 允许70%超出左边
    const minY = -element.height * 0.5; // 允许50%超出上边
    const maxX = window.innerWidth - element.width * 0.3 + margin; // 右边保留30%
    const maxY = window.innerHeight - element.height * 0.3 + margin; // 下边保留30%
    
    const boundedX = Math.max(minX, Math.min(newX, maxX));
    const boundedY = Math.max(minY, Math.min(newY, maxY));
    
    // 更新位置，添加平滑过渡
    setDraggableElements(prev => 
      prev.map(el => 
        el.id === isDragging 
          ? { ...el, x: boundedX, y: boundedY }
          : el
      )
    );
    
    // 实时反馈拖拽距离
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.x, 2) + 
      Math.pow(e.clientY - dragStartPos.y, 2)
    );
    
    // 如果拖拽距离超过5px，认为是真正的拖拽操作
    if (dragDistance > 5) {
      dragStartTime.current = 0; // 标记为拖拽，不是点击
    }
  }, [isDragging, draggableElements, dragStartPos]);

  // 处理元素点击事件 - 提前定义避免依赖顺序问题
  const handleElementClick = useCallback((elementId) => {
    switch(elementId) {
      case 'chart-toggle':
        setChartVisible(true);
        break;
      case 'globe-toggle':
        setGlobeVisible(true);
        break;
      case 'stats-panel':
        // 统计面板点击逻辑
        break;
      default:
        break;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      const dragDuration = Date.now() - dragStartTime.current;
      const isClick = dragDuration < 200 && dragStartTime.current > 0; // 小于200ms且未标记为拖拽
      
      console.log(`🎮 结束拖拽: ${isDragging}, 是否为点击: ${isClick}`);
      
      // 恢复元素样式
      const draggedElement = document.querySelector(`[data-element-id="${isDragging}"]`);
      if (draggedElement) {
        draggedElement.style.cursor = 'grab';
        draggedElement.style.transform = 'scale(1.0) rotate(0deg)';
        draggedElement.style.zIndex = '999';
        draggedElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      }
      
      // 如果是点击操作，触发点击事件
      if (isClick) {
        setTimeout(() => {
          handleElementClick(isDragging);
        }, 50); // 延迟50ms确保拖拽状态已清除
      }
      
      setIsDragging(null);
      dragStartTime.current = 0;
    }
  }, [isDragging, handleElementClick]);

  // 绑定全局事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
        setDraggableElements(prev => 
          prev.map(el => ({
            ...el,
            x: Math.min(el.x, window.innerWidth - el.width),
            y: Math.min(el.y, window.innerHeight - el.height)
          }))
        );
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 更新元素可见性
  useEffect(() => {
    setDraggableElements(prev => 
      prev.map(el => ({
        ...el,
        visible: el.id === 'chart-toggle' ? !chartVisible :
                el.id === 'globe-toggle' ? !globeVisible :
                el.id === 'stats-panel' ? true : el.visible
      }))
    );
  }, [chartVisible, globeVisible]);

  // 初始化拖拽图表
  useEffect(() => {
    if (chartRef.current) {
      initializeDraggableChart();
    }
  }, [initializeDraggableChart]);

  const handleShowChart = () => {
    console.log("📊 重新显示销售总额图表，从当前进度继续");
    setChartVisible(true);
  };

  const handleCloseGlobe = () => {
    console.log("🌍 3D地球已关闭");
    setGlobeVisible(false);
    setGlobeFullscreen(false);
  };

  const handleShowGlobe = () => {
    console.log("🌍 显示3D地球");
    setGlobeVisible(true);
  };

  const handleToggleGlobeFullscreen = () => {
    console.log("🌍 切换3D地球全屏模式");
    setGlobeFullscreen(!globeFullscreen);
  };

  // 地区名称映射：地图返回的名称 -> regionSalesData中的key
  const regionNameMap = {
    北京: "北京市",
    上海: "上海市",
    天津: "天津市",
    重庆: "重庆市",
    广东: "广东省",
    江苏: "江苏省",
    四川: "四川省",
    山东: "山东省",
    河南: "河南省",
    湖北: "湖北省",
    湖南: "湖南省",
    河北: "河北省",
    山西: "山西省",
    辽宁: "辽宁省",
    吉林: "吉林省",
    黑龙江: "黑龙江省",
    安徽: "安徽省",
    福建: "福建省",
    江西: "江西省",
    浙江: "浙江省",
    陕西: "陕西省",
    甘肃: "甘肃省",
    青海: "青海省",
    云南: "云南省",
    贵州: "贵州省",
    西藏: "西藏自治区",
    新疆: "新疆维吾尔自治区",
    内蒙古: "内蒙古自治区",
    宁夏: "宁夏回族自治区",
    广西: "广西壮族自治区",
    海南: "海南省",
    台湾: "台湾省",
    香港: "香港特别行政区",
    澳门: "澳门特别行政区",
  };

  // 处理地图点击事件
  const handleMapRegionClick = (regionName) => {
    console.log(`🗺️ 地图点击事件触发: ${regionName}`);
    console.log(`📍 当前selectedRegion: ${selectedRegion}`);
    console.log(`📊 可用地区数据:`, Object.keys(regionSalesData));

    // 映射地区名称
    const mappedRegionName = regionNameMap[regionName] || regionName;
    console.log(`🔄 地区名称映射: ${regionName} -> ${mappedRegionName}`);

    // 检查是否有对应的数据
    if (regionSalesData[mappedRegionName]) {
      console.log(`✅ 找到地区数据: ${mappedRegionName}`);
      setSelectedRegion(mappedRegionName);
      setForceUpdate((prev) => prev + 1); // 强制更新
      console.log(`🔄 设置selectedRegion为: ${mappedRegionName}`);

      // 如果图表被关闭，自动显示
      if (!chartVisible) {
        console.log(`📈 自动显示图表`);
        setChartVisible(true);
      }
    } else {
      console.warn(`⚠️ 未找到地区数据: ${mappedRegionName}，使用全国数据`);
      setSelectedRegion("全国");
      setForceUpdate((prev) => prev + 1);
    }
  };

  // 页面加载时输出提示信息
  React.useEffect(() => {
    console.log(
      "🏠 首页已加载，环形图立即显示，销售总额数据开始20秒平缓加载动画"
    );
    console.log("💡 提示：刷新页面将重新开始动画，关闭/打开图表会继续当前进度");
    console.log("🗺️ 点击地图上的地区可切换环形图显示对应地区的销售数据");
    console.log(
      "📊 已为全国所有34个省份/直辖市/自治区添加销售数据，点击任何地区都有对应的环形图"
    );
    console.log(
      "🌐 右上角数字化地球展示全球网络状态，科技感十足的数据可视化，支持全屏查看和折叠功能"
    );
    console.log("🎛️ 左上角销售统计与右上角3D地球形成对称的折叠对比布局");
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <Dashboard onRegionClick={handleMapRegionClick} />

              {/* 右下角状态监控面板 - 地图容器内悬浮 */}
        <StatusMonitorPanel />

      {/* 左上角销售统计图表 */}
      <SalesOverviewChart
        visible={chartVisible}
        onClose={handleCloseChart}
        selectedRegion={selectedRegion}
        forceUpdate={forceUpdate}
      />

      {/* 右上角3D地球 */}
      <Globe3D
        visible={globeVisible}
        onClose={handleCloseGlobe}
        onToggleFullscreen={handleToggleGlobeFullscreen}
        isFullscreen={globeFullscreen}
      />

      {/* 传统拖拽元素 - 替代ECharts方案 */}
      {draggableElements.filter(el => el.visible).map(element => (
        <div
          key={element.id}
          data-element-id={element.id}
          style={{
            position: "fixed",
            top: `${element.y}px`,
            left: `${element.x}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            zIndex: isDragging === element.id ? 9999 : 999,
            background: element.type === 'button' 
              ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.95), rgba(16, 112, 224, 0.9))' 
              : 'linear-gradient(135deg, rgba(45, 55, 72, 0.9), rgba(55, 65, 81, 0.85))',
            border: element.type === 'button' 
              ? '2px solid rgba(59, 130, 246, 0.4)' 
              : '2px solid rgba(129, 140, 248, 0.4)',
            borderRadius: element.type === 'button' ? '12px' : '16px',
            boxShadow: isDragging === element.id 
              ? '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.3)' 
              : '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            cursor: isDragging === element.id ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: element.type === 'button' ? '13px' : '12px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            userSelect: 'none',
            transition: isDragging === element.id 
              ? 'box-shadow 0.1s ease' 
              : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDragging === element.id ? 'scale(1.02)' : 'scale(1.0)',
            // 添加微妙的内发光效果
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'inherit',
              padding: '1px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude'
            }
          }}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          onMouseEnter={(e) => {
            if (isDragging !== element.id) {
              e.target.style.transform = 'scale(1.08) translateY(-2px)';
              e.target.style.boxShadow = element.type === 'button' 
                ? '0 8px 25px rgba(59, 130, 246, 0.4), 0 0 15px rgba(59, 130, 246, 0.2)' 
                : '0 8px 25px rgba(129, 140, 248, 0.4), 0 0 15px rgba(129, 140, 248, 0.2)';
              e.target.style.borderColor = element.type === 'button' 
                ? 'rgba(59, 130, 246, 0.6)' 
                : 'rgba(129, 140, 248, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (isDragging !== element.id) {
              e.target.style.transform = 'scale(1.0) translateY(0px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = element.type === 'button' 
                ? 'rgba(59, 130, 246, 0.4)' 
                : 'rgba(129, 140, 248, 0.4)';
            }
          }}
        >
          {element.label}
        </div>
      ))}
    </div>
  );
};

export default Home;
