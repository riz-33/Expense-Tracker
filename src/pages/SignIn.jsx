import { Button, Card, Col, Form, Input, Row, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
const { Title } = Typography;
import {
  db,
  doc,
  getDoc,
  auth,
  signInWithEmailAndPassword,
} from "../config/firebase";

const onFinish = async (values) => {
  console.log("Success:", values);
  await onSubmit(values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const onSubmit = async (data) => {
  try {
    const response = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    // showToastMessage("User Login Successfully!", "success");
    const docRef = doc(db, "users", response.user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      console.log("No such document!");
    }
    // reset();
  } catch (error) {
    console.log(error);
    // showToastMessage(`${error}`, "danger");
  }
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
          // onSubmit={onSubmit}
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
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
