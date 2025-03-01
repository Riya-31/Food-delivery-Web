import React, { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
// import Footer from './Footer';
import io from "socket.io-client";
import Alert from "@mui/material/Alert";
import "../css/Menu.css";
import { BsCart4 } from "react-icons/bs";
import { AiOutlineSearch } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { BASE_URL } from "../config";
import { LiaShoppingCartSolid } from "react-icons/lia";

const SideNavBar = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [cart, setCart] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState("");
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalItemsInCart, setTotalItemsInCart] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Trying to connect socket...", `${BASE_URL}`);
    const socket = io(`${BASE_URL}`);

    socket.on('deleteCategory', (updatedCategory) => {
      console.log(`Updated category for delete:`, updatedCategory);

      setCategories(prevCategories =>
        prevCategories.filter(category => category._id !== updatedCategory._id)
      );
    });

    return () => {
      socket.off('deleteCategory');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("Trying to connect socket...", `${BASE_URL}`);
    const socket = io(`${BASE_URL}`);

    socket.on('addItem', (updatedItem) => {
      console.log(`Updated item:`, updatedItem);

      setSubCategories(prevCategories => {
        const exists = prevCategories.some(cat => cat.category === updatedItem.category);

        if (exists) {
          return prevCategories.map(category =>
            category._id === updatedItem._id ? { ...updatedItem } : category
          );
        } else {
          return [...prevCategories];
        }
      });
    });

    return () => {
      socket.off('addItem');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("Trying to connect socket...", `${BASE_URL}`);
    const socket = io(`${BASE_URL}`);

    socket.on('addCategory', (updatedCategory) => {
      console.log(`Updated category:`, updatedCategory);

      setCategories(prevCategories => {
        const exists = prevCategories.some(cat => cat._id === updatedCategory._id);

        if (exists) {
          return prevCategories.map(category =>
            category._id === updatedCategory._id ? { ...updatedCategory } : category
          );
        } else {
          return [...prevCategories, updatedCategory];
        }
      });
    });

    return () => {
      socket.off('addCategory');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/items/category`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => console.error("Error fetching categories: ", error));
  }, []);

  const fetchSubCategories = (category) => {
    setSelectedCategory(category);
    fetch(`${BASE_URL}/api/items/getItems/${encodeURIComponent(category)}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched subcategories:", data);
        setSubCategories(data);
      })
      .catch((error) => console.error("Error fetching subcategories: ", error));
  };

  // useEffect(() => {
  //   // Retrieve the total items in the cart from sessionStorage
  //   const totalItems = parseInt(sessionStorage.getItem("totalItemsInCart")) || 0;

  //   // Set the totalItemsInCart state
  //   setTotalItemsInCart(totalItems);
  // }, []);

  const handleToggleChange = () => {
    setIsToggleOn((prev) => !prev);
    setSidebarOpen((prev) => !prev);
    console.log("Sidebar open:", !sidebarOpen ? "OPEN" : "CLOSED");
  };

  const handleLogoClick = () => {
    navigate("/");
  }

  // const handleIncrement = (itemId) => {
  //   setCart((prevCart) => {
  //     const newQuantity = prevCart[itemId] ? prevCart[itemId] + 1 : 1;
  //     return { ...prevCart, [itemId]: newQuantity };
  //   });
  // };

  // const handleDecrement = (itemId) => {
  //   setCart((prevCart) => {
  //     const newQuantity = prevCart[itemId] > 1 ? prevCart[itemId] - 1 : 0;
  //     return { ...prevCart, [itemId]: newQuantity };
  //   });
  // };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleExploreClick = () => {
    setIsToggleOn((prev) => !prev);
    setSidebarOpen((prev) => !prev);
    console.log("Sidebar open:", !sidebarOpen ? "OPEN" : "CLOSED");
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setSelectedMeasurement(item.quantity[0].measurement);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setSelectedMeasurement("");
  };

  const confirmAddToCart = () => {
    if (selectedItem) {
      const selectedQuantityObj = selectedItem.quantity.find((q) => q.measurement === selectedMeasurement);
      const selectedQuantity = 1;

      const itemWithDetails = {
        ...selectedItem,
        measurement: selectedMeasurement,
        quantity: selectedQuantity,
        price: selectedQuantityObj.price,
      };

      let existingCart = JSON.parse(localStorage.getItem("Cart")) || [];
      const existingItemIndex = existingCart.findIndex(
        (cartItem) =>
          cartItem._id === selectedItem._id &&
          cartItem.measurement === selectedMeasurement
      );

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += selectedQuantity;
      } else {
        existingCart.push(itemWithDetails);
      }

      localStorage.setItem("Cart", JSON.stringify(existingCart));
      setSnackbarMessage(
        ` ${selectedItem.name
        } (${selectedMeasurement}) added to cart for ₹${selectedQuantityObj.price * selectedQuantity} Please update your quantity from Cart page`
      );
      setSnackbarOpen(true);
      window.dispatchEvent(new Event("cartUpdated"));
      handleCloseModal();
    }
  };

  const addItemToCart = (item) => {
    if (item.quantity.length > 1) {
      // If item has multiple measurements, open the modal to select
      handleOpenModal(item);
    } else {
      // If item has only one measurement, directly add it to the cart
      const selectedQuantity = cart[item._id] || 1;
      const itemPrice = item.quantity[0].price;
      const itemWithDetails = {
        ...item,
        quantity: selectedQuantity,
        price: itemPrice,
      };

      // Get the current cart from localStorage or initialize it
      let existingCart = JSON.parse(localStorage.getItem("Cart")) || [];

      // Find if the item already exists in the cart
      const existingItemIndex = existingCart.findIndex(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItemIndex > -1) {
        // If the item exists, update the quantity
        existingCart[existingItemIndex].quantity += selectedQuantity;
      } else {
        // If the item doesn't exist, add it to the cart
        existingCart.push(itemWithDetails);
      }

      // Update the cart in localStorage
      localStorage.setItem("Cart", JSON.stringify(existingCart));

      // Update the total number of items in the cart
      // const totalItemsInCart = existingCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      // setTotalItemsInCart(totalItemsInCart);

      setCart((prevCart) => ({
        ...prevCart,
        [item._id]: prevCart[item._id] ? prevCart[item._id] + selectedQuantity : selectedQuantity,
      }));

      // // Show the snackbar message
      setSnackbarMessage(
        ` ${item.name} added to cart for ₹${itemPrice * selectedQuantity}`
      );
      setSnackbarOpen(true);

      // Dispatch the cartUpdated event
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // function for search functionality
  const handleSearch = (query) => {
    if (!query) {
      setSubCategories([]); // Clear the displayed items when the search query is empty
      return; // Exit early
    }

    fetch(`${BASE_URL}/api/items/`)
      .then((response) => response.json())
      .then((items) => {
        console.log("Response", items);
        // Filter items that match the search query
        const filteredItems = items.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );
        console.log("filteredItems:", filteredItems);
        if (filteredItems.length > 0) {
          setSubCategories(filteredItems); // Update the displayed items
        } else {
          setSubCategories([]); // Show no results
          setSnackbarMessage("No items matched your search.");
          setSnackbarOpen(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching items: ", error);
        setSnackbarMessage("Error fetching items. Please try again.");
        setSnackbarOpen(true);
      });
  };

  //Update on cart page icon------------------------------
  const updateCartCount = () => {
    // Recalculate total items from localStorage
    const existingCart = JSON.parse(localStorage.getItem("Cart")) || [];
    const totalItems = existingCart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemsInCart(totalItems);
  };

  useEffect(() => {
    // Initial cart count calculation on component mount
    updateCartCount();

    // Listen for the 'cartUpdated' event to refresh cart count
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      // Clean up the event listener
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const updateCartData = () => {
      // Recalculate total items from localStorage
      const existingCart = JSON.parse(localStorage.getItem("Cart")) || [];
      // Update cart state
      const newCartState = existingCart.reduce((acc, item) => {
        acc[item._id] = item.quantity;
        return acc;
      }, {});

      setCart(newCartState);

      // Update total items count
      const totalItems = existingCart.reduce((sum, item) => sum + item.quantity, 0);
      setTotalItemsInCart(totalItems);
    };
    // Initial cart update
    updateCartData();
    // Listen for 'cartUpdated' event to refresh cart state and count
    window.addEventListener("cartUpdated", updateCartData);

    return () => {
      // Cleanup event listener
      window.removeEventListener("cartUpdated", updateCartData);
    };
  }, []);

  const handleIncrement = (itemId) => {
    console.log("increment calling");

    const oldQuantity = cart[itemId] ?? 0;
    console.log("carts", oldQuantity);

    const newQuantity = oldQuantity + 1;
    console.log("New Quantity:", newQuantity);

    setCart((prevCart) => ({
      ...prevCart,
      [itemId]: newQuantity
    }));

    let cartData = JSON.parse(localStorage.getItem("Cart")) || [];
    let itemIndex = cartData.findIndex((item) => item._id === itemId);

    if (itemIndex > -1) {
      cartData[itemIndex].quantity = newQuantity;
    } else {
      cartData.push({ _id: itemId, quantity: newQuantity });
    }

    localStorage.setItem("Cart", JSON.stringify(cartData));
    window.dispatchEvent(new Event("cartUpdated")); // 🔥 Sync with Cart Page
  };

  const handleDecrement = (itemId) => {
    const oldQuantity = cart[itemId] ?? 0;
    const newQuantity = oldQuantity - 1;
    setCart((prevCart) => ({
      ...prevCart,
      [itemId]: newQuantity
    }));
    // Update localStorage
    let cartData = JSON.parse(localStorage.getItem("Cart")) || [];
    let itemIndex = cartData.findIndex((item) => item._id === itemId);
    if (itemIndex > -1) {
      if (newQuantity === 0) {
        cartData.splice(itemIndex, 1);
      } else {
        cartData[itemIndex].quantity = newQuantity;
      }
    }

    localStorage.setItem("Cart", JSON.stringify(cartData));
    window.dispatchEvent(new Event("cartUpdated")); // 🔥 Sync with Cart Page
  };

  return (
    <div className="page-container">
      <div className="bodyR">
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box className="modal-box">
            <h2>SELECT MEASUREMENT</h2>
            <RadioGroup value={selectedMeasurement} onChange={(e) => setSelectedMeasurement(e.target.value)}>
              {selectedItem &&
                selectedItem.quantity.map((q) => (
                  <FormControlLabel key={q._id} value={q.measurement} control={<Radio />} label={`${q.measurement} - ₹${q.price}`} />
                ))}
            </RadioGroup>
            <Button onClick={confirmAddToCart}>Add to Cart</Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </Box>
        </Modal>

        <div>
          <div className="headM">
            <button className="menuB" onClick={handleToggleChange} style={{ backgroundColor: '#d9b99b', border: 'none', color: '#270317', borderRadius: '0', position: 'relative' }}><b className="icon">☰</b></button>
            <img onClick={handleLogoClick} src="/images/8-removebg-preview.png" alt="Devlok Food Street and Resort" style={{ width: "200px", height: "4.5px", cursor: "pointer", marginTop: '7px' }} />
          </div>
          <div className="cart-containerr">
            <div className="search-container">
              <input type="text" placeholder="Search items..." className="search-input" onChange={(e) => handleSearch(e.target.value)} />
              <AiOutlineSearch className="search-icon" />
            </div>
          </div>
          <div className="cart-container" onClick={handleCartClick}>
            <BsCart4 className="cart-icon" style={{ color: "#d9b99b" }} />
            {totalItemsInCart > 0 && (
              <span className="cart-count">{totalItemsInCart}</span>
            )}
          </div>
        </div>
        {/* <div className="marquee">
          <p>
            🍝 𝙒𝙝𝙚𝙧𝙚 𝙩𝙝𝙚 𝙩𝙖𝙨𝙩𝙚 𝙤𝙛 𝙩𝙝𝙚 𝙢𝙤𝙪𝙣𝙩𝙖𝙞𝙣𝙨 𝙢𝙚𝙚𝙩𝙨 𝙩𝙝𝙚 𝙨𝙤𝙪𝙡 𝙤𝙛 𝙝𝙤𝙨𝙥𝙞𝙩𝙖𝙡𝙞𝙩𝙮 🍝
          </p>
        </div> */}
        {/* Sidebar */}
        <div className={`side-nav ${sidebarOpen ? "open" : ""}`}>
          <div className="side-nav-list">
            {categories.map((category) => (
              <div key={category._id} className="side-nav-item">
                <img src={`${BASE_URL}/${category.image}`} alt={category.name} className="category-image" onClick={() => fetchSubCategories(category.name)} style={{ cursor: "pointer" }} />
                <span className="category-name" onClick={() => fetchSubCategories(category.name)}                >
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Main content */}

        <div className="main-content">
          {subCategories.length > 0 ? (
            <>
              {selectedCategory && (
                <h2 className="main-title">{selectedCategory}</h2>
              )}
              <div className="sub-category-grid">
                {subCategories.map((subCat) => (
                  <div key={subCat._id} className="sub-category-card">
                    <div className="image-containerr">
                      <img src={`${BASE_URL}/${subCat.image}`} alt={subCat.name} className="sub-category-image" />
                      {/* <button className="cart-icon-btn" onClick={() => addItemToCart(subCat)} disabled={subCat.quantity.length === 1 && cart[subCat._id]}>
                        {subCat.quantity.length === 1 && cart[subCat._id]
                          ? "Added"
                          : <LiaShoppingCartSolid size={30} />}
                      </button> */}
                    </div>

                    <div className="card-content">
                      <h3 className="sub-category-name">{subCat.name}</h3>
                      <p className="sub-category-description">{subCat.description}</p>
                      <h4 className="sub-category-price">
                        Price: ₹{" "}
                        {subCat.quantity && subCat.quantity.length > 0
                          ? subCat.quantity[0].price
                          : "N/A"}
                      </h4>
                      {/* {cart[subCat._id] && subCat.quantity.length === 1 && (
                        <div className="quantity-container">
                          <button
                            className="quantity-btn"
                            onClick={() => handleDecrement(subCat._id)}
                          >
                            -
                          </button>
                          <span className="quantity-display">
                            {cart[subCat._id] || 0}
                          </span>
                          <button
                            className="quantity-btn"
                            onClick={() => handleIncrement(subCat._id)}
                          >
                            +
                          </button>
                        </div>
                      )} */}
                      {cart[subCat._id] && subCat.quantity.length === 1 ? (
                        <div className="quantity-container">
                          <button className="quantity-btn" onClick={() => handleDecrement(subCat._id)}>
                            -
                          </button>
                          <span className="quantity-display">
                            {cart[subCat._id] || 0}
                          </span>
                          <button className="quantity-btn" onClick={() => handleIncrement(subCat._id)}>
                            +
                          </button>
                        </div>
                      ) : (
                        <button className="cart-icon-btn" onClick={() => addItemToCart(subCat)}>
                          <LiaShoppingCartSolid size={30} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="welcome-container">
              {/* <img
              src="/images/welcome.png"
              alt="Welcome"
              className="welcome-image"
            /> */}
              <h2 className="welcome-text">
                Please click on the Menu button  <br />
                and select your favorite food items. Enjoy your meal! 🍽️😊
                {/* Select a category to explore items! */}
              </h2>
              <button className="explore-button" onClick={handleExploreClick}>
                Explore Menu
              </button>
            </div>
          )}
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{
            zIndex: 14000
          }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{
              width: "100%",
              bgcolor: "white",
              color: "black",
              border: "2px solid #5a3e36",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.4)",
              "& .MuiAlert-icon": {
                color: "#f1c40f",
              },
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <footer className="responsive-footer"></footer>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default SideNavBar;
