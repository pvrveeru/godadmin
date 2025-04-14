import React, { useState, useEffect } from "react";
import {
  TableContainer,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CreateIcon from "@mui/icons-material/Create";
import axios from "axios";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import "../styles.css";
import api from "../api";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const [totalCount, setTotalCount] = useState(0); // To store the total count of events

  // Fetch data from API

  const fetchEvents = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }
    const offset = page * rowsPerPage; // Calculate offset for pagination

    const url = `/events?sortBy=createdAt&sortOrder=asc&limit=${rowsPerPage}&offset=${offset}`;

    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      const event = response.data.data.result;
      const totalRecords = response.data.data.totalNoOfRecords;

      setEvents(event);
      setTotalCount(totalRecords);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch events on page load and whenever page/rowsPerPage changes
  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const tableCellStyle = { border: "1px solid #ddd", padding: "8px" };

  return (
    <DashboardLayout>
      <div className="hide-on-desktop">
        <DashboardNavbar />
      </div>
      <MDBox pt={3} pb={3}>
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
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <h2>Events</h2>
                <MDButton variant="gradient" color="success" onClick={() => navigate("/addevents")}>
                  Add Event
                </MDButton>
              </div>
            </MDTypography>
          </MDBox>
          <MDBox pt={3} px={2}>
            <MDBox mt={3}>
              <>
                <MDBox mt={2} display="flex" justifyContent="center">
                  <TableContainer component={Paper}>
                    {events?.length > 0 ? (
                      <>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "16px",
                            marginBottom: "20px",
                          }}
                        >
                          <thead style={{ background: "#efefef", fontSize: "15px" }}>
                            <tr>
                              <th style={tableCellStyle}>ID</th>
                              <th style={tableCellStyle}>Create Date</th>
                              <th style={tableCellStyle}>Category Name</th>
                              <th style={tableCellStyle}>Event Name</th>
                              <th style={tableCellStyle}>Event Type</th>
                              <th style={tableCellStyle}>Event Date</th>
                              <th style={tableCellStyle}>Location</th>
                              <th style={tableCellStyle}>Tickets</th>
                              <th style={tableCellStyle}>Status</th>
                              <th style={tableCellStyle}>Action</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {Array.isArray(events) &&
                              events.map((event) => (
                                <tr key={event.eventId}>
                                  <td style={tableCellStyle}>
                                    {event.uniqueEventId}-({event.eventId})
                                  </td>
                                  <td style={tableCellStyle}>
                                    {new Date(event.createdAt).toLocaleDateString()}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {event.categoryId?.categoryName || "N/A"}
                                  </td>
                                  <td style={tableCellStyle}>{event.title}</td>
                                  <td style={tableCellStyle}>{event.musicType}</td>
                                  <td style={tableCellStyle}>
                                    {new Date(event.eventDate).toLocaleDateString()}
                                  </td>
                                  <td style={tableCellStyle}>{event.location}</td>
                                  <td style={tableCellStyle}>{event.totalCapacity}</td>
                                  <td style={tableCellStyle}>{event.status}</td>
                                  <td style={tableCellStyle}>
                                    <MDButton
                                      style={{ marginRight: "10px" }}
                                      variant="gradient"
                                      color="info"
                                      onClick={() =>
                                        navigate("/addevents", {
                                          state: { eventId: event.eventId },
                                        })
                                      }
                                    >
                                      <CreateIcon />
                                    </MDButton>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <TablePagination
                          rowsPerPageOptions={[10, 25, 50, 100]}
                          component="div"
                          count={totalCount}
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
                            marginTop: "-50px",
                            marginLeft: "10px",
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
                        No Event Registration data available
                      </p>
                    )}
                  </TableContainer>
                </MDBox>
              </>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
};

export default Events;
