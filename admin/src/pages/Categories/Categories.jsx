// ./pages/Categories/Categories.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { url } from "../../assets/assets";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==============================
  // FETCH CATEGORIES
  // ==============================
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${url}/api/categories`);
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Error fetching categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ==============================
  // HANDLE IMAGE CHANGE
  // ==============================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // ==============================
  // HANDLE SUBMIT
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!editingId && !imageFile) {
      toast.error("Category image is required");
      return;
    }

    setLoading(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const apiUrl = editingId
        ? `${url}/api/categories/${editingId}`
        : `${url}/api/categories`;

      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("description", formData.description);

      if (imageFile) {
        dataToSend.append("image", imageFile);
      }

      const response = await fetch(apiUrl, {
        method,
        body: dataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingId ? "Category updated!" : "Category added!");
        setFormData({ name: "", description: "" });
        setImageFile(null);
        setPreview(null);
        setEditingId(null);
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to save category");
      }
    } catch (error) {
      toast.error("Error saving category");
    }

    setLoading(false);
  };

  // ==============================
  // HANDLE EDIT
  // ==============================
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
    });

    // 🔥 FIXED IMAGE URL
    setPreview(`${url}/images/${category.image}`);

    setEditingId(category._id);
  };

  // ==============================
  // HANDLE DELETE
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const response = await fetch(`${url}/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Category deleted!");
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Error deleting category");
    }
  };

  return (
    <div className="categories">
      <h2>Manage Categories</h2>

      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          placeholder="Category Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {preview && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={preview}
              alt="Preview"
              style={{ width: "120px", borderRadius: "8px" }}
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : editingId
            ? "Update Category"
            : "Add Category"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", description: "" });
              setPreview(null);
              setImageFile(null);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="category-list">
        <h3>Existing Categories</h3>

        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <ul>
            {categories.map((category) => (
              <li key={category._id}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {/* 🔥 FIXED IMAGE URL */}
                  <img
                    src={`${url}/images/${category.image}`}
                    alt={category.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginRight: "10px",
                    }}
                  />
                  <strong>{category.name}</strong> -{" "}
                  {category.description}
                </div>

                <div className="actions">
                  <button onClick={() => handleEdit(category)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(category._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Categories;
