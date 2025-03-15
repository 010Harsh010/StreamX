import React, { useEffect,useState } from "react";
import Navbar from "./Header/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useSidebar } from "../contextApi/SidebarContext.jsx";
import { useLogin } from "../contextApi/LoginContext.jsx";
import "../CSS/videogrid.css";
import AuthService from "../Server/auth.js";
import {useDispatch} from "react-redux";
import NetflixLoader from "./NetflixLoader.jsx";
import { setUser } from "../features/userSlice.js";
function Layout() {
  const dispatch = useDispatch();
  const auth  = new AuthService();
  const { setLogin} = useLogin();
  const { sidebarVisible, toggleSidebar } = useSidebar();
  const [Start,setStart] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const response = await auth.currentuser({});
        if (response){
          dispatch(setUser(response.data));
          setLogin(true);
          }else{
          setLogin(false);
        }
      } catch (error) {
        console.log(error.message);
      }
    })();
  },[]);

  useEffect(() => {
    const timeout =setTimeout(() => {
      setStart(false);
    }, 4000);
    return () => clearTimeout(timeout);
  }, []);

  if (Start){
    return (
      <NetflixLoader message={"Stream-X"} rgb={{
        r: 50,
        g: 0,
        b: 0
      }}/>
    )
  }
  
  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      {sidebarVisible && <Sidebar />}
      <Outlet />
    </>
  );
}

export default Layout;
