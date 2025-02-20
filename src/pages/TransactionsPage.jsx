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
  getDoc,
} from "../config/firebase";
import { Timestamp } from "firebase/firestore";
import User from "../context/user";
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
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("expense");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expenseForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [incomeForm] = Form.useForm();
  const [options, setOptions] = useState([]);
  const [fromAccount, setFromAccount] = useState(null);

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "transactions"),
          where("type", "==", "Income"),
          where("page", "==", "newAccount")
        );
        const querySnapshot = await getDocs(q);
        const modeSet = new Set();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const modeTitle = `${data.mode}-${data.title}`;
          modeSet.add(modeTitle);
        });
        setOptions([...modeSet]);
      } catch (error) {
        console.error("Error fetching modes:", error);
      }
    };
    fetchModes();
  }, [user.uid]);

  const prepareTransactionData = (values, tabKey) => {
    const selectedDate = new Date(values.date);
    let transactionData = {
      date: Timestamp.fromDate(selectedDate),
      amount: values.amount,
      createdAt: serverTimestamp(),
    };

    if (tabKey === "expense") {
      transactionData = {
        ...transactionData,
        title: values.title,
        category: values.category,
        mode: values.mode,
        type: "Expense",
        comments: values.comments
          ? values.comments.toUpperCase()
          : values.title.toUpperCase() + " EXPENSE",
      };
    } else if (tabKey === "transfer") {
      transactionData = {
        ...transactionData,
        fromAccount: values.fromAccount,
        toAccount: values.toAccount,
        type: "Transfer",
        comments: values.comments
          ? values.comments.toUpperCase()
          : "Transfer from " + values.fromAccount,
      };
    } else if (tabKey === "income") {
      transactionData = {
        ...transactionData,
        mode: values.toAccount,
        category: values.category,
        type: "Income",
        comments: values.comments
          ? values.comments.toUpperCase()
          : values.category.toUpperCase(),
      };
    }
    return transactionData;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let values;
      if (activeTab === "expense") {
        values = await expenseForm.validateFields();
      } else if (activeTab === "transfer") {
        values = await transferForm.validateFields();
      } else if (activeTab === "income") {
        values = await incomeForm.validateFields();
      }

      const transactionData = prepareTransactionData(values, activeTab);
      await addDoc(
        collection(db, "users", user.uid, "transactions"),
        transactionData
      );
      await handleAddTransaction({ type: activeTab, values });
      await handleTransferTransaction({ type: activeTab, values });
      message.success("Transaction created successfully!");
      closeModal();
    } catch (error) {
      message.error("Failed to create transaction.");
      console.error("Error in submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (data) => {
    try {
      const accountQuery = query(
        collection(db, "users", user.uid, "transactions"),
        where("transMode", "==", data.values.mode || data.values.toAccount),
        where("page", "==", "newAccount")
      );

      const querySnapshot = await getDocs(accountQuery);
      if (!querySnapshot.empty) {
        const accountDoc = querySnapshot.docs[0];
        const accountData = accountDoc.data();

        let updatedAmount = accountData.amount || 0;
        if (data.type === "income") {
          updatedAmount += data.values.amount;
        } else if (data.type === "expense") {
          updatedAmount -= data.values.amount;
        }
        await updateDoc(accountDoc.ref, { amount: updatedAmount });
      } else {
        console.warn("No matching account found for mode:");
      }
    } catch (error) {
      console.error("Error updating account balance:", error);
    }
  };

  const handleTransferTransaction = async (data) => {
    try {
      const { fromAccount, toAccount, amount } = data.values;
      if (!fromAccount || !toAccount || !amount) {
        // console.warn("⚠️ Missing transfer details!");
        return;
      }
      const fromAccountQuery = query(
        collection(db, "users", user.uid, "transactions"),
        where("transMode", "==", fromAccount),
        where("page", "==", "newAccount")
      );
      const toAccountQuery = query(
        collection(db, "users", user.uid, "transactions"),
        where("transMode", "==", toAccount),
        where("page", "==", "newAccount")
      );

      const [fromSnapshot, toSnapshot] = await Promise.all([
        getDocs(fromAccountQuery),
        getDocs(toAccountQuery),
      ]);

      if (!fromSnapshot.empty && !toSnapshot.empty) {
        const fromDoc = fromSnapshot.docs[0];
        const toDoc = toSnapshot.docs[0];

        const fromData = fromDoc.data();
        const toData = toDoc.data();

        await updateDoc(fromDoc.ref, {
          amount: (fromData.amount || 0) - amount,
        });
        await updateDoc(toDoc.ref, { amount: (toData.amount || 0) + amount });
      } else {
        console.warn("One or both accounts not found!");
      }
    } catch (error) {
      console.error("Error processing transfer:", error);
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
          const transactionsToDelete = await Promise.all(
            selected.map(async (id) => {
              const docRef = doc(db, "users", user.uid, "transactions", id);
              const docSnap = await getDoc(docRef);
              return { id, ...docSnap.data() };
            })
          );

          await Promise.all(
            transactionsToDelete.map(async (transaction) => {
              const accountQuery = query(
                collection(db, "users", user.uid, "transactions"),
                where(
                  "transMode",
                  "==",
                  transaction.mode || transaction.toAccount
                ),
                where("page", "==", "newAccount")
              );

              const querySnapshot = await getDocs(accountQuery);
              if (!querySnapshot.empty) {
                const accountDoc = querySnapshot.docs[0];
                const accountData = accountDoc.data();
                let updatedAmount = accountData.amount || 0;

                if (transaction.type === "Income") {
                  updatedAmount -= transaction.amount;
                } else if (transaction.type === "Expense") {
                  updatedAmount += transaction.amount;
                  await updateDoc(accountDoc.ref, { amount: updatedAmount });
                } else if (transaction.type === "Transfer") {
                  const fromQuery = query(
                    collection(db, "users", user.uid, "transactions"),
                    where("transMode", "==", transaction.fromAccount),
                    where("page", "==", "newAccount")
                  );
                  const fromSnapshot = await getDocs(fromQuery);
                  if (!fromSnapshot.empty) {
                    const fromDoc = fromSnapshot.docs[0];
                    await updateDoc(fromDoc.ref, {
                      amount: (fromDoc.data().amount || 0) + transaction.amount,
                    });
                  }
                  const toQuery = query(
                    collection(db, "users", user.uid, "transactions"),
                    where("transMode", "==", transaction.toAccount),
                    where("page", "==", "newAccount")
                  );
                  const toSnapshot = await getDocs(toQuery);
                  if (!toSnapshot.empty) {
                    const toDoc = toSnapshot.docs[0];
                    await updateDoc(toDoc.ref, {
                      amount: (toDoc.data().amount || 0) - transaction.amount,
                    });
                  }
                }
              }
              await deleteDoc(
                doc(db, "users", user.uid, "transactions", transaction.id)
              );
            })
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

  const handleUpdate = async () => {
    if (!selectedTransaction) return;
    setLoading(true);
    try {
      let values;
      if (activeTab === "expense") {
        values = await expenseForm.validateFields();
      } else if (activeTab === "transfer") {
        values = await transferForm.validateFields();
      } else if (activeTab === "income") {
        values = await incomeForm.validateFields();
      }
      const transactionData = prepareTransactionData(values, activeTab);
      const transactionRef = doc(
        db,
        "users",
        user.uid,
        "transactions",
        selectedTransaction.id
      );
      const transactionSnap = await getDoc(transactionRef);
      if (!transactionSnap.exists()) {
        message.error("Transaction not found.");
        return;
      }
      const prevTransaction = transactionSnap.data();
      console.log(prevTransaction.mode);
      // Reverse previous account–balance changes
      if (
        prevTransaction.type === "Income" ||
        prevTransaction.type === "Expense"
      ) {
        const accountQuery = query(
          collection(db, "users", user.uid, "transactions"),
          where(
            "transMode",
            "==",
            prevTransaction.mode || prevTransaction.toAccount
          ),
          where("page", "==", "newAccount")
        );
        const accountSnapshot = await getDocs(accountQuery);
        if (!accountSnapshot.empty) {
          const accountDoc = accountSnapshot.docs[0];
          console.log(accountDoc.data().amount);
          let updatedAmount = accountDoc.data().amount || 0;
          if (prevTransaction.type === "Income") {
            updatedAmount -= prevTransaction.amount;
          } else if (prevTransaction.type === "Expense") {
            updatedAmount += prevTransaction.amount;
          }
          // Apply the new amount changes
          console.log(transactionData);
          if (transactionData.type === "Income") {
            updatedAmount += transactionData.amount;
          } else if (transactionData.type === "Expense") {
            updatedAmount -= transactionData.amount;
          }
          await updateDoc(accountDoc.ref, { amount: updatedAmount });
        }
      } else if (prevTransaction.type === "Transfer") {
        // Reverse the transfer on both accounts
        const fromQuery = query(
          collection(db, "users", user.uid, "transactions"),
          where("transMode", "==", prevTransaction.fromAccount),
          where("page", "==", "newAccount")
        );
        const toQuery = query(
          collection(db, "users", user.uid, "transactions"),
          where("transMode", "==", prevTransaction.toAccount),
          where("page", "==", "newAccount")
        );
        const [fromSnap, toSnap] = await Promise.all([
          getDocs(fromQuery),
          getDocs(toQuery),
        ]);
        if (!fromSnap.empty && !toSnap.empty) {
          const fromDoc = fromSnap.docs[0];
          const toDoc = toSnap.docs[0];
          const fromData = fromDoc.data();
          const toData = toDoc.data();
          await updateDoc(fromDoc.ref, {
            amount: (fromData.amount || 0) + prevTransaction.amount,
          });
          await updateDoc(toDoc.ref, {
            amount: (toData.amount || 0) - prevTransaction.amount,
          });
        }
        // If the updated transaction is still a transfer, apply new changes
        if (transactionData.type === "Transfer") {
          const newFromQuery = query(
            collection(db, "users", user.uid, "transactions"),
            where("transMode", "==", transactionData.fromAccount),
            where("page", "==", "newAccount")
          );
          const newToQuery = query(
            collection(db, "users", user.uid, "transactions"),
            where("transMode", "==", transactionData.toAccount),
            where("page", "==", "newAccount")
          );
          const [newFromSnap, newToSnap] = await Promise.all([
            getDocs(newFromQuery),
            getDocs(newToQuery),
          ]);
          if (!newFromSnap.empty && !newToSnap.empty) {
            const newFromDoc = newFromSnap.docs[0];
            const newToDoc = newToSnap.docs[0];
            const newFromData = newFromDoc.data();
            const newToData = newToDoc.data();
            await updateDoc(newFromDoc.ref, {
              amount: (newFromData.amount || 0) - transactionData.amount,
            });
            await updateDoc(newToDoc.ref, {
              amount: (newToData.amount || 0) + transactionData.amount,
            });
          }
        }
      }

      // Update the transaction document in Firestore
      await updateDoc(transactionRef, transactionData);
      message.success("Transaction updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating transaction:", error);
      message.error("Failed to update transaction.");
    } finally {
      setLoading(false);
    }
  };

  // Chooses the proper handler based on mode (add vs. edit)
  const handleModalOk = async () => {
    if (isEditing) {
      await handleUpdate();
    } else {
      await handleSubmit();
    }
  };

  // Pre-populates the correct form and opens the modal in edit mode
  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setIsEditing(true);

    if (transaction.type === "Expense") {
      setActiveTab("expense");
      expenseForm.setFieldsValue({
        title: transaction.title,
        category: transaction.category,
        date: transaction.date ? moment(transaction.date.seconds * 1000) : null,
        amount: transaction.amount,
        mode: transaction.mode,
        comments: transaction.comments,
      });
      transferForm.resetFields();
      incomeForm.resetFields();
    } else if (transaction.type === "Transfer") {
      setActiveTab("transfer");
      transferForm.setFieldsValue({
        fromAccount: transaction.fromAccount,
        toAccount: transaction.toAccount,
        date: transaction.date ? moment(transaction.date.seconds * 1000) : null,
        amount: transaction.amount,
        comments: transaction.comments,
      });
      expenseForm.resetFields();
      incomeForm.resetFields();
    } else if (transaction.type === "Income") {
      setActiveTab("income");
      incomeForm.setFieldsValue({
        toAccount: transaction.mode || transaction.toAccount,
        category: transaction.category,
        date: transaction.date ? moment(transaction.date.seconds * 1000) : null,
        amount: transaction.amount,
        comments: transaction.comments,
      });
      expenseForm.resetFields();
      transferForm.resetFields();
    }
    setOpen(true);
  };

  // Resets state and closes the modal
  const closeModal = () => {
    setOpen(false);
    setIsEditing(false);
    setSelectedTransaction(null);
    expenseForm.resetFields();
    transferForm.resetFields();
    incomeForm.resetFields();
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
                disabled={selected.length !== 1}
                onClick={() =>
                  handleEdit(transactions.find((t) => t.id === selected[0]))
                }
              >
                <ModeEditIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton onClick={showDeleteConfirm}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip title="Add Expense">
          <IconButton
            onClick={() => {
              setOpen(true);
              setIsEditing(false);
              setSelectedTransaction(null);
              expenseForm.resetFields();
              transferForm.resetFields();
              incomeForm.resetFields();
            }}
          >
            <AddBoxIcon />
          </IconButton>
        </Tooltip>
      )}

      <Modal
        open={open}
        title={isEditing ? "Edit Transaction" : "New Transaction"}
        okText={isEditing ? "Update" : "Create"}
        cancelText="Cancel"
        destroyOnClose
        onCancel={closeModal}
        onOk={handleModalOk}
        confirmLoading={loading}
        okButtonProps={{ disabled: loading }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Expense" key="expense">
            <Form form={expenseForm} layout="vertical">
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <div style={{ display: "flex", gap: "16px" }}>
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
                <Form.Item
                  name="mode"
                  label="Mode"
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
                >
                  <Select>
                    {options.map((option) => (
                      <Select.Option key={option} value={option}>
                        {option}
                      </Select.Option>
                    ))}
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

          <TabPane tab="Transfer" key="transfer">
            <Form form={transferForm} layout="vertical">
              <div style={{ display: "flex", gap: "16px" }}>
                <Form.Item
                  name="fromAccount"
                  label="From Account"
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
                >
                  <Select onChange={(value) => setFromAccount(value)}>
                    {options.map((option) => (
                      <Select.Option key={option} value={option}>
                        {option}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="toAccount"
                  label="To Account"
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
                >
                  <Select>
                    {options
                      .filter((option) => option !== fromAccount)
                      .map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
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
                    {options.map((option) => (
                      <Select.Option key={option} value={option}>
                        {option}
                      </Select.Option>
                    ))}
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
        const filteredData = data.filter(
          (transaction) => transaction.page !== "newAccount"
        );
        setTransactions(filteredData);
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

  const paginatedRows = (
    filteredData.length > 0 ? filteredData : transactions
  ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => {
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
