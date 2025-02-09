import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState } from "react";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
} from "antd";

import {
  Box,
  Card,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Checkbox,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import ModalTab from "../components/ModalForm";
import { EditForm } from "../components/EditForm";
import {
  auth,
  signOut,
  collection,
  addDoc,
  db,
  serverTimestamp,
  query,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
} from "../config/firebase";
import User from "../context/user";
import { Timestamp } from "firebase/firestore";
import Item from "antd/es/list/Item";

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Name",
  },
  {
    id: "amount",
    numeric: true,
    disablePadding: false,
    label: "Amount",
  },
  {
    id: "date",
    numeric: true,
    disablePadding: false,
    label: "Date",
  },
  {
    id: "category",
    numeric: true,
    disablePadding: false,
    label: "Category",
  },
  {
    id: "account",
    numeric: true,
    disablePadding: false,
    label: "Account",
  },
  {
    id: "comments",
    numeric: true,
    disablePadding: false,
    label: "Comments",
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const { TextArea } = Input;

function EnhancedTableToolbar(props) {
  const user = React.useContext(User).user;
  const { numSelected } = props;

  const [editForm] = Form.useForm();
  const [editFormValues, setEditFormValues] = useState();
  const [openEdit, setOpenEdit] = useState(false);
  const onUpdate = (values) => {
    console.log("Received values of form: ", values);
    setEditFormValues(values);
    setOpenEdit(false);
  };

  const onCreate = async (values) => {
    console.log("Received values of form: ", values);
  };

  const [activeTab, setActiveTab] = useState("expense");
  const [open, setOpen] = useState(false);
  const [expenseForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [incomeForm] = Form.useForm();

  const handleSubmit = async () => {
    try {
      let values;
      if (activeTab === "expense") {
        values = await expenseForm.validateFields();
        const selectedDate = new Date(values.date);
        try {
          await addDoc(collection(db, "users", user.uid, "transactions"), {
            title: values.title,
            category: values?.category,
            date: Timestamp.fromDate(selectedDate),
            amount: values?.amount,
            mode: values?.account,
            comments: values?.comments || "",
            type: "Expense",
            createdAt: serverTimestamp(),
          });
          console.log("Saved to Firestore: ", values);
        } catch (error) {
          console.error("Error adding todo:", error);
        }
      } else if (activeTab === "transfer") {
        values = await transferForm.validateFields();
        const selectedDate = new Date(values.date);
        try {
          await addDoc(collection(db, "users", user.uid, "transactions"), {
            fromAccount: values.fromAccount,
            toAccount: values?.toAccount,
            date: Timestamp.fromDate(selectedDate),
            amount: values?.amount,
            comments: values?.comments || "",
            type: "Transfer",
            createdAt: serverTimestamp(),
          });
          console.log("Saved to Firestore: ", values);
        } catch (error) {
          console.error("Error adding todo:", error);
        }
      } else if (activeTab === "income") {
        values = await incomeForm.validateFields();
        const selectedDate = new Date(values.date);
        try {
          await addDoc(collection(db, "users", user.uid, "transactions"), {
            toAccount: values.toAccount,
            category: values?.category,
            date: Timestamp.fromDate(selectedDate),
            amount: values?.amount,
            comments: values?.comments || "",
            type: "Income",
            createdAt: serverTimestamp(),
          });
          console.log("Saved to Firestore: ", values);
        } catch (error) {
          console.error("Error adding todo:", error);
        }
      }
      onCreate({ type: activeTab, values });
      setOpen(false);
      // console.log(values);
      resetForms();
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  const resetForms = () => {
    expenseForm.resetFields();
    transferForm.resetFields();
    incomeForm.resetFields();
  };

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Transactions Activity
        </Typography>
      )}
      {numSelected > 0 ? (
        <React.Fragment>
          <Tooltip title="Edit">
            <IconButton onClick={() => setOpenEdit(true)}>
              <ModeEditIcon />
            </IconButton>
          </Tooltip>
          <>
            <Modal
              open={openEdit}
              title="Edit Transaction"
              okText="Update"
              cancelText="Cancel"
              okButtonProps={{
                autoFocus: true,
                htmlType: "submit",
              }}
              onCancel={() => setOpenEdit(false)}
              destroyOnClose
              modalRender={(dom) => (
                <Form
                  layout="vertical"
                  form={editForm}
                  name="form_in_modal"
                  initialValues={{
                    modifier: "public",
                  }}
                  clearOnDestroy
                  onFinish={(values) => onUpdate(values)}
                >
                  {dom}
                </Form>
              )}
            >
              <EditForm />
            </Modal>
          </>
          <Tooltip title="Delete">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </React.Fragment>
      ) : (
        <Tooltip title="Add Expense">
          <IconButton onClick={() => setOpen(true)}>
            {<AddBoxIcon />}
          </IconButton>
        </Tooltip>
      )}
      <>
        <Modal
          open={open}
          title="New Transaction"
          okText="Create"
          cancelText="Cancel"
          onCancel={() => setOpen(false)}
          onOk={handleSubmit}
          destroyOnClose
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Item tab="Expense" key="expense">
              <Form form={expenseForm} layout="vertical">
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true }]}
                    style={{ flex: 1 }}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true }]}
                    style={{ flex: 1 }}
                  >
                    <Select>
                      <Select.Option value="Housing">Housing</Select.Option>
                      <Select.Option value="Food">Food</Select.Option>
                      <Select.Option value="Transportation">
                        Transportation
                      </Select.Option>
                      <Select.Option value="Health">Health</Select.Option>
                      <Select.Option value="Kids">Kids</Select.Option>
                      <Select.Option value="Personal Care">
                        Personal Care
                      </Select.Option>
                      <Select.Option value="Clothing">Clothing</Select.Option>
                      <Select.Option value="Gifths">Gifts</Select.Option>
                      <Select.Option value="Savings">Savings</Select.Option>
                      <Select.Option value="Debts Payments">
                        Debts Payments
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    name="date"
                    label="Date"
                    style={{ width: "100%" }}
                    rules={[{ required: true }]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    style={{ width: "100%" }}
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="account"
                    label="Account"
                    style={{ width: "100%" }}
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Select.Option value="Cash">Cash</Select.Option>
                      <Select.Option value="Debit Card">
                        Debit Card
                      </Select.Option>
                      <Select.Option value="Credit Card">
                        Credit Card
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item name="comments" label="Comments">
                  <TextArea rows={2} />
                </Form.Item>
              </Form>
            </Item>

            <Item tab="Transfer" key="transfer">
              <Form form={transferForm} layout="vertical">
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    style={{ flex: 1 }}
                    name="fromAccount"
                    rules={[{ required: true }]}
                    label="From Account"
                  >
                    <Select>
                      <Select.Option value="Cash">Cash</Select.Option>
                      <Select.Option value="Debit Card">
                        Debit Card
                      </Select.Option>
                      <Select.Option value="Credit Card">
                        Credit Card
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    style={{ flex: 1 }}
                    name="toAccount"
                    rules={[{ required: true }]}
                    label="To Account"
                  >
                    <Select>
                      <Select.Option value="Cash">Cash</Select.Option>
                      <Select.Option value="Debit Card">
                        Debit Card
                      </Select.Option>
                      <Select.Option value="Credit Card">
                        Credit Card
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                    name="date"
                    label="Date"
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    style={{ width: "100%" }}
                    rules={[{ required: true }]}
                    name="amount"
                    label="Amount"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </div>
                <Form.Item name="comments" label="Comments">
                  <TextArea rows={2} />
                </Form.Item>
              </Form>
            </Item>

            <Item tab="Income" key="income">
              <Form form={incomeForm} layout="vertical">
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    style={{ flex: 1 }}
                    rules={[{ required: true }]}
                    name="toAccount"
                    label="To Account"
                  >
                    <Select>
                      <Select.Option value="Cash">Cash</Select.Option>
                      <Select.Option value="Debit Card">
                        Debit Card
                      </Select.Option>
                      <Select.Option value="Credit Card">
                        Credit Card
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    style={{ flex: 1 }}
                    rules={[{ required: true }]}
                    name="category"
                    label="Category"
                  >
                    <Select>
                      <Select.Option value="Salary">Salary</Select.Option>
                      <Select.Option value="Bonus">Bonus</Select.Option>
                      <Select.Option value="Rental Income">
                        Rental Income
                      </Select.Option>
                      <Select.Option value="Dividend Income">
                        Dividend Income
                      </Select.Option>
                      <Select.Option value="Interest Earned">
                        Interest Earned
                      </Select.Option>
                      <Select.Option value="Self Employed">
                        Self-Employed Income
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                    name="date"
                    label="Date"
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                    name="amount"
                    label="Amount"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </div>
                <Form.Item name="comments" label="Comments">
                  <TextArea rows={2} />
                </Form.Item>
              </Form>
            </Item>
          </Tabs>
        </Modal>
      </>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function TransactionsPage() {
  const [selected, setSelected] = React.useState([]);
  const user = React.useContext(User).user;
  const [transactions, setTransactions] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("date");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "transactions"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(transactions.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleClick = (event, id) => {
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedRows = transactions.sort((a, b) => {
    if (order === "asc") {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  const visibleRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const emptyRows = rowsPerPage - visibleRows.length;

  return (
    <div>
      <Grid padding={1} container columnSpacing={1} justifyContent={"end"}>
        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker"]}>
              <DatePicker label="Start Date" />
            </DemoContainer>
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker"]}>
              <DatePicker label="End Date" />
            </DemoContainer>
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={2} md={1} margin={2}>
          <Button variant="contained">Search</Button>
        </Grid>
      </Grid>

      <Grid padding={2} container>
        <Grid item xs={12}>
          <Card sx={{ minWidth: 275 }}>
            <EnhancedTableToolbar numSelected={selected.length} />
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={transactions.length}
                />
                <TableBody>
                  {visibleRows.map((row, index) => {
                    const isItemSelected = selected.includes(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              "aria-labelledby": labelId,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                        >
                          {row.title}
                        </TableCell>
                        <TableCell align="center">{row.amount}</TableCell>
                        <TableCell align="center">
                          {new Date(row.date.seconds * 1000).toLocaleDateString(
                            "en-GB",
                            {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell align="center">{row.category}</TableCell>
                        <TableCell align="center">{row.mode}</TableCell>
                        <TableCell align="center">{row.comments}</TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 15, 25, 50]}
              component="div"
              count={transactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
