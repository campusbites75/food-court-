import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "https://food-court-20n0.onrender.com";

  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const currency = "₹";
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  // ✅ Kitchen status
  const [kitchenOpen, setKitchenOpen] = useState(null);

  // ============================
  // AXIOS CONFIG
  // ============================
  useEffect(() => {
    axios.defaults.baseURL = url;

    const interceptor = axios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // ===============================
  // FETCH SETTINGS
  // ===============================
  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/settings");

      if (res.data?.deliveryFee !== undefined) {
        setDeliveryFee(res.data.deliveryFee);
      }

      if (res.data?.kitchenOpen !== undefined) {
        setKitchenOpen(res.data.kitchenOpen);
      }
    } catch (err) {
      console.error("Settings fetch error:", err);
    }
  };

  // ===============================
  // FETCH FOOD
  // ===============================
  const fetchFoodList = async () => {
    try {
      const response = await axios.get("/api/food/list");

      const updatedData = response.data.data.map((item) => {
        let imageUrl = item.image;

        if (!imageUrl) {
          imageUrl = null;
        } else if (!imageUrl.startsWith("http")) {
          imageUrl = `${url}/images/${imageUrl}`;
        }

        return {
          ...item,
          image: imageUrl,
        };
      });

      setFoodList(updatedData);
    } catch (error) {
      console.error("FETCH FOOD ERROR:", error);
    }
  };

  // ===============================
  // ADD TO CART
  // ===============================
  const addToCart = async (itemId) => {
    const updatedCart = {
      ...cartItems,
      [itemId]: (cartItems[itemId] || 0) + 1,
    };

    setCartItems(updatedCart);

    if (token) {
      await axios.post("/api/cart/add", { itemId });
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    }
  };

  // ===============================
  // REMOVE FROM CART
  // ===============================
  const removeFromCart = async (itemId) => {
    const updatedCart = { ...cartItems };

    if (updatedCart[itemId] > 1) {
      updatedCart[itemId] -= 1;
    } else {
      delete updatedCart[itemId];
    }

    setCartItems(updatedCart);

    if (token) {
      await axios.post("/api/cart/remove", { itemId });
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    }
  };

  // ===============================
  // TOTAL CART
  // ===============================
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      const itemInfo = food_list.find((p) => p._id === item);
      if (itemInfo) {
        totalAmount += itemInfo.price * cartItems[item];
      }
    }

    return totalAmount;
  };

  // ===============================
  // PLACE ORDER
  // ===============================
  const placeOrder = async ({
    address,
    paymentMethod,
    couponCode,
    items,
  }) => {
    try {
      if (!items || items.length === 0) {
        return { success: false, message: "Cart is empty" };
      }

      const subtotal = getTotalCartAmount();

      const endpoint =
        paymentMethod === "COD"
          ? "/api/order/placecod"
          : "/api/order/place";

      const response = await axios.post(endpoint, {
        items,
        amount: subtotal - discount,
        discount,
        couponCode,
        deliveryFee,
        totalAmount: subtotal + deliveryFee - discount,
        address,
        paymentMethod,
      });

      if (response.data.success && paymentMethod === "COD") {
        setCartItems({});
        localStorage.removeItem("guestCart");
      }

      return response.data;
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Order failed",
      };
    }
  };

  // ===============================
  // INITIAL LOAD + AUTO REFRESH ✅
  // ===============================
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      await fetchSettings();

      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);
      } else {
        const guestCart =
          JSON.parse(localStorage.getItem("guestCart")) || {};
        setCartItems(guestCart);
      }
    }

    loadData();

    // 🔥 AUTO REFRESH FOOD LIST
    const interval = setInterval(() => {
      fetchFoodList();
    }, 3000); // every 3 sec

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // CONTEXT VALUE
  // ===============================
  const contextValue = {
    url,
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    user,
    setUser,
    currency,
    deliveryFee,
    placeOrder,
    searchQuery,
    setSearchQuery,
    discount,
    setDiscount,
    couponCode,
    setCouponCode,
    kitchenOpen,
    setKitchenOpen,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
