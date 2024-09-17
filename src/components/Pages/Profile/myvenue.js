import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Modal, Button, Form } from "react-bootstrap";

const NewVenueModal = ({
  isVisible,
  onClose,
  onVenueCreated = () => {},
  onVenueUpdated = () => {},
  initialValues = null,
  accessToken,
  apiKey,
}) => {
  const isEditMode = !!initialValues;

  const defaultValues = useMemo(
    () => ({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      media: { url: initialValues?.media?.[0]?.url ?? "" },
      price: initialValues?.price ?? 0,
      maxGuests: initialValues?.maxGuests ?? 0,
      rating: initialValues?.rating ?? 0,
      meta: {
        wifi: initialValues?.meta?.wifi ?? false,
        parking: initialValues?.meta?.parking ?? false,
        breakfast: initialValues?.meta?.breakfast ?? false,
        pets: initialValues?.meta?.pets ?? false,
      },
      location: {
        address: initialValues?.location?.address ?? "",
        city: initialValues?.location?.city ?? "",
        zip: initialValues?.location?.zip ?? "",
        country: initialValues?.location?.country ?? "",
        continent: initialValues?.location?.continent ?? "",
        lat: initialValues?.location?.lat ?? 0,
        lng: initialValues?.location?.lng ?? 0,
      },
    }),
    [initialValues]
  );

  const validationSchema = Yup.object({
    name: Yup.string().required("Venue name is required"),
    description: Yup.string().required("Description is required"),
    price: Yup.number()
      .required("Price is required")
      .test("is-not-zero", "Price is required", (value) => value !== 0)
      .min(0, "Price cannot be negative"),
    maxGuests: Yup.number()
      .required("Max guests is required")
      .test("is-not-zero", "Max guests is required", (value) => value !== 0)
      .min(0, "Max guests cannot be negative"),
    rating: Yup.number()
      .min(0, "Rating cannot be negative")
      .max(5, "Rating cannot exceed 5")
      .nullable()
      .notRequired(),
    media: Yup.object({
      url: Yup.string().url("Invalid URL format").nullable().notRequired(),
    }),
    meta: Yup.object({
      wifi: Yup.boolean().nullable().notRequired(),
      parking: Yup.boolean().nullable().notRequired(),
      breakfast: Yup.boolean().nullable().notRequired(),
      pets: Yup.boolean().nullable().notRequired(),
    }),
    location: Yup.object({
      address: Yup.string().nullable().notRequired(),
      city: Yup.string().nullable().notRequired(),
      zip: Yup.string().nullable().notRequired(),
      country: Yup.string().nullable().notRequired(),
      continent: Yup.string().nullable().notRequired(),
      lat: Yup.number().nullable().notRequired(),
      lng: Yup.number().nullable().notRequired(),
    }),
  });

  const {
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultValues,
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (initialValues) {
      reset(defaultValues);
    }
  }, [initialValues, reset, defaultValues]);

  const onSubmit = async (data) => {
    const formattedVenueDetails = {
      name: data.name,
      description: data.description,
      price: data.price,
      maxGuests: data.maxGuests,
      rating: data.rating || 0,
      media: data.media.url
        ? [{ url: data.media.url, alt: data.name || "Venue Image" }]
        : [],
      meta: {
        wifi: data.meta.wifi || false,
        parking: data.meta.parking || false,
        breakfast: data.meta.breakfast || false,
        pets: data.meta.pets || false,
      },
      location: {
        address: data.location.address || null,
        city: data.location.city || null,
        zip: data.location.zip || null,
        country: data.location.country || null,
        continent: data.location.continent || null,
        lat: data.location.lat || 0,
        lng: data.location.lng || 0,
      },
    };

    try {
      if (!accessToken) throw new Error("API Key or Access Token is missing");

      const url = isEditMode
        ? `${process.env.REACT_APP_API_ALL_VENUES}${initialValues.id}`
        : process.env.REACT_APP_API_ALL_VENUES;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedVenueDetails),
      });

      if (!response.ok) throw new Error("Venue could not be updated/created");

      const venueData = await response.json();

      if (isEditMode) {
        onVenueUpdated(venueData.data);
        alert("Venue updated successfully!");
      } else {
        onVenueCreated(venueData.data);
        alert("Venue created successfully!");
      }

      reset();
      onClose();
    } catch (err) {
      setError("api", { message: err.message });
    }
  };
  if (!isVisible) return null;

  return (
    <Modal show={isVisible} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? "Update Venue" : "Create New Venue"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errors.api && (
          <div className="alert alert-danger">{errors.api.message}</div>
        )}
        <Form id="newVenueForm" onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Venue Name</Form.Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  {...field}
                  isInvalid={!!errors.name}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Form.Control
                  as="textarea"
                  {...field}
                  isInvalid={!!errors.description}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="price">
            <Form.Label>Price</Form.Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="number"
                  {...field}
                  isInvalid={!!errors.price}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.price?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="rating">
            <Form.Label>Rating</Form.Label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="number"
                  min="0"
                  max="5"
                  {...field}
                  isInvalid={!!errors.rating}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.rating?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="maxGuests">
            <Form.Label>Max Guests</Form.Label>
            <Controller
              name="maxGuests"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="number"
                  {...field}
                  isInvalid={!!errors.maxGuests}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.maxGuests?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="media">
            <Form.Label>Image URL</Form.Label>
            <Controller
              name="media.url"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="url"
                  {...field}
                  isInvalid={!!errors.media?.url}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.media?.url?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="wifi"
              label="Wi-Fi"
              {...control.register("meta.wifi")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="parking"
              label="Parking"
              {...control.register("meta.parking")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="pets"
              label="Pets Allowed"
              {...control.register("meta.pets")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="breakfast"
              label="Breakfast"
              {...control.register("meta.breakfast")}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Controller
              name="location.address"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  {...field}
                  isInvalid={!!errors.location?.address}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location?.address?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>City</Form.Label>
            <Controller
              name="location.city"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  {...field}
                  isInvalid={!!errors.location?.city}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location?.city?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="zip">
            <Form.Label>Zip Code</Form.Label>
            <Controller
              name="location.zip"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  {...field}
                  isInvalid={!!errors.location?.zip}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location?.zip?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Controller
              name="location.country"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  {...field}
                  isInvalid={!!errors.location?.country}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location?.country?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="continent">
            <Form.Label>Continent</Form.Label>
            <Controller
              name="location.continent"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  {...field}
                  isInvalid={!!errors.location?.continent}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location?.continent?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="lat">
            <Form.Label>Latitude</Form.Label>
            <Controller
              name="location.lat"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="number"
                  {...field}
                  isInvalid={!!errors.location?.lat}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location?.lat?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="lng">
            <Form.Label>Longitude</Form.Label>
            <Controller
              name="location.lng"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="number"
                  {...field}
                  isInvalid={!!errors.location?.lng}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location?.lng?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Modal.Footer>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Submitting..."
                : isEditMode
                ? "Update Venue"
                : "Create Venue"}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NewVenueModal;
