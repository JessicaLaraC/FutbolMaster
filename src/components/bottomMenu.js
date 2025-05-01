import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/BottomMenu.css";

const BottomMenu = () => {
    return (
        <div className="bottom-menu">
        <NavLink to="/panelTorneo" className="menu-item">
            <i className="icon-home"></i>
        </NavLink>
        <NavLink to="/profile" className="menu-item">
            <i className="icon-user"></i>
        </NavLink>
        </div>
    );
};

export default BottomMenu;
