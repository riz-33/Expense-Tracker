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
  const [form] = Form.useForm();
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };
  return (
    <Row style={{ marginTop: "28px" }}>
      <Col span={12} offset={6}>
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
            initialValues={{
              residence: ["zhejiang", "hangzhou", "xihu"],
              prefix: "86",
            }}
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
              <Input />
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
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <Input />
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
              <Select placeholder="select your currency">
                <Option value="pkr">PKR &nbsp; &nbsp; Pakistani Rupee</Option>
                <Option value="usd">USD &nbsp; &nbsp; US Dollar</Option>
                <Option value="eur">EUR &nbsp; &nbsp; Euro</Option>
                <Option value="gbp">GBP &nbsp; &nbsp; Pound Sterling</Option>
                <Option value="sar">SAR &nbsp; &nbsp; Saudi Riyal </Option>
              </Select>
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
              <Flex gap="small">
                <Button type="primary" htmlType="submit">
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
    </Row>
  );
};
export default ProfilePage;
