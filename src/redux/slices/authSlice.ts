import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface AuthUser {
  id: string
  email: string
  role: string
  is_email_verified: boolean
}

interface AuthState {
  user: AuthUser | null
}

const initialState: AuthState = { user: null }

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
    },
    logOut: (state) => {
      state.user = null
    },
  },
})

export const { setUser, logOut } = authSlice.actions
export default authSlice.reducer