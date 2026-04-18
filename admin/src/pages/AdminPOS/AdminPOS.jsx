// src/pages/AdminPOS/AdminPOS.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPOS.css";

const AdminPOS = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);

  const API_BASE = "https://food-court-20n0.onrender.com";
  const FOOD_API = `${API_BASE}/api/food/list`;
  const POS_ORDER_API = `${API_BASE}/api/pos/order`;

  const isValidPhone = (num) => /^[6-9]\d{9}$/.test(num);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setMenuLoading(true);
        const res = await axios.get(FOOD_API);
        console.log("FOODS API DATA:", res.data);
        const data = res.data.data || res.data.foods || res.data;
        setFoods(Array.isArray(data) ? data : []);
      } catch (err) {
        alert("Error loading menu");
      } finally {
        setMenuLoading(false);
      }
    };
    fetchFoods();
  }, []);

const addToCart = (food) => {
  console.log("FOOD CLICKED FULL:", food);

  setCart((prev) => {
    const exist = prev.find((i) => i._id === food._id);

    if (exist) {
      return prev.map((i) =>
        i._id === food._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    }

  const normalizedType =
  String(food.productType || "")
    .trim()
    .toLowerCase() === "packed"
    ? "Packed"
    : "Unpacked";

    return [
      ...prev,
      {
        _id: food._id,
        name: food.name,
        price: Number(food.price),
        quantity: 1,
        productType: normalizedType,
      },
    ];
  });
};

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i._id !== id));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i._id === id ? { ...i, quantity: qty } : i
        )
      );
    }
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce(
    (s, i) => s + (Number(i.price) || 0) * i.quantity,
    0
  );

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty");

    if (customerPhone.trim() !== "" && !isValidPhone(customerPhone.trim())) {
      return alert("Enter valid 10-digit phone number");
    }

    setLoading(true);

    try {
      await axios.post(POS_ORDER_API, {
        items: cart.map(item => ({
  _id: item._id,
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  productType: item.productType
})), // now includes productType
        customerName,
        customerPhone,
        orderType,
        paymentMethod,
        amount: total,
        status: "preparing",
        paymentStatus: "unpaid",
      });

      alert("Order placed successfully!");

      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setOrderType("dine-in");
      setPaymentMethod("cash");

    } catch (err) {
      alert("Order failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pos-page">
      <h1 className="pos-title">Restaurant POS</h1>

      <div className="pos-grid">

        {/* LEFT */}
        <div className="pos-menu">
          <input
            type="text"
            className="pos-search"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="pos-menu-list">
            {menuLoading && <p>Loading menu...</p>}

            {!menuLoading &&
              filteredFoods.map((food) => (
                <div
                  key={food._id}
                  className="pos-menu-card"
                  onClick={() => addToCart(food)}
                >
                  <div>{food.name}</div>

<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
  <span>₹{food.price}</span>

  <span
    style={{
      padding: "2px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      background:
        (food.productType || "").toLowerCase() === "packed" ? "#d1fae5" : "#e5e7eb",
      color:
        (food.productType || "").toLowerCase() === "packed"? "#065f46" : "#374151",
    }}
  >
     {(food.productType || "").toLowerCase() === "packed"
    ? "Packed"
    : "Unpacked"}
  </span>
</div>
                </div>
              ))}

            {!menuLoading && filteredFoods.length === 0 && (
              <p>No items found</p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="pos-cart">

          <h2 className="cart-title">Current Order</h2>

          <div className="pos-top-actions">
            <div className="pos-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <div className="pos-actions">
              <button className="btn-clear" onClick={clearCart}>
                Clear
              </button>

              <button
                className="btn-place"
                disabled={loading || cart.length === 0}
                onClick={placeOrder}
              >
                {loading ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>

          <div className="pos-input-grid">
            <input
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              placeholder="Phone number"
              value={customerPhone}
              maxLength={10}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCustomerPhone(val);
              }}
            />
          </div>

          <div className="pos-input-grid">
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="dine-in">Dine-In</option>
              <option value="takeaway">Takeaway</option>
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className="cart-items">
            {cart.length === 0 && <p>Cart is empty</p>}

            {cart.map((item) => (
              <div key={item._id} className="cart-row">
                <div>
                  <div>
  {item.name}

  <span
    style={{
      marginLeft: "8px",
      padding: "2px 6px",
      borderRadius: "5px",
      fontSize: "11px",
      background:
        item.productType === "Packed" ? "#d1fae5" : "#e5e7eb",
      color:
        item.productType === "Packed" ? "#065f46" : "#374151",
    }}
  >
    {item.productType}
  </span>
</div>
                  <div>
                    ₹{item.price} × {item.quantity}
                  </div>
                </div>

                <div className="qty-controls">
                  <button onClick={() => updateQty(item._id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, item.quantity + 1)}>
                    +
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

export default AdminPOS;
