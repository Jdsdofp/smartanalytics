// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Assets from './pages/Analytics/Assets'
import People from './pages/Analytics/Peoples'





function App() {
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/analytics/assets"
        element={
          <PrivateRoute>
            <Assets />
          </PrivateRoute>
        }
      />

      <Route path="/analytics/people" element={
        <PrivateRoute>
          <People/>
        </PrivateRoute>
      } />
    </Routes>
  )
}

export default App