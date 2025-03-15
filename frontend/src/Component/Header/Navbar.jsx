import React, { useEffect, useRef, useState } from "react";
import "../../CSS/navbar.css";
import { Link } from "react-router-dom";
import { FaSearch, FaMicrophone } from "react-icons/fa";
import { useLogin } from "../../contextApi/LoginContext.jsx";
import AuthService from "../../Server/auth.js";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/userSlice.js";
import { useNavigate } from "react-router-dom";
import { SlOptionsVertical } from "react-icons/sl";
import { VscLiveShare } from "react-icons/vsc";
import { v4 as uuid } from "uuid";
import {
  Drawer,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
} from "@mui/material";
import { DialogContent, DialogActions } from "@mui/material";
import { setroomData } from "../../features/videoStream.js";
import IOSStyleSwitch from "../IOSswitch.jsx";
import { SocketContext } from "../../contextApi/SocketContext.jsx";
import { useContext } from "react";
import { IoMdClose } from "react-icons/io";
import { TiTickOutline } from "react-icons/ti";
import { FaAnglesLeft } from "react-icons/fa6";
import { LinearProgress } from "@mui/material";
import { Tooltip, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IoEnterSharp } from "react-icons/io5";
import { useSidebar } from "../../contextApi/SidebarContext.jsx";

