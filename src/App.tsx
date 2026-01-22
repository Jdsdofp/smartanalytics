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
import MN0400_411 from './pages/Analytics/Certificates/MN0400_511';
import MN0400_412 from './pages/Analytics/Certificates/MN0400_412';
import MN0400_413 from './pages/Analytics/Certificates/MN0400_413';
import "./i18n";
import MN0400_312 from './pages/Analytics/Locations/MN0400_312';
import MN0400_211 from './pages/Analytics/Infraestrict/MN0400_211';
import PocSwift from './pages/PocSwift';
import MN0400_133 from './pages/Analytics/Infraestrict/MN0400_133';
import Perfil from './pages/Perfil';
import MN0400_135 from './pages/Analytics/Infraestrict/MN0400_135';
import MN0400_134 from './pages/Analytics/Infraestrict/MN0400_134';
import MN0400_132 from './pages/Analytics/Infraestrict/MN0400_132';
import MN0400_344 from './pages/Analytics/Logistics/MN0400_344';
import DashboardHub from './components/DashboardHub';
import DashboardHubCompact from './components/Dashboardhubcompact';
import DashboardHubHierarchical from './components/Dashboardhubhierarchica';

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
        path="/user/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />

            {/* Dashboard Hub Routes */}
      <Route
        path="/dashboard-hub"
        element={
          <PrivateRoute>
            <DashboardHub />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard-hub/compact"
        element={
          <PrivateRoute>
            <DashboardHubCompact />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard-hub/hierarchical"
        element={
          <PrivateRoute>
            <DashboardHubHierarchical />
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
        path="/MN0400_511"
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
          <MN0400_211 />
        </PrivateRoute>
      } />

      <Route path="/poc-swift" element={
        <>
          <PocSwift />
        </>
      } />

      <Route path='/MN0400_131' element={
        <PrivateRoute>
          <MN0400_211 />
        </PrivateRoute>
      } />

      <Route path='/MN0400_133' element={
        <PrivateRoute>
          <MN0400_133 />
        </PrivateRoute>
      } />
      <Route path='/MN0400_132' element={ 
        <PrivateRoute>
          <MN0400_132 />
        </PrivateRoute>
      } />

       <Route path='/MN0400_134' element={
        <PrivateRoute>
          <MN0400_134 />
        </PrivateRoute>
      } />

      <Route path='/MN0400_135' element={
        <PrivateRoute>
          <MN0400_135 />
        </PrivateRoute>
      } />

      <Route path='/MN0400_344' element={
        <PrivateRoute>
          <MN0400_344/>
        </PrivateRoute>
      } />  

    </Routes>

  );
}

export default App;