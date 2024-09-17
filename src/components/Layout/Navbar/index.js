import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userData");
    setIsLoggedIn(!!token);

    const handleLoginEvent = () => {
      setIsLoggedIn(true);
    };
    const handleLogoutEvent = () => {
      setIsLoggedIn(false);
    };
    window.addEventListener("login", handleLoginEvent);
    window.addEventListener("logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("login", handleLoginEvent);
      window.removeEventListener("logout", handleLogoutEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("profile");
    localStorage.removeItem("userData");
    localStorage.removeItem("key");
    window.dispatchEvent(new Event("logout"));
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <nav className="navbar bg-light-subtle ">
      <div className="container-fluid justify-content-between">
        <div className="logo">
          <Link className="navbar-brand" to="/">
            <img className="logo-img" src="" alt="Logo" />
          </Link>
        </div>
        <div className="left">
          <ul className="nav ">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Contact
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/venues">
                Venues
              </Link>
            </li>
          </ul>
        </div>
        <div className="right">
          <ul className="nav">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item bg-primary rounded">
                  <button
                    className="nav-link text-light py-1"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item border border-primary-subtle rounded px-3 me-3">
                  <Link className="nav-link py-1" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item bg-primary rounded ">
                  <Link className="nav-link text-light py-1" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
