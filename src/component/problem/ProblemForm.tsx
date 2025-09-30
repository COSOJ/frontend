import React, { useState, useEffect, startTransition } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  Tag,
  message,
  Row,
  Col,
  Typography,
  Divider
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateProblemDto, Problem, problemService } from '../../service/problemService';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProblemFormProps {
  mode: 'create' | 'edit';
}

export const ProblemForm: React.FC<ProblemFormProps> = ({ mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadProblem(id);
    }
  }, [mode, id]);

  const loadProblem = async (problemId: string) => {
    setInitialLoading(true);
    try {
      const problem = await problemService.getProblem(problemId);
      form.setFieldsValue({
        ...problem,
        samples: problem.samples || [{ input: '', output: '' }]
      });
    } catch (error) {
      message.error('Failed to load problem');
      startTransition(() => {
        navigate('/admin/problems');
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async (values: CreateProblemDto) => {
    setLoading(true);
    try {
      // Transform samples back to the expected format
      const formattedValues = {
        ...values,
        samples: values.samples || []
      };

      if (mode === 'create') {
        await problemService.createProblem(formattedValues);
        message.success('Problem created successfully');
      } else if (id) {
        await problemService.updateProblem(id, formattedValues);
        message.success('Problem updated successfully');
      }
      startTransition(() => {
        navigate('/problems');
      });
    } catch (error) {
      message.error(`Failed to ${mode} problem`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Card loading />;
  }

  return (
    <Card>
      <Title level={3}>
        {mode === 'create' ? 'Create Problem' : 'Edit Problem'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          difficulty: 1,
          timeLimitMs: 1000,
          memoryLimitMb: 256,
          visibility: 'private',
          tags: [],
          samples: [{ input: '', output: '' }]
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Problem Code"
              rules={[{ required: true, message: 'Please enter problem code!' }]}
            >
              <Input placeholder="e.g., A, B1, CF1000A" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter problem title!' }]}
            >
              <Input placeholder="Problem title" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="statement"
          label="Problem Statement"
          rules={[{ required: true, message: 'Please enter problem statement!' }]}
        >
          <TextArea rows={6} placeholder="Describe the problem..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="difficulty"
              label="Difficulty (1-10)"
              rules={[{ required: true, message: 'Please select difficulty!' }]}
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="timeLimitMs"
              label="Time Limit (ms)"
              rules={[{ required: true, message: 'Please enter time limit!' }]}
            >
              <InputNumber min={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="memoryLimitMb"
              label="Memory Limit (MB)"
              rules={[{ required: true, message: 'Please enter memory limit!' }]}
            >
              <InputNumber min={64} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="inputSpec"
              label="Input Specification"
              rules={[{ required: true, message: 'Please enter input specification!' }]}
            >
              <TextArea rows={3} placeholder="Describe the input format..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="outputSpec"
              label="Output Specification"
              rules={[{ required: true, message: 'Please enter output specification!' }]}
            >
              <TextArea rows={3} placeholder="Describe the output format..." />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="tags"
          label="Tags"
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Add tags"
            tokenSeparators={[',']}
          >
            <Option value="math">Math</Option>
            <Option value="string">String</Option>
            <Option value="array">Array</Option>
            <Option value="greedy">Greedy</Option>
            <Option value="dp">Dynamic Programming</Option>
            <Option value="graph">Graph</Option>
            <Option value="tree">Tree</Option>
            <Option value="implementation">Implementation</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="visibility"
          label="Visibility"
          rules={[{ required: true, message: 'Please select visibility!' }]}
        >
          <Select>
            <Option value="private">Private</Option>
            <Option value="public">Public</Option>
          </Select>
        </Form.Item>

        <Divider>Sample Test Cases</Divider>
        
        <Form.List name="samples">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  title={`Sample ${name + 1}`}
                  extra={
                    fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    )
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'input']}
                        label="Input"
                        rules={[{ required: true, message: 'Please enter sample input!' }]}
                      >
                        <TextArea rows={3} placeholder="Sample input..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'output']}
                        label="Expected Output"
                        rules={[{ required: true, message: 'Please enter expected output!' }]}
                      >
                        <TextArea rows={3} placeholder="Expected output..." />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Sample Test Case
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === 'create' ? 'Create Problem' : 'Update Problem'}
            </Button>
            <Button onClick={() => {
              startTransition(() => {
                navigate('/problems');
              });
            }}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};