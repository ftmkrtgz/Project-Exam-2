import React, { useState, useEffect } from "react";
import AvatarModal from "./avatar";
import NewVenueModal from "./myvenue";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../../../context/CartContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { Star } = useCart();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [name, setName] = useState("");
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isNewVenueModalVisible, setIsNewVenueModalVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newVenues, setNewVenues] = useState([]);
  const [currentVenue, setCurrentVenue] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [venueManager, setVenueManager] = useState(false);
  const [activeTab, setActiveTab] = useState("venues");

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const storedApiKey = localStorage.getItem("key");

    if (userData) {
      const parsedUserData = JSON.parse(userData);
      setAccessToken(parsedUserData.accessToken);
      setName(parsedUserData.name);
    }

    if (storedApiKey) {
      const parsedApiKey = JSON.parse(storedApiKey);
      setApiKey(parsedApiKey.key);
    }
  }, []);

  useEffect(() => {
    if (!accessToken || apiKey || !name) return;

    const fetchApiKey = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_CREATE_KEY}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch API key");
        }
        const apiKeyData = await response.json();
        setApiKey(apiKeyData.data.key);
        localStorage.setItem("key", JSON.stringify(apiKeyData.data));
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [accessToken, apiKey, name]);

  useEffect(() => {
    if (!accessToken || !apiKey || !name) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_ALL_PROFILES}${name}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": apiKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Profile could not be fetched");
        }

        const data = await response.json();
        setProfile(data.data);
        setAvatarUrl(data.data.avatar.url);
        setVenueManager(data.data.venueManager);
        localStorage.setItem("profile", JSON.stringify(data.data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken, apiKey, name]);

  useEffect(() => {
    const storedProfile = localStorage.getItem("profile");
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      if (parsedProfile && parsedProfile.avatar && parsedProfile.avatar.url) {
        setAvatarUrl(parsedProfile.avatar.url);
      }
    }
  }, [isAvatarModalVisible]);

  useEffect(() => {
    if (!accessToken || !apiKey || !name) return;

    const fetchBookingsAndVenues = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_ALL_PROFILES}${name}?_bookings=true&_venues=true`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": apiKey,
            },
          }
        );

        if (!response.ok) throw new Error("Data could not be fetched");

        const data = await response.json();
        setBookings(data.data.bookings);
        setNewVenues(data.data.venues);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBookingsAndVenues();
  }, [accessToken, apiKey, name]);

  //Delete bookings
  const deleteBooking = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_ALL_BOOKINGS}${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
          },
        }
      );

      if (!response.ok) throw new Error("Booking could not be deleted");

      // Remove the booking from the list
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== id)
      );
    } catch (err) {
      alert("Error deleting booking: " + err.message);
    }
  };

  const openAvatarModal = () => setIsAvatarModalVisible(true);
  const closeAvatarModal = () => setIsAvatarModalVisible(false);
  const openNewVenueModal = () => setIsNewVenueModalVisible(true);

  const openEditVenueModal = (venue) => {
    setCurrentVenue(venue);
    setIsNewVenueModalVisible(true);
  };

  const closeNewVenueModal = () => {
    setCurrentVenue(null);
    setIsNewVenueModalVisible(false);
  };

  const handleUpdateVenue = (updatedVenue) => {
    setNewVenues((prevVenues) =>
      prevVenues.map((venue) =>
        venue.id === updatedVenue.id ? updatedVenue : venue
      )
    );
  };

  const handleCreateVenue = (newVenue) => {
    setNewVenues((prevVenues) => [...prevVenues, newVenue]);
  };

  const deleteVenue = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_ALL_VENUES}${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey,
          },
        }
      );

      if (!response.ok) throw new Error("Venue could not be deleted");

      setNewVenues((prevVenues) =>
        prevVenues.filter((venue) => venue.id !== id)
      );
    } catch (err) {
      alert("Error deleting venue: " + err.message);
    }
  };

  const handleVenueManagerToggle = async (event) => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const apiKey = JSON.parse(localStorage.getItem("key"));
    const newVenueManagerStatus = event.target.checked;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_ALL_PROFILES}${userData.name}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            "X-Noroff-API-Key": apiKey.key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ venueManager: newVenueManagerStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update venue manager status");
      }

      setVenueManager(newVenueManagerStatus);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewVenueClick = () => {
    if (!venueManager) {
      alert("Please enable Venue Manager status to create a new venue.");
    } else {
      openNewVenueModal();
    }
  };

  const calculateBookingDetails = (dateFrom, dateTo, venuePrice) => {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const numberOfNights = Math.ceil((to - from) / (1000 * 60 * 60 * 24)); // Calculate nights
    const totalCost = venuePrice * numberOfNights; // Calculate total cost
    return { numberOfNights, totalCost };
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "150vh", color: "#008080" }}
      >
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile-container">
      {profile && (
        <>
          <div className="container-fluid how-works">
            <div className="row row-cols-1 row-cols-md-2 row-cols-sm-2 pb-4 justify-content-center align-items-center">
              <div className="col-md-4 col-xs-5 col-lg-4 col-8 border border-black rounded-5 text-center bg-success-subtle mt-4 pb-4 mx-auto">
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  style={{ width: "60%" }}
                  className="rounded-circle pt-2"
                />
                <button
                  type="button"
                  className="btn btn-primary rounded-5 mt-4 px-4 fs-5"
                  onClick={openAvatarModal}
                >
                  Update Avatar
                </button>
              </div>

              <div className="col-md-7 col-lg-7 col-sm-12 border border-black pt-2 mt-4 pb-4 rounded-5 bg-success-subtle mx-auto">
                <h3 className="ms-4 fw-semibold pb-2">Personal Details</h3>
                <div className="col-lg-11 col-sm-12 border border-black mx-auto pt-2 pb-2 rounded-3">
                  <p className="fw-semibold mx-3 fs-5">
                    <span className="text-primary-emphasis fw-bolder">
                      Name:
                    </span>{" "}
                    {profile.name}
                  </p>
                  <p className="fw-semibold mx-3 fs-5">
                    <span className="text-primary-emphasis fw-bolder">
                      E-mail:
                    </span>{" "}
                    {profile.email}
                  </p>
                  <p className="fw-semibold mx-3 fs-5">
                    <span className="text-primary-emphasis fw-bolder">
                      My Venues:
                    </span>{" "}
                    {profile._count.venues}
                  </p>
                  <p className="fw-semibold mx-3 fs-5">
                    <span className="text-primary-emphasis fw-bolder">
                      My Bookings:
                    </span>{" "}
                    {profile._count.bookings}
                  </p>
                </div>
                <div className="text-center mt-4">
                  <input
                    type="checkbox"
                    id="venueManager"
                    checked={venueManager}
                    onChange={handleVenueManagerToggle}
                  />
                  <label htmlFor="venueManager" className="ms-2 fs-5">
                    Venue Manager
                  </label>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-primary rounded-5 mt-4 px-4 fs-5"
                    onClick={handleNewVenueClick}
                  >
                    Add New Venue
                  </button>
                </div>
              </div>
            </div>

            <div className="tabs mt-5 mx-5">
              <button
                className={`me-4 tab-button ${
                  activeTab === "venues" ? "active" : ""
                }`}
                onClick={() => setActiveTab("venues")}
              >
                My New Venues
              </button>
              <button
                className={`tab-button ${
                  activeTab === "bookings" ? "active" : ""
                }`}
                onClick={() => setActiveTab("bookings")}
              >
                My Bookings
              </button>
            </div>
            <hr></hr>
            {activeTab === "venues" && (
              <div className="row venues-list mb-4">
                <h3 className="text-center mt-5 mb-3">My New Venues</h3>
                {newVenues.length > 0 ? (
                  newVenues.map((venue, index) => (
                    <div
                      key={index}
                      className="col-md-6 mb-4 justify-content-center d-flex"
                    >
                      <div className="card h-100">
                        <div className="row g-0">
                          <div className="col-md-4">
                            <Link to={`/venue/${venue.id}`}>
                              {" "}
                              <img
                                className="img-fluid rounded-start h-100 w-100"
                                src={venue.media?.[0]?.url}
                                alt={venue.name}
                                style={{ objectFit: "cover" }}
                              />{" "}
                            </Link>
                          </div>

                          <div className="col-md-8">
                            <div className="card-body">
                              <Link
                                className="text-decoration-none"
                                to={`/venue/${venue.id}`}
                              >
                                {" "}
                                <h5 className="card-title text-primary-emphasis fw-bold">
                                  {venue.name}
                                </h5>
                              </Link>
                              <p
                                className="card-text"
                                style={{ fontSize: "1.5rem", color: "#008080" }}
                              >
                                {[...Array(5)].map((_, idx) => (
                                  <Star key={idx} filled={idx < venue.rating} />
                                ))}
                                <span className="fs-5 text-black">
                                  {" "}
                                  {venue.rating}.0
                                </span>
                              </p>
                              <p className="card-text">
                                <FontAwesomeIcon icon={faLocationDot} />{" "}
                                {venue.location.city}, {venue.location.country}
                              </p>
                              <div className="d-flex justify-content-start">
                                <Button
                                  className="me-3"
                                  onClick={() => openEditVenueModal(venue)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={() => deleteVenue(venue.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No venues created yet.</p>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="row bookings-list mb-4">
                <h3 className="text-center mt-5 mb-3">My Bookings</h3>
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => {
                    const { numberOfNights, totalCost } =
                      calculateBookingDetails(
                        booking.dateFrom,
                        booking.dateTo,
                        booking.venue.price
                      );

                    return (
                      <div
                        key={index}
                        className="col-md-6 mb-4 justify-content-center d-flex"
                      >
                        <div className="card h-100" style={{ height: "300px" }}>
                          <div className="row g-0">
                            <div className="col-md-5">
                              <Link to={`/venue/${booking.venue.id}`}>
                                <img
                                  className="img-fluid rounded-start  h-100 w-100"
                                  src={booking.venue.media?.[0]?.url}
                                  alt={booking.venue.name}
                                  style={{
                                    objectFit: "cover",
                                    height: "100%",
                                    minHeight: "150px",
                                    maxHeight: "300px",
                                  }}
                                />
                              </Link>
                            </div>
                            <div className="col-md-5 ">
                              <div className="card-body">
                                <Link
                                  className="text-decoration-none"
                                  to={`/venue/${booking.venue.id}`}
                                >
                                  <h5 className="card-title text-primary-emphasis fw-bold fs-3 text-center">
                                    {booking.venue?.name}
                                  </h5>
                                </Link>
                                <p className="card-text">
                                  <strong className="text-primary-emphasis">
                                    Date From:
                                  </strong>{" "}
                                  {new Date(
                                    booking.dateFrom
                                  ).toLocaleDateString()}
                                </p>
                                <p className="card-text">
                                  <strong className="text-primary-emphasis">
                                    Date To:
                                  </strong>{" "}
                                  {new Date(
                                    booking.dateTo
                                  ).toLocaleDateString()}
                                </p>
                                <p className="card-text">
                                  <strong className="text-primary-emphasis">
                                    Guests:
                                  </strong>{" "}
                                  {booking.guests}
                                </p>
                                <p className="card-text">
                                  <strong className="text-primary-emphasis">
                                    Number of Nights:
                                  </strong>{" "}
                                  {numberOfNights}
                                </p>
                                <p className="card-text">
                                  <strong className="text-primary-emphasis">
                                    Total Cost:
                                  </strong>{" "}
                                  ${totalCost}
                                </p>
                              </div>
                            </div>
                            <div
                              className="col-md-2 d-flex justify-content-end my-auto align-items-center pe-2"
                              style={{ height: "60px" }}
                            >
                              <span
                                className="text-danger trash"
                                onClick={() => deleteBooking(booking.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No bookings found.</p>
                )}
              </div>
            )}
          </div>

          <AvatarModal
            isVisible={isAvatarModalVisible}
            onClose={closeAvatarModal}
          />
          <NewVenueModal
            isVisible={isNewVenueModalVisible}
            onClose={closeNewVenueModal}
            accessToken={accessToken}
            apiKey={apiKey}
            initialValues={currentVenue}
            onVenueCreated={handleCreateVenue}
            onVenueUpdated={handleUpdateVenue}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
