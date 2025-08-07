import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Tree,
  Card,
  Space,
  Button,
  message,
  Divider,
  Typography,
  Row,
  Col,
  Tag,
  Spin
} from 'antd';
import {
  SafetyOutlined,
  TeamOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  SettingOutlined
} from '@ant-design/icons';
import roleManagementAPI from '@/api/roleManagement';
import userManagementAPI from '@/api/userManagement';

const { Title, Text } = Typography;
const { Option } = Select;

const RoleTemplateModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [navigationData, setNavigationData] = useState({ firstLevel: [], secondLevel: [] });
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [treeData, setTreeData] = useState([]);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const response = await userManagementAPI.getRoleList();
      if (response && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
      message.error('获取角色列表失败');
    }
  };

  // 获取导航数据
  const fetchNavigationData = async () => {
    try {
      const response = await roleManagementAPI.getNavigationData();
      if (response && response.data) {
        setNavigationData(response.data);
        buildTreeData(response.data);
      }
    } catch (error) {
      console.error('获取导航数据失败:', error);
      message.error('获取导航数据失败');
    }
  };

  // 构建树形数据
  const buildTreeData = (navData) => {
    const treeNodes = navData.firstLevel.map(firstLevel => ({
      title: firstLevel.name,
      key: `first-${firstLevel._id}`,
      icon: <ApartmentOutlined />,
      children: navData.secondLevel
        .filter(secondLevel => secondLevel.parentId === firstLevel._id)
        .map(secondLevel => ({
          title: secondLevel.name,
          key: `second-${secondLevel._id}`,
          icon: <BranchesOutlined />
        }))
    }));
    setTreeData(treeNodes);
  };

  // 获取角色详情
  const fetchRoleDetail = async (roleId) => {
    if (!roleId) return;
    
    setLoading(true);
    try {
      const response = await roleManagementAPI.getRoleDetail(roleId);
      if (response && response.data) {
        const role = response.data;
        
        // 构建选中的权限keys
        const firstLevelKeys = (role.FirstLevelNavigationID || []).map(nav => `first-${nav._id}`);
        const secondLevelKeys = (role.SecondaryNavigationID || []).map(nav => `second-${nav._id}`);
        const allCheckedKeys = [...firstLevelKeys, ...secondLevelKeys];
        
        setCheckedKeys(allCheckedKeys);
        setSelectedRole(role);
      }
    } catch (error) {
      console.error('获取角色详情失败:', error);
      message.error('获取角色详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 角色选择处理
  const handleRoleChange = (roleId) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      fetchRoleDetail(roleId);
    } else {
      setSelectedRole(null);
      setCheckedKeys([]);
    }
  };

  // 权限树选择处理
  const handleTreeCheck = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue);
  };

  // 保存角色权限
  const handleSave = async () => {
    if (!selectedRole) {
      message.error('请先选择一个角色');
      return;
    }

    setLoading(true);
    try {
      // 分离一级和二级导航权限
      const firstLevelIds = checkedKeys
        .filter(key => key.startsWith('first-'))
        .map(key => key.replace('first-', ''));
      
      const secondLevelIds = checkedKeys
        .filter(key => key.startsWith('second-'))
        .map(key => key.replace('second-', ''));

      console.log('🔄 保存角色权限:', {
        roleId: selectedRole._id,
        firstLevelIds,
        secondLevelIds
      });

      await roleManagementAPI.updateRolePermissions(selectedRole._id, {
        firstLevel: firstLevelIds,
        secondLevel: secondLevelIds
      });

      message.success('角色权限更新成功');
      onSuccess && onSuccess();
      handleCancel();
    } catch (error) {
      console.error('保存角色权限失败:', error);
      message.error('保存角色权限失败');
    } finally {
      setLoading(false);
    }
  };

  // 取消处理
  const handleCancel = () => {
    form.resetFields();
    setSelectedRole(null);
    setCheckedKeys([]);
    onCancel();
  };

  // 快速权限设置
  const handleQuickPermission = (type) => {
    switch (type) {
      case 'all':
        // 全部权限
        const allKeys = [];
        treeData.forEach(node => {
          allKeys.push(node.key);
          if (node.children) {
            node.children.forEach(child => {
              allKeys.push(child.key);
            });
          }
        });
        setCheckedKeys(allKeys);
        break;
      case 'none':
        // 清空权限
        setCheckedKeys([]);
        break;
      case 'readonly':
        // 只读权限（只选择查看相关的权限）
        const readonlyKeys = treeData
          .filter(node => node.title.includes('管理') || node.title.includes('列表'))
          .map(node => node.key);
        setCheckedKeys(readonlyKeys);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (visible) {
      fetchRoles();
      fetchNavigationData();
    }
  }, [visible]);

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>角色模板管理</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          保存权限
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <Row gutter={16}>
          {/* 左侧：角色选择 */}
          <Col span={10}>
            <Card size="small" title="选择角色" style={{ marginBottom: 16 }}>
              <Select
                placeholder="请选择要配置的角色"
                style={{ width: '100%' }}
                onChange={handleRoleChange}
                value={selectedRole?._id}
              >
                {roles.map(role => (
                  <Option key={role._id} value={role._id}>
                    <Space>
                      <TeamOutlined />
                      {role.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Card>

            {/* 当前角色信息 */}
            {selectedRole && (
              <Card size="small" title="角色信息">
                <div style={{ textAlign: 'center' }}>
                  <SafetyOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 8 }} />
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>{selectedRole.name}</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">
                      已选权限: {checkedKeys.length}
                    </Tag>
                  </div>
                </div>
              </Card>
            )}
          </Col>

          {/* 右侧：权限配置 */}
          <Col span={14}>
            <Card 
              size="small" 
              title="权限配置"
              extra={
                <Space size="small">
                  <Button size="small" onClick={() => handleQuickPermission('all')}>
                    全选
                  </Button>
                  <Button size="small" onClick={() => handleQuickPermission('readonly')}>
                    只读
                  </Button>
                  <Button size="small" onClick={() => handleQuickPermission('none')}>
                    清空
                  </Button>
                </Space>
              }
            >
              {selectedRole ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Tree
                    checkable
                    checkedKeys={checkedKeys}
                    onCheck={handleTreeCheck}
                    treeData={treeData}
                    showIcon
                    defaultExpandAll
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <ApartmentOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
                  <div>请先选择一个角色</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* 权限说明 */}
        <Divider />
        <Card size="small" title="权限说明">
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>一级导航权限：</Text>
              <div style={{ marginTop: 8 }}>
                {navigationData.firstLevel.map(nav => (
                  <Tag 
                    key={nav._id} 
                    color={checkedKeys.includes(`first-${nav._id}`) ? 'blue' : 'default'}
                    style={{ marginBottom: 4 }}
                  >
                    {nav.name}
                  </Tag>
                ))}
              </div>
            </Col>
            <Col span={12}>
              <Text strong>二级导航权限：</Text>
              <div style={{ marginTop: 8, maxHeight: '100px', overflowY: 'auto' }}>
                {navigationData.secondLevel.map(nav => (
                  <Tag 
                    key={nav._id} 
                    color={checkedKeys.includes(`second-${nav._id}`) ? 'green' : 'default'}
                    style={{ marginBottom: 4 }}
                  >
                    {nav.name}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
        </Card>
      </Spin>
    </Modal>
  );
};

export default RoleTemplateModal;