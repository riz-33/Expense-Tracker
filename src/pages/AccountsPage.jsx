import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import { blue, green, purple, red } from "@mui/material/colors";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useContext, useEffect } from "react";
import { useState } from "react";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  message,
} from "antd";
import {
  collection,
  db,
  addDoc,
  query,
  where,
  onSnapshot,
} from "../config/firebase";
import { Timestamp } from "firebase/firestore";
import User from "../components/user";

const getAccountStyle = (mode) => {
  switch (mode) {
    case "Debit Card":
      return { icon: <CreditCardIcon />, color: green[800] };
    case "Credit Card":
      return { icon: <CreditCardIcon />, color: red[800] };
    case "Investment":
      return { icon: <AttachMoneyIcon />, color: purple[800] };
    case "Cash":
      return { icon: <PaymentsIcon />, color: blue[900] };
    default:
      return { icon: <PaymentsIcon />, color: blue[900] }; 
  }
};

export const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const { user } = useContext(User);
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const resetForms = () => {
    form.resetFields();
  };

  const onCreate = async (values) => {
    const selectedDate = new Date(values.date);
    setLoading(true); // Start loading

    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        title: values.title.toUpperCase(),
        mode: values.mode,
        amount: values.amount,
        type: "Income",
        date: Timestamp.fromDate(selectedDate),
        page: "newAccount",
        transMode: values.mode + "-" + values.title.toUpperCase(),
        // comments: values.mode.toUpperCase() + "-" + values.title.toUpperCase(),
      });
      message.success("Account added successfully!");
      console.log("Received values of form: ", values);
      setOpenModal(false);
      resetForms();
    } catch {
      message.error("Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      where("page", "==", "newAccount")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const accountsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(accountsData);
    });
    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div>
      <Grid
        container
        direction="row"
        sx={{
          justifyContent: "flex-end",
          alignItems: "flex-end",
          marginTop: 2,
          paddingRight: 6,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          style={{ padding: "2px 12px", backgroundColor: "#1a237e" }}
        >
          Add Account
        </Button>
      </Grid>
      <Modal
        open={openModal}
        title="New Account"
        okText="Add Account"
        cancelText="Cancel"
        onCancel={() => setOpenModal(false)}
        confirmLoading={loading}
        okButtonProps={{
          disabled: loading,
          style: { backgroundColor: "#1a237e", color:"white" },
        }}
        destroyOnClose
        onOk={() => form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          name="form_in_modal"
          onFinish={onCreate}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true }]}
              style={{ width: "100%" }}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="mode"
              label="Mode"
              rules={[{ required: true }]}
              style={{ width: "100%" }}
            >
              <Select>
                <Select.Option value="Cash">Cash</Select.Option>
                <Select.Option value="Debit Card">Debit Card</Select.Option>
                <Select.Option value="Credit Card">Credit Card</Select.Option>
                <Select.Option value="Investment">Investment</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true }]}
              style={{ width: "100%" }}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Grid padding={2} container rowSpacing={2} columnSpacing={2}>
        {accounts.map((account, index) => {
          const { icon, color } = getAccountStyle(account.mode);
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ maxWidth: 420 }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: color, marginBottom: 8 }}>
                      {icon}
                    </Avatar>
                  }
                  title={
                    <>
                      <Typography sx={{ fontSize: 20 }}>
                        {account.title.toUpperCase()}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                        {account.mode.toUpperCase() +
                          "-" +
                          account.title.toUpperCase()}
                      </Typography>
                      <Typography variant="h6" component="div">
                        {user?.currency + "."}{" "}
                        {new Intl.NumberFormat("en-IN").format(account.amount)}
                      </Typography>
                    </>
                  }
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};
