import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../../hooks/apiFetch";
import { useCart } from "../../../context/CartContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faWifi,
  faPaw,
  faMugSaucer,
  faCar,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Carousel } from "react-bootstrap";
import Map from "./map";

function Product() {
  let { id } = useParams();
  const { Star } = useCart();
  const { data, isLoading, isError } = useApi(
    `${process.env.REACT_APP_API_ALL_VENUES}${id}?_owner=true`
  );

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_ALL_VENUES}${id}?_bookings=true&_customer=true&_owner=true`
        );
        if (!response.ok) throw new Error("Failed to fetch bookings");
        const result = await response.json();
        const dates = result.data.bookings.map((booking) => ({
          start: new Date(booking.dateFrom),
          end: new Date(booking.dateTo),
        }));
        setBookedDates(dates);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [id]);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData) {
        return;
      }

      try {
        const apiKey = JSON.parse(localStorage.getItem("key"));

        const response = await fetch(
          `${process.env.REACT_APP_API_ALL_PROFILES}${userData.name}/venues`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userData.accessToken}`,
              "X-Noroff-API-Key": apiKey.key,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch venue");
        const venue = await response.json();

        const isCurrentVenueCreatedByUser = venue.data.some(
          (venue) => venue.id === id
        );

        setIsCreator(isCurrentVenueCreatedByUser);

        const bookingsResponse = await fetch(
          `${process.env.REACT_APP_API_ALL_BOOKINGS}?_venue=true&venueId=${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userData.accessToken}`,
              "X-Noroff-API-Key": apiKey.key,
              "Content-Type": "application/json",
            },
          }
        );

        if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
        const result = await bookingsResponse.json();

        if (result.data && Array.isArray(result.data)) {
          const dates = result.data
            .filter((booking) => booking.venue && booking.venue.id === id)
            .map((booking) => ({
              start: new Date(booking.dateFrom),
              end: new Date(booking.dateTo),
            }));

          setBookedDates(dates);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserAndBookings();
  }, [id]);

  const isDateRangeAvailable = (start, end) => {
    return bookedDates.every((booking) => {
      return start >= booking.end || end <= booking.start;
    });
  };

  if (isLoading || !data) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "150vh", color: "#008080" }}
      >
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  }

  if (isError) {
    return <div>Error</div>;
  }

  const media = data.media || [];

  const handleBooking = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (!userData) {
      alert("You must be logged in to make a booking.");
      return;
    }

    if (!dateFrom || !dateTo) {
      alert("Please fill in all booking details.");
      return;
    }

    if (dateTo <= dateFrom) {
      alert("Checkout date must be at least one day after the check-in date.");
      return;
    }

    if (!isDateRangeAvailable(new Date(dateFrom), new Date(dateTo))) {
      alert("Selected dates are unavailable. Please choose different dates.");
      return;
    }

    setIsBooking(true);
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const apiKey = JSON.parse(localStorage.getItem("key"));
      const response = await fetch(
        `${process.env.REACT_APP_API_ALL_BOOKINGS}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            "Content-Type": "application/json",
            "X-Noroff-API-Key": apiKey.key,
          },
          body: JSON.stringify({
            dateFrom: dateFrom.toISOString(),
            dateTo: dateTo.toISOString(),
            guests: Number(guests),
            venueId: id,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setBookingSuccess(result.data);
        setBookedDates((prevDates) => [
          ...prevDates,
          { start: new Date(dateFrom), end: new Date(dateTo) },
        ]);
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      console.error("Error booking the venue:", error);
      setBookingSuccess(null);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <main>
      <div className="card mb-3 mx-auto mt-1">
        {media.length > 0 && (
          <Carousel>
            {media.map((item, index) => (
              <Carousel.Item key={index}>
                <img
                  className="single-img"
                  key={index}
                  src={item.url}
                  alt={item.alt}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        )}
        <div className="row">
          <div className="col-md-6 ms-4">
            <h3 className="ms-3 text-primary-emphasis fw-bold">{data.name}</h3>
            <div>
              <p
                className="ms-2 mb-0"
                style={{
                  fontSize: "1.5rem",
                  color: "#008080",
                }}
              >
                {[...Array(5)].map((_, index) => (
                  <Star key={index} filled={index < data.rating} />
                ))}
                <span className="fs-5 text-black"> {data.rating}.0</span>
              </p>
            </div>
            <div className="ms-2 mb-3">
              <span className="text-primary-emphasis">
                {" "}
                <FontAwesomeIcon icon={faLocationDot} />
              </span>
              {"  "}
              <span>
                {data.location?.city}, {data.location?.country}
              </span>
            </div>
            <div>
              {data.meta?.wifi && (
                <span className="icon-wrapper me-2">
                  <FontAwesomeIcon icon={faWifi} /> Wifi
                </span>
              )}
              {data.meta?.parking && (
                <span className="icon-wrapper">
                  <FontAwesomeIcon icon={faCar} /> Parking
                </span>
              )}
            </div>
            <div className="mt-2">
              {data.meta?.breakfast && (
                <span className="icon-wrapper me-2">
                  <FontAwesomeIcon icon={faMugSaucer} /> Breakfast
                </span>
              )}
              {data.meta?.pets && (
                <span className="icon-wrapper">
                  <FontAwesomeIcon icon={faPaw} /> Pets{" "}
                </span>
              )}
            </div>
            {/* Left side content */}
            <div className="mt-3">
              <span className="fs-5 text-primary-emphasis">Description</span>
              <p className="">{data.description}</p>
            </div>
            <div className="mb-3">
              <span className="fs-5 text-primary-emphasis">Price: </span>
              <span className="fs-4 ">{data.price}$</span> / per night
            </div>
            <div className="mb-3">
              <span className="fs-5 text-primary-emphasis">Max Guests: </span>
              <span className="fs-4 ">{data.maxGuests}</span>
            </div>

            <div className="mb-5">
              <h5 className="text-primary-emphasis">Venue Manager</h5>
              <div className="venue-manager mt-2">
                <img
                  src={data.owner?.avatar?.url}
                  alt={data.owner?.avatar?.alt}
                  className="avatar ms-2"
                />
                <p className="my-auto">{data.owner?.name}</p>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card-body">
              {isCreator ? (
                <div className="alert alert-info mt-3">
                  You cannot book your own venue.
                </div>
              ) : (
                <div className="mt-4">
                  <h5 className="fw-semibold text-primary-emphasis">
                    Book this venue:
                  </h5>

                  <div className="mb-3 datepicker-wrapper">
                    <label
                      htmlFor="dateFrom"
                      className="form-label datepicker-label text-primary-emphasis fw-semibold"
                    >
                      Check-in
                    </label>
                    <DatePicker
                      selected={dateFrom}
                      onChange={(date) => {
                        setDateFrom(date);
                        if (date && dateTo && date >= dateTo) {
                          setDateTo(null);
                        }
                      }}
                      dateFormat="yyyy/MM/dd"
                      className="form-control"
                      minDate={new Date()}
                      excludeDateIntervals={bookedDates.map((booking) => ({
                        start: new Date(booking.start),
                        end: new Date(booking.end),
                      }))}
                      dayClassName={(date) => {
                        const isBooked = bookedDates.some(
                          (booking) =>
                            date >= booking.start && date <= booking.end
                        );
                        return isBooked ? "disabled-day" : "";
                      }}
                      id="dateFrom"
                    />
                  </div>

                  <div className="mb-3 datepicker-wrapper">
                    <label
                      htmlFor="dateTo"
                      className="form-label datepicker-label text-primary-emphasis fw-semibold"
                    >
                      Check-out
                    </label>
                    <DatePicker
                      selected={dateTo}
                      onChange={(date) => setDateTo(date)}
                      dateFormat="yyyy/MM/dd"
                      className="form-control"
                      minDate={
                        dateFrom
                          ? new Date(dateFrom.getTime() + 24 * 60 * 60 * 1000)
                          : new Date()
                      }
                      excludeDates={bookedDates.reduce((acc, booking) => {
                        let currentDate = new Date(booking.start);
                        const endDate = new Date(booking.end);

                        while (currentDate <= endDate) {
                          acc.push(new Date(currentDate));
                          currentDate.setDate(currentDate.getDate() + 1);
                        }

                        return acc;
                      }, [])}
                      id="dateTo"
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="guests"
                      className="form-label text-primary-emphasis fw-semibold"
                    >
                      Guests:
                    </label>
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      min="1"
                      max={data.maxGuests}
                      className="form-control guests-input"
                      id="guests"
                    />
                  </div>

                  <button
                    onClick={handleBooking}
                    className="btn btn-primary w-50"
                    disabled={isBooking}
                  >
                    {isBooking ? "Booking..." : "Create Booking"}
                  </button>

                  {bookingSuccess && (
                    <div className="mt-3 alert alert-success text-center fs-4">
                      <span className="text-primary-emphasis fw-bold fs-2">
                        <FontAwesomeIcon icon={faCheck} />
                        {"   "}
                      </span>
                      Booking successful
                    </div>
                  )}
                </div>
              )}
              <Map
                city={data.location?.city}
                country={data.location?.country}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Product;
