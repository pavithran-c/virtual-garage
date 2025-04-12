import React, { useEffect } from "react";
import "./Contact.css";

const Contact = () => {
  useEffect(() => {
    // Add animation class to elements when component mounts
    const animateElements = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        
        observer.observe(el);
      });
    };

    animateElements();
  }, []);

  return (
    <div className="contact-container">
      <div className="contact-banner animate-on-scroll">
        <div className="banner-overlay">
          <h1>Contact Friends Car Care</h1>
          <p>Your trusted partner for reliable auto services</p>
        </div>
      </div>

      <div className="contact-content">
        {/* Contact Details */}
        <div className="contact-info animate-on-scroll">
          <div className="info-icon">📍</div>
          <h2>Visit Us</h2>
          <div className="info-grid">
            <div className="info-item">
              <i className="fas fa-map-marker-alt"></i>
              <p><strong>Address:</strong> FRIENDS CAR CARE, Kuppanur By-Pass,   <br></br>Salem  Main  Road. SANKARI -637 301.Salem dt.</p>
            </div>
            <div className="info-item">
              <i className="fas fa-phone"></i>
              <p><strong>Phone:</strong> +91 98427 34744 , <br></br>+91 98656 55570   </p>
            </div>
            <div className="info-item">
              <i className="fas fa-envelope"></i>
              <p><strong>Email:</strong> friendscarcare@gmail.com</p>
            </div>
            <div className="info-item">
              <i className="fas fa-clock"></i>
              <p><strong>Working Hours:</strong> Mon - Sat: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="map-container animate-on-scroll">
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

        {/* Updated Contact Form */}
        <div className="contact-form animate-on-scroll">
          <div className="form-header">
            <h2>Send Us a Message</h2>
            <div className="form-icon">🚗</div>
          </div>
          <form>
            <div className="form-group modern-input">
              <label>Name</label>
              <input type="text" required />
            </div>
            <div className="form-group modern-input">
              <label>Email</label>
              <input type="email" required />
            </div>
            <div className="form-group modern-input">
              <label>Message</label>
              <textarea rows="4" required></textarea>
            </div>
            <button type="submit" className="submit-btn modern-btn">
              <span>Send Message</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;