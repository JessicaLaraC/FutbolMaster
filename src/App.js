import React, { useEffect } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/register";
import NuevoTorneoForm from "./components/NuevoTorneoFrom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./components/profile";
import { useState } from "react";
import { auth } from "./components/firebase";
import BottomMenu from "./components/bottomMenu";
import FormProfile from "./components/ProfileFrom";
import Torneo from "./components/Torneo"
import TablaDePosiciones from "./components/TablaDePosiciones"
import PanelTorneo from "./components/PanelTorneo"
import Partidos from "./components/Partidos";
import PartidosFinal from "./components/PartidosFinal";
import PartidosSemifinal from "./components/PartidosSemifinal";
import PartidoCuartosFinal from "./components/PartidoCuartosFinal";
import FromPartidos from"./components/FormPartidos";
import RestablecerContrasenia from "./components/RestablecerContrasenia"
import RecuperacionContrasenia from "./components/RecuperacionContrasenia"
import EditarTorneo from "./components/EditarTorneo"
import Estadisticas from "./components/Estadisticas";
import Alineacion from "./components/Alineacion"
import Posiciones from "./components/Posiciones"
import ListaJugadores from "./components/ListaJugadores"
import FormularioEstadisticas from "./components/FromularioEstadisticas";
import FormularioJugadores from "./components/FromularioJugadores"
import CalificarJugadores from "./components/CalificacionJugadores";
import FormularioAlineacion from "./components/FormularioAlineación";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    
    const logoutAndCheckAuth = async () => {
      await auth.signOut(); // Cerrar sesión al iniciar la app
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setIsAuthChecked(true);
      });
      return unsubscribe;
    };
  
    logoutAndCheckAuth();
  }, []);
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null); 
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              <Route
                path="/"
                element={user ? <Navigate to="/panelTorneo" /> : <Navigate to="/login" />}
              />
            
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/restablecer-contrasenia" element={<RestablecerContrasenia/>} />
              <Route path="/recuperacion-contrasenia" element ={<RecuperacionContrasenia/>} />
              <Route
                path="/paneltorneo"
                element={user ? <PanelTorneo /> : <Navigate to="/login" />}
              />
              <Route
                path="/profile"
                element={user ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />}
              />
              <Route
                path="/edit-profile"
                element={user ? <FormProfile onLogout={handleLogout} /> : <Navigate to="/login" />}
              />
              <Route
                path="/nuevo-torneo"
                element={user ? <NuevoTorneoForm /> : <Navigate to="/login" />}
              />
              <Route
                path="/torneo/:id"
                element={user ? <Torneo/> : <Navigate to="/login" />}
              />
              <Route path="/editar-torneo/:torneoId" 
                element={user ?<EditarTorneo />: <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:id/tabla"
                element={user ? <TablaDePosiciones/> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos"
                element={user ? <Partidos /> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/nuevo"
                element={user ? <FromPartidos mode="create" /> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/editar/:partidoId"
                element={user ? <FromPartidos mode="edit" /> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/:partidoId/estadisticas" 
                element={user ? <Estadisticas/> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/:partidoId/estadisticas/formulario-estadisticas" 
                element={user ? <FormularioEstadisticas/> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/:partidoId/formulario-jugadores" 
                element={user ? <FormularioJugadores/> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/:partidoId/alineacion" 
                element={user ? <Alineacion/> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/:partidoId/posiciones" 
                element={user ? <Posiciones/> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/:partidoId/lista-jugadores"
                element={user ? <ListaJugadores /> : <Navigate to="/login" />}
              />
              <Route
                path="/torneos/:torneoId/partidos/:partidoId/jugadores/:jugadorId/calificar"
                element={user ? <CalificarJugadores /> : <Navigate to="/login" />}
              />
              <Route
                path="/formulario-alineacion/:torneoId/:equipoId/:partidoId/:posicionId"
                element={user ? <FormularioAlineacion /> : <Navigate to="/login" />}
              />
              <Route path="/torneos/:torneoId/cuartosfinal" 
              element={user ?<PartidoCuartosFinal /> : <Navigate to="/login" />} 
              />

              <Route path="/torneos/:torneoId/semifinal"
              element={user ?<PartidosSemifinal />: <Navigate to="/login" />} 
              />

              <Route path="/torneos/:torneoId/final"
              element={user ?<PartidosFinal />: <Navigate to="/login" />} 
              />
          
            </Routes>
            <ToastContainer />
          </div>
        </div>
        {isAuthChecked && user && <BottomMenu onLogout={handleLogout} />}
      </div>
    </Router>
  );
}

export default App;