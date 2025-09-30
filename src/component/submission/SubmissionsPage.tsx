import React, { useContext } from 'react';
import { Layout, Typography, Space } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import LazySubmissionList from '../submission/LazySubmissionList';
import LazyUserStats from '../submission/LazyUserStats';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;
const { Title } = Typography;

const SubmissionsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

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

          {/* All Submissions List */}
          <LazySubmissionList 
            showUserColumn={true}
            showProblemColumn={true}
          />
        </Space>
      </Content>
    </Layout>
  );
};

export default SubmissionsPage;