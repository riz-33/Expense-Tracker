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
  Upload,
} from "antd";
import User from "../context/user"
import { UserOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { doc, db, updateDoc, onSnapshot } from "../config/firebase";

const ProfilePage = () => {
  const user = useContext(User).user;
  const { Option } = Select;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          // Resize logic
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height *= maxWidth / width;
              width = maxWidth;
            } else {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            },
            "image/jpeg",
            1
          );
        };
      };
    });
  };

  const props = {
    name: "file",
    async beforeUpload(file) {
      return await compressImage(file);
    },
    action: "https://api.cloudinary.com/v1_1/dxzqtndlo/image/upload",
    data: (file) => ({
      upload_preset: "expense_tracker",
      file,
    }),

    async onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        const url = info.file.response.secure_url;
        const fileRef = doc(db, "users", user.uid);

        await updateDoc(fileRef, { avatar: url });
        setAvatarUrl(url);

        message.success(`Profile picture updated successfully`);
      } else if (info.file.status === "error") {
        message.error(`Failed to update profile.`);
      }
    },
  };

  useEffect(() => {
    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        form.setFieldsValue(userData);
        setAvatarUrl(userData.avatar);
      }
    });
    return () => unsubscribe();
  }, [user.uid, form]);

  const onFinish = async (values) => {
    setLoading(true);
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

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            scrollToFirstError
          >
            <div
              style={{
                padding: 5,
                marginBottom: 15,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Upload style={{ justifyContent: "center" }} {...props}>
                <Space
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  direction="vertical"
                  size={16}
                >
                  <Avatar src={avatarUrl} size={150} icon={<UserOutlined />} />
                </Space>
              </Upload>
            </div>

            <Row>
              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  // style={{ width: "90%" }}
                  name="username"
                  label="Username"
                  initialValue={user.username}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  // style={{ width: "100%" }}
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
              </Col>

              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  // style={{ width: "100%" }}
                  initialValue={user.number}
                  name="number"
                  label="Phone Number"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  style={{ width: "100%" }}
                  initialValue={user.currency}
                  name="currency"
                  label="Currency"
                >
                  <Select placeholder="select your currency">
                    <Option value="PKR">
                      PKR &nbsp; &nbsp; Pakistani Rupee
                    </Option>
                    <Option value="USD">USD &nbsp; &nbsp; US Dollar</Option>
                    <Option value="EUR">EUR &nbsp; &nbsp; Euro</Option>
                    <Option value="GBP">
                      GBP &nbsp; &nbsp; Pound Sterling
                    </Option>
                    <Option value="SAR">SAR &nbsp; &nbsp; Saudi Riyal </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

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
                  Update
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
