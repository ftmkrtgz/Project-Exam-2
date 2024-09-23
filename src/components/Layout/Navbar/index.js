import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar bg-light-subtle ">
      <div className="container-fluid justify-content-between">
        <div className="hamburger" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
        <div className="logo">
          <Link className="navbar-brand" to="/">
            <img className="logo-img" src="../images/logo.png" alt="Logo" />
          </Link>
        </div>

        <div className={`menu ${isMobileMenuOpen ? "open" : ""}`}>
          <ul className="nav">
            <li className="nav-item">
              <Link
                className="nav-link nav-navbar"
                to="/"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about" onClick={closeMobileMenu}>
                About
              </Link>
            </li>
            <li className="nav-item left">
              <Link
                className="nav-link"
                to="/contact"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
            </li>

            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/profile"
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-item btn btn-outline-primary py-1"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item px-2 me-2">
                  <Link
                    className="nav-item btn btn-outline-primary py-1"
                    to="/login"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item  ">
                  <Link
                    className="nav-item btn btn-outline-primary py-1 me-3"
                    to="/register"
                    onClick={closeMobileMenu}
                  >
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
