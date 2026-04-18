import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const KitchenContext = createContext();

const KitchenProvider = ({ children }) => {
  const [kitchenOpen, setKitchenOpen] = useState(null);

  // ✅ Fetch status
  const fetchStatus = async () => {
    try {
      const res = await axios.get("https://food-court-20n0.onrender.com/api/settings");

      if (res.data.success) {
        setKitchenOpen(res.data.kitchenOpen);
      }
    } catch (err) {
      console.error("Error fetching kitchen status", err);
    }
  };

  // ✅ FIXED: Set kitchen (NOT toggle)
  const toggleKitchen = async () => {
    try {
      const newStatus = !kitchenOpen;

      const res = await axios.post(
        "https://food-court-20n0.onrender.com/api/settings/set-kitchen",
        { kitchenOpen: newStatus }
      );

      if (res.data.success) {
        setKitchenOpen(res.data.kitchenOpen);
        return res.data.kitchenOpen; // 🔥 important for Navbar toast
      }
    } catch (err) {
      console.error("Error updating kitchen", err);
    }
  };

  // ✅ Auto refresh every 3 sec
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <KitchenContext.Provider value={{ kitchenOpen, toggleKitchen }}>
      {children}
    </KitchenContext.Provider>
  );
};

export default KitchenProvider;
