import {configureStore} from "@reduxjs/toolkit"
import userReducer from "../features/userSlice.js"
import videoReducer from "../features/videoSlice.js"
import roomReducer from "../features/videoStream.js";

export const store = configureStore({
    reducer: {
        userReducer,
        videoReducer,
        roomReducer
    }
});