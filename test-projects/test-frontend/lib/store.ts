import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "@/lib/services/userApi";
import { projectApi } from "@/lib/services/projectApi";
import { taskApi } from "@/lib/services/taskApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [userApi.reducerPath]: userApi.reducer,
      [projectApi.reducerPath]: projectApi.reducer,
      [taskApi.reducerPath]: taskApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        userApi.middleware,
        projectApi.middleware,
        taskApi.middleware
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
