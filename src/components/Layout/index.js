import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <div className="container-layout">
        <Header />
        <Outlet />
      </div>

      <Footer />
    </>
  );
}

export default Layout;
