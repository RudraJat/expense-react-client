import axios from "axios";
import { useState } from "react";
import { serverEndpoint } from "../config/appConfig";

function ExpenseForm({ groupId, groupMembers, onSuccess }) {
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        description: "",
        splitType: "equal",
        excludedMembers: [],
        customSplit: []
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleMemberToggle = (email) => {
        const excluded = formData.excludedMembers;
        if (excluded.includes(email)) {
            setFormData({
                ...formData,
                excludedMembers: excluded.filter(e => e !== email)
            });
        } else {
            setFormData({
                ...formData,
                excludedMembers: [...excluded, email]
            });
        }
    };


    const handleCustomSplitChange = (email, amount) => {
        const customSplit = [...(formData.customSplit || [])];
        const index = customSplit.findIndex(split => split.email === email);
        const amountValue = parseFloat(amount) || 0;
        
        if (index >= 0) {
            if (amountValue > 0) {
                customSplit[index].amount = amountValue;
            } else {
                customSplit.splice(index, 1);
            }
        } else {
            if (amountValue > 0) {
                customSplit.push({ email, amount: amountValue });
            }
        }
        
        setFormData({ ...formData, customSplit });
    };

    const validateCustomSplit = () => {
        if (formData.splitType !== "custom") return null;

        const customSplit = formData.customSplit || [];
        const includedMembers = groupMembers.filter(
            (m) => !formData.excludedMembers.includes(m)
        );

        if (includedMembers.length === 0) {
            return "Please include at least one member";
        }

        const missingMember = includedMembers.find(
            (member) => !customSplit.some((s) => s.email === member && s.amount > 0)
        );
        if (missingMember) {
            return "Please enter amounts for all included members";
        }

        const total = customSplit.reduce((sum, split) => sum + split.amount, 0);
        const expenseAmount = parseFloat(formData.amount);

        if (!expenseAmount || expenseAmount <= 0) {
            return "Please enter a valid amount before splitting";
        }

        if (Math.abs(total - expenseAmount) > 0.01) {
            return `Amounts must sum to ₹${expenseAmount.toFixed(2)}. Current total: ₹${total.toFixed(2)}`;
        }

        return null;
    };

    const validate = () => {
        let isValid = true;
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Expense title is required";
            isValid = false;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = "Amount must be greater than 0";
            isValid = false;
        }

        if (formData.splitType === "custom") {
            const customSplitError = validateCustomSplit();
            if (customSplitError) {
                newErrors.customSplit = customSplitError;
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            setLoading(true);
            try {
                const payload = {
                    groupId,
                    title: formData.title,
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    splitType: formData.splitType,
                    excludedMembers: formData.excludedMembers
                };

                if (formData.splitType === 'custom') {
                    payload.customSplit = formData.customSplit;
                }

                const response = await axios.post(
                    `${serverEndpoint}/expenses/create`,
                    payload,
                    { withCredentials: true }
                );

                onSuccess(response.data.expenseId);
                setFormData({
                    title: "",
                    amount: "",
                    description: "",
                    splitType: "equal",
                    excludedMembers: [],
                    customSplit: []
                });
            } catch (error) {
                console.log(error);
                setErrors({ message: error.response?.data?.message || "Error creating expense" });
            } finally {
                setLoading(false);
            }
        }
    };

    const membersList = groupMembers.filter(m => !formData.excludedMembers.includes(m));

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Add New Expense</h5>

                {errors.message && (
                    <div className="alert alert-danger" role="alert">
                        {errors.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-medium">Expense Title</label>
                        <input
                            type="text"
                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Dinner, Movie tickets"
                        />
                        {errors.title && <small className="text-danger d-block mt-1">{errors.title}</small>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-medium">Amount (₹)</label>
                        <input
                            type="number"
                            className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                        {errors.amount && <small className="text-danger d-block mt-1">{errors.amount}</small>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-medium">Description (Optional)</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="What is this expense for?"
                            rows="2"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-medium">Split Type</label>
                        <select
                            className="form-select"
                            name="splitType"
                            value={formData.splitType}
                            onChange={handleChange}
                        >
                            <option value="equal">Equal Split</option>
                            <option value="custom">Custom Split</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-medium">Members</label>
                        <div className="d-flex flex-wrap gap-2">
                            {groupMembers.map((member) => (
                                <div key={member} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`member-${member}`}
                                        checked={!formData.excludedMembers.includes(member)}
                                        onChange={() => handleMemberToggle(member)}
                                    />
                                    <label className="form-check-label small" htmlFor={`member-${member}`}>
                                        {member.split('@')[0]}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {formData.splitType === 'custom' && (
                        <div className="mb-3">
                            <label className="form-label fw-medium">Custom Split Amounts</label>
                            {errors.customSplit && <div className="alert alert-warning mb-2">{errors.customSplit}</div>}
                            <div className="bg-light rounded-3 p-3">
                                {membersList.length === 0 ? (
                                    <p className="text-muted small mb-0">No members selected. Please include at least one member.</p>
                                ) : (
                                    membersList.map((member) => (
                                        <div key={member} className="mb-2 d-flex align-items-end gap-2">
                                            <label className="small fw-medium flex-grow-1 mb-0">
                                                {member.split('@')[0]}
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                value={
                                                    formData.customSplit?.find(s => s.email === member)?.amount || ''
                                                }
                                                onChange={(e) => handleCustomSplitChange(member, e.target.value)}
                                                style={{ maxWidth: '100px' }}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary rounded-pill fw-bold"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Add Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ExpenseForm;
