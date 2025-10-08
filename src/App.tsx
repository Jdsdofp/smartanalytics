// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useMemo } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Assets from './pages/Analytics/Assets';
import People from './pages/Analytics/Peoples';
import MN0400_013 from './pages/Analytics/Assets/MN0400_013';
import MN0400_12 from './pages/Analytics/Assets/MN0400_12';
import MN0400_411 from './pages/Analytics/Certificates/MN0400_411';
import MN0400_412 from './pages/Analytics/Certificates/MN0400_412';
import MN0400_413 from './pages/Analytics/Certificates/MN0400_413';
import { useCompany } from './hooks/useCompany';
import { ApolloProvider } from '@apollo/client/react';
import { createApolloClient } from './graphql/client';
import "./i18n";

function App() {
  const { company } = useCompany();


  // useMemo garante que o client só seja recriado quando company_id mudar
  const client = useMemo(
    () => createApolloClient(company?.company_id || 0, "afr1"),
    [company?.company_id]
  );

  console.log('Company ID:', company?.company_id);

  return (
    // Envolva TODAS as rotas com ApolloProvider uma única vez
    <ApolloProvider client={client}>
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
        
        <Route 
          path="/MN0400_111" 
          element={
            <PrivateRoute>
              <People />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/MN0400_013" 
          element={
            <PrivateRoute>
              <MN0400_013 />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/MN0400_012" 
          element={
            <PrivateRoute>
              <MN0400_12 />
            </PrivateRoute>
          } 
        />
        
        {/* Remova o ApolloProvider individual daqui */}
        <Route 
          path="/MN0400_411" 
          element={
            <PrivateRoute>
              <MN0400_411 />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/MN0400_412" 
          element={
            <PrivateRoute>
              <MN0400_412 />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/MN0400_413" 
          element={
            <PrivateRoute>
              <MN0400_413 />
            </PrivateRoute>
          } 
        />
      </Routes>
    </ApolloProvider>
  );
}

export default App;