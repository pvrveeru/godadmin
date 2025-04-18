import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDButton from "components/MDButton";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import api from "../api";

function Dashboard() {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [isDateDisabled, setIsDateDisabled] = useState(false);
  const [summaryData, setSummaryData] = useState({
    geekerCount: 0,
    seekerCount: 0,
    acceptedCount: 0,
    pendingCount: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/authentication/sign-in/");
      return;
    }

    const headers = {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    };

    try {
      const formattedStartDate = startDate.format("YYYY-MM-DD");
      const formattedEndDate = endDate.format("YYYY-MM-DD");
      const url = `/admin/stats?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

      const response = await api.get(url, { headers });
      if (response.data && response.data.data) {
        setSummaryData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleClearSearch = () => {
    setStartDate(null);
    setEndDate(null);
    setSummaryData({ geekerCount: 0, seekerCount: 0, acceptedCount: 0, pendingCount: 0 });
  };

  return (
    <DashboardLayout>
      <div className="hide-on-desktop">
        <DashboardNavbar />
      </div>
      <MDBox pt={3} pb={3}>
        <Grid item xs={12}>
          <Card style={{ paddingBottom: "20px" }}>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h6" color="white">
                <h2>Dashboard Reports</h2>
              </MDTypography>
            </MDBox>
            <MDBox pt={3} px={2}>
              <Card style={{ backgroundColor: "#f6f0f0" }}>
                <MDBox p={3}>
                  <Grid container spacing={2}>
                    <b style={{ lineHeight: "60px", marginLeft: "10px" }}>Search by</b>
                    <Grid item xs={12} sm={2}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={(date) => setStartDate(date)}
                          renderInput={(params) => <TextField fullWidth {...params} />}
                          disabled={isDateDisabled}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="End Date"
                          value={endDate}
                          onChange={(date) => setEndDate(date)}
                          renderInput={(params) => <TextField fullWidth {...params} />}
                          disabled={isDateDisabled}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={1} style={{ display: "flex" }}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        onClick={fetchSummaryData}
                        style={{ marginRight: "10px" }}
                      >
                        Search
                      </MDButton>
                      <MDButton
                        variant="gradient"
                        color="error"
                        fullWidth
                        onClick={handleClearSearch}
                      >
                        Clear
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} py={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="weekend"
                  title="Geek Registrations"
                  count={summaryData.geekerCount}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="weekend"
                  title="Seeker Registrations"
                  count={summaryData.seekerCount}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="store"
                  title="Raised Request"
                  count={summaryData.pendingCount}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="store"
                  title="Hiring Reports"
                  count={summaryData.acceptedCount}
                />
              </MDBox>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
