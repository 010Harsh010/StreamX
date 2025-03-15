import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    roomData: JSON.parse(localStorage.getItem("roomId")) || null,
};

export const roomSlice = createSlice({
    name: "roomData",
    initialState,
    reducers: {
        setroomData(state, action) {
            state.roomData = action.payload;
            localStorage.setItem("roomId", JSON.stringify(action.payload));
        }
    }
});

export const { setroomData } = roomSlice.actions;
export default roomSlice.reducer;
