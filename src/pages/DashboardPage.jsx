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
import { collection, db, query, orderBy, onSnapshot } from "../config/firebase";

const columns = [
  { id: "date", label: "Date", minWidth: 170 },
  { id: "name", label: "Name", minWidth: 150, align: "left" },
  { id: "amount", label: "Amount", minWidth: 100, align: "left" },
  { id: "category", label: "Category", minWidth: 150, align: "left" },
  { id: "account", label: "Account", minWidth: 150, align: "left" },
  { id: "comments", label: "Comments", minWidth: 150, align: "left" },
];

export const DashboardPage = () => {
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
  const user = useContext(User).user;
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [columnChartData, setColumnChartData] = useState([
    ["Category", "Expense"],
  ]);
  const [lineChartData, setLineChartData] = useState([["Month"]]);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "transactions"),
      (snapshot) => {
        let income = 0;
        let expense = 0;
        let categoryData = {};
        let yearlyData = {};
        let categories = new Set();

        const now = new Date();
        const firstDay =
          new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
        const lastDay =
          new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59
          ).getTime() / 1000;

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const transactionTime = data.date?.seconds;

          if (transactionTime >= firstDay && transactionTime <= lastDay) {
            if (data.type === "Income") {
              income += data.amount;
            } else if (data.type === "Expense") {
              expense += data.amount;
            }
          }

          if (
            transactionTime >= firstDay &&
            transactionTime <= lastDay &&
            data.type === "Expense"
          ) {
            const category = data.category || "Other"; // Default to "Other" if category is missing

            if (!categoryData[category]) {
              categoryData[category] = 0;
            }

            categoryData[category] += data.amount;
          }

          if (data.type === "Expense" && transactionTime) {
            const date = new Date(transactionTime * 1000);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // "YYYY-M"

            const category = data.category || "Other";
            categories.add(category);

            if (!yearlyData[monthKey]) {
              yearlyData[monthKey] = {};
            }

            if (!yearlyData[monthKey][category]) {
              yearlyData[monthKey][category] = 0;
            }

            yearlyData[monthKey][category] += data.amount;
          }
        });

        setTotalIncome(income);
        setTotalExpense(expense);

        const chartArray = [["Category", "Expense"]];
        Object.keys(categoryData).forEach((category) => {
          chartArray.push([category, categoryData[category]]);
        });
        setColumnChartData(chartArray);

        if (categories.size === 0) {
          setLineChartData([]);
          return;
        }

        const months = Array.from({ length: 12 }, (_, i) => {
          const monthName = new Date(2025, i, 1).toLocaleString("en-US", {
            month: "short",
          });
          return `${monthName}-${new Date().getFullYear().toString().slice(-2)}`;
        });

        const lineChartArray = [["Month", ...categories]];
        months.forEach((month, index) => {
          const yearMonthKey = `${new Date().getFullYear()}-${index + 1}`;
          const row = [month];

          categories.forEach((category) => {
            row.push(yearlyData[yearMonthKey]?.[category] || 0);
          });

          lineChartArray.push(row);
        });
        setLineChartData(lineChartArray);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  const chartData = [
    ["Category", "Amount"],
    ["Income", totalIncome],
    ["Expense", totalExpense],
  ];

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("date", "desc")
      // , where("type", "==", "expense")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <div style={{ cursor: "pointer" }} className="group-1">
        <Grid padding={2} container rowSpacing={3} columnSpacing={5}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              style={{
                height: 120,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
              sx={{
                ":hover": {
                  boxShadow: 15, // theme.shadows[20]
                  backgroundColor: "#1a237e",
                  color: "white",
                  // color:"text.primary",
                },
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
                {user?.currency + "."}{" "}
                  {new Intl.NumberFormat("en-IN").format(
                    totalIncome - totalExpense
                  )}
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
              sx={{
                ":hover": {
                  boxShadow: 15, // theme.shadows[20]
                  backgroundColor: "#1a237e",
                  color: "white",
                  // color:"text.primary",
                },
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
                {user?.currency + "."}{" "}
                  {new Intl.NumberFormat("en-IN").format(
                    totalIncome ? totalIncome : 0
                  )}
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
              sx={{
                ":hover": {
                  boxShadow: 15, // theme.shadows[20]
                  backgroundColor: "#1a237e",
                  color: "white",
                  // color:"text.primary",
                },
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
                {user?.currency + "."}{" "}
                  {new Intl.NumberFormat("en-IN").format(
                    totalExpense ? totalExpense : 0
                  )}
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
              sx={{
                ":hover": {
                  boxShadow: 15, // theme.shadows[20]
                  backgroundColor: "#1a237e",
                  color: "white",
                  // color:"text.primary",
                },
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
            <Card
              sx={{
                ":hover": {
                  boxShadow: 15,
                },
              }}
            >
              <Chart
                chartType="PieChart"
                data={chartData}
                width={"100%"}
                height={"400px"}
                options={{
                  title: "Income vs Expense",
                  legend: { position: "bottom" },
                  pieHole: 0.5, // Donut chart effect
                  animation: { duration: 1000, easing: "out" },
                }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card
              sx={{
                ":hover": {
                  boxShadow: 15,
                },
              }}
            >
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="400px"
                data={columnChartData}
                options={{
                  title: "Expenses by Category",
                  chartArea: { width: "70%" },
                  hAxis: { title: "Category" },
                  vAxis: { title: "Amount" },
                  animation: { duration: 1000, easing: "out" },
                  legend: { position: "none" },
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </div>
      <div className="group-3">
        <Grid padding={2} container>
          <Grid item xs={12}>
            <Card
              sx={{
                ":hover": {
                  boxShadow: 15,
                },
              }}
            >
              <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={lineChartData}
                options={{
                  title: "Monthly Expenses by Category",
                  chartArea: { width: "80%" },
                  hAxis: { title: "Month" },
                  vAxis: { title: "Amount Spent" },
                  legend: { position: "bottom" },
                  animation: { duration: 1000, easing: "out" },
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </div>

      <div className="group-4">
        <Grid padding={2} container>
          <Grid item xs={12}>
            <Card
              variant="outlined"
              sx={{
                ":hover": {
                  boxShadow: 15,
                },
              }}
            >
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
                        {transactions
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((item) => (
                            <TableRow hover key={item.id}>
                              <TableCell>
                                {new Date(
                                  item.date.seconds * 1000
                                ).toLocaleDateString("en-GB", {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                {item?.title
                                  ? item.title.toUpperCase()
                                  : item.type.toUpperCase()}
                              </TableCell>
                              <TableCell>
                                {new Intl.NumberFormat("en-IN").format(
                                  item.amount
                                )}
                              </TableCell>
                              <TableCell>
                                {item?.category
                                  ? item.category.toUpperCase()
                                  : item.type.toUpperCase()}
                              </TableCell>
                              <TableCell>
                                {item?.mode
                                  ? item.mode.toUpperCase()
                                  : item.toAccount.toUpperCase()}
                              </TableCell>
                              <TableCell>{item?.comments}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15, 20, 25]}
                    component="div"
                    count={transactions.length}
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
