import React from "react";
import useApi from "../../../hooks/apiFetch";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useState } from "react";

function Home() {
  const { Star } = useCart();
  const { data, isLoading, isError } = useApi(
    process.env.REACT_APP_API_ALL_VENUES
  );
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return <div>Loading</div>;
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
        <button className="btn btn-outline-success" type="submit">
          Search
        </button>
      </form>
      <h1 className="text-center mt-3 mb-4">Venues</h1>
      <div className="row row-cols-1 row-cols-md-3 row-cols-sm-2 pb-4  ">
        {filteredProducts.map((venue) => (
          <div className="col mb-4" key={venue.id}>
            <div className="card m-auto">
              <h3 className="card-title text-center">{venue.name}</h3>

              <img
                className="card-img-top cart-img"
                src={venue.media?.[0]?.url}
                alt={venue.name}
              />

              <div className="card-body text-center">
                <div
                  style={{
                    fontSize: "2rem",
                    color: "gold",
                  }}
                >
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} filled={index < venue.rating} />
                  ))}
                </div>
                <div className="d-flex justify-content-around mb-3">
                  <span>{venue.price} $</span>{" "}
                  {/* Fiyat bilgisini venue.price'den alabilirsiniz */}
                </div>
                <div className="d-flex  justify-content-around">
                  <div>
                    <Link to={`/venue/${venue.id}`}>
                      <button className="btn  btn-primary ms-1">
                        View Venue
                      </button>
                    </Link>
                  </div>
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
