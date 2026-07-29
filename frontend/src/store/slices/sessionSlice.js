import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    complaintId: null,
    editHistory: [],
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setComplaintId(state, action) {
            state.complaintId = action.payload;
        },
        pushSnapshot(state, action) {
            state.editHistory.push(action.payload);
        },
        popSnapshot(state) {
            if (state.editHistory.length > 0) {
                state.editHistory.pop();
            }
        },
        clearSession() {
            return initialState;
        },
    },
});

export const { setComplaintId, pushSnapshot, popSnapshot, clearSession } =
    sessionSlice.actions;
export default sessionSlice.reducer;
