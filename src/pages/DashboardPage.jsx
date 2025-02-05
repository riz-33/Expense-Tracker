import React from "react";
import Chart from "react-google-charts";
import {
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import User from "../context/user";
import { useContext, useEffect, useState } from "react";
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


const dataNew = [
  ["Name", "Expenses"],
  ["Housing", 370],
  ["Food", 600],
  ["Transportation", 700],
  ["Health", 1500],
  ["Kids", 370],
  ["Personal Care", 600],
  ["Clothing", 700],
  ["Gifts", 1500],
  ["Savings", 370],
  ["Debt Payments", 600],
];

const data3 = [
  ["Month", "Income", "Expense"],
  ["Jan", 1000, 400],
  ["Feb", 1170, 460],
  ["Mar", 660, 1120],
  ["Apr", 1030, 540],
  ["May", 1000, 400],
  ["Jun", 1170, 460],
  ["Jul", 660, 1120],
  ["Aug", 1030, 540],
  ["Sep", 1000, 400],
  ["Oct", 1170, 460],
  ["Nov", 660, 1120],
  ["Dec", 1030, 540],
];

const options = {
  title: "Monthly Summary",
  curveType: "function",
  legend: { position: "bottom" },
};

const columns = [
  { id: "date", label: "Date", minWidth: 120 },
  { id: "name", label: "Name", minWidth: 80, align: "left" },
  { id: "amount", label: "Amount", minWidth: 80, align: "center" },
  { id: "category", label: "Category", minWidth: 120, align: "left" },
  { id: "account", label: "Account", minWidth: 120, align: "left" },
  { id: "comments", label: "Comments", minWidth: 170, align: "left" },
];

function createData(name, amount, date, category, account, comments) {
  // const density = population / size;
  return { name, amount, date, category, account, comments };
}

const rows = [
  createData(
    "Grocery",
    "20,000",
    "Tue 21 Jan 2025",
    "Housing",
    "Card",
    "Monthly Grocery"
  ),
  createData("Eggs", "500", "Wed 22 Jan 2025", "Food", "Cash", "Eggs"),
  createData(
    "Fuel",
    "1,000",
    "Thu 23 Jan 2025",
    "Transportation",
    "Card",
    "Fuel"
  ),
  createData(
    "Hospital",
    "2,000",
    "Fri 24 Jan 2025",
    "Health",
    "Card",
    "Routine Checkup"
  ),
  createData(
    "Formal",
    "8,000",
    "Sat 25 Jan 2025",
    "Clothing",
    "Cash",
    "Pent Shirt"
  ),
];

export const DashboardPage = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const user = useContext(User).user;
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const d = new Date();
  const currentMonth = month[d.getMonth()];
  const currentYear = new Date().getFullYear();

  const data = [
    ["Summary", "Income & Expenses"],
    ["Income", user.income],
    ["Expense", user.expense],
  ];
  

  return (
    <div>
      <div className="group-1">
        <Grid padding={2} container rowSpacing={3} columnSpacing={5}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              style={{
                height: 120,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                // backgroundColor: "lightgrey",
              }}
            >
              <CardContent style={{ textAlign: "center" }}>
                <Typography
                  gutterBottom
                  sx={{ color: "text.secondary", fontSize: 20, mb: 2 }}
                >
                  Total Balance
                </Typography>
                <Typography variant="h5" component="div">
                  {user.currency} {user.income - user.expense}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              style={{
                height: 120,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <CardContent style={{ textAlign: "center" }}>
                <Typography
                  gutterBottom
                  sx={{ color: "text.secondary", fontSize: 20, mb: 2 }}
                >
                  Total Income
                </Typography>
                <Typography variant="h5" component="div">
                  {user.currency} {user.income}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              style={{
                height: 120,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <CardContent style={{ textAlign: "center" }}>
                <Typography
                  gutterBottom
                  sx={{ color: "text.secondary", fontSize: 20, mb: 2 }}
                >
                  Total Expense
                </Typography>
                <Typography variant="h5" component="div">
                  {user.currency} {user.expense}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              style={{
                height: 120,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <CardContent style={{ textAlign: "center" }}>
                <Typography
                  gutterBottom
                  sx={{ color: "text.secondary", fontSize: 20, mb: 2 }}
                >
                  Month
                </Typography>
                <Typography variant="h5" component="div">
                  {currentMonth} {currentYear}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>

      <div className="group-2">
        <Grid padding={2} container rowSpacing={3} columnSpacing={4}>
          <Grid item xs={12} sm={6} md={6}>
            <Card style={{ backgroundColor: "lightgrey" }}>
              <Chart
                chartType="PieChart"
                data={data}
                width={"100%"}
                height={"400px"}
                options={{
                  title: "Summary",
                  legend: { position: "bottom" },
                  animation: {
                    duration: 1000,
                    easing: "out",
                  },
                }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="400px"
                data={dataNew}
              />
            </Card>
          </Grid>
        </Grid>
      </div>
      <div className="group-3">
        <Grid padding={2} container>
          <Grid item xs={12}>
            <Card>
              <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={data3}
                options={options}
              />
            </Card>
          </Grid>
        </Grid>
      </div>

      <div className="group-4">
        <Grid padding={2} container>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" component="div">
                  Detail Summary
                </Typography>
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          {columns.map((column) => (
                            <TableCell
                              key={column.id}
                              align={column.align}
                              style={{ minWidth: column.minWidth }}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((row) => {
                            return (
                              <TableRow
                                hover
                                role="checkbox"
                                tabIndex={-1}
                                key={row.code}
                              >
                                {columns.map((column) => {
                                  const value = row[column.id];
                                  return (
                                    <TableCell
                                      key={column.id}
                                      align={column.align}
                                    >
                                      {column.format &&
                                      typeof value === "number"
                                        ? column.format(value)
                                        : value}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15, 20, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
