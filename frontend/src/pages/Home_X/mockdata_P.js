var data = [
  {
    id: 1,
    name: '张三',
    phone: '12345678901',
    type: '零售',
    city: '江西省南昌市红谷滩区',
    remarks: '备注内容备注内容',
    status: 'pending',
    createTime: '2023-01-01 00:00:00',
    updateTime: '2023-01-01 00:00:00',
    remark: '无'
  },
  {
    id: 2,
    name: '李四',
    phone: '12345678902',
    type: '批发',
    city: '江西省南昌市东湖区',
    remarks: '备注内容备注内容',
    status: 'approved',
    createTime: '2023-01-02 00:00:00',
    updateTime: '2023-01-03 00:00:00',
    remark: '无'
  },
  {
    id: 3,
    name: '王五',
    phone: '12345678903',
    type: '餐饮',
    city: '江西省南昌市西湖区',
    remarks: '备注内容备注内容',
    status: 'rejected',
    createTime: '2023-01-03 00:00:00',
    updateTime: '2023-01-04 00:00:00',
    remark: '无'
  },
  {
    id: 4,
    name: '赵六',
    phone: '12345678904',
    type: '家政',
    city: '江西省南昌市青山湖区',
    remarks: '备注内容备注内容',
    status: 'pending',
    createTime: '2023-01-04 00:00:00',
    updateTime: '2023-01-04 00:00:00',
    remark: '无'
  },
  {
    id: 5,
    name: '钱七',
    phone: '12345678905',
    type: '文旅',
    city: '江西省南昌市青云谱区',
    remarks: '备注内容备注内容',
    status: 'approved',
    createTime: '2023-01-05 00:00:00',
    updateTime: '2023-01-06 00:00:00',
    remark: '无'
  },
  {
    id: 6,
    name: '孙八',
    phone: '12345678906',
    type: '教育',
    city: '江西省南昌市新建区',
    remarks: '备注内容备注内容',
    status: 'pending',
    createTime: '2023-01-06 00:00:00',
    updateTime: '2023-01-06 00:00:00',
    remark: '无'
  },
  {
    id: 7,
    name: '周九',
    phone: '12345678907',
    type: '医疗',
    city: '江西省南昌市湾里区',
    remarks: '备注内容备注内容',
    status: 'rejected',
    createTime: '2023-01-07 00:00:00',
    updateTime: '2023-01-08 00:00:00',
    remark: '无'
  },
  {
    id: 8,
    name: '吴十',
    phone: '12345678908',
    type: '金融',
    city: '江西省南昌市安义县',
    remarks: '备注内容备注内容',
    status: 'approved',
    createTime: '2023-01-08 00:00:00',
    updateTime: '2023-01-09 00:00:00',
    remark: '无'
  }
]

export const getData = () => {
  return data
}