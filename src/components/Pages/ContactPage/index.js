import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const schema = yup
  .object({
    fullName: yup
      .string()
      .required("Please enter your full name")
      .min(3, "Your full name should be at least 3 characters."),
    subject: yup
      .string()
      .required("Please enter your subject")
      .min(3, "Your subject should be at least 3 characters."),
    email: yup
      .string()
      .email("Must be a valid email address")
      .required("Email field cannot be left empty"),
    body: yup
      .string()
      .required("Please enter body")
      .min(3, "Body should be at least 3 characters."),
  })
  .required();

function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (d) => {
    alert("The contact form has been sent successfully.");
    reset();
  };

  return (
    <Form className="mt-5 mb-5 contact" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-center mt-4">Contact Form</h2>
      <Form.Group>
        <Form.Label> Full Name:</Form.Label>
        <Form.Control type="text" {...register("fullName")} />
      </Form.Group>
      <p className="text-danger">{errors.fullName?.message}</p>
      <Form.Group>
        <Form.Label> Subject:</Form.Label>
        <Form.Control type="text" {...register("subject")} />
      </Form.Group>
      <p className="text-danger">{errors.subject?.message}</p>
      <Form.Group>
        <Form.Label> Email:</Form.Label>
        <Form.Control type="text" {...register("email")} />
      </Form.Group>
      <p className="text-danger">{errors.email?.message}</p>
      <Form.Group>
        <Form.Label> Body:</Form.Label>
        <Form.Control as="textarea" rows={3} {...register("body")} />
      </Form.Group>
      <p className="text-danger">{errors.body?.message}</p>
      <Button type="submit">Submit</Button>
    </Form>
  );
}

export default Contact;
