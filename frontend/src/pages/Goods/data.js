import { Tag, Space, Button } from 'antd'
// 三级分类数据
export const categoryData = [
    {
        value: '1',
        label: '电子产品',
        children: [
            {
                value: '1-1',
                label: '手机',
                children: [
                    { value: '1-1-1', label: '智能手机' },
                    { value: '1-1-2', label: '功能手机' }
                ]
            },
            {
                value: '1-2',
                label: '电脑',
                children: [
                    { value: '1-2-1', label: '笔记本' },
                    { value: '1-2-2', label: '台式机' },
                    { value: '1-2-3', label: '平板电脑' }
                ]
            }
        ]
    },
    {
        value: '2',
        label: '服装',
        children: [
            {
                value: '2-1',
                label: '男装',
                children: [
                    { value: '2-1-1', label: '上衣' },
                    { value: '2-1-2', label: '裤子' }
                ]
            },
            {
                value: '2-2',
                label: '女装',
                children: [
                    { value: '2-2-1', label: '连衣裙' },
                    { value: '2-2-2', label: '外套' }
                ]
            }
        ]
    }
];

export default categoryData;
export const GoodsListColumns = [
    {
        title: '商品ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: '商品名称',
        dataIndex: 'ProductName',
        key: 'ProductName',
    },
    {
        title: '商品分类',
        dataIndex: 'ProductCategory',
        key: 'ProductCategory',
    },
    {
        title: '销售价',
        dataIndex: 'SellingPrice',
        key: 'SellingPrice',
    },
    {
        title: '库存商品',
        dataIndex: 'StockCommodities',
        key: 'StockCommodities',
    },
    {
        title: '库存总数',
        dataIndex: 'TotalInventory',
        key: 'TotalInventory',
    },
    {
        title: '状态',
        dataIndex: 'status',
        render: (text) => <Tag color={text === '在售' ? 'blue' : 'red'}>{text}</Tag>,
        key: 'status',
    },
    {
        title: '最后更新时间',
        dataIndex: 'LastUpdateTime',
        key: 'LastUpdateTime',
    },
    {
        title: "操作",
        key: "action",
        render: (text, record) => (
            <Space size="middle">
                <Button type="link">复制</Button>
                <Button type="link">编辑</Button>
                <Button type="link" style={{ color: record.status === '在售' ? 'red' : 'blue' }} >{record.status === '在售' ? '下架' : '上架'}</Button>
                <Button type="link" style={{ color: "red" }}>删除</Button>
            </Space>
        ),
    },







];
export const formItemList = [
    {
        formItemProps: { name: 'name', label: '商品名称' },
        valueCompProps: {
            placeholder: '请输入',
        },
    },
    {
        formItemProps: { name: 'Classification', label: '商品分类' },
        valueCompProps: {
            type: 'Cascader',
            options: categoryData,
            placeholder: '请选择',
        },
    },
    {
        formItemProps: { name: 'ProductStatus', label: '商品状态' },
        valueCompProps: {
            type: 'select',
            options: [
                { value: 'OnSale', label: '在售中' },
                { value: 'OffSale', label: '已下架' },
            ],
            placeholder: '请选择',
        },
    },
    {
        formItemProps: { name: 'Inventory goods', label: '库存商品' },
        valueCompProps: {
            type: 'select',
            options: [
                { value: '1', label: '是' },
                { value: '0', label: '否' },
            ],
            placeholder: '请选择',
        },
    },
];
export const dataSource = [
    {
        key: '1',
        name: '胡彦斌',
        age: 32,
        address: '西湖区湖底公园1号',
    },
    {
        key: '2',
        name: '胡彦祖',
        age: 42,
        address: '西湖区湖底公园1号',
    },
];