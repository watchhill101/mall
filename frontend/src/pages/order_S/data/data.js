import {
    AppstoreOutlined,
    ContainerOutlined,
    DesktopOutlined,
    MailOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined,
} from '@ant-design/icons';
export const items = [
    {
        key: 'orders',
        icon: <PieChartOutlined />,
        label: '订单',
        children: [
            { key: 'list', icon: <PieChartOutlined />, label: '订单' },
            { key: 'afterSales', icon: <PieChartOutlined />, label: '售后' },
            { key: 'tallySheet', icon: <PieChartOutlined />, label: '理货单' },
            { key: 'sortingList', icon: <PieChartOutlined />, label: '分拣单' },
        ],
    },
];