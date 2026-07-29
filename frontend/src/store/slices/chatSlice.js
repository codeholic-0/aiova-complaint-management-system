import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [
        {
            role: "bot",
            content:
                "Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you!",
        },
    ],
    isStreaming: false,
    progress: 0,
    statusText: "",
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage(state, action) {
            state.messages.push(action.payload);
        },
        setStreaming(state, action) {
            state.isStreaming = action.payload;
        },
        setProgress(state, action) {
            state.progress = action.payload.percent;
            state.statusText = action.payload.status;
        },
        resetChat() {
            return initialState;
        },
    },
});

export const { addMessage, setStreaming, setProgress, resetChat } =
    chatSlice.actions;
export default chatSlice.reducer;
