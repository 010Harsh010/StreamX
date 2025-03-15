import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {VideoMethods} from "../../Server/config.js"
import {Link} from "react-router-dom"
function UpdateVideo() {
  const service = new VideoMethods();
  const user = useSelector((state) => state.userReducer.currentUser);
  const [owner, setowner] = useState({});
  const [title, settitle] = useState("");
  const [descrption, setdescription] = useState("");
  const [loading,setloading] = useState(false);
  const file = useRef();
  const thumbnail = useRef();

  const uploadvideo = async () => {
    if (!title || !descrption || !file.current?.files[0] || !thumbnail.current?.files[0]) {
      return;
    }
  
    try {
      setloading(true)
      const response = await service.uploadVideo({
        title,
        description: descrption,
        videoFile: file.current.files[0],
        thumbnail: thumbnail.current.files[0],
      });
  
      if (!response){
        throw new Error("Unable to update Video");
      }
    } catch (error) {
      console.error(error);
    } finally {
      settitle("");
      setdescription("");
      file.current.value = "";
      thumbnail.current.value = "";
      console.log("Video upload process completed.");
      setloading(false)
    }
  };
  const emptyfields = () => {
    settitle("");
    setdescription("");
    file.current.value = "";
    thumbnail.current.value = "";
  }

  useEffect(() => {
    setowner(user);
  }, [user,]);

  if (!owner._id) {
    return (
      <>
        <h1>Loading ....</h1>
      </>
    );
  }
  return (
    <div className="sett-container" style={{ overflow: "hidden" }}>
      <div className="sett-header">
        <div className="sett-banner"></div>
        <div className="settuserinfobox">
          <img
            src={owner?.avatar}
            alt="Profile"
            className="sett-avatar"
            style={{ width: "13%" }}
          />
          <div
            className="sett-name"
            style={{ width: "87%", paddingTop: "5rem" }}
          >
            <h2>
              {owner?.fullName.split(" ")[0]} {owner?.fullName.split(" ")[1]}
            </h2>
            <p>@{owner?.email}</p>
            <Link to={"/content"}>
            <button className="sett-view-btn">View profile</button>
            </Link>
            
          </div>
        </div>
      </div>
      <div className="sett-section">
        <h3>Upload Video</h3>
        <p>Update your Video.</p>
        <div className="sett-inputs">
          <div>
            <label className="sett-label">Title</label>
            <input
              placeholder="Enter Title"
              type="text"
              value={title}
              onChange={(e) => settitle(e.target.value)}
              className="sett-input"
            />
          </div>
          <div>
            <label className="sett-label">Description</label>
            <input
              placeholder="Enter Description"
              type="text"
              value={descrption}
              onChange={(e) => setdescription(e.target.value)}
              className="sett-input"
            />
          </div>
          <div>
            <label className="sett-label">Video FIle</label>
            <input
              placeholder={owner?.email}
              type="file"
              ref={file}
              className="sett-input"
            />
          </div>
          <div>
            <label className="sett-label">Thumnail</label>
            <input
              placeholder={owner?.email}
              type="file"
              ref={thumbnail}
              className="sett-input"
            />
          </div>
        </div>
        <div className="sett-buttons" style={{ marginTop: "1rem" }}>
          <button onClick={() => emptyfields()} className="sett-cancel-btn">Cancel</button>
          <button disabled={loading} onClick={() => uploadvideo()} className="sett-save-btn" style={{"cursor":loading?"not-allowed":"pointer","backgroundColor":loading?"gray":"voilet"}}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateVideo;
