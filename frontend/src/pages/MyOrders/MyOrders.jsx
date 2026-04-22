import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {

  const [data, setData] = useState([]);
  const [bill, setBill] = useState(null);
  const { url, token, currency } = useContext(StoreContext);

  // ✅ Fetch user orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${url}/api/order/userorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success && response.data.data) {
        const sorted = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setData(sorted);
      } else {
        setData([]);
      }

    } catch (err) {
      console.error("ORDER FETCH ERROR:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // ✅ Status cleaner (important UX fix)
  const getStatusLabel = (order) => {
    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "PENDING") {
      return "Payment Pending";
    }

    if (order.paymentStatus === "FAILED") {
      return "Payment Failed";
    }

    if (order.status === "CONFIRMED") {
      return "Order Confirmed";
    }

    if (order.status === "DELIVERED" || order.status === "delivered") {
      return "Delivered";
    }

    return order.status;
  };

  // ✅ Fetch bill
  const viewBill = async (order) => {
    if (order.status !== "DELIVERED" && order.status !== "delivered") {
      alert("Bill is available only for delivered orders.");
      return;
    }

    try {
      const res = await axios.get(
        `${url}/api/order/bill/${order._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success && res.data.bill) {
        setBill(res.data.bill);
      } else {
        alert("Bill not found for this order.");
      }

    } catch (err) {
      console.error("BILL FETCH ERROR:", err.response?.data || err.message);
      alert("Unable to load bill. Please try again later.");
    }
  };

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>

      <div className="container">
        {data.map((order, index) => (
          <div key={order._id || index} className='my-orders-order'>

            <img src={assets.parcel_icon} alt="order" />

            <p className="order-id">
              <b>Order ID:</b> {order.orderNumber}
            </p>

            <p>
              {order.items.map((item, i) =>
                i === order.items.length - 1
                  ? `${item.name} x ${item.quantity}`
                  : `${item.name} x ${item.quantity}, `
              )}
            </p>

            <p>{currency}{order.amount}.00</p>

            <p>Items: {order.items.length}</p>

            <p>
              <span>&#x25cf;</span>{" "}
              <b>{getStatusLabel(order)}</b>
            </p>

            <button
              className="view-bill-btn"
              disabled={
                order.status !== "DELIVERED" &&
                order.status !== "delivered"
              }
              onClick={() => viewBill(order)}
              style={{
                opacity:
                  order.status !== "DELIVERED" &&
                  order.status !== "delivered"
                    ? 0.5
                    : 1,
                cursor:
                  order.status !== "DELIVERED" &&
                  order.status !== "delivered"
                    ? "not-allowed"
                    : "pointer"
              }}
            >
              View Bill
            </button>

          </div>
        ))}
      </div>

      {/* ✅ EMPTY STATE */}
      {data.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No orders found 😕
        </p>
      )}

      {/* ✅ BILL MODAL */}
      {bill && (
        <div className="bill-modal">
          <div className="bill-box">

            <h2 className="bill-title">Order Invoice</h2>

            <p><b>Order ID:</b> {bill.orderId}</p>
            <p><b>Name:</b> {bill.customerName}</p>
            <p><b>Date:</b> {new Date(bill.createdAt).toLocaleString()}</p>

            <hr />

            <h3>Items</h3>
            {bill.items.map((item, i) => (
              <p key={i}>
                {item.name} x {item.quantity} — ₹{item.price * item.quantity}
              </p>
            ))}

            <hr />

            <p><b>Subtotal:</b> ₹{bill.amount}</p>
            <p><b>Delivery Fee:</b> ₹{bill.deliveryFee}</p>

            <h3>Total: ₹{bill.totalAmount}</h3>

            <hr />

            <p><b>Status:</b> {bill.status}</p>

            <button
              className="close-bill-btn"
              onClick={() => setBill(null)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrders;
