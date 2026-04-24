import React, { useContext, useState, useEffect } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    addToCart,
    getTotalCartAmount,
    url,
    currency,
    deliveryFee,
    discount,
    setDiscount
  } = useContext(StoreContext);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // 🔥 APPLY COUPON
  const applyCoupon = async () => {
    if (!promoCode) {
      setPromoMessage("Enter a promo code");
      return;
    }

    try {
      const res = await axios.post(
        "https://food-court-20n0.onrender.com/api/coupon/apply",
        {
          code: promoCode,
          subtotal: getTotalCartAmount()
        }
      );

      if (res.data.success) {
        setDiscount(res.data.discount);

        // store coupon for revalidation
        setAppliedCoupon(res.data.coupon);

        setPromoMessage(`Coupon applied! ₹${res.data.discount} discount`);
      } else {
        setDiscount(0);
        setAppliedCoupon(null);
        setPromoMessage(res.data.message || "Invalid coupon");
      }
    } catch (error) {
      console.error(error);
      setPromoMessage("Server error");
    }
  };

  // 🔥 REVALIDATE COUPON WHEN CART CHANGES
  useEffect(() => {
    if (appliedCoupon) {
      const subtotal = getTotalCartAmount();

      if (subtotal < appliedCoupon.minOrderAmount) {
        setDiscount(0);
        setAppliedCoupon(null);
        setPromoMessage(
          `Coupon removed: Minimum order ₹${appliedCoupon.minOrderAmount} not met`
        );
      }
    }
  }, [cartItems]);

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
        </div>

        <br />
        <hr />

        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img
                    src={
                      item.image
                        ? item.image.startsWith("http")
                          ? item.image
                          : `${url}/images/${item.image}`
                        : "/fallback.png"
                    }
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <p>{item.name}</p>

                  <p>{currency}{item.price}</p>

                  <div className="cart-quantity-control">
                    <button onClick={() => removeFromCart(item._id)}>
                      -
                    </button>

                    <span>{cartItems[item._id]}</span>

                    <button
                      onClick={() => {
                        const currentQty = cartItems[item._id];
                        const stock = item.quantity || 0;

                        if (currentQty >= stock) {
                          alert(`Only ${stock} items available`);
                          return;
                        }

                        addToCart(item._id);
                      }}
                      disabled={cartItems[item._id] >= (item.quantity || 0)}
                    >
                      +
                    </button>
                  </div>

                  <p>{currency}{item.price * cartItems[item._id]}</p>
                </div>

                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>

          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount()}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>
                {currency}
                {getTotalCartAmount() === 0 ? 0 : deliveryFee}
              </p>
            </div>

            <hr />

            {discount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount</p>
                  <p>-{currency}{discount}</p>
                </div>
                <hr />
              </>
            )}

            <div className="cart-total-details">
              <b>Total</b>
              <b>
                {currency}
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + deliveryFee - discount}
              </b>
            </div>

            {discount > 0 && (
              <p style={{ color: "green", marginTop: "10px" }}>
                🎉 You saved {currency}{discount}
              </p>
            )}
          </div>

          <button onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>

            <div className="cart-promocode-input">
              <input
                type="text"
                placeholder="promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />

              <button onClick={applyCoupon}>Submit</button>
            </div>

            {promoMessage && (
              <p className="cart-promocode-message">{promoMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
