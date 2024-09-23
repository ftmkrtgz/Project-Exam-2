import React from "react";
import useApi from "../../../hooks/apiFetch";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faUserGroup,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

function Home() {
  const { Star } = useCart();
  const { data, isLoading, isError } = useApi(
    process.env.REACT_APP_API_ALL_VENUES
  );
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", color: "#008080" }}
      >
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  }

  if (isError) {
    return <div>Error</div>;
  }

  const filteredProducts = data.filter((venue) =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <main>
      <form
        className="d-flex justify-content-center align-items-center my-3 search-form"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-outline-primary" type="submit">
          Search
        </button>
      </form>
      <h1 className="text-center text-primary-emphasis fw-bolder mt-3 mb-4">
        Venues
      </h1>
      <div className="row row-cols-1 row-cols-md-3 row-cols-sm-2 pb-4  ">
        {filteredProducts.map((venue) => (
          <div className="col mb-4" key={venue.id}>
            <div className="card m-auto">
              <img
                className="card-img-top cart-img"
                src={venue.media?.[0]?.url}
                alt={venue.name}
              />
              <div>
                <h3 className="mb-0 ms-3 text-primary-emphasis">
                  {venue.name}
                </h3>
                <p
                  className="ms-3 mb-0"
                  style={{
                    fontSize: "1.5rem",
                    color: "#008080",
                  }}
                >
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} filled={index < venue.rating} />
                  ))}
                  <span className="fs-5 text-black"> {venue.rating}.0</span>
                </p>
              </div>
              <div className="ms-3 mb-3">
                <span className="text-primary-emphasis">
                  {" "}
                  <FontAwesomeIcon icon={faLocationDot} />
                </span>
                {"  "}
                <span>
                  {venue.location.city}, {venue.location.country}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3 mx-4">
                <span>
                  <span className="fs-4  fw-semibold">{venue.price} $ </span>
                  <span className="fs-6 fw-light">/per night</span>
                </span>

                <span>
                  <span className="fs-5 text-primary-emphasis">
                    {" "}
                    <FontAwesomeIcon icon={faUserGroup} />{" "}
                  </span>
                  <span className="fs-4">{venue.maxGuests} </span>
                  <span className="fs-6 fw-light">guests</span>
                </span>
              </div>
              <div className="d-flex  justify-content-around my-auto">
                <div>
                  <Link to={`/venue/${venue.id}`}>
                    <button className="btn btn-primary ms-1 mb-4">
                      View Venue
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Home;
