import React, { useState, useEffect, startTransition } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Tag,
  Modal,
  message,
  Popconfirm,
  Typography,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Problem, problemService } from '../../service/problemService';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

export const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin/superadmin
  const isAdmin = user && user.roles?.includes('admin') || user?.roles?.includes('superadmin');

  const loadProblems = async (page = 1) => {
    setLoading(true);
    try {
      const response = await problemService.getProblems(page, pageSize);
      setProblems(response.items);
      setTotal(response.total);
      setCurrent(page);
    } catch (error) {
      message.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await problemService.deleteProblem(id);
      message.success('Problem deleted successfully');
      loadProblems(current);
    } catch (error) {
      message.error('Failed to delete problem');
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'green';
    if (difficulty <= 6) return 'orange';
    return 'red';
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 6) return 'Medium';
    return 'Hard';
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string) => <code>{code}</code>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Problem) => (
        <Button
          type="link"
          onClick={() => {
            startTransition(() => {
              navigate(`/problem/${record._id}`);
            });
          }}
          style={{ padding: 0, height: 'auto' }}
        >
          {title}
        </Button>
      ),
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty: number) => (
        <Tag color={getDifficultyColor(difficulty)}>
          {getDifficultyText(difficulty)}
        </Tag>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size={[0, 8]} wrap>
          {tags.slice(0, 3).map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
          {tags.length > 3 && (
            <Tag color="default">+{tags.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Visibility',
      dataIndex: 'visibility',
      key: 'visibility',
      width: 100,
      render: (visibility: string) => (
        <Badge
          status={visibility === 'public' ? 'success' : 'default'}
          text={visibility}
        />
      ),
    },
    {
      title: 'Time Limit',
      dataIndex: 'timeLimitMs',
      key: 'timeLimitMs',
      width: 100,
      render: (timeMs: number) => `${timeMs}ms`,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Problem) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              startTransition(() => {
                navigate(`/problem/${record._id}`);
              });
            }}
            title="View Problem"
          />
          {isAdmin && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  startTransition(() => {
                    navigate(`/admin/problems/${record._id}/edit`);
                  });
                }}
                title="Edit Problem"
              />
              <Popconfirm
                title="Delete Problem"
                description="Are you sure you want to delete this problem?"
                onConfirm={() => handleDelete(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  title="Delete Problem"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Problems</Title>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              startTransition(() => {
                navigate('/admin/problems/create');
              });
            }}
          >
            Create Problem
          </Button>
        )}
      </div>
      
      <Table
        columns={columns}
        dataSource={problems}
        rowKey="_id"
        loading={loading}
        pagination={{
          current,
          pageSize,
          total,
          onChange: loadProblems,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} problems`,
        }}
      />
    </Card>
  );
};