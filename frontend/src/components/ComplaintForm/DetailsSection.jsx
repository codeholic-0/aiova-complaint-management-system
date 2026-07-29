import { useSelector } from "react-redux";
import Field from "../common/Field";

export default function DetailsSection() {
    const details = useSelector((s) => s.complaint.details);

    return (
        <div className="border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Section 3: Complaint Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="Complaint Type"
                    value={details.complaintType}
                    placeholder="e.g., Packaging, Contamination"
                />
                <Field
                    label="Complaint Date"
                    type="date"
                    value={details.complaintDate}
                />
            </div>
            <div className="mt-4">
                <Field
                    label="Detailed Description"
                    type="textarea"
                    value={details.description}
                />
            </div>
        </div>
    );
}
