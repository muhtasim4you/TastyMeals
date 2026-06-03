import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import "./TopRestaurants.css";

const restaurants = [
  {
    id: 1,
    name: "The Spice Garden",
    cuisine: "Indian",
    rating: 4.8,
    location: "Downtown",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.7,
    location: "Midtown",
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Bella Italia",
    cuisine: "Italian",
    rating: 4.9,
    location: "Westside",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Burger Bliss",
    cuisine: "American",
    rating: 4.6,
    location: "East End",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Dragon Wok",
    cuisine: "Chinese",
    rating: 4.5,
    location: "Chinatown",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.7,
    location: "Southside",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
  },
];

const TopRestaurants = () => {
  return (
    <section className="top-restaurants">
      <h2 className="section-title">Top Restaurants</h2>
      <p className="section-subtitle">Recommended for you</p>
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="restaurant-card">
            <div className="card-image">
              <img src={restaurant.image} alt={restaurant.name} />
              <span className="cuisine-badge">{restaurant.cuisine}</span>
            </div>
            <div className="card-info">
              <h3>{restaurant.name}</h3>
              <div className="card-details">
                <span className="rating">
                  <FaStar className="star-icon" /> {restaurant.rating}
                </span>
                <span className="location">
                  <FaMapMarkerAlt /> {restaurant.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopRestaurants;
