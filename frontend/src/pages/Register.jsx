import React, { useState } from "react";
import "../CSS/registerpage.css";
import AuthService from "../Server/auth.js";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import loadings from "../assets/circleloading.json";
import { useGoogleLogin } from "@react-oauth/google";

function Register() {
  const auth = new AuthService();
  document.title = "StreamX-SignUp"
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    username: "",
    avatar: null,
    coverImage: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const responseGoogle = async (authResult) => {
    if (authResult["code"]) {
      try {
        await auth.register({
          ...formData,
          authResult,
        });
        console.log("User registered successfully");
        navigate("/success");
      } catch (error) {
        console.error("Error during registration:", error);
        setError("Registration failed. Please try again.");
      }
    } else {
      setError("Google authentication failed.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      console.error("Goo.gle Login Error:", error);
      setError("Google Login failed. Please try again.");
    },
    scope:
      "https://mail.google.com/ https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile",
    flow: "auth-code",
  });

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.password || !formData.username || !formData.avatar || !formData.coverImage) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      googleLogin();
    } catch (error) {
      setError("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="register-container">
      {loading && (
        <div className="loading-overlay">
          <Lottie animationData={loadings} loop={true} style={{ height: "80px", width: "80px" }} />
          <p>Loading...</p>
        </div>
      )}

      <div className="register-formbox">
        <div className="register-title" style={{ fontFamily: "monospace" }}>
          REGISTER
        </div>
        {error && (
          <div className="error-message" style={{ color: "red", fontFamily: "monospace" }}>
            {error}
          </div>
        )}
        <div className="register-seprate">
          <div className="register-formstart">
            <form method="post">
              <div className="register-groupby">
                <label>Full Name:</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="register-groupby">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="register-groupby">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="register-groupby">
                <label>Avatar:</label>
                <input
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  accept="image/*"
                  required
                />
              </div>
              <div className="register-groupby">
                <label>Cover Image:</label>
                <input
                  type="file"
                  name="coverImage"
                  onChange={handleChange}
                  accept="image/*"
                />
              </div>
              <div className="register-submits">
                <button type="button" onClick={() => handleSubmit()}>
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
