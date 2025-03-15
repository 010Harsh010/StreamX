import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: {"_id": "",
        "username": "",
        "email": "",
        "fullName": "",
        "avatar": "",
        "coverImage": "",
        "watchHistory": [],
        "createdAt": "",
        "updatedAt": "",
        "__v": 0
    }
}

export const userSlice = createSlice({
    name: "currentUser",
    initialState,
    reducers:{
        setUser: (state,action) => {
            if (action.payload==="initial"){
                state.currentUser = initialState;
            }else{
                state.currentUser = action.payload;
            }
        },
        updateField: (state, action) => {
            const { field, value } = action.payload;
            state.currentUser[field] = value;
        },
    }
})

export const {setUser,updateField}  = userSlice.actions;
export default userSlice.reducer;