import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../Server/auth.js";
import "../CSS/login.css";
import { useLogin } from "../contextApi/LoginContext.jsx";
import { useDispatch } from "react-redux";
import { setUser } from "../features/userSlice.js";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

function Login() {
  const dispatch = useDispatch();
  const { setLogin } = useLogin();
  const auth = new AuthService();
  document.title = "StreamX-Login"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [forgot, setForgot] = useState(true);
  const newPassword = useRef();
  const userName = useRef();

  const verifyEmail = async (authResult) => {
    try {
      const response = await auth.verifyEmail({
        authResult: authResult,
        username: userName.current.value,
        newPassword: newPassword.current.value,
      });
      if (!response || !response.success) {
        throw new Error("No User Exist");
      }
      setError("Login Password Updated");
      setForgot(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const googleLogin = async (authResult) => {
    try {
      const data = await auth.googlelogin({
        authResult: authResult,
      });
      console.log(data);
      if (data) {
        const response = await auth.currentuser({});
        dispatch(setUser(response.data));
        setLogin(true);
        setLoading(false);
        navigate(-1);
      }
    } catch (error) {
      setLoading(false);
      setError("Invalid Credentials");
    }
  }
  const googleverify = useGoogleLogin({
    onSuccess: googleLogin,
    onError: (error) => {
      console.error("Google Login Error:", error);
      setError("Google Login failed. Please try again.");
    },
    scope: "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.send",
    flow: "auth-code",
  });
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await auth.login({ username, password });
      if (data) {
        const response = await auth.currentuser({});
        dispatch(setUser(response.data));
        setLogin(true);
        setLoading(false);
        navigate(-1);
      }
    } catch (err) {
      setLoading(false);
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="login-container">
      {forgot ? (
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              Password <Link onClick={() => setForgot(false)} style={{ color: "red" }}>Forgot</Link>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="signup-prompt">
            Don't have an account? <Link to="/register" className="heee">Sign up here</Link>
          </p>
          <div className="google-box">
            <img style={{height:"20px","marginRight":"5px"}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAA4CAMAAABuU5ChAAAA+VBMVEX////pQjU0qFNChfT6uwU0f/O4zvs6gfSJr/j6twDoOisjePPoNSXpPjDrWU/oLRr+9vZ7pff/vAAUoUAkpEn0ran619b82pT7wgD+68j947H/+e7//PafvPm/0vuBw5Df7+P63tz3xcPxl5HnJQ7qUEXxj4n4z83zoJzqSz/vgXrucWrsY1r1tbHrSBPoOjbvcSr0kx74rRH80XntZC3xhSPmGRr86+r4sk/936EJcfPS3/yowvnbwVKjsTjx9f5urEjkuBu9tC+ErkJyvoRRpj2az6hWs23j6/0emX2z2btAiuI8k8AyqkE5nZU1pGxCiOxVmtHJ5M+PSt3WAAACGElEQVRIieWSa3fSQBCGk20CJRcW2AWKxgJtqCmieNdatV5SUtFq5f//GJeE7CXJJOT4TZ+PO+c58+7MaNr/SWd60mecTDs1pMFp28dODPZnZw/369TXseXqHNfCblDdte84krTDwUFFwnMnJyXm+bSsmZ/vlcb1+6A2x5C1xYeyPgIyJlhtYDjzjOYyZA3oFighLYxni8UMY6dCG/jy9KzTQfI8DXSnTNN0kcl1lNE9dlxYC8TnnEVmAJ02qHlPllyb58vgmQ2Np0tYgzGMo2ex6IKRihi1mPhcZyYuO8McL4yYl0vrrI6mJZpx9Or1mzqa10rFt8p7o5ArXh+lXutC8d6ZBdiXvH6PeyPFsw8KMBu8fsG9+3t473l9yD1vD+/BX3v1cgqv3lzE/8A9NCUK5sn33vugeN1DQTcVTbG/9M56H+lEAzg2d54t7iW5657xCdEx5PF+B9Lj9oO9z4hBgIZX6YyaXfmZaV9QQkU781h+Hra+7jQaFv6Or8RW3r1rhErES641D9XKigox8jJaQxyAfZOpIQm6kiuT6BvfujqVuEpkkY43u+d1RBBF35v55aVJidKSEBRFiJAk/+0PM3NjgjFFMLc/WVYzlzImLBPprzvzrlBjHUmZSH8DmqatS0QSZtcjTxUBWSlZw1bckhaYlISTcm1rIqKolJJxtRWnXUVscTFsjWFFwoy7WTM2+zX69/gDaLcy7SET9nsAAAAASUVORK5CYII=" alt="" />
            <div onClick={googleverify}style={{"cursor":"pointer","color":"white"}}>Login with Google</div>
          </div>
        </form>
      ) : (
        <form className="login-form">
          <h2>Recover Password</h2>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" ref={userName} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              New Password <Link onClick={() => setForgot(true)} style={{ color: "red" }}>Login</Link>
            </label>
            <input type="password" id="password" ref={newPassword} required />
          </div>
          <button type="button" onClick={googleverify} className="login-button" disabled={loading}>
            {loading ? "Sending Req..." : "Request"}
          </button>
          <p className="signup-prompt">
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default Login;
