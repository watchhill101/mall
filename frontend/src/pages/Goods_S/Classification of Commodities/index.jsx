import React, { useState } from 'react';
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
import Icon, { SearchOutlined } from '@ant-design/icons';
import { ProductClassificationData } from '@/db_S/data.mjs';
import {
  RefreshSvg,
  SearchSvg,
  clipSvg,
  toggleSvg,
} from '@/pages/Goods_S/icons_svg/IconCom';
import './index.scss';
import SearchBar from '@/components/SearchBar';
import {
  categoryData,
  ClassificationofCommoditiesColumns,
  categoryFormItemList,
} from '../data/data';
import CustomTable from '@/components/CustomTable';
// import SvgIcon from '@/components/SvgIcon';
// import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';

export default function Index() {
  const [selectionType, setSelectionType] = useState('checkbox');
  const handleSearch = () => {};
  const fetchMethod = async (requesParams) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        count: ProductClassificationData.list.length,
        rows: ProductClassificationData.list,
      },
    };
  };
  const onParamChange = () => {};
  const [params, setparams] = useState({
    pageSize: 5,
    current: 1,
  });
  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };
  return (
    <div className="List">
      <div className="searchbar">
        <SearchBar
          formItemList={categoryFormItemList}
          getSearchParams={handleSearch}
        />
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
              backgroundColor: '#FDECEC',
              border: '1px solid #EE736F',
              color: '#EC5149',
            }}
          >
            删除
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
          rowSelection={Object.assign({ type: selectionType }, rowSelection)}
          columns={ClassificationofCommoditiesColumns}
          fetchMethod={fetchMethod}
          requestParam={params}
          // onParamsChange={setparams}
        />
      </div>
    </div>
  );
}
