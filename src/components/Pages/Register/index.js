import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useNavigate } from "react-router-dom";

export async function submitRegistration(
  name,
  email,
  password,
  avatar = null,
  venueManager = false
) {
  try {
    const response = await fetch(process.env.REACT_APP_API_REGISTER, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        ...(avatar && { avatar }),
        venueManager,
      }),
    });
    console.log(response);
    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "User registration could not be carried out."
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

const schema = yup
  .object({
    name: yup
      .string()
      .required("Name is required")
      .matches(
        /^[\w_]+$/,
        "Name can only contain letters, numbers, and underscores"
      ),
    email: yup
      .string()
      .email("Must be a valid email address")
      .required("Email field cannot be left empty")
      .matches(/@stud\.noroff\.no$/, "Email must be a stud.noroff.no address"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    avatar: yup.object().shape({
      url: yup.string().url("Invalid URL").nullable().notRequired(),
      venueManager: yup.boolean().nullable().notRequired(),
    }),
  })
  .required();

function Register() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();

  const onSubmit = async (d) => {
    const dataToSubmit = {
      name: d.name,
      email: d.email,
      password: d.password,
    };

    if (d.avatar?.url) {
      dataToSubmit.avatar = { url: d.avatar.url };
    }

    if (d.venueManager !== undefined) {
      dataToSubmit.venueManager = d.venueManager;
    }
    try {
      const result = await submitRegistration(
        dataToSubmit.name,
        dataToSubmit.email,
        dataToSubmit.password,
        dataToSubmit.avatar || null,
        dataToSubmit.venueManager || false
      );
      localStorage.setItem("userData", JSON.stringify(result.data));
      alert("Registration successful!");
      reset();
      navigate("/login");
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <Form className="mt-5 mb-5 contact" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-center mt-4">Register</h2>

      <Form.Group>
        <Form.Label> Full Name:</Form.Label>
        <Form.Control type="text" {...register("name")} />
        {errors.name && <p className="text-danger">{errors.name.message}</p>}
      </Form.Group>

      <Form.Group>
        <Form.Label> Email:</Form.Label>
        <Form.Control type="email" {...register("email")} />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
      </Form.Group>

      <Form.Group>
        <Form.Label>Avatar URL:</Form.Label>
        <Form.Control type="url" {...register("avatar.url")} />
        {errors.avatar?.url && (
          <p className="text-danger">{errors.avatar.url.message}</p>
        )}
      </Form.Group>

      <Form.Group>
        <Form.Label>Password:</Form.Label>
        <Form.Control type="password" {...register("password")} />
        {errors.password && (
          <p className="text-danger">{errors.password.message}</p>
        )}
      </Form.Group>

      <Form.Group>
        <Form.Label>Confirm Password:</Form.Label>
        <Form.Control type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-danger">{errors.confirmPassword.message}</p>
        )}
      </Form.Group>

      <Form.Group>
        <Form.Check
          type="checkbox"
          label="Venue Manager"
          {...register("venueManager")}
        />
        {errors.venueManager && (
          <p className="text-danger">{errors.venueManager.message}</p>
        )}
      </Form.Group>

      <Button className="mt-3" type="submit">
        Sign up
      </Button>
      <div className="mt-3">
        Already have an account?
        <Link to={`/login`}> Login </Link>
      </div>
    </Form>
  );
}

export default Register;
