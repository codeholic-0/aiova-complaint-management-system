import { useSelector } from "react-redux";
import Field from "../common/Field";

export default function ProductSection() {
    const product = useSelector((s) => s.complaint.product);

    return (
        <div className="border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Section 2: Product & Batch Identification
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Product Name" value={product.productName} />
                <Field label="Strength/Grade" value={product.strength} />
                <Field label="Batch/Lot Number" value={product.batchLot} />
                <Field
                    label="Manufacturing Date"
                    type="date"
                    value={product.mfgDate}
                />
                <Field
                    label="Expiry Date"
                    type="date"
                    value={product.expiryDate}
                />
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Field
                            label="Quantity Affected"
                            type="number"
                            value={product.quantity}
                        />
                    </div>
                    <div className="w-20">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Unit
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400"
                                value={product.unit || "kg"}
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
