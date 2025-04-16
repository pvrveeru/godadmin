import React, { useState, useEffect, useCallback, useRef } from "react";
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
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import api from "../api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryName: "", categoryImage: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const selectedCategoryForUpload = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
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

      const data = response.data.categories || [];

      const formatted = Array.isArray(data)
        ? data.map((cat) => ({
            categoryId: cat.id,
            categoryName: cat.name,
            categoryImage: cat.imageUrl,
            createdAt: cat.createdAt,
          }))
        : [];

      setCategories(formatted);
    } catch (err) {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageOpenDialog = (category) => {
    selectedCategoryForUpload.current = category;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCategoryForUpload.current) return;

    setLoading(true);
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // ✅ match the expected field name

    try {
      const response = await api.post(
        `/upload/category/${selectedCategoryForUpload.current.categoryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ now included
            Accept: "*/*",
          },
        }
      );

      console.log("Upload success:", response.data);
      fetchCategories();
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category?.categoryName || "",
      categoryImage: category?.categoryImage || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ categoryName: "", categoryImage: "" });
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
        setError("User not authenticated.");
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
          },
          { headers }
        );
      } else {
        const response = await api.post(
          "/categories",
          {
            name: formData.categoryName,
            imageUrl: formData.categoryImage,
          },
          { headers }
        );

        const newCategory = {
          categoryId: response.data.category.id,
          categoryName: response.data.category.name,
          categoryImage: response.data.category.imageUrl,
          createdAt: response.data.category.updatedAt,
        };

        setCategories((prev) => [...prev, newCategory]);
      }

      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      setError("Failed to submit.");
    } finally {
      setLoading(false);
    }
  }, [formData, editingCategory]);

  const handleDeleteCategory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("User not authenticated.");
        return;
      }

      await api.delete(`/event-category/${categoryToDelete.categoryId}`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories((prev) => prev.filter((c) => c.categoryId !== categoryToDelete.categoryId));
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      setError("Delete failed.");
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
                      <h2>Categories</h2>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        onClick={() => handleOpenDialog()}
                      >
                        Add Category
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDTypography>
              </MDBox>

              <MDBox pt={3} px={2}>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <TableContainer component={Paper}>
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
                          <th style={tableCellStyle}>Categories</th>
                          <th style={tableCellStyle}>Image</th>
                          <th style={tableCellStyle}>Create Date</th>
                          <th style={tableCellStyle}>Action</th>
                        </tr>
                      </thead>
                      <tbody style={{ textAlign: "center" }}>
                        {categories.map((category) => (
                          <tr key={category.id}>
                            <td style={tableCellStyle}>{category.categoryName}</td>
                            <td
                              style={{
                                ...tableCellStyle,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {category.categoryImage ? (
                                <img
                                  src={category.categoryImage}
                                  alt="category"
                                  style={{ width: 100, height: 80, objectFit: "cover" }}
                                />
                              ) : (
                                "No Image"
                              )}
                              <MDButton
                                style={{ marginLeft: "30px", maxWidth: "20px", minWidth: "20px" }}
                                variant="gradient"
                                color="warning"
                                onClick={() => handleImageOpenDialog(category)}
                              >
                                <UploadIcon />
                              </MDButton>
                            </td>
                            <td style={tableCellStyle}>
                              {new Date(category.createdAt).toLocaleDateString()}
                            </td>
                            <td style={tableCellStyle}>
                              <MDButton
                                style={{ marginLeft: "10px", maxWidth: "20px" }}
                                variant="gradient"
                                color="info"
                                onClick={() => handleOpenDialog(category)}
                              >
                                <CreateIcon />
                              </MDButton>
                              {/* <MDButton
                                style={{ marginLeft: "10px" }}
                                variant="gradient"
                                color="error"
                                onClick={() => {
                                  setIsDeleteConfirmOpen(true);
                                  setCategoryToDelete(category);
                                }}
                              >
                                <DeleteIcon />
                              </MDButton> */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableContainer>
                )}

                {/* File input for upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                  <DialogTitle
                    style={{
                      maxWidth: "500px", // Restricts maximum size
                      width: "500px", // Allows full width within the grid system
                    }}
                  >
                    {editingCategory ? "Edit Category" : "Add Category"}
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      name="categoryName"
                      label="Category Name"
                      fullWidth
                      margin="normal"
                      value={formData.categoryName}
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

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogContent>
                    Are you sure you want to delete{" "}
                    <strong>{categoryToDelete?.categoryName}</strong>?
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteCategory} color="error">
                      Delete
                    </Button>
                  </DialogActions>
                </Dialog>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default Categories;
