import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const KitchenContext = createContext();

const KitchenProvider = ({ children }) => {
  const [kitchenOpen, setKitchenOpen] = useState(true);

  const fetchStatus = async () => {
    const res = await axios.get("https://food-court-20n0.onrender.com/api/settings");
    if (res.data.success) {
      setKitchenOpen(res.data.kitchenOpen);
    }
  };

  const toggleKitchen = async () => {
    const res = await axios.post("https://food-court-20n0.onrender.com/api/settings/toggle-kitchen");
    if (res.data.success) {
      setKitchenOpen(res.data.kitchenOpen);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <KitchenContext.Provider value={{ kitchenOpen, toggleKitchen }}>
      {children}
    </KitchenContext.Provider>
  );
};

export default KitchenProvider;
