import React,{useState} from 'react';
import "../../CSS/setting.css";
import AuthService from "../../Server/auth.js"
import { useLogin } from "../../contextApi/LoginContext.jsx";

function Password() {
    const auth = new AuthService();
    const { login} = useLogin();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading,setloading]  = useState(false);
    const handleUpdate =async () => {
      try {
        setloading(true);
        if(confirmPassword.length<6){
            alert("Password must be at least 6 characters");
            return;
        }
        if (newPassword!==confirmPassword){
            alert("Confirm password Must Be same As new Password")
            return;
        }
        const response = await auth.changePassword({oldPassword:currentPassword,newPassword:confirmPassword});
        if (!response){
            throw new Error("Unable to update password");
        }
      } catch (error) {
        console.log(error);
      }
      finally{
        setCurrentPassword('');
        setConfirmPassword("");
        setNewPassword("");
        setloading(false);
      }
    };
  
    const clearform = () => {
      setCurrentPassword('');
      setConfirmPassword("");
      setNewPassword("");
    }
    if (!login){
      return <h1 style={{color:"white",textAlign:"center",marginTop:"2rem"}}>Please Login To Change Password</h1>
    }
  return (
    <div className="pass-container">
      <h2 className="pass-heading">Password</h2>
      <p className="pass-subtext" style={{borderBottom:"1px solid white",paddingBottom:"1rem"}}>
        Please enter your current password to change your password.
      </p>
      <div className="pass-form">
        <label className="pass-label">Current password</label>
        <input
          type="password"
          className="pass-input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label className="pass-label">New password</label>
        <input
          type="password"
          className="pass-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <p className="pass-hint">Your new password must be more than 8 characters.</p>

        <label className="pass-label">Confirm new password</label>
        <input
          type="password"
          className="pass-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="pass-buttons">
          <button onClick={() => clearform()} className="pass-cancel">Cancel</button>
          <button disabled={loading} className="pass-submit" onClick={() => handleUpdate()}>
            Update password
          </button>
        </div>
      </div>
    </div>
  );
}

export default Password;
