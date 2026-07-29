import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    file: null,
    fileName: "",
    fileType: "",
    extractedText: "",
    isUploading: false,
};

const uploadSlice = createSlice({
    name: "upload",
    initialState,
    reducers: {
        setFile(state, action) {
            state.file = action.payload.file;
            state.fileName = action.payload.name;
            state.fileType = action.payload.type;
        },
        setExtractedText(state, action) {
            state.extractedText = action.payload;
        },
        setUploading(state, action) {
            state.isUploading = action.payload;
        },
        clearFile(state) {
            state.file = null;
            state.fileName = "";
            state.fileType = "";
            state.extractedText = "";
        },
    },
});

export const { setFile, setExtractedText, setUploading, clearFile } =
    uploadSlice.actions;
export default uploadSlice.reducer;
