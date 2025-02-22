import { UserOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Typography,
  message,
  Avatar,
  Space,
} from "antd";
import User from "../context/user";
import { useContext, useEffect, useState } from "react";
import { doc, getDoc, db, updateDoc } from "../config/firebase";

const ProfilePage = () => {
  const { Option } = Select;
  const user = useContext(User).user;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
    };
    fetchData();
  }, [user.uid]);

  const onFinish = async (values) => {
    setLoading(true); // Start loading
    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, {
        username: values.username,
        email: values.email,
        number: values.number,
        currency: values.currency,
      });
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error("Failed to update profile.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ marginTop: "40px" }}>
      <Col xs={2} sm={4} md={4} lg={5} xl={6}></Col>
      <Col xs={20} sm={16} md={16} lg={14} xl={12}>
        <Card>
          <Typography
            style={{ fontSize: 20, textAlign: "center", marginBottom: 10 }}
          >
            User Profile
          </Typography>

          <Space
            style={{
              display: "flex",
              alignItems: "center",
              padding: 5,
              marginBottom: 15,
              cursor:"pointer",
            }}
            direction="vertical"
            size={16}
          >
            <Avatar
              // src={
              //   "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
              // }
              size={150}
              icon={<UserOutlined />}
            />
          </Space>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            scrollToFirstError
          >
            <div style={{ display: "flex", gap: "16px" }}>
              <Form.Item
                style={{ width: "100%" }}
                name="username"
                label="Username"
                initialValue={user.username}
              >
                <Input />
              </Form.Item>

              <Form.Item
                style={{ width: "100%" }}
                initialValue={user.email}
                name="email"
                label="E-mail"
                rules={[
                  {
                    type: "email",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <Form.Item
                style={{ width: "100%" }}
                initialValue={user.number}
                name="number"
                label="Phone Number"
              >
                <Input />
              </Form.Item>

              <Form.Item
                style={{ width: "100%" }}
                initialValue={user.currency}
                name="currency"
                label="Currency"
              >
                <Select placeholder="select your currency">
                  <Option value="PKR">PKR &nbsp; &nbsp; Pakistani Rupee</Option>
                  <Option value="USD">USD &nbsp; &nbsp; US Dollar</Option>
                  <Option value="EUR">EUR &nbsp; &nbsp; Euro</Option>
                  <Option value="GBP">GBP &nbsp; &nbsp; Pound Sterling</Option>
                  <Option value="SAR">SAR &nbsp; &nbsp; Saudi Riyal </Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              style={{ display: "flex", justifyContent: "center", margin: 12 }}
            >
              <Flex gap="small">
                <Button
                  loading={loading}
                  disabled={loading}
                  style={{ backgroundColor: "#1a237e" }}
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>
                <Button danger onClick={() => form.resetFields()}>
                  Reset
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={2} sm={4} md={4} lg={5} xl={6}></Col>
    </Row>
  );
};
export default ProfilePage;
