import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب المشاريع')
    }
  }
)

export const fetchProject = createAsyncThunk(
  'projects/fetchProject',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب المشروع')
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects/', projectData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء المشروع')
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${id}/`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحديث المشروع')
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}/`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في حذف المشروع')
    }
  }
)

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProject: (state) => {
      state.currentProject = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload.results || action.payload
        state.pagination = {
          count: action.payload.count || action.payload.length,
          next: action.payload.next || null,
          previous: action.payload.previous || null,
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch single project
      .addCase(fetchProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false
        state.currentProject = action.payload
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects.unshift(action.payload)
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false
        const index = state.projects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects = state.projects.filter(p => p.id !== action.payload)
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentProject } = projectsSlice.actions
export default projectsSlice.reducer

