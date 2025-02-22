import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-banner">
        <h1>Contact Friends Car Care</h1>
        <p>Your trusted partner for reliable auto services</p>
      </div>

      <div className="contact-content">
        {/* Contact Details */}
        <div className="contact-info">
          <h2>📍 Visit Us</h2>
          <p><strong>Address:</strong> 123 Main Street, City, Country</p>
          <p><strong>Phone:</strong> +1 234 567 890</p>
          <p><strong>Email:</strong> contact@friendscarcare.com</p>
          <p><strong>Working Hours:</strong> Mon - Sat: 9:00 AM - 6:00 PM</p>
        </div>

        {/* Google Map (Embed Your Location) */}
        <div className="map-container">
          <iframe
            title="Friends Car Care Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.8008754335706!2d77.87190327489347!3d11.494283988701502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba95e3e310837d7%3A0x530acf67217dbdb0!2sFriends%20Car%20Care!5e0!3m2!1sen!2sin!4v1739555043460!5m2!1sen!2sin"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

        {/* Contact Form */}
        <div className="contact-form">
          <h2>📩 Send Us a Message</h2>
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="4" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
