import React from "react";
import { PiScreencastBold, PiPhoneDisconnectFill } from "react-icons/pi";
import { IoVideocam, IoSettings } from "react-icons/io5";
import { FaMicrophoneSlash } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa6";
import { IoVideocamOff } from "react-icons/io5";
import "../CSS/videobox.css";

function VideoBox(props){
  
  const reference = props?.localVideoRef;
  return (
    <div className="video-container" style={{"marginBottom":"10px"}}>
      {/* Main Video */}
      <div className="main-video">
        <video ref={reference} autoPlay muted playsInline></video>
      </div>
      {/* Control Options */}
      <div className="video-controls">
        <div onClick={() => props?.toggleScreenShare()} className="control-btn">
          <PiScreencastBold className="icon" />
        </div>
        <div className="control-btn" onClick={() => props?.changeVideo()}>
          {
            props?.vid ? <IoVideocam className="icon" /> :
            <IoVideocamOff className="icon" style={{"color":"red"}} />
          }
        </div>
        <div className="end-call" onClick={()=>props?.endcall()}>
          <PiPhoneDisconnectFill className="icon" size={30} />
        </div>
        <div className="control-btn" onClick={() => props?.changeMic()}>
          {
            !props?.mic? <FaMicrophoneSlash color="red" className="icon" /> :
            <FaMicrophone className="icon" />
          }
        </div>
        <div className="control-btn">
          <IoSettings className="icon" />
        </div>
      </div>
    </div>
  );
};

export default VideoBox;
