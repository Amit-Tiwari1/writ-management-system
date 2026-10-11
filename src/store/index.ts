import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import mastersReducer from "./slices/mastersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    masters: mastersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;