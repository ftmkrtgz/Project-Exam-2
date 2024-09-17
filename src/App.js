import React, { Routes, Route } from "react-router-dom";
import Contact from "./components/Pages/ContactPage";
import Layout from "./components/Layout";
import Home from "./components/Pages/HomePage";
import Product from "./components/Pages/SingleProductPage";
import About from "./components/Pages/About";
import Venues from "./components/Pages/Venues";
import Login from "./components/Pages/Login";
import Register from "./components/Pages/Register";
import Profile from "./components/Pages/Profile";

import "./sass/styles.scss";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="venue/:id" element={<Product />} />
          <Route path="about" element={<About />} />
          <Route path="venues" element={<Venues />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
