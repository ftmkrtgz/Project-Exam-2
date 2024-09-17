import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useNavigate } from "react-router-dom";

export async function login(email, password) {
  try {
    const response = await fetch(process.env.REACT_APP_API_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed. Please check your credentials.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

const schema = yup
  .object({
    email: yup
      .string()
      .email("Must be a valid email address")
      .required("Email field cannot be left empty"),
    password: yup.string().required("Please enter your password"),
  })
  .required();

function Login() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);

      localStorage.setItem("userData", JSON.stringify(result.data));
      window.dispatchEvent(new Event("login"));
      alert("Successfully logged in.");
      reset();
      navigate("/profile");
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <Form className="mt-5 mb-5 contact" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-center mt-4">Login</h2>

      <Form.Group>
        <Form.Label> Email:</Form.Label>
        <Form.Control type="text" {...register("email")} />
      </Form.Group>
      <p className="text-danger">{errors.email?.message}</p>
      <Form.Group>
        <Form.Label> Password:</Form.Label>
        <Form.Control type="password" {...register("password")} />
      </Form.Group>
      <p className="text-danger">{errors.password?.message}</p>

      <Button type="submit">Login</Button>
      <div>
        Don't have an account?
        <Link to={`/register`}> Create an account </Link>
      </div>
    </Form>
  );
}

export default Login;
