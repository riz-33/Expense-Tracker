import { Button, Card, Col, Form, Input, Row, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
const { Title } = Typography;

const onFinish = (values) => {
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
const LoginForm = () => (
  <Row>
    <Col xs={2} sm={4} md={6} lg={8} xl={8}></Col>
    <Col xs={20} sm={16} md={12} lg={8} xl={8} style={{ marginTop: 120 }}>
      <Card>
        <Title underline level={2} style={{ textAlign: "center" }}>
          Login
        </Title>

        <Form
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item label={null}>
            <Button block type="primary" htmlType="submit">
              Sign In
            </Button>
            or <a href="/register">Register now!</a>
          </Form.Item>
        </Form>
      </Card>
    </Col>
    <Col xs={2} sm={4} md={6} lg={8} xl={8}></Col>
  </Row>
);
export default LoginForm;
