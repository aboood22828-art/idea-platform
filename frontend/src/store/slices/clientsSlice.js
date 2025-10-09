import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/clients/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب العملاء')
    }
  }
)

export const fetchLeads = createAsyncThunk(
  'clients/fetchLeads',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/leads/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب العملاء المحتملين')
    }
  }
)

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/clients/', clientData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء العميل')
    }
  }
)

export const createLead = createAsyncThunk(
  'clients/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await api.post('/leads/', leadData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء العميل المحتمل')
    }
  }
)

export const convertLeadToClient = createAsyncThunk(
  'clients/convertLeadToClient',
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/leads/${leadId}/convert/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحويل العميل المحتمل')
    }
  }
)

const initialState = {
  clients: [],
  leads: [],
  loading: false,
  error: null,
  pagination: {
    clients: { count: 0, next: null, previous: null },
    leads: { count: 0, next: null, previous: null },
  },
}

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.clients = action.payload.results || action.payload
        state.pagination.clients = {
          count: action.payload.count || action.payload.length,
          next: action.payload.next || null,
          previous: action.payload.previous || null,
        }
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false
        state.leads = action.payload.results || action.payload
        state.pagination.leads = {
          count: action.payload.count || action.payload.length,
          next: action.payload.next || null,
          previous: action.payload.previous || null,
        }
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create client
      .addCase(createClient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false
        state.clients.unshift(action.payload)
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create lead
      .addCase(createLead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false
        state.leads.unshift(action.payload)
      })
      .addCase(createLead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Convert lead to client
      .addCase(convertLeadToClient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(convertLeadToClient.fulfilled, (state, action) => {
        state.loading = false
        // Remove from leads and add to clients
        state.leads = state.leads.filter(lead => lead.id !== action.payload.leadId)
        state.clients.unshift(action.payload.client)
      })
      .addCase(convertLeadToClient.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = clientsSlice.actions
export default clientsSlice.reducer

