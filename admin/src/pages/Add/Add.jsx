import React, { useState, useEffect } from "react";
import "./Add.css";
import { assets, url } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = () => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    productType: "", // ✅ NEW FIELD
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${url}/api/categories`);
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Please upload a product image.");
      return;
    }

    if (!data.categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (!data.productType) {
      toast.error("Please select Packed or Unpacked.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.categoryId);
    formData.append("productType", data.productType); // ✅ SEND TO BACKEND
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);

      if (response.data.success) {
        toast.success("Product added successfully!");

        setData({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          productType: "", // reset
        });

        setImage(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Error adding product.");
    }
  };

  const onChangeHandler = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  return (
    <div className="add-page">
      <div className="add-card">
        <h2 className="add-title">Add New Product</h2>

        <form className="add-form" onSubmit={onSubmitHandler}>
          {/* IMAGE */}
          <div className="add-image-block">
            <p className="label">Product Image</p>

            <input
              type="file"
              id="image"
              hidden
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
                e.target.value = "";
              }}
            />

            <label htmlFor="image" className="upload-box">
              <img
                src={!image ? assets.upload_area : URL.createObjectURL(image)}
                alt="upload"
                className="upload-preview"
              />
            </label>
          </div>

          {/* NAME */}
          <div className="add-field">
            <p className="label">Product Name</p>
            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={data.name}
              onChange={onChangeHandler}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="add-field">
            <p className="label">Description</p>
            <textarea
              name="description"
              rows={5}
              placeholder="Write a short description..."
              value={data.description}
              onChange={onChangeHandler}
              required
            ></textarea>
          </div>

          {/* ⭐ NEW: Packed / Unpacked */}
          <div className="add-field">
            <p className="label">Product Type</p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className={`type-btn ${
                  data.productType === "Packed" ? "active" : ""
                }`}
                onClick={() =>
                  setData({ ...data, productType: "Packed" })
                }
              >
                Packed
              </button>

              <button
                type="button"
                className={`type-btn ${
                  data.productType === "Unpacked" ? "active" : ""
                }`}
                onClick={() =>
                  setData({ ...data, productType: "Unpacked" })
                }
              >
                Unpacked
              </button>
            </div>
          </div>

          {/* CATEGORY + PRICE */}
          <div className="add-row">
            <div className="add-field">
              <p className="label">Category</p>
              {loadingCategories ? (
                <p>Loading categories...</p>
              ) : (
                <select
                  name="categoryId"
                  value={data.categoryId}
                  onChange={onChangeHandler}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="add-field">
              <p className="label">Price</p>
              <input
                type="number"
                name="price"
                placeholder="₹ Price"
                value={data.price}
                onChange={onChangeHandler}
                required
              />
            </div>
          </div>

          <button className="add-btn" type="submit">
            ADD PRODUCT
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;