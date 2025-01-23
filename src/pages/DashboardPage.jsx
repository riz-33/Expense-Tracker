import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import React from "react";
import Chart from "react-google-charts";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

const card = (
  <React.Fragment>
    <CardContent>
      <Typography gutterBottom sx={{ color: "text.secondary", fontSize: 14 }}>
        Word of the Day
      </Typography>
      <Typography variant="h5" component="div">
        be{bull}nev{bull}o{bull}lent
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
        adjective
      </Typography>
      <Typography variant="body2">
        well meaning and kindly.
        <br />
        {'"a benevolent smile"'}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </React.Fragment>
);

const data = [
  ["Language", "Speakers (in millions)"],
  ["German", 5.85],
  ["French", 1.66],
  ["Italian", 0.316],
  ["Romansh", 0.0791],
];

const dataNew = [
  ["Name", "Popularity"],
  ["Cesar", 370],
  ["Rachel", 600],
  ["Patrick", 700],
  ["Eric", 1500],
];

const data3 = [
  ["Year", "Sales", "Expenses"],
  ["2004", 1000, 400],
  ["2005", 1170, 460],
  ["2006", 660, 1120],
  ["2007", 1030, 540],
];

const options = {
  title: "Company Performance",
  curveType: "function",
  legend: { position: "bottom" },
};

const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "code", label: "ISO\u00a0Code", minWidth: 100 },
  {
    id: "population",
    label: "Population",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "size",
    label: "Size\u00a0(km\u00b2)",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "density",
    label: "Density",
    minWidth: 170,
    align: "right",
    format: (value) => value.toFixed(2),
  },
];

function createData(name, code, population, size) {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [
  createData("India", "IN", 1324171354, 3287263),
  createData("China", "CN", 1403500365, 9596961),
  createData("Italy", "IT", 60483973, 301340),
  createData("United States", "US", 327167434, 9833520),
  createData("Canada", "CA", 37602103, 9984670),
  createData("Australia", "AU", 25475400, 7692024),
  createData("Germany", "DE", 83019200, 357578),
  createData("Ireland", "IE", 4857000, 70273),
  createData("Mexico", "MX", 126577691, 1972550),
  createData("Japan", "JP", 126317000, 377973),
  createData("France", "FR", 67022000, 640679),
  createData("United Kingdom", "GB", 67545757, 242495),
  createData("Russia", "RU", 146793744, 17098246),
  createData("Nigeria", "NG", 200962417, 923768),
  createData("Brazil", "BR", 210147125, 8515767),
];

export const DashboardPage = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div>
      <div className="group-1">
        <Grid padding={2} container rowSpacing={2} columnSpacing={2}>
          <Grid item xs={3}>
            <Box>
              <Card variant="outlined">{card}</Card>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box>
              <Card variant="outlined">{card}</Card>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box>
              <Card variant="outlined">{card}</Card>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box>
              <Card variant="outlined">{card}</Card>
            </Box>
          </Grid>
        </Grid>
      </div>
      <div className="group-2">
        <Grid padding={2} container rowSpacing={2} columnSpacing={2}>
          <Grid item xs={6}>
            <Chart
              chartType="PieChart"
              data={data}
              width={"100%"}
              height={"400px"}
              options={{
                title: "Company Performance",
                legend: { position: "bottom" },
                animation: {
                  duration: 1000,
                  easing: "out",
                },
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="400px"
              data={dataNew}
            />
          </Grid>
        </Grid>
      </div>
      <div className="group-3">
        <Grid padding={2} container rowSpacing={2} columnSpacing={2}>
          <Grid item xs={12}>
            <Chart
              chartType="LineChart"
              width="100%"
              height="400px"
              data={data3}
              options={options}
            />
          </Grid>
        </Grid>
      </div>
      <div className="group-4">
        <Grid padding={2} container rowSpacing={2} columnSpacing={2}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" component="div">
                  Summary
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
