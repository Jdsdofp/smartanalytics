// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Assets from './pages/Analytics/Assets';
import People from './pages/Analytics/Peoples';
import MN0400_013 from './pages/Analytics/Assets/MN0400_013';
import MN0400_12 from './pages/Analytics/Assets/MN0400_12';
import "./i18n"; // Importa a configuração do i18n
import MN0400_411 from './pages/Analytics/Certificates/MN0400_411';
import MN0400_412 from './pages/Analytics/Certificates/MN0400_412';
import MN0400_413 from './pages/Analytics/Certificates/MN0400_413';
import { useCompany } from './hooks/useCompany';
import { ApolloProvider } from '@apollo/client/react';
import { createApolloClient } from './graphql/client';





function App() {
const { company } = useCompany();
const client = createApolloClient(company?.company_id || 0, "afr1");
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
        path="/MN0400_011"
        element={
          <PrivateRoute>
            <Assets />
          </PrivateRoute>
        }
      />

      <Route path="/MN0400_111" element={
        <PrivateRoute>
          <People />
        </PrivateRoute>
      } />

      <Route path="/MN0400_013" element={
        <PrivateRoute>
          <MN0400_013 />
        </PrivateRoute>
      } />

      <Route path="/MN0400_012" element={
        <PrivateRoute>
          <MN0400_12 />
        </PrivateRoute>
      } />

      <Route path="/MN0400_411" element={
        <PrivateRoute>
          <ApolloProvider client={client }>
              <MN0400_411 />
          </ApolloProvider>
        </PrivateRoute>
      } />

      <Route path="/MN0400_412" element={
        <PrivateRoute>
          <MN0400_412 />
        </PrivateRoute>
      } />

      <Route path="/MN0400_413" element={
        <PrivateRoute>
          <MN0400_413 />
        </PrivateRoute>
      } />


    </Routes>
  )
}

export default App