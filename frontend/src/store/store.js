import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import projectsSlice from './slices/projectsSlice'
import clientsSlice from './slices/clientsSlice'
import invoicesSlice from './slices/invoicesSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    clients: clientsSlice,
    invoices: invoicesSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

