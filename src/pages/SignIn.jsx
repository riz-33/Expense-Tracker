import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Flex, Row, Col } from "antd";
const App = () => {
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };
  return (
    <Row>
      <Col xs={2} sm={4} md={7} lg={8} xl={9}></Col>
      <Col xs={20} sm={16} md={10} lg={8} xl={6}>
        <Form
          name="login"
          initialValues={{
            remember: true,
          }}
          style={{
            textAlign: "center",
            // maxWidth: 360,
            height: "100vh",
            justifyContent: "center",
            // alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your Username!",
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
                message: "Please input your Password!",
              },
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Log in
            </Button>
            or <a href="">Register now!</a>
          </Form.Item>
        </Form>
      </Col>
      <Col xs={2} sm={4} md={7} lg={8} xl={9}></Col>
    </Row>
  );
};
export default App;
