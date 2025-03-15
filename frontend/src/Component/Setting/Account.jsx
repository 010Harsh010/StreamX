import React, { useState, useEffect,useRef } from "react";
import { useSelector } from "react-redux";
import AuthService from "../../Server/auth.js";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
function Account() {
  const auth = new AuthService();
  const user = useSelector((state) => state.userReducer.currentUser);
  const [owner, setowner] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [photoshow,setphotshow] = useState(false);
  const [editphoto, seteditphoto] = useState(false);
  const avatarRef = useRef();
  const [loading,setloading] = useState(false);
  useEffect(() => {
    setowner(user);
  }, [user]);


  const editdescription = async () => {
    try {
      setloading(true);
      console.log("Clicked");

      // if (bio===""){
      //     return;
      // }
      const response = await auth.editdescription({ description: bio });
      if (!response) {
        throw new Error("Unable to update description");
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setBio("");
      setloading(false);
    }
  };
  const updateUser = async () => {
    try {
      setloading(true);
      const fullName = [firstName, lastName].join(" ");
      const response = await auth.updateAccountDetails({ fullName, email });

      if (!response) {
        throw new Error("Unable to Update User");
      }

      setowner((prev) => ({
        ...prev,
        fullName: fullName,
        email: email,
      }));

      console.log("Updated owner:", { fullName, email }); // Log new state values
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setFirstName("");
      setLastName("");
      setEmail("");
      setloading(false);
    }
  };
  const updateavatar = async () => {
    if (!avatarRef.current || !avatarRef.current.files[0]) {
      console.log("No file selected for upload.");
      return;
    }
    
    try {
      setloading(true);
      const response = await auth.updateAvatar({ avatar: avatarRef.current.files[0] });
      if (!response) {
        throw new Error("unable to update");
      }
      setowner((prevOwner) => ({
        ...prevOwner,
        avatar: response.data.user.avatar,
      }));
      avatarRef.current.value = null;
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      seteditphoto(false);
      setphotshow(false);
      setloading(false);
      avatarRef.current.value= "";
    }
  };  
  const clearpersonsalform = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
  }
  const profile = () => {
    setBio("");
  }
  if (!owner._id) {
    return (
      <>
        <h1>Loading ....</h1>
      </>
    );
  }
  return (
    <div className="sett-container" style={{ overflow: "hidden" }}>
      {
          photoshow && 
          <div className="sett-photobox" onClick={()=>setphotshow(false)}>
            <div className="innerbigphoto"  onClick={(event) => event.stopPropagation()} >
            {
              editphoto && (
                <input className="inputingphoto" type="file" ref={avatarRef}/>
              )
            }{
              !editphoto && (
                <img src={owner.avatar?owner?.avatar:"/user.jpg"} alt="Profile" className="sett-bigphoto" />
              )
            }
            </div>
            <div className="sett-photobox2"  onClick={(event) => event.stopPropagation()} >
              {
                editphoto && (
                  <button disabled={loading} className="sett-photobtn" onClick={() => updateavatar()}>Upload</button>
                )
              }
              {
                !editphoto && (
                  <button className="sett-photobtn" onClick={() => {
                    seteditphoto(true)
                  }}>Change</button>
                )
              }
              
            </div>
          </div>
        }
      <div className="sett-header">
        <div className="sett-banner"></div>
        <div className="settuserinfobox">
          <img
            src={owner?.avatar}
            alt="Profile"
            className="sett-avatar"
            style={{ width: "13%" }}
            onClick={() => setphotshow(true)}
          />
          <div
            className="sett-name"
            style={{ width: "87%", paddingTop: "5rem" }}
          >
            <h2>
              {owner?.fullName.split(" ")[0]} {owner?.fullName.split(" ")[1]}
            </h2>
            <p>@{owner?.email}</p>
            <Link to="/content">
            <button className="sett-view-btn">View profile</button>
            </Link>
          </div>
        </div>
      </div>
      <div className="sett-section">
        <h3>Personal Info</h3>
        <p>Update your photo and personal details.</p>
        <div className="sett-inputs">
          <div>
            <label className="sett-label">First name</label>
            <input
              placeholder={owner?.fullName.split(" ")[0]}
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="sett-input"
            />
          </div>
          <div>
            <label className="sett-label">Last name</label>
            <input
              placeholder={owner?.fullName.split(" ")[1]}
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="sett-input"
            />
          </div>
          <div>
            <label className="sett-label">Email address</label>
            <input
              placeholder={owner?.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sett-input"
            />
          </div>
        </div>
        <div className="sett-buttons" style={{ marginTop: "1rem" }}>
          <button onClick={() => clearpersonsalform()} className="sett-cancel-btn">Cancel</button>
          <button disabled={loading} onClick={() => updateUser()} className="sett-save-btn">
            Save changes
          </button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="sett-section">
        <h3>Profile</h3>
        <p>Update your portfolio and bio.</p>
        <div className="sett-inputs">
          <div>
            <label className="sett-label">Username</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value="/myvideotube.com"
                onChange={(e) => setUsername(e.target.value)}
                className="sett-input"
                disabled
              />
              <input
                disabled
                value={owner?.username}
                type="text"
                placeholder="olivia"
                className="sett-input"
              />
            </div>
          </div>
          <div>
            <label className="sett-label">Description</label>
            <textarea
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="sett-textarea"
            ></textarea>
          </div>
        </div>
        <div className="sett-buttons" style={{ marginTop: "1rem" }}>
          <button onClick={() => profile()} className="sett-cancel-btn">Cancel</button>
          <button disabled={loading} className="sett-save-btn" onClick={() => editdescription()}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Account;
