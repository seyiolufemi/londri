import { combineReducers } from "@reduxjs/toolkit"
import { apiManager } from "./apiManager"
import authReducer from "./slices/authSlice"

export const rootReducer = combineReducers({
  [apiManager.reducerPath]: apiManager.reducer,
  auth: authReducer,
})

export type RootReducer = ReturnType<typeof rootReducer>