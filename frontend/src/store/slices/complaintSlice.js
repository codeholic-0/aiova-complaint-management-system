import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    origin: { source: "", customerName: "" },
    product: {
        productName: "",
        strength: "",
        batchLot: "",
        mfgDate: "",
        expiryDate: "",
        quantity: "",
        unit: "kg",
    },
    details: {
        complaintType: "",
        complaintDate: "",
        description: "",
    },
    assessment: {
        severity: "",
        priority: "",
        riskCategory: "",
        recommendedActions: [],
        regulatoryImpact: "",
        nextSteps: "",
    },
};

const complaintSlice = createSlice({
    name: "complaint",
    initialState,
    reducers: {
        updateField(state, action) {
            const { section, field, value } = action.payload;
            if (state[section] && field in state[section]) {
                state[section][field] = value;
            }
        },
        setForm(state, action) {
            const { origin, product, details, assessment } = action.payload;
            if (origin) Object.assign(state.origin, origin);
            if (product) Object.assign(state.product, product);
            if (details) Object.assign(state.details, details);
            if (assessment) Object.assign(state.assessment, assessment);
        },
        setFromBackend(state, action) {
            const { form, assessment } = action.payload;
            if (form) {
                if (form.source) state.origin.source = form.source;
                if (form.customer_name) state.origin.customerName = form.customer_name;
                if (form.product_name) state.product.productName = form.product_name;
                if (form.strength) state.product.strength = form.strength;
                if (form.batch_lot) state.product.batchLot = form.batch_lot;
                if (form.mfg_date) state.product.mfgDate = form.mfg_date;
                if (form.expiry_date) state.product.expiryDate = form.expiry_date;
                if (form.quantity != null) state.product.quantity = form.quantity;
                if (form.unit) state.product.unit = form.unit;
                if (form.complaint_type) state.details.complaintType = form.complaint_type;
                if (form.complaint_date) state.details.complaintDate = form.complaint_date;
                if (form.description) state.details.description = form.description;
            }
            if (assessment) {
                if (assessment.severity) state.assessment.severity = assessment.severity;
                if (assessment.priority) state.assessment.priority = assessment.priority;
                if (assessment.risk_category) state.assessment.riskCategory = assessment.risk_category;
                if (assessment.recommended_actions) state.assessment.recommendedActions = assessment.recommended_actions;
                if (assessment.regulatory_impact) state.assessment.regulatoryImpact = assessment.regulatory_impact;
                if (assessment.next_steps) state.assessment.nextSteps = assessment.next_steps;
            }
        },
        resetForm() {
            return initialState;
        },
    },
});

export const { updateField, setForm, setFromBackend, resetForm } = complaintSlice.actions;
export default complaintSlice.reducer;
