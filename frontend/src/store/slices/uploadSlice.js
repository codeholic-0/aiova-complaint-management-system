import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    file: null,
    fileName: "",
    fileType: "",
    extractedText: "",
    isUploading: false,
    uploadedFiles: [],
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
        addUploadedFile(state, action) {
            const entry = { name: action.payload.name, timestamp: Date.now() };
            state.uploadedFiles = [entry, ...state.uploadedFiles.filter(f => f.name !== entry.name)];
        },
        removeUploadedFile(state, action) {
            state.uploadedFiles = state.uploadedFiles.filter(f => f.name !== action.payload);
        },
        clearFile(state) {
            state.file = null;
            state.fileName = "";
            state.fileType = "";
            state.extractedText = "";
        },
        clearAllFiles(state) {
            state.file = null;
            state.fileName = "";
            state.fileType = "";
            state.extractedText = "";
            state.uploadedFiles = [];
        },
    },
});

export const { setFile, setExtractedText, setUploading, addUploadedFile, removeUploadedFile, clearFile, clearAllFiles } =
    uploadSlice.actions;
export default uploadSlice.reducer;
