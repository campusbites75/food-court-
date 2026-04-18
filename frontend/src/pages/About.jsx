import React from "react";
import "./StaticPages.css";

const About = () => {
  return (
    <div className="static-page">
      <h1>About Campus Bites</h1>

      <p>
        Campus Bites is your trusted campus food delivery platform designed
        exclusively for students and faculty. We bring your favorite campus
        cafés and local eateries directly to your hostel, classroom, or office.
      </p>

      <p>
        Our mission is simple — make food ordering fast, affordable, and
        convenient within campus. With just a few clicks, you can enjoy fresh,
        delicious meals without waiting in long queues.
      </p>

      <p>
        We focus on quality, hygiene, and timely delivery to ensure the best
        experience for our campus community.
      </p>

      <h3>Why Choose Us?</h3>
      <ul>
        <li>Fast on-campus delivery</li>
        <li>Affordable student pricing</li>
        <li>Verified campus vendors</li>
        <li>Secure payment options</li>
      </ul>
    </div>
  );
};

export default About;
