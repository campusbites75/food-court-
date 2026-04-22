import React, { useEffect, useState } from 'react';
import './List.css';
import { url, currency } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = () => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list?admin=true`);

      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to load items");
      }
    } catch (err) {
      console.log(err);
      toast.error("Server error");
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  // ✅ FIXED HERE
  const toggleFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/toggle-status`, { id: foodId });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchList(); // refresh list
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      const response = await axios.post(`${url}/api/food/update-quantity`, {
        id,
        quantity: Number(quantity),
      });

      if (!response.data.success) {
        toast.error("Failed to update quantity");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list-page">
      <div className="list-container">
        <h2 className="list-title">All Foods List</h2>

        <div className="list-card">
          <div className="list-header">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Type</span>
            <span>Quantity</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          <div className="list-body">
            {list.map((item, index) => (
              <div key={item._id} className="list-row">

                <div className="image-wrapper">
                  <img
                    src={`${url}/images/${item.image}`}
                    alt={item.name}
                  />

                  {!item.isActive && (
                    <div className="paused-badge">
                      Paused
                    </div>
                  )}
                </div>

                <span className="food-name">{item.name}</span>
                <span>{item.category?.name || 'No Category'}</span>
                <span>{currency}{item.price}</span>

                <span className={`type-badge ${item.productType}`}>
                  {item.productType === "Packed" ? "Packed" : "Unpacked"}
                </span>

                <input
                  type="number"
                  min="0"
                  value={item.quantity ?? 0}
                  onChange={(e) => {
                    const updatedList = [...list];
                    updatedList[index].quantity = Number(e.target.value);
                    setList(updatedList);
                  }}
                  onBlur={(e) =>
                    updateQuantity(item._id, Number(e.target.value))
                  }
                  className="quantity-input"
                />

                <span
                  className={`status-text ${
                    item.quantity === 0
                      ? "out"
                      : item.isActive
                      ? "active"
                      : "paused"
                  }`}
                >
                  {item.quantity === 0
                    ? "Out of Stock"
                    : item.isActive
                    ? "Active"
                    : "Paused"}
                </span>

                <div className="action-buttons">

                  <button
                    className={`pause-btn ${item.isActive ? "pause" : "resume"}`}
                    onClick={() => toggleFood(item._id)}
                  >
                    {item.isActive ? "Pause" : "Resume"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => removeFood(item._id)}
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default List;
