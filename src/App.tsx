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
import MN0400_411 from './pages/Analytics/Certificates/MN0400_411';
import MN0400_412 from './pages/Analytics/Certificates/MN0400_412';
import MN0400_413 from './pages/Analytics/Certificates/MN0400_413';
import "./i18n";
import MN0400_312 from './pages/Analytics/Locations/MN0400_312';
import MN0400_211 from './pages/Analytics/Infraestrict/MN0400_211';

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

      <Route path='/MN0400_312' element={
        <PrivateRoute>
          <MN0400_312 />
        </PrivateRoute>
      } />

      <Route path="/MN0400_211" element={
        <PrivateRoute>
          <MN0400_211/>
        </PrivateRoute>
      }/>
    </Routes>

  );
}

export default App;