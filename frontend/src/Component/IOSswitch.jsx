import React,{useState} from "react";
import { Switch } from "@mui/material";
import { styled } from "@mui/system";
import PublicIcon from "@mui/icons-material/Public"; // Globe Icon

const IOSSwitch = styled(Switch)(({ theme }) => ({
    width: 44,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 1,
      margin: 2,
      transition: "transform 0.3s ease-in-out",
      "&.Mui-checked": {
        transform: "translateX(18px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor: "#000", // iOS green
          opacity: 1,
        },
      },
    },
    "& .MuiSwitch-thumb": {
      width: 22,
      height: 22,
      backgroundColor: "#fff",
      boxShadow: "0 2px 3px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& svg": {
        fontSize: 16, // Adjust icon size
        color: "#000", // Change globe color if needed
      },
    },
    "& .MuiSwitch-track": {
      borderRadius: 13,
      backgroundColor: "#e5e5e5", // iOS grey
      opacity: 1,
      transition: "background-color 0.3s",
    },
}));

export default function IOSStyleSwitch() {
    const [checked, setChecked] = useState(false);

    return (
      <IOSSwitch
        checked={checked}
        icon={<PublicIcon />} // Globe icon for OFF state
        checkedIcon={<PublicIcon />} // Globe icon for ON state
        onChange={() => setChecked(!checked)}
      />
    );
}
