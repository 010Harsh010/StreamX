import React from 'react';
import Lottie from 'lottie-react';
import notfound from "../assets/pagenotfound.json"
function Notfound() {
  return (
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",flexDirection:"column"}}>
        <Lottie style={{height:"80vh",width:"100%",objectFit:"cover",padding:"5rem"}} animationData={notfound} loop={true}/>
        <h3 style={{color:"white",fontFamily:"monospace"}}>404 - No Page Found</h3>
    </div>
  );
}

export default Notfound;