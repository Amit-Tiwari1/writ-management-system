
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import casesReducer from "./slices/casesSlice";
import usersReducer from "./slices/usersSlice";
import locationReducer from "./slices/masterSlice/locationSlice";
import judicialReducer from "./slices/masterSlice/judicialSlice";
import taxonomyReducer from "./slices/masterSlice/taxonomySlice";
import organizationReducer from "./slices/masterSlice/organizationSlice";
import ranksReducer from "./slices/masterSlice/ranksSlice";
import designationsReducer from "./slices/masterSlice/designationsSlice";
import custodiansReducer from "./slices/masterSlice/custodiansSlice";
import respondentsReducer from "./slices/masterSlice/respondentsSlice";
import actionsReducer from "./slices/masterSlice/actionsSlice";
import aliasesReducer from "./slices/masterSlice/aliasesSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    cases: casesReducer,
    users: usersReducer,
    location: locationReducer,
    judicial: judicialReducer,
    taxonomy: taxonomyReducer,
    organization: organizationReducer,
    ranks: ranksReducer,
    designations: designationsReducer,
    custodians: custodiansReducer,
    respondents: respondentsReducer,
    actionMappings: actionsReducer,
    aliases: aliasesReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
