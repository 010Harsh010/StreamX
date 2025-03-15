import React, { createContext, useContext, useState } from "react";

const videoReference = createContext();

export const useVideoReferencer = () => useContext(videoReference);

export const VideoIdProvider = ({ children }) => {
  const [videoId, setVideoId] = useState(null)
  const SetVideoId = (id) => setVideoId(id);
  return (
    <videoReference.Provider value={{ videoId, SetVideoId }}>
      {children}
    </videoReference.Provider>
  );
};
