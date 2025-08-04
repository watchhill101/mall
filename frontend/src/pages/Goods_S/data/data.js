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
// 商品列表columns
export const GoodsListColumns = [
    {
        title: '商品ID',
        dataIndex: 'id',
        key: 'id',
    },
    // {
    //     title: '商品图片',
    //     dataIndex: 'src',
    //     key: 'src',
    //     render: (src) => <img src={src} alt="商品图片" />

    // },
    {
        title: '商品名称',
        dataIndex: 'ProductName',
        key: 'ProductName',
        render: (text, record) => {
            return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <img src={record.src} alt="" style={{ width: "70px", height: "70px" }} />
                <span>{text}</span>
            </div>
        }

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
                <Button type="link" style={{ color: "red" }}>j</Button>
            </Space>
        ),
    },







];
// 商品分类columns
export const ClassificationofCommoditiesColumns = [
    {
        title: "业务类型",
        dataIndex: "BusinessType",
        key: "BusinessType",

    },
    {
        title: "分类ID",
        dataIndex: "ClassificationID",
        key: "ClassificationID",

    },
    {
        title: "分类名称",
        dataIndex: "CategoryName",
        key: "CategoryName",
    },
    {
        title: "上级分类",
        dataIndex: "ParentCategory",
        key: "ParentCategory",
    },
    {
        title: "分类等级",
        dataIndex: "ClassificationRank",
        key: "ClassificationRank",
    },
    {
        title: "分类图标",
        dataIndex: "ClassificationIcon",
        key: "ClassificationIcon",
        render: (text, record) => (
            <img src={record.ClassificationIcon} alt="分类图标" style={{ width: "50px", height: "50px" }} />
        ),
    },
    {
        title: "分类图片",
        dataIndex: "ClassificationImg",
        key: "ClassificationImg",
        render: (text, record) => (
            <img src={record.ClassificationImg} alt="分类图片" style={{ width: "50px", height: "50px" }} />
        ),
    },
    {
        title: "售后天数",
        dataIndex: "AfterSalesDays",
        key: "AfterSalesDays",
    },
    {
        title: "分类排序",
        dataIndex: "ClassificationAndSorting",
        key: "ClassificationAndSorting",
    },
    {
        title: "状态",
        dataIndex: "status",
        key: "status",
    },
    {
        title: "操作",
        key: "action",
        render: (text, record) => (
            <Space size="middle">

                <Button type="link">编辑</Button>
                <Button type="link" style={{ color: "red" }}>禁用</Button>
                <Button type="link" style={{ color: "red" }}>删除</Button>
            </Space>
        ),
    },




]

// 商品列表
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
// 商品分类
export const categoryFormItemList = [
    {
        formItemProps: { name: 'name', label: '业务类型：' },
        valueCompProps: {
            placeholder: '请输入',
            type: "select",
            options: [
                { value: '零售', label: '零售' },
                { value: '家政', label: '家政' },
            ],
        },
    },
    {
        formItemProps: { name: 'level', label: '分类等级：' },
        valueCompProps: {
            placeholder: '请输入',
            type: "select",
            options: [
                { value: '一级分类', label: '一级分类' },
                { value: '二级分类', label: '二级分类' },
            ],
        },
    },
    {
        formItemProps: { name: 'CategoryName', label: '分类名称：' },
        valueCompProps: {
            placeholder: '请输入',
        },
    },
    {
        formItemProps: { name: 'status', label: '状态：' },
        valueCompProps: {
            // placeholder: '请输入',
            type: "select",
            options: [
                {
                    value: '1', label: "是"
                },
                {
                    value: '0', label: "否"
                }
            ]
        },
    },
]
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
export const items = [
    {
        label: '商品列表',
        key: 'ListofCommodities',
        // icon: <MailOutlined />,
    },
    {
        label: '商品分类',
        key: 'ClassificationofCommodities',
        // icon: <M
        // ailOutlined />,
    },
    {
        label: '库存管理',
        key: 'inventory',
        // icon: <MailOutlined />,
        children: [
            {
                key: "CurrentInventory",
                label: '当前库存'
            },
            {
                key: "enterTheWarehouse",
                label: '入库'
            },
            {
                key: "exWarehouse",
                label: '出库'
            },
            {
                key: "stocktaking",
                label: '盘点'
            },
            {
                key: "DetailsOfStockInAndstockOut",
                label: '出入库明细'
            }



        ]

    },
    {
        label: '价格管理',
        key: 'price',
        // icon: <MailOutlined />,
    },

]
