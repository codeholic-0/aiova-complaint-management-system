import { useSelector } from "react-redux";
import Field from "../common/Field";

export default function OriginSection() {
    const origin = useSelector((s) => s.complaint.origin);

    return (
        <div className="border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Section 1: Origin & Customer Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="Complaint Source"
                    value={origin.source}
                    placeholder="e.g., Email, Portal"
                />
                <Field
                    label="Customer Name"
                    value={origin.customerName}
                    placeholder="Client or facility name"
                />
            </div>
        </div>
    );
}
