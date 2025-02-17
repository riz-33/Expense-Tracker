import { useState, useEffect, useContext } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  Box,
  Card,
  Typography,
  Grid,
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
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  message,
} from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import {
  collection,
  addDoc,
  db,
  serverTimestamp,
  doc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  query,
  where,
  getDocs,
} from "../config/firebase";
import { Timestamp } from "firebase/firestore";
import User from "../context/user";
import { EditForm } from "../components/EditForm";
const { TextArea } = Input;
const { TabPane } = Tabs;

const headCells = [
  { id: "name", label: "Name", minWidth: 120, align: "left" },
  { id: "amount", label: "Amount", minWidth: 100, align: "left" },
  { id: "date", label: "Date", minWidth: 170 },
  { id: "category", label: "Category", minWidth: 120, align: "left" },
  { id: "mode", label: "Mode", minWidth: 120, align: "left" },
  { id: "comments", label: "Comments", minWidth: 150, align: "left" },
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
              "aria-label": "select all transactions",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || "left"}
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
  rowCount: PropTypes.number.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, selected, setSelected, transactions } = props;
  const { user } = useContext(User);
  const [editForm] = Form.useForm();
  const [openEdit, setOpenEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("expense");
  const [open, setOpen] = useState(false);
  const [expenseForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [incomeForm] = Form.useForm();
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  console.log(selectedTransaction);
  const onCreate = (data) => {
    console.log("Created Transaction:", data);
  };

  const resetForms = () => {
    expenseForm.resetFields();
    transferForm.resetFields();
    incomeForm.resetFields();
  };

  const handleSubmit = async () => {
    try {
      let values;
      if (activeTab === "expense") {
        values = await expenseForm.validateFields();
        const selectedDate = new Date(values.date);
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          title: values.title,
          category: values.category,
          date: Timestamp.fromDate(selectedDate),
          amount: values.amount,
          mode: values.mode,
          comments: values.comments || "",
          type: "Expense",
          createdAt: serverTimestamp(),
        });
        message.success("Transaction created successfully!");
      } else if (activeTab === "transfer") {
        values = await transferForm.validateFields();
        const selectedDate = new Date(values.date);
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          fromAccount: values.fromAccount,
          toAccount: values.toAccount,
          date: Timestamp.fromDate(selectedDate),
          amount: values.amount,
          comments: values.comments || "",
          type: "Transfer",
          createdAt: serverTimestamp(),
        });
        message.success("Transaction created successfully!");
      } else if (activeTab === "income") {
        values = await incomeForm.validateFields();
        const selectedDate = new Date(values.date);
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          toAccount: values.toAccount,
          category: values.category,
          date: Timestamp.fromDate(selectedDate),
          amount: values.amount,
          comments: values.comments || "",
          type: "Income",
          createdAt: serverTimestamp(),
        });
        message.success("Transaction created successfully!");
      }
      onCreate({ type: activeTab, values });
      setOpen(false);
      resetForms();
    } catch (error) {
      message.error("Failed to create transaction.");
      console.error("Validation or submission error:", error);
    }
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: "Are you sure you want to delete the selected transaction(s)?",
      icon: <ExclamationCircleFilled />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await Promise.all(
            selected.map((id) =>
              deleteDoc(doc(db, "users", user.uid, "transactions", id))
            )
          );
          message.info("Transaction(s) deleted successfully!");
          setSelected([]);
        } catch (error) {
          console.error("Error deleting transaction(s):", error);
          message.error("Failed to delete transaction(s).");
        }
      },
    });
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    editForm.setFieldsValue({
      title: transaction.title,
      category: transaction.category,
      date: transaction.date ? moment(transaction.date.seconds * 1000) : null,
      amount: transaction.amount,
      mode: transaction.mode,
      comments: transaction.comments,
    });
    setOpenEdit(true);
  };

  const onUpdate = async (values) => {
    if (!selectedTransaction) return;

    const updatedTransaction = {
      ...values,
      date: values.date ? new Date(values.date) : null,
    };

    try {
      await updateDoc(
        doc(db, "users", user.uid, "transactions", selectedTransaction.id),
        updatedTransaction
      );
      message.success("Transaction updated successfully!");
      setOpenEdit(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
      message.error("Failed to update transaction.");
    }
  };
  const [modesTransactions, setModesTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [transactionModes, setTransactionModes] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      where("userId", "==", user.uid),
      where("type", "in", ["Income", "newAccount"]) // Fetch only "Income" OR "newAccount"
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setModesTransactions(data);
      setFilteredData(data); // Initially show all transactions
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Fetch Available Transaction Modes from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchModes = async () => {
      const modesCollection = collection(db, "users",user.uid, "transactions"); // Assume "modes" collection stores transaction modes
      const snapshot = await getDocs(modesCollection);
      const modesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactionModes(modesList); // Store fetched modes
    };

    fetchModes();
  }, [user]);

  return (
    <Toolbar
      sx={[
        { pl: { sm: 2 }, pr: { xs: 1, sm: 1 } },
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
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: "1 1 100%" }} variant="h6" id="tableTitle">
          Transactions Activity
        </Typography>
      )}

      {numSelected > 0 ? (
        <>
          <Tooltip title="Edit">
            <span>
              <IconButton
                disabled={selected.length !== 1}
                onClick={() =>
                  handleEdit(transactions.find((t) => t.id === selected[0]))
                }
              >
                <ModeEditIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Modal
            open={openEdit}
            title="Edit Transaction"
            okText="Update"
            cancelText="Cancel"
            destroyOnClose
            onCancel={() => setOpenEdit(false)}
            onOk={() => editForm.submit()}
          >
            <Form
              layout="vertical"
              form={editForm}
              name="edit_form_modal"
              onFinish={onUpdate}
            >
              <div style={{ display: "flex", gap: "16px" }}>
                <Form.Item
                  name="title"
                  label="Title"
                  style={{ flex: 1 }}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  rules={[{ required: true }]}
                  name="category"
                  label="Category"
                  style={{ flex: 1 }}
                >
                  <Select>
                    <Select.Option value="housing">Housing</Select.Option>
                    <Select.Option value="food">Food</Select.Option>
                    <Select.Option value="transportation">
                      Transportation
                    </Select.Option>
                    <Select.Option value="health">Health</Select.Option>
                    <Select.Option value="kids">Kids</Select.Option>
                    <Select.Option value="personal">
                      Personal Care
                    </Select.Option>
                    <Select.Option value="clothing">Clothing</Select.Option>
                    <Select.Option value="gifths">Gifts</Select.Option>
                    <Select.Option value="savings">Savings</Select.Option>
                    <Select.Option value="debts">Debts Payments</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <Form.Item
                  rules={[{ required: true }]}
                  name="date"
                  label="Select Date"
                  style={{ width: "100%" }}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  rules={[{ required: true }]}
                  name="amount"
                  label="Amount"
                  style={{ width: "100%" }}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  rules={[{ required: true }]}
                  name="mode"
                  label="Mode"
                  style={{ width: "100%" }}
                >
                             <Select>
                    {transactionModes.map((mode) => (
                      <Select.Option key={mode.id} value={mode.mode}>
                        {mode.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div>
                <Form.Item
                  name="comments"
                  // rules={[{ required: true }]}
                  label="Comments"
                >
                  <TextArea rows={2} />
                </Form.Item>
              </div>
            </Form>
          </Modal>

          {/* <EditForm selectedTransaction={selectedTransaction} /> */}
          <Tooltip title="Delete">
            <IconButton onClick={showDeleteConfirm}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip title="Add Expense">
          <IconButton onClick={() => setOpen(true)}>
            <AddBoxIcon />
          </IconButton>
        </Tooltip>
      )}

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
          <TabPane tab="Expense" key="expense">
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
                    <Select.Option value="Gifts">Gifts</Select.Option>
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
                  rules={[{ required: true }]}
                  style={{ width: "100%" }}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{ required: true }]}
                  style={{ width: "100%" }}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  name="mode"
                  label="Mode"
                  rules={[{ required: true }]}
                  style={{ width: "100%" }}
                >
                  <Select>
                    {transactionModes.map((mode) => (
                      <Select.Option key={mode.id} value={mode.name}>
                        {mode.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <Form.Item name="comments" label="Comments">
                <TextArea rows={2} />
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Transfer" key="transfer">
            <Form form={transferForm} layout="vertical">
              <div style={{ display: "flex", gap: "16px" }}>
                <Form.Item
                  name="fromAccount"
                  label="From Account"
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
                >
                  <Select>
                    <Select.Option value="Cash">Cash</Select.Option>
                    <Select.Option value="Debit Card">Debit Card</Select.Option>
                    <Select.Option value="Credit Card">
                      Credit Card
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="toAccount"
                  label="To Account"
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
                >
                  <Select>
                    <Select.Option value="Cash">Cash</Select.Option>
                    <Select.Option value="Debit Card">Debit Card</Select.Option>
                    <Select.Option value="Credit Card">
                      Credit Card
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>
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
                  name="amount"
                  label="Amount"
                  rules={[{ required: true }]}
                  style={{ width: "100%" }}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </div>
              <Form.Item name="comments" label="Comments">
                <TextArea rows={2} />
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Income" key="income">
            <Form form={incomeForm} layout="vertical">
              <div style={{ display: "flex", gap: "16px" }}>
                <Form.Item
                  name="toAccount"
                  label="To Account"
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
                >
                  <Select>
                    <Select.Option value="Cash">Cash</Select.Option>
                    <Select.Option value="Debit Card">Debit Card</Select.Option>
                    <Select.Option value="Credit Card">
                      Credit Card
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
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
                  name="date"
                  label="Date"
                  rules={[{ required: true }]}
                  style={{ width: "100%" }}
                >
                  <DatePicker style={{ width: "100%" }} />
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
              <Form.Item name="comments" label="Comments">
                <TextArea rows={2} />
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  selected: PropTypes.array.isRequired,
  setSelected: PropTypes.func.isRequired,
  transactions: PropTypes.array.isRequired,
};

export default function TransactionsPage() {
  const { user } = useContext(User);
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("date");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState([null, null]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
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
    if (order === "desc") {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  const { RangePicker } = DatePicker;

  const handleSearch = () => {
    if (!dateRange[0] || !dateRange[1]) {
      setFilteredData(transactions);
      return;
    }
    const [startDate, endDate] = dateRange;
    const filteredTransactions = transactions.filter((t) => {
      if (!t.date || !t.date.seconds) return false; // Ensure date exists
      const transactionDate = new Date(t.date.seconds * 1000);

      return transactionDate >= startDate && transactionDate <= endDate;
    });
    setFilteredData(filteredTransactions);
  };

  useEffect(() => {
    setFilteredData(transactions);
  }, [transactions]);

  return (
    <div>
      <Grid container spacing={1} justifyContent="end" padding={1}>
        <Grid item xs={12} sm={4} md={3} alignSelf="center" marginTop={0.4}>
          <Space direction="horizontal" size={12}>
            <RangePicker
              id={{ start: "startInput", end: "endInput" }}
              onChange={(dates) =>
                setDateRange(
                  dates
                    ? [dates[0]?.toDate(), dates[1]?.toDate()]
                    : [null, null]
                )
              }
            />
          </Space>
        </Grid>
        <Grid item xs={12} sm={2} md={1} alignSelf="center" margin={1}>
          <Button
            onClick={handleSearch}
            style={{ padding: "2px 12px" }}
            variant="contained"
            fullWidth
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <Grid container padding={2}>
        <Grid item xs={12}>
          <Card sx={{ minWidth: 275 }}>
            <EnhancedTableToolbar
              numSelected={selected.length}
              selected={selected}
              setSelected={setSelected}
              transactions={transactions}
            />
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={
                    filteredData.length > 0
                      ? filteredData.length
                      : transactions.length
                  }
                />
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, index) => {
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
                            {row?.title
                              ? row.title.toUpperCase()
                              : row.type.toUpperCase()}
                          </TableCell>
                          <TableCell align="left">
                            {new Intl.NumberFormat("en-IN").format(row.amount)}
                          </TableCell>
                          <TableCell align="left">
                            {new Date(
                              row?.date?.seconds * 1000
                            ).toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell align="left">
                            {row?.category
                              ? row.category.toUpperCase()
                              : row.type.toUpperCase()}
                          </TableCell>
                          <TableCell align="left">
                            {row?.mode
                              ? row.mode.toUpperCase()
                              : row.toAccount.toUpperCase()}
                          </TableCell>
                          <TableCell align="left">{row.comments}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No transactions found for the selected date range.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 15, 25, 50]}
              component="div"
              count={
                filteredData.length > 0
                  ? filteredData.length
                  : transactions.length
              }
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
