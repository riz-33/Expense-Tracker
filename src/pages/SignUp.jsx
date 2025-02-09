import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
} from "antd";
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  auth,
  createUserWithEmailAndPassword,
  db,
  doc,
  setDoc,
  serverTimestamp,
} from "../config/firebase";

const onFinish = async (values) => {
  console.log("Success:", values);
  await onSubmit(values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
const { Option } = Select;
const { Title } = Typography;

const onSubmit = async (data) => {
  try {
    const response = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    // showToastMessage("User Registered Successfully!", "success");
    await setDoc(doc(db, "users", response.user.uid), {
      username: data.username,
      email: data.email,
      password: data.password,
      number: data.phone,
      currency: 'PKR',
      uid: response.user.uid,
      createdAt: serverTimestamp(),
    });
    console.log("User registered and saved to Firestore:", response.user);
  } catch (error) {
    console.error("Error during email/password signup:", error);
  }
};

const RegisterForm = () => {
  const suffixSelector = (
    <Form.Item name="suffix" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
        <Option value="PKR">PKR</Option>
        <Option value="USD">USD</Option>
        <Option value="EUR">EUR</Option>
        <Option value="GBP">GBP</Option>
        <Option value="SAR">SAR</Option>
      </Select>
    </Form.Item>
  );
  return (
    <Row>
      <Col xs={2} sm={4} md={6} lg={8} xl={8}></Col>
      <Col xs={20} sm={16} md={12} lg={8} xl={8} style={{ marginTop: 60 }}>
        <Card>
          <Title underline level={2} style={{ textAlign: "center" }}>
            Register
          </Title>
          <Form
            name="basic"
            initialValues={{
              remember: true,
              suffixSelector: "PKR",
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
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The new password that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                type="password"
                placeholder="Confirm Password"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <InputNumber
                prefix={<PhoneOutlined />}
                placeholder="Phone Number"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>

            {/* <Form.Item
              name="income"
              rules={[
                {
                  required: true,
                  message: "Please input initial income!",
                },
              ]}
            >
              <InputNumber
                prefix={<WalletOutlined />}
                placeholder="Income"
                addonAfter={suffixSelector}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item> */}

            <Form.Item label={null}>
              <Button block type="primary" htmlType="submit">
                Sign Up
              </Button>
              or <a href="/">Login now!</a>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={2} sm={4} md={6} lg={8} xl={8}></Col>
    </Row>
  );
};
export default RegisterForm;
