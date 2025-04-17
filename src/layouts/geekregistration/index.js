import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TablePagination } from "@mui/material";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import CircularProgress from "@mui/material/CircularProgress";
import { TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import MDButton from "components/MDButton";
import api from "../api";

function GeekRegistration() {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0); // Added to track total bookings

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    const url = `/profiles/search`;

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
          user_type: "geeker", // ✅ Only fetch seekers
        },
      });

      const seekerUsers = response.data.data || [];
      setRows(seekerUsers);
      setTotalUsers(seekerUsers.length);
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
  const handleSearchChange = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handlePageChange = (event, newPage) => setPage(newPage - 1);
  const handleRowsPerPageChange = (e) => setRowsPerPage(e.target.value);

  // Filtered data for search and pagination
  const filteredRows = rows
    .filter((row) => {
      const email = row.email || "";
      const address = row.address || "";
      const displayName = row.display_name || "";

      return (
        email.toLowerCase().includes(searchQuery) ||
        address.toLowerCase().includes(searchQuery) ||
        displayName.toLowerCase().includes(searchQuery)
      );
    })
    .slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

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
                  <h2>Geek Registrations</h2>
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
                      <MDBox mt={2} display="flex" justifyContent="center">
                        <TableContainer
                          component={Paper}
                          style={{ borderRadius: "0px", boxShadow: "none" }}
                        >
                          {filteredRows?.length > 0 ? (
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
                                      Name
                                    </th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      Phone
                                    </th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      Email
                                    </th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      City
                                    </th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      Registration Date
                                    </th>
                                  </tr>
                                </thead>
                                <tbody style={{ fontSize: "15px" }}>
                                  {filteredRows.map((row) => (
                                    <tr key={row.id}>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.user?.first_name || "N/A"}{" "}
                                        {row.user?.last_name || "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.user?.phone || "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.user?.email || "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.city || "N/A"}
                                      </td>

                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {row.createdAt
                                          ? dayjs(row.createdAt).format("DD-MM-YYYY")
                                          : "N/A"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={totalUsers}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(row, newPage) => setPage(newPage)}
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
                              No Registration data available
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

export default GeekRegistration;
