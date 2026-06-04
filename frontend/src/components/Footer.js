import { FaUtensils } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <FaUtensils className="footer-icon" />
          <h3>TastyMeals</h3>
        </div>
        <div className="footer-about">
          <h4>About TastyMeals</h4>
          <p>
            TastyMeals is Bangladesh's favourite food delivery and profit management platform.
            We connect hungry customers with the best local restaurants across Dhaka
            and beyond, ensuring fresh, delicious meals delivered right to your doorstep.
            Our platform also helps restaurant owners manage their profits and track
            business performance effortlessly. Pay easily with Bkash, Nagad, or Bank Transfer.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TastyMeals. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
