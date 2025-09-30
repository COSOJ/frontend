import React from 'react';
import { Card, Descriptions, Tag, Typography, Space, Button } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export const UserInfoCard: React.FC = () => {
  const { user, getUserExtendedData } = useAuth();
  const userExtendedData = getUserExtendedData();

  if (!user || !userExtendedData) {
    return null;
  }

  const isAdmin = userExtendedData.role === 'admin';

  return (
    <Card
      style={{ marginBottom: 16 }}
      title={
        <Space>
          {isAdmin ? <CrownOutlined style={{ color: '#faad14' }} /> : <UserOutlined />}
          <span>Welcome, {user.handle}!</span>
          <Tag color={isAdmin ? 'gold' : 'blue'}>
            {userExtendedData.role.toUpperCase()}
          </Tag>
        </Space>
      }
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Department">{userExtendedData.department}</Descriptions.Item>
        <Descriptions.Item label="Last Login">
          {new Date(userExtendedData.lastLogin).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Permissions">
          <Space wrap>
            {userExtendedData.permissions.map((permission) => (
              <Tag key={permission} color="processing">
                {permission}
              </Tag>
            ))}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Theme" span={2}>
          <Tag color={userExtendedData.preferences.theme === 'dark' ? 'default' : 'blue'}>
            {userExtendedData.preferences.theme}
          </Tag>
          <Tag color="green">
            Language: {userExtendedData.preferences.language}
          </Tag>
          <Tag color={userExtendedData.preferences.notifications ? 'success' : 'default'}>
            Notifications: {userExtendedData.preferences.notifications ? 'Enabled' : 'Disabled'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
      
      {isAdmin && (
        <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 6 }}>
          <Text type="warning" strong>
            🛡️ Administrator Access Detected
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            You have full administrative privileges in this system.
          </Text>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Button 
          type="primary" 
          size="small"
          onClick={() => {
            console.log('Current user data:', user);
            console.log('Extended user data:', userExtendedData);
            console.log('Auth token:', localStorage.getItem('authToken'));
          }}
        >
          Log User Data to Console
        </Button>
      </div>
    </Card>
  );
};
