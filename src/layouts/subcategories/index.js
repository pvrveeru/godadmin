import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  TableContainer,
  Grid,
  Card,
  Paper,
  InputLabel,
  FormControl,
} from "@mui/material";
import MDBox from "components/MDBox";
import { Select, MenuItem } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import api from "../api";

const SubCategories = () => {
  const [categories, setCategories] = useState([]);
  const [allMainCategories, setAllMainCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryImage: "",
    mainCategoryId: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchMainCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/categories`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response?.data?.category || response?.data || [];

      const formattedCategories = Array.isArray(data)
        ? data.map((cat) => ({
            categoryId: cat.id,
            categoryName: cat.name,
            categoryImage: cat.imageUrl,
            //Category: category?.mainCategoryId,
            createdAt: cat.createdAt,
            mainCategoryId: cat.mainCategoryId,
          }))
        : [];

      setCategories(formattedCategories);
    } catch (err) {
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMainCategories = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await api.get("/categories", {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      setAllMainCategories(response.data || []);
    } catch (err) {
      console.error("Error fetching main categories:", err);
    }
  };

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category?.categoryName || "",
      categoryImage: category?.categoryImage || "",
      mainCategoryId: category?.mainCategoryId || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ categoryName: "", categoryImage: "", mainCategoryId: "" });
    setEditingCategory(null);
    setError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("User not authenticated. Please log in.");
        navigate("/authentication/sign-in/");
        return;
      }

      const headers = {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      };

      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory.categoryId}`,
          {
            name: formData.categoryName,
            imageUrl: formData.categoryImage,
            mainCategoryId: formData.mainCategoryId,
          },
          { headers }
        );
      } else {
        const response = await api.post(
          "/categories",
          {
            name: formData.categoryName,
            imageUrl: formData.categoryImage,
            mainCategoryId: formData.mainCategoryId,
          },
          { headers }
        );
        setCategories([...categories, response.data.data]);
      }

      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, editingCategory, categories]);

  const handleDeleteCategory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("User not authenticated. Please log in.");
        navigate("/authentication/sign-in/");
        return;
      }

      await api.delete(`/event-category/${categoryToDelete.categoryId}`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(categories.filter((c) => c.categoryId !== categoryToDelete.categoryId));
      setIsDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tableCellStyle = { border: "1px solid #ddd", padding: "8px" };

  return (
    <DashboardLayout>
      <div className="hide-on-desktop">
        <DashboardNavbar />
      </div>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
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
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={9}>
                      <h2>Sub Categories</h2>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        onClick={() => handleOpenDialog()}
                      >
                        Add Sub Category
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <TableContainer component={Paper} style={{ borderRadius: 0, boxShadow: "none" }}>
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
                          <th style={tableCellStyle}>Main Category</th>
                          <th style={tableCellStyle}>Sub Category</th>
                          <th style={tableCellStyle}>Image</th>
                          <th style={tableCellStyle}>Created At</th>
                          <th style={tableCellStyle}>Action</th>
                        </tr>
                      </thead>
                      <tbody style={{ textAlign: "center" }}>
                        {categories.map((category) => (
                          <tr key={category.categoryId}>
                            <td style={tableCellStyle}>
                              {allMainCategories.find((main) => main.id === category.mainCategoryId)
                                ?.name || "N/A"}
                            </td>
                            <td style={tableCellStyle}>{category.categoryName}</td>
                            <td style={tableCellStyle}>
                              {category.categoryImage ? (
                                <img
                                  src={category.categoryImage}
                                  alt="category"
                                  style={{ width: 100, height: 80, objectFit: "cover" }}
                                />
                              ) : (
                                "No Image"
                              )}
                            </td>
                            <td style={tableCellStyle}>
                              {new Date(category.createdAt).toLocaleDateString()}
                            </td>
                            <td style={tableCellStyle}>
                              <MDButton
                                style={{ marginRight: "10px" }}
                                variant="gradient"
                                color="info"
                                onClick={() => handleOpenDialog(category)}
                              >
                                <CreateIcon />
                              </MDButton>
                              <MDButton
                                style={{ marginLeft: "10px" }}
                                variant="gradient"
                                color="error"
                                onClick={() => {
                                  setIsDeleteConfirmOpen(true);
                                  setCategoryToDelete(category);
                                }}
                              >
                                <DeleteIcon />
                              </MDButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableContainer>
                )}

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                  <DialogTitle>
                    {editingCategory ? "Edit Sub Category" : "Add Sub Category"}
                  </DialogTitle>
                  <DialogContent>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Select Main Category</InputLabel>
                      <Select
                        name="mainCategoryId"
                        value={formData.mainCategoryId}
                        onChange={handleFormChange}
                        label="Select Main Category"
                      >
                        {allMainCategories.map((main) => (
                          <MenuItem key={main.id} value={main.id}>
                            {main.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      name="categoryName"
                      label="Sub Category Name"
                      fullWidth
                      margin="normal"
                      value={formData.categoryName}
                      onChange={handleFormChange}
                    />
                    <TextField
                      name="categoryImage"
                      label="Image URL"
                      fullWidth
                      margin="normal"
                      value={formData.categoryImage}
                      onChange={handleFormChange}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleFormSubmit} disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogContent>
                    Are you sure you want to delete &quot;{categoryToDelete?.categoryName}&quot;?
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteCategory} color="error" disabled={loading}>
                      {loading ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogActions>
                </Dialog>

                {error && <p style={{ color: "red" }}>{error}</p>}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default SubCategories;
