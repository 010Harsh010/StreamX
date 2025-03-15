import React, { useState } from "react";
import { FaUser,FaLock, FaUpload, FaCreditCard } from "react-icons/fa";
import Account from "../Component/Setting/Account";
import "../CSS/setting.css";
import { useSidebar } from "../contextApi/SidebarContext";
import Password from "../Component/Setting/Password";
import UpdateVideo from "../Component/Setting/UpdateVideo";
function Setting() {
  const { sidebarVisible } = useSidebar();
  const [panel, setpanel] = useState("account");
  document.title = "StreamX-Setting"
  return (
    <div
      className="settouter"
      style={{
        color: "white",
        display: "flex",
        flexDirection: "row",
        width: "100%",
        ...(sidebarVisible && { marginLeft: "250px" }),
      }}
    >
      <div
        className="settleft"
        style={{
          borderRight: "1px solid white",
          paddingTop: "5rem",
          backgroundColor: "black",
          width: "20%",
          minHeight: "100vh"
        }}
      >
        <div
          className="settbarheading"
          style={{
            marginTop: "1rem",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        > {(
            <h2 className="barheddingsett">Setting</h2>
          )
        }
        </div>
        <div
          className="settbarcomponent"
          style={{ margin: "3rem 0 0 1rem", fontSize: "1.5rem" }}
        >
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              height: "4rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
            className="settbarcomponentitem"
            onClick={() => setpanel("account")}
          >
            <FaUser className="iconclassh" style={{ marginRight: "0.8rem" }} />{
              (
                <div className="barheddingsett" >Account</div>
              )
            }
          </div>
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              height: "4rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
            className="settbarcomponentitem"
            onClick={() => setpanel("payment")}
          >
            <FaCreditCard className="iconclassh" style={{ marginRight: "0.8rem" }} />
            { (
                <div className="barheddingsett" >Billing / Payment</div>
              )
            }
          </div>
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              height: "4rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
            className="settbarcomponentitem"
            onClick={() => setpanel("upload")}
          >
            <FaUpload className="iconclassh" style={{ marginRight: "0.8rem" }} />
            {(
                <div className="barheddingsett" >Upload Videos</div>
              )
            }
          </div>
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              height: "4rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
            className="settbarcomponentitem"
            onClick={() => setpanel("password")}
          >
            <FaLock className="iconclassh" style={{ marginRight: "0.8rem" }} />
            { (
                <div className="barheddingsett" >Password Manager</div>
              )
            }
          </div>
        </div>
      </div>
      <div
        className="settright"
        style={{ width: "80%", height: "100vh", overflow: "hidden" }}
      >
        {panel === "account" && (
          <div
            className="accountbox"
            style={{
              overflowY: "scroll",
              height: "100%",
              padding: "1rem",
              paddingTop: "4rem",
              objectFit: "cover",
            }}
          >
            <Account />
          </div>
        )}
        {panel === "password" && (
          <div
            className="accountbox"
            style={{
              overflowY: "scroll",
              height: "100%",
              padding: "1rem",
              paddingTop: "4rem",
              objectFit: "cover",
            }}
          >
            <Password />
          </div>
        )}
        {panel === "upload" && (
          <div
            className="accountbox"
            style={{
              overflowY: "scroll",
              height: "100%",
              padding: "1rem",
              paddingTop: "4rem",
              objectFit: "cover",
            }}
          >
            <UpdateVideo/>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setting;
