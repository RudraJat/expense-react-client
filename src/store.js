import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './redux/user/reducers';
import { expenseReducer } from './redux/expenses/reducers';

export const store = configureStore({
    reducer: {
        userDetails: userReducer,
        expenses: expenseReducer
    }
});