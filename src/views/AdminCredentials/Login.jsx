import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, Space } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useLoginMutation } from 'features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import 'antd/dist/reset.css';

const { Title, Text } = Typography;

const Login = () => {
  const [login, { isLoading, isSuccess, isError, error }] = useLoginMutation();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email, password } = values;
    try {
      await login({ email, password });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // Use useEffect to track isSuccess and navigate upon success
  useEffect(() => {
    if (isSuccess) {
      navigate('/scraper/admin/default'); // Navigate after successful login
    }
  }, [isSuccess, navigate]); // This effect runs when isSuccess changes



  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-lg">
        <Title level={2} className="text-center mb-6 text-gray-800">
          Welcome Back
        </Title>
        <Text className="block text-center mb-4 text-gray-600">
          Please enter your credentials to log in.
        </Text>
        <div className='flex text-center items-center justify-center mb-4'>
          {isError && <Text className='text-lg' type="danger">{error?.data?.message || 'Error during login!'}</Text>}
          {isSuccess && <Text className='text-lg' type="success">Login successful!</Text>}
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-500" />}
              placeholder="Email"
              size="large"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: 'Password must be at least 8 characters long and contain both letters and numbers!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-500" />}
              placeholder="Password"
              size="large"
              className="w-full"
            />
          </Form.Item>

          <Form.Item>
            <Space className="flex justify-between">
              <span></span>
              <a href="/forgot-password" className="text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </Space>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </Form.Item>



          <Form.Item className="text-center">
            <Text>
              Don't have an account?{' '}
              <a href="/scraper/admins/signup" className="text-blue-600 hover:text-blue-800">
                Sign up
              </a>
            </Text>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
