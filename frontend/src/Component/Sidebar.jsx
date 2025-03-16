import React ,{useEffect}from "react";
import "../CSS/sidebar.css";
import {
  FaHome,
  FaThumbsUp,
  FaHistory,
  FaVideo,
  FaFolder,
  FaUserFriends,
  FaCog,
  FaQuestionCircle,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {useSidebar} from "../contextApi/SidebarContext.jsx";

function Sidebar() {
  const user = useSelector((state) => state.userReducer.currentUser);
  const { sidebarVisible, toggleSidebar } = useSidebar();
  
  return (
    <div className="sidebar">
      <ul className="sidebar-list">
        <li onClick={()=>{toggleSidebar()}}>
          <Link to="/"  style={{"width":"100%",margin:0,padding:0}}>
            <div className="nav-item">
              <FaHome className="sidebar-icon" />
              <h5 className="nav-for">Home</h5>
            </div>
          </Link>
        </li>
        <li onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to={user._id ? "/likedcomponent" : "/login"}>
            <div className="nav-item">
              <FaThumbsUp className="sidebar-icon " />
              <h5 className="nav-for">Liked Videos</h5>
            </div>
          </Link>
        </li>
        <li onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to={user._id ? "/user-history" : "/login"}>
            <div className="nav-item">
              <FaHistory className="sidebar-icon" />

              <h5 className="nav-for">History</h5>
            </div>
          </Link>
        </li>
        <li onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to={user._id ? "/content" : "/login"}>
            <div className="nav-item">
              <FaVideo className="sidebar-icon" />

              <h5 className="nav-for">My Content</h5>
            </div>
          </Link>
        </li>
        <li onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to={user._id ? "/playlist" : "/login"}>
            <div className="nav-item">
              <FaFolder className="sidebar-icon" />

              <h5 className="nav-for">Collection</h5>
            </div>
          </Link>
        </li>
        <li onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to={user._id ? "/subscriber-user" : "/login"}>
            <div className="nav-item">
              <FaUserFriends className="sidebar-icon" />

              <h5 className="nav-for">Subscribers</h5>
            </div>
          </Link>
        </li>
        <li className="extrasbars" onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to="/login">
            <div className="nav-item ">
              <FaSignInAlt className="sidebar-icon" />

              <h5 className="nav-for">Login</h5>
            </div>
          </Link>
        </li>
        <li className="extrasbars" onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to="/register">
            <div className="nav-item ">
              <FaUserPlus className="sidebar-icon" />
              <h5 className="nav-for">Sign-Up</h5>
            </div>
          </Link>
        </li>
        <li className="sidebar-bottom" onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to="/support">
            <div className="nav-item">
              <FaQuestionCircle className="sidebar-icon" />

              <h5 className="nav-for">Support</h5>
            </div>
          </Link>
        </li>
        <li onClick={()=>{toggleSidebar()}}>
          <Link style={{"width":"100%",margin:0,padding:0}} to={user._id ? "/setting" : "/login"}>
            <div className="nav-item">
              <FaCog className="sidebar-icon" />

              <h5 className="nav-for">Settings</h5>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
