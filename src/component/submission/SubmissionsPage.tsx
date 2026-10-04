import React from 'react';
import { Layout, Typography, Space, Tabs } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { LazySubmissionList } from './LazySubmissionList';
import { LazyUserStats } from './LazyUserStats';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;
const { Title } = Typography;

export const SubmissionsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const tabItems = [
    {
      key: 'all',
      label: 'All Submissions',
      children: (
        <LazySubmissionList
          showUserColumn
          showProblemColumn
        />
      ),
    },
    ...(isAuthenticated && user ? [
      {
        key: 'mine',
        label: 'My Submissions',
        children: (
          <LazySubmissionList
            userId={user._id}
            showUserColumn={false}
            showProblemColumn
          />
        ),
      },
    ] : []),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>
              <HistoryOutlined /> All Submissions
            </Title>
          </div>

          {/* User Stats - only show if authenticated */}
          {isAuthenticated && user && (
            <LazyUserStats
              userId={user._id}
              userHandle={user.handle}
            />
          )}

          <Tabs items={tabItems} />
        </Space>
      </Content>
    </Layout>
  );
};
