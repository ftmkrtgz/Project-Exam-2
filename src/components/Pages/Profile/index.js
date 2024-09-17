import React, { useState, useEffect } from "react";
import AvatarModal from "./avatar";
import NewVenueModal from "./myvenue";
import { Button } from "react-bootstrap";

const Profile = () => {
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
        console.log(localStorage.getItem("key"));
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

  if (loading) return <div>Loading...</div>;
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
                  className="btn btn-warning rounded-5 mt-4 px-4 fs-5"
                  onClick={openAvatarModal}
                >
                  Update Avatar
                </button>
              </div>

              <div className="col-md-7 col-lg-7 col-sm-12 border border-black pt-5 mt-4 pb-4 rounded-5 bg-success-subtle mx-auto">
                <h3 className="ms-4 fw-semibold pb-2">Personal Details</h3>
                <div className="col-lg-11 col-sm-12 border border-black mx-auto pt-4 pb-4 rounded-3">
                  <p className="fw-semibold mx-3 fs-5">Name: {profile.name}</p>
                  <p className="fw-semibold mx-3 fs-5">
                    E-mail: {profile.email}
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
                    className="btn btn-warning rounded-5 mt-4 px-4 fs-5"
                    onClick={handleNewVenueClick}
                  >
                    New Venue
                  </button>
                </div>
              </div>
            </div>
            <div className="container">
              <h3 className="text-center mt-5">My New Venues</h3>
              {newVenues.length > 0 ? (
                newVenues.map((venue, index) => (
                  <div key={index} className="venue-details">
                    <img
                      className="card-img-top cart-img"
                      src={venue.media?.[0]?.url}
                      alt={venue.name}
                    />
                    <p>
                      <strong>Name:</strong> {venue.name}
                    </p>
                    <p>
                      <strong>Description:</strong> {venue.description}
                    </p>
                    <p>
                      <strong>Price:</strong> ${venue.price}
                    </p>
                    <p>
                      <strong>Max Guests:</strong> {venue.maxGuests}
                    </p>
                    <p>
                      <strong>Rating:</strong> {venue.rating}
                    </p>
                    <Button onClick={() => openEditVenueModal(venue)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => deleteVenue(venue.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))
              ) : (
                <p>No venues created yet.</p>
              )}
            </div>
            <div className="container mt-5">
              <h3 className="text-center">My Bookings</h3>
              {bookings.length > 0 ? (
                bookings.map((booking, index) => {
                  const { numberOfNights, totalCost } = calculateBookingDetails(
                    booking.dateFrom,
                    booking.dateTo,
                    booking.venue.price
                  );

                  return (
                    <div key={index} className="booking-details">
                      <img
                        className="card-img-top cart-img"
                        src={booking.venue.media?.[0]?.url}
                        alt={booking.venue.name}
                      />
                      <p>
                        <strong>Name:</strong> {booking.venue?.name}
                      </p>
                      <p>
                        <strong>Date From:</strong>{" "}
                        {new Date(booking.dateFrom).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Date To:</strong>{" "}
                        {new Date(booking.dateTo).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Guests:</strong> {booking.guests}
                      </p>
                      <p>
                        <strong>Number of Nights:</strong> {numberOfNights}
                      </p>
                      <p>
                        <strong>Total Cost:</strong> ${totalCost}
                      </p>

                      <Button
                        variant="danger"
                        onClick={() => deleteBooking(booking.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p>No bookings found.</p>
              )}
            </div>
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
