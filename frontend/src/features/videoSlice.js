import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    videoId: localStorage.getItem('videoId') || null,
}

export const videoSlice = createSlice({
    name: 'videoId',
    initialState,
    reducers: {
        setVideoId(state, action) {
            state.videoId = action.payload;
            localStorage.setItem('videoId', action.payload);
        }
    }
});

export const {setVideoId} = videoSlice.actions;
export default videoSlice.reducer;