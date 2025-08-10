import React from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const Signup: React.FC = () => {
  const [form] = Form.useForm();
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: SignupFormValues) => {
    try {
      if (values.email === 'admin@adminmail.com') {
        message.error('This email is reserved for admin access. Please use a different email.');
        return;
      }
      
      const success = await signup(values.email, values.password, values.name);
      
      if (success) {
        message.success('Account created successfully!');
        navigate('/landing', { replace: true });
      } else {
        message.error('Signup failed. Please check your information and try again.');
      }
    } catch (error) {
      message.error('Signup failed. Please try again.');
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Please fill in all required fields correctly.');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            Create Account
          </Title>
          <Text type="secondary">
            Join us today and get started
          </Text>
        </div>

        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please input your full name!' },
              { min: 2, message: 'Name must be at least 2 characters!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">or</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#1890ff',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Text
            type="secondary"
            style={{
              fontSize: '12px',
              display: 'block',
              padding: '8px',
              background: '#fff2e8',
              borderRadius: '4px',
              border: '1px solid #ffbb96',
            }}
          >
            <strong>Note:</strong> admin@adminmail.com is reserved.<br />
            Use any other valid email to create an account.
          </Text>
        </div>
      </Card>
    </div>
  );
};
