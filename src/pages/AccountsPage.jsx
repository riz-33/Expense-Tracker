import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { blue, green, purple, red } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  message,
} from "antd";
import User from "../context/user";
import {
  collection,
  db,
  addDoc,
  query,
  where,
  onSnapshot,
} from "../config/firebase";
import { Timestamp } from "firebase/firestore";

const options = ["Transfer Funds", "Add Money"];

const getAccountStyle = (mode) => {
  switch (mode) {
    case "Debit Card":
      return { icon: <CreditCardIcon />, color: green[500] };
    case "Credit Card":
      return { icon: <CreditCardIcon />, color: red[600] };
    case "Investment":
      return { icon: <AttachMoneyIcon />, color: purple[500] };
    case "Cash":
      return { icon: <PaymentsIcon />, color: blue[800] };
    default:
      return { icon: <PaymentsIcon />, color: blue[800] }; // Default case
  }
};

export const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const { user } = useContext(User);
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [loading, setLoading] = useState(false);

  const onCreate = async (values) => {
    const selectedDate = new Date(values.date);
    setLoading(true); // Start loading

    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        title: values.title.toUpperCase(),
        mode: values.mode + "-"+ values.title.toUpperCase(),
        amount: values.amount,
        type: "Income",
        date: Timestamp.fromDate(selectedDate),
        page: "newAccount",
        comments: values.mode.toUpperCase() + "-" + values.title.toUpperCase(),
      });
      message.success("Account added successfully!");
      console.log("Received values of form: ", values);
      setOpenModal(false);
    } catch {
      message.error("Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (!user) return;
  //   const accountsRef = collection(db, "users", user.uid, "transactions");
  //   const unsubscribe = onSnapshot(accountsRef, (snapshot) => {
  //     const fetchedAccounts = snapshot.docs
  //       .map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }))
  //       .filter((account) => account.page === "newAccount");
  //     setAccounts(fetchedAccounts);
  //   });
  //   return () => unsubscribe();
  // }, [user]);

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
        <Button variant="contained" onClick={() => setOpenModal(true)}>
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
        okButtonProps={{ disabled: loading }}
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

      <Grid padding={2} container rowSpacing={3} columnSpacing={2}>
        {accounts.map((account, index) => {
          const { icon, color } = getAccountStyle(account.mode);
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ maxWidth: 400 }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: color, marginBottom: 8 }}>
                      {icon}
                    </Avatar>
                  }
                  action={
                    <>
                      <IconButton
                        aria-label="more"
                        id="long-button"
                        aria-controls={open ? "long-menu" : undefined}
                        aria-expanded={open ? "true" : undefined}
                        aria-haspopup="true"
                        onClick={handleClick}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        id="long-menu"
                        MenuListProps={{
                          "aria-labelledby": "long-button",
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                          paper: {
                            style: {
                              width: "20ch",
                            },
                          },
                        }}
                      >
                        {options.map((option) => (
                          <MenuItem key={option} onClick={handleClose}>
                            {option}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  }
                  title={
                    <>
                      <Typography sx={{ fontSize: 20 }}>
                        {account.title.toUpperCase()}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                        {account.mode.toUpperCase()}
                      </Typography>
                      <Typography variant="h6" component="div">
                        Rs.{" "}
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
