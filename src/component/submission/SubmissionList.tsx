import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Card, 
  Space, 
  Button, 
  Select, 
  Input,
  message,
  Typography,
  Tooltip,
  Modal,
  Descriptions,
  Spin
} from 'antd';
import { 
  EyeOutlined, 
  ReloadOutlined, 
  FilterOutlined,
  CodeOutlined,
  ClockCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  submissionService, 
  Submission, 
  SubmissionVerdict, 
  ProgrammingLanguage,
  SubmissionQueryParams 
} from '../../service/submissionService';

const { Option } = Select;
const { Search } = Input;
const { Text, Title } = Typography;

interface SubmissionListProps {
  problemId?: string;
  userId?: string;
  showUserColumn?: boolean;
  showProblemColumn?: boolean;
}

const SubmissionList: React.FC<SubmissionListProps> = ({
  problemId,
  userId,
  showUserColumn = true,
  showProblemColumn = true
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<SubmissionQueryParams>({
    problem: problemId,
    user: userId
  });
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchSubmissions = async (params: SubmissionQueryParams = {}) => {
    try {
      setLoading(true);
      const queryParams = { ...filters, ...params };
      const response = await submissionService.getSubmissions(queryParams);
      
      setSubmissions(response.items);
      setPagination({
        current: response.current,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [problemId, userId]);

  const handleTableChange = (page: number, size?: number) => {
    const newParams = {
      current: page,
      pageSize: size || pagination.pageSize
    };
    setPagination(prev => ({ ...prev, ...newParams }));
    fetchSubmissions(newParams);
  };

  const handleFilterChange = (key: keyof SubmissionQueryParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchSubmissions({ ...newFilters, current: 1 });
  };

  const showSubmissionDetail = async (submission: Submission) => {
    try {
      // Fetch fresh submission data with full details
      const fullSubmission = await submissionService.getSubmission(submission._id);
      setSelectedSubmission(fullSubmission);
      setDetailModalVisible(true);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch submission details');
    }
  };

  const formatTime = (timeInMs: number): string => {
    if (timeInMs < 1000) {
      return `${timeInMs}ms`;
    }
    return `${(timeInMs / 1000).toFixed(2)}s`;
  };

  const formatMemory = (memoryInKb: number): string => {
    if (memoryInKb < 1024) {
      return `${memoryInKb}KB`;
    }
    return `${(memoryInKb / 1024).toFixed(2)}MB`;
  };

  const columns: ColumnsType<Submission> = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: 'id',
      width: 100,
      render: (id: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {id.slice(-8)}
        </Text>
      )
    },
    ...(showUserColumn ? [{
      title: 'User',
      dataIndex: ['user', 'handle'],
      key: 'user',
      width: 120,
      render: (handle: string) => (
        <Text strong>{handle}</Text>
      )
    }] : []),
    ...(showProblemColumn ? [{
      title: 'Problem',
      dataIndex: 'problem',
      key: 'problem',
      width: 200,
      render: (problem: any) => (
        <Space direction="vertical" size={0}>
          <Text code>{problem.code}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {problem.title}
          </Text>
        </Space>
      )
    }] : []),
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      width: 100,
      render: (language: ProgrammingLanguage) => (
        <Tag>{submissionService.getLanguageDisplayName(language)}</Tag>
      ),
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Filter by language"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => handleFilterChange('language', value)}
          >
            {Object.values(ProgrammingLanguage).map(lang => (
              <Option key={lang} value={lang}>
                {submissionService.getLanguageDisplayName(lang)}
              </Option>
            ))}
          </Select>
        </div>
      ),
      filterIcon: <FilterOutlined />
    },
    {
      title: 'Verdict',
      dataIndex: 'verdict',
      key: 'verdict',
      width: 150,
      render: (verdict: SubmissionVerdict) => (
        <Tag color={submissionService.getVerdictColor(verdict)}>
          {submissionService.getVerdictText(verdict)}
        </Tag>
      ),
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Filter by verdict"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => handleFilterChange('verdict', value)}
          >
            {Object.values(SubmissionVerdict).map(verdict => (
              <Option key={verdict} value={verdict}>
                {submissionService.getVerdictText(verdict)}
              </Option>
            ))}
          </Select>
        </div>
      ),
      filterIcon: <FilterOutlined />
    },
    {
      title: 'Time',
      dataIndex: 'timeUsedMs',
      key: 'time',
      width: 100,
      render: (time: number) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{formatTime(time)}</Text>
        </Space>
      )
    },
    {
      title: 'Memory',
      dataIndex: 'memoryUsedKb',
      key: 'memory',
      width: 100,
      render: (memory: number) => (
        <Space>
          <DatabaseOutlined />
          <Text>{formatMemory(memory)}</Text>
        </Space>
      )
    },
    {
      title: 'Test Cases',
      key: 'testCases',
      width: 100,
      render: (_, record) => (
        <Text>
          {record.testCasesPassed}/{record.totalTestCases}
        </Text>
      )
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString()}
        </Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showSubmissionDetail(record)}
          size="small"
        >
          View
        </Button>
      )
    }
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <CodeOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Submissions
            </Title>
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchSubmissions()}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Filters */}
          <Space wrap>
            {showUserColumn && (
              <Search
                placeholder="Search by user handle"
                style={{ width: 200 }}
                onSearch={(value) => handleFilterChange('user', value || undefined)}
                allowClear
              />
            )}
            {showProblemColumn && (
              <Search
                placeholder="Search by problem code"
                style={{ width: 200 }}
                onSearch={(value) => handleFilterChange('problem', value || undefined)}
                allowClear
              />
            )}
          </Space>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={submissions}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} submissions`,
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange
            }}
            scroll={{ x: 1200 }}
            size="small"
          />
        </Space>
      </Card>

      {/* Submission Detail Modal */}
      <Modal
        title={
          <Space>
            <CodeOutlined />
            <span>Submission Details</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedSubmission && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Submission ID">
                <Text code>{selectedSubmission._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="User">
                <Text strong>{selectedSubmission.user.handle}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Problem">
                <Space direction="vertical" size={0}>
                  <Text code>{selectedSubmission.problem.code}</Text>
                  <Text type="secondary">{selectedSubmission.problem.title}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Language">
                <Tag>{submissionService.getLanguageDisplayName(selectedSubmission.language)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Verdict">
                <Tag color={submissionService.getVerdictColor(selectedSubmission.verdict)}>
                  {submissionService.getVerdictText(selectedSubmission.verdict)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Execution Time">
                <Space>
                  <ClockCircleOutlined />
                  <Text>{formatTime(selectedSubmission.timeUsedMs)}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Memory Used">
                <Space>
                  <DatabaseOutlined />
                  <Text>{formatMemory(selectedSubmission.memoryUsedKb)}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Test Cases">
                <Text>
                  {selectedSubmission.testCasesPassed}/{selectedSubmission.totalTestCases} passed
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Submitted At" span={2}>
                <Text>{new Date(selectedSubmission.createdAt).toLocaleString()}</Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedSubmission.errorMessage && (
              <Card title="Error Message" size="small">
                <Text type="danger" code>
                  {selectedSubmission.errorMessage}
                </Text>
              </Card>
            )}

            <Card title="Source Code" size="small">
              <pre style={{ 
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}>
                {selectedSubmission.code}
              </pre>
            </Card>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default SubmissionList;