import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TablePagination } from "@mui/material";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import { saveAs } from "file-saver";
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
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isBetween from "dayjs/plugin/isBetween";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import api from "../api";
import { debounce } from "lodash";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "../styles.css"; // Import the CSS file
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Papa from "papaparse";

import { EventRepeat } from "@mui/icons-material";
// Extend dayjs with required plugins
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.extend(advancedFormat);

function RaisedRequest() {
  const [startDate, setStartDate] = useState(dayjs());
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [endDate, setEndDate] = useState(dayjs()); // Current date
  const [totalRepots, setTotalReports] = useState(0); // Added to track total bookings
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const navigate = useNavigate();

  const [isEventIdDisabled, setIsEventIdDisabled] = useState(false);
  const [isDateDisabled, setIsDateDisabled] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allMainCategories, setAllMainCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [formData, setFormData] = useState({
    mainCategoryId: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    const fetchMainCategories = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        setLoading(true);
        const response = await api.get(`/categories`, {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data.categories || [];

        const formatted = Array.isArray(data)
          ? data.map((cat) => ({
              categoryId: cat.id,
              categoryName: cat.name,
              categoryImage: cat.imageUrl,
              createdAt: cat.createdAt,
            }))
          : [];

        setAllMainCategories(formatted);
      } catch (err) {
        setError("Failed to load main categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchMainCategories();
    setIsDateDisabled(false);
    setStartDate();
    setEndDate();
  }, []);

  const fetchPendingConnections = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }
    const offset = page * rowsPerPage; // Calculate offset for pagination

    const url = `/connections?connection_status=pending&sortBy=createdAt&sortOrder=asc&limit=${rowsPerPage}&offset=${offset}`;

    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      setTableData(response.data.connections || []);
      setTotalReports(response.data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching request:", error);
    }
  };

  const handleSelectChange = (event) => {
    setSelectedEventId(event.target.value);
    if (event.target.value) {
      setIsDateDisabled(true);
      setStartDate(null);
      setEndDate(null);
    } else {
      setIsDateDisabled(false);
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date) {
      setIsEventIdDisabled(true);
      setSelectedEventId("");
    } else {
      setIsEventIdDisabled(false);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (date) {
      setIsEventIdDisabled(true);
      setSelectedEventId("");
    } else {
      setIsEventIdDisabled(false);
    }
  };

  // Handle search button click
  const handleSearch = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    let url = "";

    if (selectedEventId) {
      // Search by event ID
      url = `/connections?connection_status=pending&categoryId=${selectedCategoryId}&sortBy=createdAt&sortOrder=asc&limit=10&offset=0`;
    } else if (startDate && endDate) {
      // Search by date range
      const formattedStartDate = startDate.format("YYYY-MM-DD");
      const formattedEndDate = endDate.format("YYYY-MM-DD");
      url = `/connections?connection_status=pending&categoryId=${selectedCategoryId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&limit=10&offset=0`;
    } else {
      console.error("Please select either an event or a date range.");
      return;
    }

    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`, // Token applied to all requests
        },
      });

      setTableData(response.data.connections); // Update table data
      setTotalReports(response.data.totalCount); // Update total bookings count
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleClearSearch = () => {
    setSelectedEventId(""); // Reset the selected event
    setStartDate(null); // Clear the start date
    setEndDate(null); // Clear the end date
    setTableData([]); // Clear the table data (optional, if you want to clear the results)
    setIsEventIdDisabled();
    setEndDate();
    setStartDate();
  };

  // Fetch events on page load and whenever page/rowsPerPage changes
  useEffect(() => {
    fetchPendingConnections();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const handleDownloadCSV = () => {
    if (!tableData || tableData.length === 0) return;

    const csvData = tableData.map((conn) => ({
      Name:
        conn.geeker?.Profile?.display_name ||
        `${conn.geeker?.first_name || ""} ${conn.geeker?.last_name || ""}`,
      Email: conn.geeker?.email || "N/A",
      Category: conn.geeker?.Profile?.category?.name || "N/A",
      Subcategory: conn.geeker?.Profile?.subcategory?.name || "N/A",
      Comment: conn.comment || "",
      Date: conn.createdAt ? dayjs(conn.createdAt).format("DD MMM YYYY, hh:mm A") : "N/A",
    }));

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "Raised_Request_Reports.csv");
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
                  <h2>Raised Request Reports</h2>
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <Card style={{ backgroundColor: "#f6f0f0" }}>
                  <MDBox p={3}>
                    <Grid container spacing={2}>
                      <b style={{ lineHeight: "60px", marginLeft: "10px" }}>Search by</b>
                      <Grid item xs={12} sm={3}>
                        <Select
                          value={selectedCategoryId}
                          onChange={(e) => setSelectedCategoryId(e.target.value)}
                          label="Select Category"
                          fullWidth
                          style={{
                            lineHeight: "44px",
                          }}
                        >
                          {allMainCategories.map((cat) => (
                            <MenuItem key={cat.categoryId} value={cat.categoryId}>
                              {cat.categoryName}
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={handleStartDateChange}
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
                            onChange={handleEndDateChange}
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
                          onClick={handleSearch}
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
                <MDBox mt={3}>
                  <>
                    <Grid item xs={12} sm={2} style={{ width: 150 }}>
                      <MDButton
                        variant="outlined"
                        color="success"
                        fullWidth
                        onClick={handleDownloadCSV}
                      >
                        Export CSV
                      </MDButton>
                    </Grid>
                    <MDBox mt={2} display="flex" justifyContent="center">
                      <TableContainer
                        component={Paper}
                        style={{ borderRadius: "0px", boxShadow: "none" }}
                      >
                        {tableData?.length > 0 ? (
                          <>
                            <table
                              style={{
                                width: "100%",
                                marginTop: "10px",
                                borderCollapse: "collapse",
                                fontSize: "16px",
                              }}
                            >
                              <thead style={{ backgroundColor: "#f0f0f0" }}>
                                <tr>
                                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Name</th>
                                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                                    Email
                                  </th>
                                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                                    Category
                                  </th>
                                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                                    Subcategory
                                  </th>
                                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                                    Comment
                                  </th>
                                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tableData.length > 0 ? (
                                  tableData.map((conn) => (
                                    <tr key={conn.id}>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {conn.geeker?.Profile?.display_name ||
                                          `${conn.geeker?.first_name || ""} ${
                                            conn.geeker?.last_name || ""
                                          }`}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {conn.geeker?.email || "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {conn.geeker?.Profile?.category?.name || "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {conn.geeker?.Profile?.subcategory?.name || "N/A"}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {conn.comment}
                                      </td>
                                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                        {conn.createdAt
                                          ? dayjs(conn.createdAt).format("DD MMM YYYY, hh:mm A")
                                          : "N/A"}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="7">No accepted connections found.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            <TablePagination
                              rowsPerPageOptions={[10, 25, 50, 100]}
                              component="div"
                              count={totalRepots}
                              rowsPerPage={rowsPerPage}
                              page={page}
                              onPageChange={(event, newPage) => setPage(newPage)}
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
                            No Raised Request data available
                          </p>
                        )}
                      </TableContainer>
                    </MDBox>
                  </>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default RaisedRequest;
