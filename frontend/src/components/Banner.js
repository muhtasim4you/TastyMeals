import "./Banner.css";

const Banner = () => {
  return (
    <section className="banner">
      <div className="banner-overlay">
        <h1>Delicious Food, Delivered Fast</h1>
        <p>Order from the best restaurants near you and enjoy tasty meals at your doorstep.</p>
        <a href="#top-restaurants" className="banner-btn">Explore Restaurants</a>
      </div>
    </section>
  );
};

export default Banner;
