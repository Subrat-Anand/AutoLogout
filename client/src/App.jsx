import React from 'react';
import Login from './Pages/Login';
import Home from './Pages/Home';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import SocketSetup from './hooks/SocketSetup'; // 👈 import karo
import useIsloggedIn from './hooks/isLoggedIn';
import { ToastContainer } from "react-toastify";


const App = () => {
  useIsloggedIn()
  const userData = useSelector((store) => store.user);
  console.log("data", userData)

  return (
    <>
      {userData && <SocketSetup />} {/* 👈 socket tabhi lagega jab login ho */}
      <ToastContainer position="top-center" />
      <Routes>
        <Route
          path="/login"
          element={userData ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
};

export default App;
