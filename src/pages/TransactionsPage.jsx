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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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
import { Form, Input, Modal, Radio } from "antd";
import { useState } from "react";
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
} from "../config/firebase";
import User from "../context/user";

function createData(id, name, amount, date, category, account, comments) {
  return {
    id,
    name,
    amount,
    date,
    category,
    account,
    comments,
  };
}

const rows = [
  createData(
    1,
    "Grocery",
    "20,000",
    "Tue 21 Jan 2025",
    "Housing",
    "Card",
    "Monthly Grocery"
  ),
  createData(2, "Eggs", "500", "Wed 22 Jan 2025", "Food", "Cash", "Eggs"),
  createData(
    3,
    "Fuel",
    "1,000",
    "Thu 23 Jan 2025",
    "Transportation",
    "Card",
    "Fuel"
  ),
  createData(
    4,
    "Hospital",
    "2,000",
    "Fri 24 Jan 2025",
    "Health",
    "Card",
    "Routine Checkup"
  ),
  createData(
    5,
    "Formal",
    "8,000",
    "Sat 25 Jan 2025",
    "Clothing",
    "Cash",
    "Pent Shirt"
  ),
  createData(
    6,
    "Grocery",
    "20,000",
    "Tue 21 Jan 2025",
    "Housing",
    "Card",
    "Monthly Grocery"
  ),
  createData(7, "Eggs", "500", "Wed 22 Jan 2025", "Food", "Cash", "Eggs"),
  createData(
    "Fuel",
    "1,000",
    "Thu 23 Jan 2025",
    "Transportation",
    "Card",
    "Fuel"
  ),
  createData(
    8,
    "Hospital",
    "2,000",
    "Fri 24 Jan 2025",
    "Health",
    "Card",
    "Routine Checkup"
  ),
  createData(
    9,
    "Formal",
    "8,000",
    "Sat 25 Jan 2025",
    "Clothing",
    "Cash",
    "Pent Shirt"
  ),
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

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

function EnhancedTableToolbar(props) {
  const user = React.useContext(User).user;
  const { numSelected } = props;
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState();
  const [open, setOpen] = useState(false);
  const onCreate = async (values) => {
    console.log("Received values of form: ", values);
    setFormValues(values);
    setOpen(false);
    await addExpense(values);
  };
  const [editForm] = Form.useForm();
  const [editFormValues, setEditFormValues] = useState();
  const [openEdit, setOpenEdit] = useState(false);
  const onUpdate = (values) => {
    console.log("Received values of form: ", values);
    setEditFormValues(values);
    setOpenEdit(false);
  };

  const addExpense = async (data) => {
    try {
      await addDoc(collection(db, "users", user.uid, "expenses"), {
        title: data.title,
        category: data?.category,
        // date: data.date,
        amount: data?.amount,
        account: data?.account,
        comments: data?.comments || ("") ,
        // createdAt: serverTimestamp(),
      });
      console.log("Received data of form: ", data);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
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
          okButtonProps={{
            autoFocus: true,
            htmlType: "submit",
          }}
          onCancel={() => setOpen(false)}
          destroyOnClose
          modalRender={(dom) => (
            <Form
              layout="vertical"
              form={form}
              name="form_in_modal"
              initialValues={{
                paymentType: "Cash",
              }}
              clearOnDestroy
              onFinish={(values) => onCreate(values)}
            >
              {dom}
            </Form>
          )}
        >
          <ModalTab />
        </Modal>
      </>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function TransactionsPage() {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage]
  );

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
            <Box sx={{ width: "100%" }}>
              <Paper sx={{ width: "100%", mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} />
                <TableContainer>
                  <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                    <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onSelectAllClick={handleSelectAllClick}
                      onRequestSort={handleRequestSort}
                      rowCount={rows.length}
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
                              {row.name}
                            </TableCell>
                            <TableCell align="center">{row.amount}</TableCell>
                            <TableCell align="center">{row.date}</TableCell>
                            <TableCell align="center">{row.category}</TableCell>
                            <TableCell align="center">{row.account}</TableCell>
                            <TableCell align="center">{row.comments}</TableCell>
                          </TableRow>
                        );
                      })}
                      {emptyRows > 0 && (
                        <TableRow style={{}}>
                          <TableCell colSpan={6} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 15, 25, 50]}
                  component="div"
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
