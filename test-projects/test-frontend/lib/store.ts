import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "@/lib/services/userApi";
import { postApi } from "@/lib/services/postApi";
import { roleApi } from "@/lib/services/roleApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [userApi.reducerPath]: userApi.reducer,
      [postApi.reducerPath]: postApi.reducer,
      [roleApi.reducerPath]: roleApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(userApi.middleware, postApi.middleware, roleApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
