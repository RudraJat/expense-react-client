function ExpenseSummary({ summary, userEmail }) {
    if (!summary || !summary.balances) {
        return null;
    }

    const balances = summary.balances;
    const userBalance = balances[userEmail] || 0;
    const isOwing = userBalance < 0;
    const amount = Math.abs(userBalance);

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Summary</h5>

                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3 text-center">
                            <small className="text-muted d-block">Total Expenses</small>
                            <h4 className="fw-bold mb-0">₹{summary.totalAmount?.toFixed(2) || '0.00'}</h4>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3 text-center">
                            <small className="text-muted d-block">Number of Expenses</small>
                            <h4 className="fw-bold mb-0">{summary.totalExpenses || 0}</h4>
                        </div>
                    </div>
                    <div className={`col-md-4`}>
                        <div className={`rounded-3 p-3 text-center ${isOwing ? 'bg-danger-subtle' : 'bg-success-subtle'}`}>
                            <small className={`d-block ${isOwing ? 'text-danger' : 'text-success'}`}>
                                {isOwing ? 'You Owe' : 'You Are Owed'}
                            </small>
                            <h4 className={`fw-bold mb-0 ${isOwing ? 'text-danger' : 'text-success'}`}>
                                ₹{amount.toFixed(2)}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="bg-light rounded-3 p-3">
                    <h6 className="fw-bold mb-3 text-uppercase text-muted small">Balance Per Member</h6>
                    <div className="list-group list-group-flush">
                        {Object.entries(balances).map(([email, balance]) => (
                            <div key={email} className="list-group-item bg-light border-0 px-0 py-2 d-flex justify-content-between">
                                <span className="small">{email.split('@')[0]}</span>
                                <span className={`fw-bold small ${balance > 0 ? 'text-success' : balance < 0 ? 'text-danger' : 'text-muted'}`}>
                                    {balance > 0 ? '+' : ''} ₹{balance.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExpenseSummary;
