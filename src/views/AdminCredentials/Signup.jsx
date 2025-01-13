import React,{useEffect} from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useSignupMutation } from 'features/auth/authSlice';
import { useNavigate } from 'react-router-dom'; 
import 'antd/dist/reset.css';

const { Title, Text } = Typography;

const Signup = () => {
  const [signup, { isLoading, isSuccess, isError, error }] = useSignupMutation();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email, password, confirmPassword } = values; // Extract confirmPassword as well

    // Now send email, password, and confirmPassword to the backend
    try {
      await signup({ email, password, confirmPassword }); // Trigger the signup mutation
      console.log('Sign-up successful:', values);
    } catch (error) {
      console.error('Sign-up error:', error);
    }
  };

    // Effect to handle redirection after success
    useEffect(() => {
      if (isSuccess) {
        setTimeout(() => {
          navigate('/admins/login'); // Redirect to the login page after 2 seconds
        }, 2000); // 2000 milliseconds = 2 seconds
      }
    }, [isSuccess, navigate]); // The effect runs when isSuccess changes


  return (

    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-purple-500 to-blue-600">
      <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-lg">
        <Title level={2} className="text-center mb-6 text-gray-800">
          Create an Account
        </Title>
        <Text className="block text-center mb-4 text-gray-600">
          Please fill in the information below to create an account.
        </Text>
        <div className='flex text-center items-center justify-center mb-4'>
          {isError && <Text className='text-lg' type="danger">{error?.data?.error || 'Error during sign-up!'} </Text>}
          {isSuccess && <Text className='text-lg' type="success">Sign-up successful! You can now log in.</Text>}
        </div>
        <Form
          name="signup"
          initialValues={{ remember: true }}
          onFinish={onFinish} // Handle form submission
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

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-500" />}
              placeholder="Confirm Password"
              size="large"
              className="w-full"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </Form.Item>



          <Form.Item className="text-center">
            <Text>
              Already have an account?{' '}
              <a href="/scraper/admins/login" className="text-blue-600 hover:text-blue-800">
                Log in
              </a>
            </Text>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Signup;