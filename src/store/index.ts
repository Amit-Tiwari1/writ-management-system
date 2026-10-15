import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import mastersReducer from "./slices/mastersSlice";
import notificationReducer from "./slices/notificationSlice";
import casesReducer from "./slices/casesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    masters: mastersReducer,
    notifications: notificationReducer,
    cases: casesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;