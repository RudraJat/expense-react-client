import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { useSelector } from "react-redux";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ExpenseSummary from "../components/ExpenseSummary";

function GroupExpenses() {
    const { groupId } = useParams();
    const user = useSelector((state) => state.userDetails);
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSettled, setIsSettled] = useState(false);

    const fetchGroupDetails = async () => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/groups/${groupId}`,
                { withCredentials: true }
            );
            setGroup(response.data);
            setIsSettled(response.data.paymentStatus?.isPaid || false);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchExpenses = async () => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/expenses/group/${groupId}`,
                { withCredentials: true }
            );
            setExpenses(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/expenses/group/${groupId}/summary`,
                { withCredentials: true }
            );
            setSummary(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpenseAdded = (expenseId) => {
        fetchExpenses();
        fetchSummary();
    };

    const handleExpenseDeleted = (expenseId) => {
        setExpenses(expenses.filter(exp => exp._id !== expenseId));
        fetchSummary();
    };

    const handleSettleGroup = async () => {
        if (!window.confirm("Are you sure you want to settle this group? All balances will be reset.")) {
            return;
        }

        try {
            await axios.post(
                `${serverEndpoint}/expenses/group/${groupId}/settle`,
                {},
                { withCredentials: true }
            );
            setIsSettled(true);
            fetchGroupDetails();
            fetchSummary();
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Error settling group");
        }
    };

    const handleReopenGroup = async () => {
        if (!window.confirm("Reopen this group to add more expenses?")) {
            return;
        }

        try {
            await axios.post(
                `${serverEndpoint}/expenses/group/${groupId}/reopen`,
                {},
                { withCredentials: true }
            );
            setIsSettled(false);
            fetchGroupDetails();
            fetchSummary();
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Error reopening group");
        }
    };

    useEffect(() => {
        fetchGroupDetails();
        fetchExpenses();
        fetchSummary();
    }, [groupId]);

    if (loading) {
        return (
            <div
                className="container p-5 d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "60vh" }}
            >
                <div
                    className="spinner-grow text-primary"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">Loading expenses...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">Groups</Link>
                    </li>
                    <li className="breadcrumb-item active">{group?.name}</li>
                </ol>
            </nav>

            <div className="row align-items-center mb-5">
                <div className="col-md-8">
                    <h2 className="fw-bold text-dark display-6 mb-2">
                        {group?.name}
                    </h2>
                    <p className="text-muted mb-0">
                        {group?.membersEmail?.length || 0} members • {expenses.length} expenses
                        {isSettled && <span className="badge bg-success ms-2">Settled</span>}
                    </p>
                </div>
                <div className="col-md-4 text-end">
                    {group?.adminEmail === user?.email && (
                        <>
                            {!isSettled ? (
                                <button
                                    className="btn btn-warning rounded-pill fw-bold"
                                    onClick={handleSettleGroup}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    Settle Group
                                </button>
                            ) : (
                                <button
                                    className="btn btn-info rounded-pill fw-bold"
                                    onClick={handleReopenGroup}
                                >
                                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                                    Reopen Group
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isSettled && (
                <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    This group has been settled. All balances are now zero.
                    {group?.adminEmail === user?.email && (
                        <span className="ms-2">Click "Reopen Group" to add more expenses.</span>
                    )}
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-8">
                    {!isSettled && (
                        <ExpenseForm
                            groupId={groupId}
                            groupMembers={group?.membersEmail || []}
                            onSuccess={handleExpenseAdded}
                        />
                    )}
                    <ExpenseList
                        expenses={expenses}
                        userEmail={user?.email}
                        onDelete={handleExpenseDeleted}
                    />
                </div>

                <div className="col-lg-4">
                    <ExpenseSummary
                        summary={summary}
                        userEmail={user?.email}
                    />
                </div>
            </div>
        </div>
    );
}

export default GroupExpenses;

