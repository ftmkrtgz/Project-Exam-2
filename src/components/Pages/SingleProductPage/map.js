import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Map = ({ city, country }) => {
  const [position, setPosition] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city || !country) {
      setError("City or country is not provided.");
      setLoading(false);
      return;
    }

    const geocode = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json&limit=1`
        );
        const data = await response.json();
        if (data.length > 0) {
          setPosition([data[0].lat, data[0].lon]);
        } else {
          setError("Location not found.");
        }
      } catch (err) {
        setError("Error fetching location data.");
      } finally {
        setLoading(false);
      }
    };

    geocode();
  }, [city, country]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", color: "#008080" }}
      >
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>; // Display error message
  }

  const customMarkerIcon = L.divIcon({
    className: "custom-marker",
    html: '<div style="background-color: red; width: 13px; height: 13px;margin-top:15px; border-radius: 50%; border: 2px solid white;"></div>',
  });

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{
          height: "200px",
          width: "90%",
          marginTop: "20px",
          marginBottom: "30px",
          zIndex: 0,
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={customMarkerIcon}>
          <Popup>{`${city.toUpperCase()}, ${country.toUpperCase()}`}</Popup>
        </Marker>
      </MapContainer>
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#000",
          textAlign: "center",
        }}
      >
        {city.toUpperCase()}
      </div>
    </div>
  );
};

export default Map;
