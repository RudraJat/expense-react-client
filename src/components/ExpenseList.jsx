import axios from "axios";
import { serverEndpoint } from "../config/appConfig";

function ExpenseList({ expenses, userEmail, onDelete }) {
    const handleDelete = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }

        try {
            await axios.delete(
                `${serverEndpoint}/expenses/${expenseId}`,
                { withCredentials: true }
            );
            onDelete(expenseId);
        } catch (error) {
            console.log(error);
            alert("Error deleting expense");
        }
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                <i className="bi bi-receipt display-1 text-muted opacity-50"></i>
                <p className="text-muted mt-3">No expenses yet. Add one to get started!</p>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-0">
                <div className="p-4 border-bottom">
                    <h5 className="fw-bold mb-0">Recent Expenses</h5>
                </div>
                <div className="list-group list-group-flush">
                    {expenses.map((expense) => (
                        <div key={expense._id} className="list-group-item px-4 py-3 border-bottom">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 className="fw-bold mb-1">{expense.title}</h6>
                                    <small className="text-muted">
                                        Paid by {expense.paidByEmail.split('@')[0]}
                                    </small>
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold text-dark">₹{expense.amount.toFixed(2)}</div>
                                    <small className="text-muted">
                                        {expense.splitType === 'equal' ? 'Equal Split' : 'Custom Split'}
                                    </small>
                                </div>
                            </div>
                            {expense.description && (
                                <small className="text-muted d-block mb-2">{expense.description}</small>
                            )}
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    {expense.splits.length} members involved
                                    {expense.excludedMembers.length > 0 && ` (${expense.excludedMembers.length} excluded)`}
                                </small>
                                {expense.paidByEmail === userEmail && (
                                    <button
                                        className="btn btn-sm btn-danger-subtle text-danger rounded-2"
                                        onClick={() => handleDelete(expense._id)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ExpenseList;
