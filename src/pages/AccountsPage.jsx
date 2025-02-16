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
import React, { useContext } from "react";
import { useState } from "react";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
} from "antd";
import User from "../context/user";
import { collection, db, addDoc, serverTimestamp } from "../config/firebase";
import { Timestamp } from "firebase/firestore";

const options = ["Transfer Funds", "Add Money"];

export const AccountsPage = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { user } = useContext(User);
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState();
  const [openModal, setOpenModal] = useState(false);
  const onCreate = async (values) => {
    const selectedDate = new Date(values.date);
    await addDoc(collection(db, "users", user.uid, "transactions"), {
      title: values.title,
      mode: values.mode,
      amount: values.amount,
      type: "Income",
      date: Timestamp.fromDate(selectedDate),
    });
    console.log("Received values of form: ", values);
    setFormValues(values);
    setOpenModal(false);
  };

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
        okButtonProps={{
          autoFocus: true,
          htmlType: "submit",
        }}
        onCancel={() => setOpenModal(false)}
        destroyOnClose
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            clearOnDestroy
            onFinish={(values) => onCreate(values)}
          >
            {dom}
          </Form>
        )}
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
      </Modal>

      <Grid padding={2} container rowSpacing={3} columnSpacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ maxWidth: 290 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: blue[800], marginBottom: 8 }}>
                  <PaymentsIcon />
                </Avatar>
              }
              // action={
              //   <>
              //     <IconButton
              //       aria-label="more"
              //       id="long-button"
              //       aria-controls={open ? "long-menu" : undefined}
              //       aria-expanded={open ? "true" : undefined}
              //       aria-haspopup="true"
              //       onClick={handleClick}
              //     >
              //       <MoreVertIcon />
              //     </IconButton>
              //     <Menu
              //       id="long-menu"
              //       MenuListProps={{
              //         "aria-labelledby": "long-button",
              //       }}
              //       anchorEl={anchorEl}
              //       open={open}
              //       onClose={handleClose}
              //       slotProps={{
              //         paper: {
              //           style: {
              //             width: "20ch",
              //           },
              //         },
              //       }}
              //     >
              //       {options.map((option) => (
              //         <MenuItem key={option} onClick={handleClose}>
              //           {option}
              //         </MenuItem>
              //       ))}
              //     </Menu>
              //   </>
              // }
              title={
                <>
                  <Typography sx={{ fontSize: 20 }}>Cash</Typography>
                  <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                    Cash
                  </Typography>
                  <Typography variant="h5" component="div">
                    Rs.20,000
                  </Typography>
                </>
              }
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ maxWidth: 290 }}>
            <CardHeader
              avatar={
                <Avatar
                  sx={{ bgcolor: green[500], marginBottom: 8 }}
                  aria-label="recipe"
                >
                  <CreditCardIcon />
                </Avatar>
              }
              // action={
              //   <>
              //     <IconButton
              //       aria-label="more"
              //       id="long-button"
              //       aria-controls={open ? "long-menu" : undefined}
              //       aria-expanded={open ? "true" : undefined}
              //       aria-haspopup="true"
              //       onClick={handleClick}
              //     >
              //       <MoreVertIcon />
              //     </IconButton>
              //     <Menu
              //       id="long-menu"
              //       MenuListProps={{
              //         "aria-labelledby": "long-button",
              //       }}
              //       anchorEl={anchorEl}
              //       open={open}
              //       onClose={handleClose}
              //       slotProps={{
              //         paper: {
              //           style: {
              //             width: "20ch",
              //           },
              //         },
              //       }}
              //     >
              //       {options.map((option) => (
              //         <MenuItem key={option} onClick={handleClose}>
              //           {option}
              //         </MenuItem>
              //       ))}
              //     </Menu>
              //   </>
              // }
              title={
                <>
                  <Typography sx={{ fontSize: 20 }}>Debit Card</Typography>
                  <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                    Meezan Bank
                  </Typography>
                  <Typography variant="h5" component="div">
                    Rs.50,000
                  </Typography>
                </>
              }
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ maxWidth: 290 }}>
            <CardHeader
              avatar={
                <Avatar
                  sx={{ bgcolor: red[600], marginBottom: 8 }}
                  aria-label="recipe"
                >
                  <CreditCardIcon />
                </Avatar>
              }
              // action={
              //   <>
              //     <IconButton
              //       aria-label="more"
              //       id="long-button"
              //       aria-controls={open ? "long-menu" : undefined}
              //       aria-expanded={open ? "true" : undefined}
              //       aria-haspopup="true"
              //       onClick={handleClick}
              //     >
              //       <MoreVertIcon />
              //     </IconButton>
              //     <Menu
              //       id="long-menu"
              //       MenuListProps={{
              //         "aria-labelledby": "long-button",
              //       }}
              //       anchorEl={anchorEl}
              //       open={open}
              //       onClose={handleClose}
              //       slotProps={{
              //         paper: {
              //           style: {
              //             width: "20ch",
              //           },
              //         },
              //       }}
              //     >
              //       {options.map((option) => (
              //         <MenuItem key={option} onClick={handleClose}>
              //           {option}
              //         </MenuItem>
              //       ))}
              //     </Menu>
              //   </>
              // }
              title={
                <>
                  <Typography sx={{ fontSize: 20 }}>Credit Card</Typography>
                  <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                    Faysal Bank
                  </Typography>
                  <Typography variant="h5" component="div">
                    Rs.100,000
                  </Typography>
                </>
              }
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ maxWidth: 290 }}>
            <CardHeader
              avatar={
                <Avatar
                  sx={{ bgcolor: purple[500], marginBottom: 8 }}
                  aria-label="recipe"
                >
                  <AttachMoneyIcon />
                </Avatar>
              }
              // action={
              //   <>
              //     <IconButton
              //       aria-label="more"
              //       id="long-button"
              //       aria-controls={open ? "long-menu" : undefined}
              //       aria-expanded={open ? "true" : undefined}
              //       aria-haspopup="true"
              //       onClick={handleClick}
              //     >
              //       <MoreVertIcon />
              //     </IconButton>
              //     <Menu
              //       id="long-menu"
              //       MenuListProps={{
              //         "aria-labelledby": "long-button",
              //       }}
              //       anchorEl={anchorEl}
              //       open={open}
              //       onClose={handleClose}
              //       slotProps={{
              //         paper: {
              //           style: {
              //             width: "20ch",
              //           },
              //         },
              //       }}
              //     >
              //       {options.map((option) => (
              //         <MenuItem key={option} onClick={handleClose}>
              //           {option}
              //         </MenuItem>
              //       ))}
              //     </Menu>
              //   </>
              // }
              title={
                <>
                  <Typography sx={{ fontSize: 20 }}>Investment</Typography>
                  <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                    Al Meezan
                  </Typography>
                  <Typography variant="h5" component="div">
                    Rs.50,000
                  </Typography>
                </>
              }
            />
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
