import { useSelector } from "react-redux";
import Field from "../common/Field";

export default function AssessmentSection() {
    const assessment = useSelector((s) => s.complaint.assessment);

    return (
        <div className="border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Section 4: Initial Assessment & Priority
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="Initial Severity"
                    value={assessment.severity}
                    placeholder="Low, Medium, Critical"
                />
                <Field
                    label="Priority"
                    value={assessment.priority}
                    placeholder="P0-P3"
                />
            </div>
            <div className="mt-4">
                <Field label="Risk Category" value={assessment.riskCategory} />
            </div>
            <div className="mt-4">
                <Field
                    label="Regulatory Impact"
                    type="textarea"
                    value={assessment.regulatoryImpact}
                />
            </div>
            <div className="mt-4">
                <Field
                    label="Next Steps"
                    type="textarea"
                    value={assessment.nextSteps}
                />
            </div>
        </div>
    );
}
