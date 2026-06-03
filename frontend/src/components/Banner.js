import "./Banner.css";

const Banner = () => {
  return (
    <section className="banner">
      <div className="banner-overlay">
        <h1>Delicious Food, Delivered Fast</h1>
        <p>Order from the best restaurants near you and enjoy tasty meals at your doorstep.</p>
        <button className="banner-btn">Explore Restaurants</button>
      </div>
    </section>
  );
};

export default Banner;
