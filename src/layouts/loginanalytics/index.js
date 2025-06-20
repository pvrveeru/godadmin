import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Grid,
  Card,
  Button,
  TableContainer,
  Paper,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { saveAs } from "file-saver";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import api from "../api";

function LoginAnalytics() {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("User not authenticated. Please log in.");
      window.location.href = "/authentication/sign-in/";
      return;
    }

    const url = `/users/login-analytics`;
    setLoading(true);
    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        params: {
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        },
      });

      const users = response.data?.data?.users || [];
      setRows(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStartDateChange = (newDate) => setStartDate(newDate);
  const handleEndDateChange = (newDate) => setEndDate(newDate);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setPage(0);
  };

  const handlePageChange = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = rows.filter((row) => {
    const email = row.email || "";
    const fullName = `${row.firstName || ""} ${row.lastName || ""}`;
    return (
      email.toLowerCase().includes(searchQuery) || fullName.toLowerCase().includes(searchQuery)
    );
  });

  const exportToCSV = () => {
    const headers = ["User type", "Name", "Phone", "Email", "Login Date"];

    const csvRows = [
      headers.join(","),
      ...filteredRows.map((row) => {
        const fullName = `${row.firstName || ""} ${row.lastName || ""}`.trim();
        const registrationDate = row.lastLogin ? dayjs(row.lastLogin).format("DD-MM-YYYY") : "N/A";
        const registrationType = row.is_seeker ? "Seeker" : row.is_geeker ? "Geeker" : "N/A";

        return [
          registrationType,
          fullName,
          row.phone || "N/A",
          row.email || "N/A",
          registrationDate,
        ]
          .map((value) => `"${value}"`)
          .join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "LoginAnalytics.csv");
  };

  const paginatedRows = filteredRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <DashboardLayout>
      <div className="hide-on-desktop">
        <DashboardNavbar />
      </div>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
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
                  <h2>Login Analytics</h2>
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
                            onChange={handleStartDateChange}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDButton
                          variant="gradient"
                          color="info"
                          fullWidth
                          onClick={fetchUsers}
                          style={{ marginRight: "10px" }}
                        >
                          Search
                        </MDButton>
                      </Grid>
                    </Grid>
                  </MDBox>
                </Card>

                <MDBox mt={3}>
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <>
                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={12}
                          sm={2}
                          sx={{
                            maxWidth: "150px !important",
                          }}
                        >
                          <MDButton
                            variant="outlined"
                            color="success"
                            fullWidth
                            onClick={exportToCSV}
                          >
                            Export CSV
                          </MDButton>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Search by Name or Email"
                            variant="outlined"
                            fullWidth
                            value={searchQuery}
                            onChange={handleSearchChange}
                          />
                        </Grid>
                      </Grid>
                      <MDBox mt={2} display="flex" justifyContent="center">
                        <TableContainer
                          component={Paper}
                          style={{ borderRadius: "0px", boxShadow: "none" }}
                        >
                          {paginatedRows.length > 0 ? (
                            <>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "16px",
                                }}
                              >
                                <thead style={{ background: "#efefef", fontSize: "14px" }}>
                                  <tr>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      User type
                                    </th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      Name
                                    </th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      Phone
                                    </th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      Email
                                    </th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      Last Login Date
                                    </th>
                                  </tr>
                                </thead>
                                <tbody style={{ fontSize: "15px" }}>
                                  {paginatedRows.map((row) => (
                                    <tr key={row.id}>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.is_seeker
                                          ? "Seeker"
                                          : row.is_geeker
                                          ? "Geeker"
                                          : "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {`${row.firstName || ""} ${row.lastName || ""}`.trim()}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.phone || "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.email || "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.lastLogin
                                          ? dayjs(row.lastLogin).format("DD-MM-YYYY - HH:mm")
                                          : "N/A"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={filteredRows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                              />

                              <FormControl
                                variant="outlined"
                                sx={{
                                  minWidth: 120,
                                  position: "absolute",
                                  marginTop: "-30px",
                                }}
                              >
                                <InputLabel id="rows-per-page-label">Rows per page</InputLabel>
                                <Select
                                  labelId="rows-per-page-label"
                                  value={rowsPerPage}
                                  onChange={handleChangeRowsPerPage}
                                  label="Rows per page"
                                  style={{ height: "36px", fontSize: "16px" }}
                                >
                                  <MenuItem value={10}>10</MenuItem>
                                  <MenuItem value={25}>25</MenuItem>
                                  <MenuItem value={50}>50</MenuItem>
                                  <MenuItem value={100}>100</MenuItem>
                                </Select>
                              </FormControl>
                            </>
                          ) : (
                            <p style={{ textAlign: "center", margin: "20px 0" }}>
                              No Login Analytics data available
                            </p>
                          )}
                        </TableContainer>
                      </MDBox>
                    </>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default LoginAnalytics;
