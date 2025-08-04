import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Icon, { SearchOutlined } from '@ant-design/icons';
import {
  RefreshSvg,
  SearchSvg,
  clipSvg,
  toggleSvg,
} from '@/pages/Goods_S/icons_svg/IconCom';
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Cascader,
  Button,
  Menu,
} from 'antd';
import { data } from '@/db_S/data.mjs';
import './index.scss';

import SearchBar from '@/components/SearchBar';
import { categoryData, GoodsListColumns, formItemList } from '../data/data';
import CustomTable from '@/components/CustomTable';
// import { refreshSvg } from './icons_svg/icon';
import SvgIcon from '@/components/SvgIcon';
import '../index.scss';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  TagOutlined,
} from '@ant-design/icons';
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';
import GoodsLayout from '../Goods_Layout/Goods_Layout';
const ListOfCommodities = () => {
  const handleSearch = () => {};
  const fetchMethod = async (requesParams) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        count: data.list.length,
        rows: data.list,
      },
    };
  };
  const onParamChange = () => {};
  const [params, setparams] = useState({
    pageSize: 5,
    current: 1,
  });
  return (
    // <GoodsLayout>
    <div className="List">
      <div className="searchbar">
        <SearchBar formItemList={formItemList} getSearchParams={handleSearch} />
      </div>
      <div className="OperationButton">
        <div className="OperationButton-left">
          <Button
            color="primary"
            style={{
              backgroundColor: '#EAF4FE',
              border: '1px solid #448EF7',
              color: '#4792F7',
            }}
          >
            新增
          </Button>
          <Button
            color="cyan"
            variant="outlined"
            style={{
              backgroundColor: '#FEF9E6',
              border: '1px solid #F6C955',
              color: '#F7CB59',
            }}
          >
            导出
          </Button>
        </div>
        <div className="OperationButton-right">
          <ul>
            <li>
              <Button
                // type="primary"
                shape="circle"
                icon={
                  <Icon component={RefreshSvg} />
                  // <SvgIcon
                  //   name="refresh"
                  //   width="16"
                  //   height="16"
                  //   color="#1890ff"
                  // ></SvgIcon>
                }
              />
            </li>
            <li>
              <Button
                // type="primary"
                shape="circle"
                icon={<Icon component={SearchSvg} />}
                // icon={
                //   <SvgIcon
                //     name="setting"
                //     width="16"
                //     height="16"
                //     color="#1890ff"
                //
              />
            </li>
            <li>
              <Button
                // type="primary"
                shape="circle"
                icon={<Icon component={clipSvg}></Icon>}
              />
            </li>
            <li>
              <Button
                // type="primary"
                shape="circle"
                icon={<Icon component={toggleSvg} />}
              />
            </li>
          </ul>
        </div>
      </div>
      <div className="GoodsList">
        <CustomTable
          columns={GoodsListColumns}
          fetchMethod={fetchMethod}
          requestParam={params}
          // onParamsChange={setparams}
        />
      </div>
    </div>
  );
};

export default ListOfCommodities;
