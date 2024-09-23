import React from "react";

const About = () => {
  return (
    <section className="about-section">
      <div className="container">
        <h1 className="text-primary-emphasis fw-bold">About Holidaze</h1>
        <p>
          Welcome to Holidaze, your trusted platform for finding the best
          accommodations around the world. Whether you're looking for a cozy
          cabin in the mountains, a luxurious beachfront villa, or a charming
          city apartment, Holidaze has something for every traveler.
        </p>

        <h2 className="text-primary-emphasis fw-semibold">Our Mission</h2>
        <p>
          At Holidaze, our mission is to make booking accommodations easy,
          transparent, and reliable. We are committed to offering travelers a
          wide range of choices, competitive pricing, and a seamless booking
          experience.
        </p>

        <h2 className="text-primary-emphasis fw-semibold">
          Why Choose Holidaze?
        </h2>
        <ul>
          <li>Wide variety of unique accommodations</li>
          <li>Transparent pricing with no hidden fees</li>
          <li>Easy booking process and secure payments</li>
          <li>Responsive customer support available 24/7</li>
        </ul>

        <h2 className="text-primary-emphasis fw-semibold">Meet the Team</h2>
        <p>
          Our team is made up of passionate individuals who are dedicated to
          helping you find the perfect stay for your next vacation. We work
          tirelessly to ensure that our platform is user-friendly and our
          properties are of the highest quality.
        </p>

        <h2 className="text-primary-emphasis fw-semibold">Contact Us</h2>
        <p>
          If you have any questions or need assistance, feel free to{" "}
          <a href="/contact">contact our team</a>. We’re here to help you every
          step of the way!
        </p>
      </div>
    </section>
  );
};

export default About;
