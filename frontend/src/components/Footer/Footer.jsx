import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">

        <div className="footer-content-left">
          <img src={assets.logo} alt="CampusBites Logo" />
          <p>
            CampusBite — Your Campus, Your Cravings, Delivered Fast.
            Discover delicious food from your favorite campus cafés and
            local eateries, delivered straight to your hostel or classroom
            with a single tap.
          </p>
        </div>

        <div className="footer-content-center">
          <h2>Company</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/delivery">Delivery</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>Get In Touch</h2>
          <ul>
            <li><a href="mailto:bitescampus27@gmail.com">bitescampus27@gmail.com</a></li>
          </ul>
        </div>

      </div>

      <hr />

      <p className="footer-copyright">
        © 2026 CampusBites.com — All Rights Reserved.
      </p>
    </div>
  )
}

export default Footer
