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
  InputLabel,
  FormControl,
} from "@mui/material";
import MDBox from "components/MDBox";
import { Select, MenuItem } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
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
  const fileInputRef = useRef(null);
  const selectedCategoryForUpload = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchMainCategories();
  }, []);

  const handleImageOpenDialog = (category) => {
    selectedCategoryForUpload.current = category;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const selectedCategory = selectedCategoryForUpload.current;
    if (!file || !selectedCategory) return;

    const { categoryId: subCategoryId, mainCategoryId: categoryId } = selectedCategory;

    if (!categoryId || !subCategoryId) {
      console.error("Missing categoryId or subCategoryId");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post(
        `/upload/subCategory/${categoryId}/${subCategoryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
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

  const fetchCategories = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    try {
      setLoading(true);
      const response = await api.get(`/categories/subcategories`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      const categoryList = response?.data?.data;
      const formattedCategories = Array.isArray(categoryList)
        ? categoryList.map((cat) => ({
            categoryId: cat.id,
            categoryName: cat.name,
            categoryImage: cat.imageUrl,
            createdAt: cat.createdAt,
            mainCategoryId: cat.categoryId,
          }))
        : [];

      setCategories(formattedCategories);
    } catch (err) {
      setError("Failed to load subcategories.");
    } finally {
      setLoading(false);
    }
  };

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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = useCallback(async () => {
    if (!formData || !formData.categoryName || !formData.mainCategoryId) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) return;

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
            categoryId: formData.mainCategoryId,
          },
          { headers }
        );
      } else {
        const response = await api.post(
          "/categories/subcategory",
          {
            name: formData.categoryName,
            categoryId: formData.mainCategoryId,
          },
          { headers }
        );
        const newCategory = response.data;
        setCategories((prev) => [
          ...prev,
          {
            categoryId: newCategory.id,
            categoryName: newCategory.name,
            categoryImage: newCategory.imageUrl,
            createdAt: newCategory.createdAt,
            mainCategoryId: newCategory.categoryId,
          },
        ]);
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
      if (!token) return;

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
                        {categories.map((category) => {
                          const mainCategory = allMainCategories.find(
                            (mainCat) => mainCat.categoryId === category.mainCategoryId
                          );
                          return (
                            <tr key={category.categoryId}>
                              <td style={tableCellStyle}>
                                {mainCategory ? mainCategory.categoryName : "N/A"}
                              </td>
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
                          );
                        })}
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
                    <FormControl fullWidth>
                      <InputLabel id="mainCategoryLabel">Main Category</InputLabel>
                      <Select
                        labelId="mainCategoryLabel"
                        id="mainCategory"
                        name="mainCategoryId"
                        value={formData?.mainCategoryId || ""}
                        onChange={handleFormChange}
                        fullWidth
                      >
                        {allMainCategories.map((mainCategory) => (
                          <MenuItem key={mainCategory.categoryId} value={mainCategory.categoryId}>
                            {mainCategory.categoryName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      margin="normal"
                      id="categoryName"
                      label="Category Name"
                      fullWidth
                      name="categoryName"
                      value={formData?.categoryName || ""}
                      onChange={handleFormChange}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={handleFormSubmit} color="primary" disabled={loading}>
                      {editingCategory ? "Save Changes" : "Add Category"}
                    </Button>
                  </DialogActions>
                </Dialog>

                <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogContent>Are you sure you want to delete this category?</DialogContent>
                  <DialogActions>
                    <Button onClick={() => setIsDeleteConfirmOpen(false)} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={handleDeleteCategory} color="primary">
                      Confirm
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

export default SubCategories;
