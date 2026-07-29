import { configureStore } from "@reduxjs/toolkit";
import complaintReducer from "./slices/complaintSlice";
import chatReducer from "./slices/chatSlice";
import uploadReducer from "./slices/uploadSlice";
import sessionReducer from "./slices/sessionSlice";

export const store = configureStore({
    reducer: {
        complaint: complaintReducer,
        chat: chatReducer,
        upload: uploadReducer,
        session: sessionReducer,
    },
});
