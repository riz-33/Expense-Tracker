import { useState, useEffect, useContext } from "react";
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
} from "../config/firebase";
import { Timestamp } from "firebase/firestore";
import User from "../context/user";
import { EditForm } from "../components/EditForm";
const { TextArea } = Input;
const { TabPane } = Tabs;

const headCells = [
  { id: "name", label: "Name", minWidth: 150, align: "left" },
  { id: "amount", label: "Amount", minWidth: 100, align: "left" },
  { id: "date", label: "Date", minWidth: 170 },
  { id: "category", label: "Category", minWidth: 150, align: "left" },
  { id: "account", label: "Account", minWidth: 150, align: "left" },
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
            sx={{ minWidth: headCell.minWidth }}
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
  const selectedTransaction =
    selected.length === 1
      ? transactions.find((t) => t.id === selected[0])
      : null; 
  const [editForm] = Form.useForm();
  const [openEdit, setOpenEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("expense");
  const [open, setOpen] = useState(false);
  const [expenseForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [incomeForm] = Form.useForm();
  const onUpdate = (values) => {
    console.log("Edit Form Values:", values);
    setOpenEdit(false);
  };
console.log(selectedTransaction)
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
          mode: values.account,
          comments: values.comments || "",
          type: "Expense",
          createdAt: serverTimestamp(),
        });
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
      }
      onCreate({ type: activeTab, values });
      setOpen(false);
      resetForms();
    } catch (error) {
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
          setSelected([]);
        } catch (error) {
          console.error("Error deleting transaction(s):", error);
        }
      },
    });
  };

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
                onClick={() => setOpenEdit(true)}
                disabled={selected.length !== 1}
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
            modalRender={(dom) => (
              <Form
                layout="vertical"
                form={editForm}
                name="edit_form_modal"
                onFinish={onUpdate}
              >
                {dom}
              </Form>
            )}
          >
            <EditForm selectedTransaction={selectedTransaction} />
          </Modal>

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
                  name="account"
                  label="Account"
                  rules={[{ required: true }]}
                  style={{ width: "100%" }}
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

export default function NewTransactionsPage() {
  const { user } = useContext(User);
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("date");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const { RangePicker } = DatePicker;

  return (
    <div>
      {/* Search Filters */}
      <Grid container spacing={1} justifyContent="end" padding={1}>
        <Grid item xs={12} sm={4} md={3} alignSelf="center" marginTop={0.4}>
          <Space direction="horizontal" size={12}>
            <RangePicker
              id={{
                start: "startInput",
                end: "endInput",
              }}
            />
          </Space>
        </Grid>
        <Grid item xs={12} sm={2} md={1} alignSelf="center" margin={1}>
          <Button style={{ padding: "2px 12px" }} variant="contained" fullWidth>
            Search
          </Button>
        </Grid>
      </Grid>

      {/* Transactions Table */}
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
                          {row?.title ? row.title : row.type}
                        </TableCell>
                        <TableCell align="center">{row?.amount}</TableCell>
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
                        <TableCell align="center">
                          {row?.category ? row.category : row.type}
                        </TableCell>
                        <TableCell align="center">
                          {row?.mode ? row.mode : row.toAccount}
                        </TableCell>
                        <TableCell align="center">{row.comments}</TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow>
                      <TableCell colSpan={7} />
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
