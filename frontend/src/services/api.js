import axios from "axios";

const API_BASE = "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

export function logComplaint(text, complaintId = null) {
    return api.post("/api/complaint/log", { text, complaintId });
}

export function editComplaint(prompt, complaintId) {
    return api.put("/api/complaint/edit", { prompt, complaintId });
}

export function extractFromFile(text, complaintId = null) {
    return api.post("/api/complaint/extract", { text, complaintId });
}

export function createChatStream(message, complaintId = null) {
    const params = new URLSearchParams({ message });
    if (complaintId) params.append("complaint_id", complaintId);
    return new EventSource(`${API_BASE}/api/chat/stream?${params}`);
}

export default api;
