import { SET_EXPENSES, ADD_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE, SET_SUMMARY } from "./action";

export const expenseReducer = (state = { expenses: [], summary: null }, action) => {
    switch (action.type) {
        case SET_EXPENSES:
            return { ...state, expenses: action.payload };

        case ADD_EXPENSE:
            return { ...state, expenses: [action.payload, ...state.expenses] };

        case UPDATE_EXPENSE:
            return {
                ...state,
                expenses: state.expenses.map(exp =>
                    exp._id === action.payload._id ? action.payload : exp
                )
            };

        case DELETE_EXPENSE:
            return {
                ...state,
                expenses: state.expenses.filter(exp => exp._id !== action.payload)
            };

        case SET_SUMMARY:
            return { ...state, summary: action.payload };

        default:
            return state;
    }
};
