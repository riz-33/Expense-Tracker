import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import Chart from "react-google-charts";

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

export const DashboardPage = () => {
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
            <Card variant="outlined">{card}</Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
