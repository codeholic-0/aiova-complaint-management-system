import { useDispatch } from "react-redux";
import { resetForm } from "../../store/slices/complaintSlice";
import Button from "../common/Button";

export default function FormActions() {
    const dispatch = useDispatch();

    return (
        <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => dispatch(resetForm())}>
                Reset Form
            </Button>
            <Button variant="primary" disabled>
                Save Complaint
            </Button>
        </div>
    );
}