function Navbar({ toggleSidebar }) {
  const auth = new AuthService();
  const { sidebarVisible } = useSidebar();
  const { socket } = useContext(SocketContext);
  const dispatch = useDispatch();
  const { login, setLogin } = useLogin();
  const searchRef = useRef();
  const nav = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [option, setoption] = useState(false);
  const [liveform, setliveform] = useState(false);
  const [formData, setFormData] = useState({
    roomId: uuid(),
    title: "",
    description: "",
  });
  const [enterForm, setEnterForm] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [popup, setpopup] = useState(false);
  const [popdata, setPopData] = useState({});
  const [joinroom, setJoinRoom] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (formData?.roomId) {
      navigator.clipboard.writeText(formData.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleLive = ({ roomId, user }) => {
      setpopup(true);
      setPopData(user);
      setJoinRoom(roomId);

      const timeout = setTimeout(() => {
        setpopup(false);
      }, 10000);

      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    };

    socket.on("hosting-live", handleLive);

    return () => {
      socket.off("hosting-live", handleLive);
    };
  }, [socket]);

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setliveform(false);
    setoption(false);
    if (formData?.title === "" || formData?.description === "") {
      return;
    }
    dispatch(setroomData(formData));
    nav(`/golive/${formData?.roomId}/${isEnabled ? "broadcast" : "private"}`);
  };
  const onJoin = () => {
    if (joinroom !== "") {
      setpopup(false);
      setEnterForm(false);
      nav(`/live/${joinroom}`);
    } else {
      alert("Please enter a valid Room ID");
    }
  };

  const logoutuser = (e) => {
    e.preventDefault();
    try {
      const data = auth.logout();
      if (!data) {
        throw new Error("Unable to Logout User");
      }
      setLogin(false);
      dispatch(setUser("initial"));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const response = await auth.currentuser();
      setLogin(response ? true : false);
    };
    try {
      checkUser();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const triggersearch = () => {
    if (!searchRef.current.value) return;
    nav(`/Searchuser/${searchRef.current.value}`);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      searchRef.current.value = transcript;
      triggersearch();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="navbar">
      <div className="logo" onClick={toggleSidebar}>
        <div className="play-icon">
          <span>PLAY</span>
        </div>
      </div>

      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <form
          className="search-bar"
          style={{
            position: "relative",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
          onSubmit={(e) => {
            e.preventDefault(); // Prevents page reload
            triggersearch();
          }}
        >
          <input
            type="text"
            placeholder="Search"
            style={{
              paddingRight: "3rem",
              paddingLeft: "1rem",
              width: "200px",
            }}
            ref={searchRef}
          />
          <FaSearch
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
            onClick={triggersearch}
          />
        </form>
        {!sidebarVisible ? (
          <FaMicrophone
            className={isListening ? "microphone-active" : ""}
            style={{
              display: "flex",
              alignItems: "center",
              right: "0.5rem",
              top: "100%",
              marginTop: "1rem",
              marginLeft: "1rem",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: isListening ? "red" : "white",
              fontSize: "1.2rem",
            }}
            onClick={startListening}
          />
        ) : (
          <div className="opt">
            {login && (
              <SlOptionsVertical
                onClick={() => setoption((prev) => !prev)}
              ></SlOptionsVertical>
            )}
          </div>
        )}
      </div>
      <div className="menu">
        {!login ? (
          <button className="signup-button">
            <Link to="/login">Login</Link>
          </button>
        ) : (
          <button className="signup-button" onClick={logoutuser}>
            Logout
          </button>
        )}
        <button className="signup-button">
          <Link to="/register">Sign up</Link>
        </button>
        {login && (
          <div>
            <SlOptionsVertical
              onClick={() => setoption((prev) => !prev)}
            ></SlOptionsVertical>
          </div>
        )}
      </div>
      {option && (
        <div
          className="option"
          style={{ position: "fixed", right: "0", top: "70px" }}
        >
          <div className="option-list">
            <div className="oppstion" style={{ borderRadius: "10px" }}>
              <IoEnterSharp
                style={{
                  width: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyItems: "center",
                  fontSize: "20px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyItems: "center",
                  fontSize: "20px",
                }}
              >
                <div
                  style={{ color: "white" }}
                  onClick={() => setEnterForm(true)}
                >
                  Join Live
                </div>
              </div>
            </div>
            <div className="oppstion" style={{ borderRadius: "10px" }}>
              <VscLiveShare
                style={{
                  width: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyItems: "center",
                  fontSize: "20px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyItems: "center",
                  fontSize: "20px",
                }}
              >
                <div
                  style={{ color: "white" }}
                  onClick={() => {
                    setliveform(true);
                  }}
                >
                  Go Live
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {enterForm && (
        <Dialog
          className="roomIdForm"
          open={enterForm}
          onClose={() => setEnterForm(false)}
          PaperProps={{
            style: {
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "black",
              color: "white",
              padding: "20px",
              borderRadius: "10px",
            },
          }}
        >
          <DialogTitle>Enter Room ID</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Room ID"
              type="text"
              fullWidth
              variant="outlined"
              value={joinroom}
              onChange={(e) => setJoinRoom(e.target.value)}
              InputLabelProps={{ style: { color: "white" } }} // Make label text white
              InputProps={{ style: { color: "white", borderColor: "white" } }} // Make input text white
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnterForm(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={onJoin} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {liveform && (
        <div className="liveformbar">
          <Drawer
            anchor="right"
            open={liveform}
            onClose={() => setliveform(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: "280px",
                marginTop: "68px",
                padding: "20px",
                background: "#1e1e1e",
                boxShadow: "0px 0px 12px rgba(150, 150, 150, 0.3)",
                color: "#ddd",
                borderLeft: "2px solid rgba(180, 180, 180, 0.3)",
                borderTopLeftRadius: "10px",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
                textAlign: "center",
                color: "#b0b0b0",
              }}
            >
              Create Room
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <TextField
                  value={formData?.roomId || ""}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    sx: {
                      background: "#2a2a2a",
                      borderRadius: "10px",
                      color: "#ddd",
                      border: "1px solid #666",
                    },
                    readOnly: true, // Use readOnly instead of disabled
                  }}
                  InputLabelProps={{ sx: { color: "#ffffff" } }}
                  style={{ color: "white" }}
                />
                <Tooltip title={copied ? "Copied!" : "Copy"}>
                  <IconButton onClick={handleCopy} color="primary">
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </div>

              <TextField
                label="Title"
                name="title" // Add this
                variant="outlined"
                fullWidth
                value={formData?.title}
                onChange={handleChange}
                style={{ color: "white" }}
              />

              <TextField
                label="Description"
                style={{ color: "white" }}
                name="description" // Add this
                variant="outlined"
                multiline
                rows={3}
                fullWidth
                value={formData?.description}
                onChange={handleChange}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <div onClick={() => setIsEnabled((prev) => !prev)}>
                  <IOSStyleSwitch checked={isEnabled} />
                </div>
                <div style={{ color: "white" }}>
                  {isEnabled ? "BoardCast" : "Private"}
                </div>
              </div>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 1,
                  background: "linear-gradient(90deg, #4a4a4a, #717171)", // Metallic gradient
                  borderRadius: "10px",
                  fontWeight: "bold",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(90deg, #717171, #4a4a4a)",
                  },
                }}
              >
                Create Room
              </Button>
            </Box>
          </Drawer>
        </div>
      )}
      {popup && (
        <div className="notify-card">
          <LinearProgress
            style={{
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              height: "1px",
            }}
          />
          <div className="card-inner">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                height: "50px",
                width: "50px",
                alignItems: "center",
              }}
            >
              <img
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "100%",
                  padding: "5px",
                }}
                src="/me.jpg"
                alt=""
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                alignItems: "start",
                fontFamily: "sans-serif",
                width: "300px",
                marginLeft: "5px",
              }}
            >
              <h5 style={{ margin: "0" }}>harsh singh</h5>
              <h6 style={{ color: "green" }}>Join Live</h6>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100px",
                overflowX: "auto",
                backgroundColor: "black",
                whiteSpace: "nowrap", // Prevent items from wrapping
                scrollbarWidth: "none", // Hide scrollbar for Firefox
                msOverflowStyle: "none", // Hide scrollbar for IE/Edge
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "180px", // Make sure it scrolls
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "60px",
                    height: "50px",
                  }}
                >
                  <FaAnglesLeft size={25} color="gray" />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "60px",
                    height: "50px",
                  }}
                >
                  <FaAnglesLeft size={25} color="gray" />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "80px",
                    height: "50px",
                  }}
                >
                  <FaAnglesLeft size={25} color="gray" />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "70px",
                    height: "50px",
                  }}
                >
                  <TiTickOutline
                    onClick={() => onJoin()}
                    size={25}
                    color="green"
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "60px",
                    height: "50px",
                  }}
                >
                  <IoMdClose
                    onClick={() => {
                      setpopup(false);
                      setroomData({});
                      setJoinRoom("");
                    }}
                    size={25}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
