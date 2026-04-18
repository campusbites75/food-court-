import React from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">

        <NavLink to='/add' className="sidebar-link">
          <img src={assets.add_icon} alt="" />
          <span>Add Items</span>
        </NavLink>

        <NavLink to='/list' className="sidebar-link">
          <img src={assets.order_icon} alt="" />
          <span>List Items</span>
        </NavLink>

        {/* ⭐ NEW: Manage Categories Link */}
        <NavLink to='/categories' className="sidebar-link">
          <img src={assets.order_icon} alt="" />
          <span>Manage Categories</span>
        </NavLink>

        <NavLink to='/orders' className="sidebar-link">
          <img src={assets.order_icon} alt="" />
          <span>Orders</span>
        </NavLink>

        <NavLink to='/kitchen' className="sidebar-link">
          <img src={assets.order_icon} alt="" />
          <span>Kitchen Screen</span>
        </NavLink>

        <NavLink to='/admin/pos' className="sidebar-link">
          <img src={assets.order_icon} alt="" />
          <span>POS</span>
        </NavLink>

        <NavLink to='/monthly-report' className="sidebar-link">
          <img src={assets.order_icon} alt="" />
          <span>Monthly Report</span>
        </NavLink>

        <NavLink to='/settings' className="sidebar-link">
          <img src={assets.settings_icon || assets.order_icon} alt="" />
          <span>Settings</span>
        </NavLink>

      </div>
    </aside>
  );
};

export default Sidebar;