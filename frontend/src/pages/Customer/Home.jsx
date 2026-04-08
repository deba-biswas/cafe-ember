import React, { useState, useEffect } from "react";
import MenuFilter from "../../components/MenuFilter";
import MenuItemCard from "../../components/MenuItemCard";
import HeroImg from "../../assets/HeroCover.png";

// Home page displaying menu items with search and category filters
const Home = () => {
  // Menu and cart state
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cafeCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch menu from backend on mount
  useEffect(() => {
    const fetchLiveMenu = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/menu");

        if (response.ok) {
          const data = await response.json();
          setMenuItems(data.menu);
        } else {
          setError("Failed to load the menu from the server.");
        }
      } catch {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMenu();
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("cafeCart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart or increment quantity
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem._id === item._id,
      );

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Extract unique categories
  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  // Filter menu based on search and category
  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#faf7f5] dark:bg-gray-900">
      {/* Hero section */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={HeroImg}
          alt="Cafe Hero"
          className="w-full h-full object-cover"
        />

        {/* Overlay for contrast */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

        {/* Gradient fade into page background */}
        <div className="absolute inset-0 bg-linear-to-t from-[#faf7f5] dark:from-gray-900 to-transparent pointer-events-none" />

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-playfair font-extrabold text-white mb-3">
            Café <span className="text-[#cb6b3b]">Ember</span>
          </h1>

          <p className="text-white/90 text-sm md:text-lg max-w-md">
            Handcrafted drinks & fresh bites, made with love
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-400 w-[95%] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-10">
        {/* Filter controls */}
        <MenuFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        {/* Menu grid */}
        <section>
          {loading ? (
            // Loading state
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 border-4 border-coffee-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            // Error state
            <div className="bg-red-100 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : filteredMenu.length === 0 ? (
            // Empty state
            <div className="text-center py-12 rounded-3xl">
              <p className="text-xl">No items found matching "{searchQuery}"</p>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 text-coffee-accent font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            // Menu items grid
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {filteredMenu.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  addToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
