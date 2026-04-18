import React from 'react'
import './Header.css'

const Header = () => {

  const handleViewMenu = () => {
    const menuSection = document.getElementById("explore-menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const heroImg = "/singh.jpg"; // ✅ from public folder

  return (
    <div
      className="header"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)),
          url(${heroImg})
        `
      }}
    >
      <div className="header-contents">
        <h2>Order your favourite food here</h2>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes
          crafted with the finest ingredients and culinary expertise.
        </p>
        <button onClick={handleViewMenu}>
          View Menu
        </button>
      </div>
    </div>
  )
}

export default Header
