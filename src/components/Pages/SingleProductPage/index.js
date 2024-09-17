import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../../hooks/apiFetch";
import { useCart } from "../../../context/CartContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Product() {
  let { id } = useParams();
  const { Star } = useCart();
  const { data, isLoading, isError } = useApi(
    `${process.env.REACT_APP_API_ALL_VENUES}${id}`
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
          `${process.env.REACT_APP_API_ALL_VENUES}${id}?_bookings=true&_customer=true`
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
    return <div>Loading</div>;
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
    <>
      <div className="card mb-3 mx-auto mt-5" style={{ maxWidth: "740px" }}>
        <div className="row g-0">
          <div className="col-md-5">
            {media.length > 0 && (
              <div>
                {media.map((item, index) => (
                  <img
                    className="single-img"
                    key={index}
                    src={item.url}
                    alt={item.alt}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="col-md-7">
            <div className="card-body">
              <h3 className="text-center">{data.name}</h3>
              <div
                style={{
                  fontSize: "2rem",
                  color: "gold",
                }}
              >
                {[...Array(5)].map((_, index) => (
                  <Star key={index} filled={index < data.rating} />
                ))}
              </div>
              <p className="card-text">{data.description}</p>
              <div className="d-flex justify-content-around mb-3 mx-4 fs-5">
                <div>{data.price} $</div>
                <div>Max Guests: {data.maxGuests}</div>
              </div>

              {isCreator ? (
                <div className="alert alert-info mt-3">
                  You cannot book your own venue.
                </div>
              ) : (
                <div className="mt-4">
                  <h5>Book this venue:</h5>
                  <div className="mb-3">
                    <label>Date From:</label>
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
                    />
                  </div>
                  <div className="mb-3">
                    <label>Date To:</label>
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
                    />
                  </div>
                  <div className="mb-3">
                    <label>Guests:</label>
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      min="1"
                      max={data.maxGuests}
                      className="form-control"
                    />
                  </div>
                  <button
                    onClick={handleBooking}
                    className="btn btn-success"
                    disabled={isBooking}
                  >
                    {isBooking ? "Booking..." : "Create Booking"}
                  </button>

                  {bookingSuccess && (
                    <div className="mt-3 alert alert-success">
                      Booking successful! Booking ID: {bookingSuccess.id}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <hr className="line" />
        <h3 className="mt-4 mx-5">Reviews:</h3>
        {data.reviews?.length > 0 ? (
          <div className="mx-5">
            <ul>
              {data.reviews.map((review) => (
                <li key={review.id}>
                  <p>
                    <strong>{review.username}</strong> {"      "}
                    <span
                      style={{
                        fontSize: "2rem",
                        color: "gold",
                      }}
                    >
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} filled={index < data.rating} />
                      ))}
                    </span>
                  </p>
                  <p>{review.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center mt-5">There are no reviews yet. </p>
        )}
      </div>
    </>
  );
}

export default Product;
