import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../store/slices/authSlice'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, user, loading, token } = useSelector((state) => state.auth)

  useEffect(() => {
    // If we have a token but no user data, fetch user info
    if (token && !user && !loading) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, user, loading])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحقق من الهوية...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If authenticated but no user data and not loading, something went wrong
  if (!user && !loading) {
    return <Navigate to="/login" replace />
  }

  // If everything is good, render the protected content
  return children
}

export default ProtectedRoute

