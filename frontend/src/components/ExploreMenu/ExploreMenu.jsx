import React, { useContext, useEffect, useState } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "../../Context/StoreContext";

const ExploreMenu = ({ category, setCategory }) => {
  const { searchQuery, setSearchQuery, url } = useContext(StoreContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // FETCH CATEGORIES
  // ==============================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${url}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [url]);

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>

      <p className="explore-menu-text">
        Choose from a diverse menu featuring a delectable array of dishes.
      </p>

      <div className="explore-menu-list">
        {/* ALL CATEGORY */}
        <div
          onClick={() => setCategory("All")}
          className="explore-menu-list-item"
        >
          <div className={`all-category ${category === "All" ? "active" : ""}`}>
            <p>All</p>
          </div>
        </div>

        {/* DYNAMIC CATEGORIES */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          categories.map((item) => (
            <div
              key={item._id}
              onClick={() =>
                setCategory((prev) =>
                  prev === item.name ? "All" : item.name
                )
              }
              className="explore-menu-list-item"
            >
              <img
                src={`${url}/images/${item.image}`}
                alt={item.name}
                className={category === item.name ? "active" : ""}
                onError={(e) => {
                  e.target.src =
                    "https://dummyimage.com/300x200/cccccc/000000&text=No+Image";
                }}
              />
              <p>{item.name}</p>
            </div>
          ))
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="menu-search-wrapper">
        <input
          type="text"
          placeholder="Search for food items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="menu-search-input"
        />
      </div>

      <hr />
    </div>
  );
};

export default ExploreMenu;
