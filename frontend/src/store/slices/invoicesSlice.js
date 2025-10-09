import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoices/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب الفواتير')
    }
  }
)

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/invoices/', invoiceData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء الفاتورة')
    }
  }
)

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/invoices/${id}/`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحديث الفاتورة')
    }
  }
)

export const sendInvoice = createAsyncThunk(
  'invoices/sendInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/invoices/${id}/send/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إرسال الفاتورة')
    }
  }
)

export const markInvoicePaid = createAsyncThunk(
  'invoices/markInvoicePaid',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/invoices/${id}/mark-paid/`, paymentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تسجيل دفع الفاتورة')
    }
  }
)

const initialState = {
  invoices: [],
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
  stats: {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  },
}

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload.results || action.payload
        state.pagination = {
          count: action.payload.count || action.payload.length,
          next: action.payload.next || null,
          previous: action.payload.previous || null,
        }
        
        // Calculate stats
        const invoices = action.payload.results || action.payload
        state.stats = {
          total: invoices.length,
          paid: invoices.filter(inv => inv.status === 'paid').length,
          pending: invoices.filter(inv => inv.status === 'sent').length,
          overdue: invoices.filter(inv => inv.status === 'overdue').length,
        }
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false
        state.invoices.unshift(action.payload)
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update invoice
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false
        const index = state.invoices.findIndex(inv => inv.id === action.payload.id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Send invoice
      .addCase(sendInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(inv => inv.id === action.payload.id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
      })
      
      // Mark invoice as paid
      .addCase(markInvoicePaid.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(inv => inv.id === action.payload.id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
      })
  },
})

export const { clearError } = invoicesSlice.actions
export default invoicesSlice.reducer

