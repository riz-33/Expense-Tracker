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
} from "antd";
import User from "../context/user";
import { useContext, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  db,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
} from "../config/firebase";

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 6,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
const ProfilePage = () => {
  const user = useContext(User).user;
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    };
    fetchData();
  }, [user.uid]);

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      username: values.username,
      email: values.email,
      number: values.number,
      currency: values.currency,
    });
    console.log("Received values of form: ", values);
  };
  return (
    <Row style={{ marginTop: "60px" }}>
      <Col xs={2} sm={4} md={4} lg={5} xl={6}></Col>
      <Col xs={20} sm={16} md={16} lg={14} xl={12}>
        <Card>
          <Typography
            style={{ fontSize: 20, textAlign: "center", marginBottom: 10 }}
          >
            {" "}
            User Profile
          </Typography>
          <Form
            {...formItemLayout}
            form={form}
            name="register"
            onFinish={onFinish}
            style={{
              paddingBlock: 20,
            }}
            scrollToFirstError
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                {
                  required: true,
                  message: "Please input your Username!",
                },
              ]}
            >
              <Input defaultValue={user.username} />
            </Form.Item>

            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: "Please input your E-mail!",
                },
              ]}
            >
              <Input defaultValue={user.email} />
            </Form.Item>

            <Form.Item
              name="number"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <Input defaultValue={user.number} />
            </Form.Item>

            <Form.Item
              name="currency"
              label="Currency"
              rules={[
                {
                  required: true,
                  message: "Please select Currency Type!",
                },
              ]}
            >
              <Select
                placeholder="select your currency"
                defaultValue={user.currency}
              >
                <Option value="PKR">PKR &nbsp; &nbsp; Pakistani Rupee</Option>
                <Option value="USD">USD &nbsp; &nbsp; US Dollar</Option>
                <Option value="EUR">EUR &nbsp; &nbsp; Euro</Option>
                <Option value="GBP">GBP &nbsp; &nbsp; Pound Sterling</Option>
                <Option value="SAR">SAR &nbsp; &nbsp; Saudi Riyal </Option>
              </Select>
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
              <Flex gap="small">
                <Button
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
