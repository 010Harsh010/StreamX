import React, { createContext, useContext, useState } from "react";

const VideoListContext = createContext();

export const useVideoList = () => useContext(VideoListContext);

export const VideoListProvider = ({ children }) => {
  const storedVideos = sessionStorage.getItem("videolist");
  const initialVideoList = storedVideos ? JSON.parse(storedVideos) : []; 
  
  const [videoList, setVideoList] = useState(initialVideoList);

  const updateVideoList = (newVideos) => {
    if (videoList.length<20){
      setVideoList(newVideos);
      sessionStorage.setItem("videolist", JSON.stringify(newVideos)); 
    }
  };

  return (
    <VideoListContext.Provider value={{ videoList, updateVideoList }}>
      {children}
    </VideoListContext.Provider>
  );
};
