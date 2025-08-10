import React from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination or default to landing
  const from = (location.state as any)?.from?.pathname || '/landing';

  const onFinish = async (values: LoginFormValues) => {
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        message.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        message.error('Invalid email or password. Please try again.');
      }
    } catch (error) {
      message.error('Login failed. Please try again.');
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
            Welcome Back
          </Title>
          <Text type="secondary">
            Please sign in to your account
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
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
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">or</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: '#1890ff',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Sign Up
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
              background: '#e6f7ff',
              borderRadius: '4px',
              border: '1px solid #91d5ff',
            }}
          >
            <strong>Admin Login:</strong><br />
            Email: admin@adminmail.com<br />
            Password: admin12345admin
          </Text>
        </div>
      </Card>
    </div>
  );
};
