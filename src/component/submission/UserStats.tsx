import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Progress, 
  Typography, 
  Space,
  message,
  Spin
} from 'antd';
import { 
  TrophyOutlined, 
  CodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { 
  submissionService, 
  UserStats, 
  SubmissionVerdict 
} from '../../service/submissionService';

const { Title, Text } = Typography;

interface UserStatsProps {
  userId: string;
  userHandle?: string;
}

const UserStatsComponent: React.FC<UserStatsProps> = ({ 
  userId, 
  userHandle 
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const userStats = await submissionService.getUserStats(userId);
      setStats(userStats);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <Spin tip="Loading statistics...">
          <div style={{ height: 200 }} />
        </Spin>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const getVerdictCount = (verdict: SubmissionVerdict): number => {
    const found = stats.verdictBreakdown.find(item => item._id === verdict);
    return found ? found.count : 0;
  };

  const acceptedCount = getVerdictCount(SubmissionVerdict.ACCEPTED);
  const wrongAnswerCount = getVerdictCount(SubmissionVerdict.WRONG_ANSWER);
  const timeExceededCount = getVerdictCount(SubmissionVerdict.TIME_LIMIT_EXCEEDED);
  const memoryExceededCount = getVerdictCount(SubmissionVerdict.MEMORY_LIMIT_EXCEEDED);
  const runtimeErrorCount = getVerdictCount(SubmissionVerdict.RUNTIME_ERROR);
  const compilationErrorCount = getVerdictCount(SubmissionVerdict.COMPILATION_ERROR);
  const pendingCount = getVerdictCount(SubmissionVerdict.PENDING);

  const successRate = stats.totalSubmissions > 0 
    ? Math.round((acceptedCount / stats.totalSubmissions) * 100) 
    : 0;

  const verdictStats = [
    {
      label: 'Accepted',
      count: acceptedCount,
      color: '#52c41a',
      icon: <CheckCircleOutlined />
    },
    {
      label: 'Wrong Answer',
      count: wrongAnswerCount,
      color: '#ff4d4f',
      icon: <CloseCircleOutlined />
    },
    {
      label: 'Time Limit Exceeded',
      count: timeExceededCount,
      color: '#fa8c16',
      icon: <ClockCircleOutlined />
    },
    {
      label: 'Memory Limit Exceeded',
      count: memoryExceededCount,
      color: '#fa8c16',
      icon: <ClockCircleOutlined />
    },
    {
      label: 'Runtime Error',
      count: runtimeErrorCount,
      color: '#ff4d4f',
      icon: <CloseCircleOutlined />
    },
    {
      label: 'Compilation Error',
      count: compilationErrorCount,
      color: '#ff4d4f',
      icon: <CloseCircleOutlined />
    },
    {
      label: 'Pending',
      count: pendingCount,
      color: '#1890ff',
      icon: <ClockCircleOutlined />
    }
  ];

  return (
    <Card
      title={
        <Space>
          <TrophyOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {userHandle ? `${userHandle}'s Statistics` : 'User Statistics'}
          </Title>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        {/* Overall Statistics */}
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Submissions"
              value={stats.totalSubmissions}
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Accepted"
              value={acceptedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Success Rate"
              value={successRate}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: successRate >= 50 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Success Rate</Text>
              <Progress
                type="circle"
                percent={successRate}
                size={80}
                strokeColor={successRate >= 50 ? '#52c41a' : '#ff4d4f'}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Verdict Breakdown */}
      <Card 
        title="Verdict Breakdown" 
        size="small" 
        style={{ marginTop: 16 }}
      >
        <Row gutter={[16, 16]}>
          {verdictStats
            .filter(stat => stat.count > 0)
            .map((stat, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Space direction="vertical" size="small">
                    <div style={{ color: stat.color, fontSize: '24px' }}>
                      {stat.icon}
                    </div>
                    <Text strong style={{ color: stat.color }}>
                      {stat.count}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {stat.label}
                    </Text>
                    <Progress
                      percent={Math.round((stat.count / stats.totalSubmissions) * 100)}
                      size="small"
                      strokeColor={stat.color}
                      showInfo={false}
                    />
                  </Space>
                </Card>
              </Col>
            ))}
        </Row>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card size="small" title="Performance Summary">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Accuracy:</Text>
                <Text strong style={{ color: successRate >= 50 ? '#52c41a' : '#ff4d4f' }}>
                  {successRate}%
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Correct Solutions:</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  {acceptedCount}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Failed Attempts:</Text>
                <Text strong style={{ color: '#ff4d4f' }}>
                  {stats.totalSubmissions - acceptedCount}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card size="small" title="Error Analysis">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Logic Errors:</Text>
                <Text strong style={{ color: '#ff4d4f' }}>
                  {wrongAnswerCount}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Performance Issues:</Text>
                <Text strong style={{ color: '#fa8c16' }}>
                  {timeExceededCount + memoryExceededCount}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Code Issues:</Text>
                <Text strong style={{ color: '#ff4d4f' }}>
                  {runtimeErrorCount + compilationErrorCount}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default UserStatsComponent;