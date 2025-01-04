import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
	name: "user",
	initialState: {
		isLoggedIn: false,
		emailAlarm: false,
		homeAlarm: false,
		socialType: null,
		createdAt: "",
		email: "",
		incomeTags: [],
		outgoTags: [],
	},
	reducers: {
		login: (state, action) => {
			state.isLoggedIn = true;
			state.emailAlarm = action.payload.emailAlarm;
			state.homeAlarm = action.payload.homeAlarm;
			state.socialType = action.payload.socialType;
			state.createdAt = action.payload.createdAt;
			state.email = action.payload.email;
			state.incomeTags = action.payload.incomeTags;
			state.outgoTags = action.payload.outgoTags;
		},
		logout: (state) => {
			state.isLoggedIn = false;
		},
	},
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
