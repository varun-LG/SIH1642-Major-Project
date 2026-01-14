import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    auth: false,
    user: null,
    loading: true
}

const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser : (state, action) => {
            state.auth = action.payload.auth
            state.user = action.payload.user || null
            state.loading = false
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        clearUser: (state) => {
            state.auth = false
            state.user = null
            state.loading = false
        }
    }
})

export const {setUser, setLoading, clearUser} = AuthSlice.actions
export default AuthSlice.reducer