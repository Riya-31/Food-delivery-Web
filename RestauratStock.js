// frontend/src/App.js

import React, { useState, useEffect } from "react";
import '../css/RestaurantStock.css';
import { BASE_URL } from '../config';
import { AiOutlineSearch } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoHome } from "react-icons/io5";


const App = () => {

    const [showForm, setShowForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({ name: "", quantity: "", quantityUnit: "", purchaseDate: "", expiryDate: "", categoryName: "" });
    const [newCategory, setNewCategory] = useState("");
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editId, setEditId] = useState(null); // Track which item is being edited
    const [updatedQuantity, setUpdatedQuantity] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [consumption, setconsumption] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newStock, setNewStock] = useState({ quantity: "", purchaseDate: "" });
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024); // Open by default on large screens
    const [showMenu, setShowMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showhistoryModal, setShowhistoryModal] = useState(false);
    const [stockHistory, setStockHistory] = useState([]); // Stores history for selected item only


    // Detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Hide buttons on small screens
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    // Handle the categories sidebar and  screen size changes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setShowSidebar(true); // Always open on large screens
            } else {
                setShowSidebar(false); // Hide on small screens
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);




    const addItem = async () => {
        // Trim input to avoid issues with trailing spaces
        const itemName = newItem.name.trim().toLowerCase();

        // Check if the item already exists in the inventory
        const itemExists = inventory.some(item => item.name.trim().toLowerCase() === itemName);

        if (!newItem.name || !newItem.quantity || !newItem.quantityUnit || !newItem.purchaseDate || !newItem.categoryName) {
            toast.error("All fields are required");
            return;
        }
        if (new Date(newItem.purchaseDate) > new Date()) {
            toast.error("Purchase date cannot be in the future!");
            return;
        }

        if (itemExists) {
            toast.error("This item already exists in inventory.");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/stock/createstockitem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newItem.name,
                    quantityUnit: newItem.quantityUnit,
                    // remainingStock: newItem.quantity, // Initialize with quantity
                    category: newItem.categoryName,
                    stockHistory: [
                        {
                            quantity: newItem.quantity,
                            purchaseDate: newItem.purchaseDate
                        }
                    ]

                }),
            });
            if (!response.ok) {
                throw new toast.error('Failed to add item');
            }
            const savedTask = await response.json();
            setInventory([...inventory, savedTask]);
            setNewItem({ name: "", quantity: "", remainingStock: "", purchaseDate: "", categoryName: "" });
            setShowForm(false);
            toast.success("New item added successfully!");
        } catch (err) {
            console.error(err);
            toast.error('Failed to add new item stock. please try again');
            console.log("Error");

        }



    };

    const addCategory = async () => {
        const trimmedCategory = newCategory.trim().toLowerCase();
        const categoryExists = categories.some(category => category.name.trim().toLowerCase() === trimmedCategory);

        if (!newCategory) {
            toast.error("Category name is required");
            return;
        }
        if (categoryExists) {
            toast.error("This category already exists.");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/stock/createCategory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory }),
            });

            if (!response.ok) throw new toast.error('Failed to add category');

            const savedCategory = await response.json();
            setCategories([...categories, savedCategory]);
            setNewCategory("");
            setShowCategoryForm(false);
            toast.success("Category added successfully!")
        } catch (error) {
            console.error(error);
            toast.error("Error adding category");
        }
    };



    const removeCategory = async (id) => {
        console.log("Attempting to delete category:", id); // Debugging log
        const confirmDelete = window.confirm("Are you sure you want to delete this category?");

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${BASE_URL}/api/stock/deletecat/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                console.error("Failed to delete category. Server responded with:", response.status);
                toast.error("Failed to delete category. Please try again.");
                return;
            }

            const deletedCategory = await response.json();
            console.log("Deleted category:", deletedCategory);

            // Update the state after successful deletion
            setCategories(prevCategories => prevCategories.filter(category => category._id !== id));
            toast.success("Category Deleted Successfully!")
        } catch (err) {
            console.error("Error deleting category:", err);
            toast.error("An error occurred while deleting the category.");
        }
    };


    const deleteItem = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (confirmDelete) {
            try {

                const response = await fetch(`${BASE_URL}/api/stock/deleteitem/${id}`, {
                    method: 'DELETE',

                });
                if (!response.ok) {
                    toast.error("Failed to delete item");
                }
                const updateditem = inventory.filter(item => item._id !== id);
                setInventory(updateditem);
                toast.success("Item deleted successfully!");

            } catch (err) {
                console.error(err);
                toast.error('Failed to delete item.please try again');
            }
        }

    };


    // Item fetch from the backend
    const fetchData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/stock/fetchstockitem`);
            if (!response.ok) {
                throw new Error('Failed to fetch Data');
            }
            const fetchedData = await response.json();
            setInventory(fetchedData);

        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch data. Please try again');
            setError('Failed to fetch data. Please try again');
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    // Fetching the categories of item
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/stock/categories`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories");
                toast.error('Failed to fetch categories. Please try again');
                setError('Failed to fetch data. Please try again');
            }
        };

        fetchCategories();
    }, []);
    useEffect(() => {
        console.log("Fetched Inventory:", inventory);
    }, [inventory]);

    function gotoconsumption() {
        window.location.href = '/consumption';
    }

    function gotoadmin() {
        window.location.href = '/adminHomePage';
    }

    const filteredInventory = inventory.filter((item) => {
        // const matchesCategory = !selectedCategory || item.category === selectedCategory ||  (item.category?._id === selectedCategory);
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

        // If there's a search query, ignore category selection and show matching results
        if (searchQuery.trim() !== "") {
            return matchesSearch;
        }

        // Otherwise, apply category filter
        return matchesCategory;
    });

    // Add new Stock ==============================

    const openModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
        setNewStock({ quantity: "", purchaseDate: "" });
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStock({ ...newStock, [name]: value });
    };

    const handleAddStock = async () => {
        if (!selectedItem || newStock.quantity === "" || newStock.purchaseDate === "") {
            toast.error("Please fill all fields.");
            return;
        }

        if (new Date(newStock.purchaseDate) > new Date()) {
            toast.error("Purchase date cannot be in the future!");
            return;
        }

        try {
            const updatedQuantity = (selectedItem.remainingStock || 0) + Number(newStock.quantity);

            const response = await fetch(`${BASE_URL}/api/stock/updateitem/${selectedItem._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newQuantity: Number(newStock.quantity), // Send only the new stock added
                    updatedTotalQuantity: updatedQuantity, // Send correct total quantity calculation
                    purchaseDate: newStock.purchaseDate,
                }),
            });

            if (!response.ok) throw new Error("Failed to update stock");

            toast.success("Stock updated successfully!");
            closeModal();
            fetchData(); // Refresh the inventory list after update
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update stock");
        }
    };


    // Fetch Stock history 
    const fetchStockHistory = async (itemId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/stock/history/${itemId}`);
            if (!response.ok) throw new Error("Failed to fetch stock history");

            const data = await response.json();
            setStockHistory(data);
            setShowhistoryModal(true); // Open the modal
        } catch (error) {
            console.error("Error fetching stock history:", error);
            toast.error("Error fetching stock history");
        }
    };



    const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format


    return (
        <div className="flex">
            {/* Add Item Form */}
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="stock-Addform">
                {showForm && (
                    <div className="stock-modal">
                        <div className="stock-form">
                            <div className="Additemheading">
                                <h3 style={{ margin: '10px 10px 10px 10px' }}>Add Item </h3>
                                <button className="stocks-close-button"
                                    // style={{ position: 'relative', left: '220px', margin: '10px 10px 10px 10px', top: '0px' }}
                                    onClick={() => setShowForm(false)}>X</button>
                            </div>
                            <div className="modal-stock-input">
                                <label htmlFor="name">Name <span className="required">*</span></label>
                                <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                            </div>
                            <div className="modal-stock-input">
                                <label htmlFor="quantity"> Quantity <span className="required">*</span></label>
                                <input type="number" placeholder="Quantity" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                            </div>
                            <div className="modal-stock-input">
                                <label htmlFor="quantityUnit"> QuantityUnit <span className="required">*</span></label>
                                <select
                                    style={{ margin: '0px 0px 0px 14px', padding: '4px 20px 4px 3px', borderradius: '7px' }}
                                    value={newItem.quantityUnit}
                                    onChange={(e) => setNewItem({ ...newItem, quantityUnit: e.target.value })}
                                >
                                    <option value="">Select Unit</option> {/* Default option */}
                                    <option value="g">Gram</option>
                                    <option value="kg">Kg</option>
                                    <option value="liter">Liter</option>
                                    <option value="ml">Milliliter</option>
                                    <option value="dz">dozen</option>
                                    <option value="piece">piece</option>
                                    <option value="set">set</option>


                                </select>
                            </div>
                            <div className="modal-stock-input">
                                <label htmlFor="date"> Purchase Date <span className="required">*</span></label>
                                <input type="date" value={newItem.purchaseDate} max={today} onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })} />
                            </div>
                            {/* <div className="modal-stock-input">
                                <label htmlFor="date"> Expire Date <span className="required">*</span></label>
                                <input type="date" value={newItem.expiryDate} onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} />
                            </div> */}
                            <div className="modal-stock-input">
                                <label htmlFor="category"> Select Category <span className="required">*</span></label>
                                <select value={newItem.categoryName} onChange={(e) => setNewItem({ ...newItem, categoryName: e.target.value })}
                                    style={{ margin: '0px 0px 0px 14px', padding: '4px 20px 4px 3px', borderradius: '7px' }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category.name}> {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button onClick={addItem}> <strong>Add Item</strong></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Category Form */}
            <div className="stock-Category">
                {showCategoryForm && (
                    <div className="stock-modal">
                        <div className="stock-form">
                            <div className="Additemheading">
                                <h3 style={{ margin: '10px 10px 10px 10px' }}>Add Category </h3>
                                <button className="stock-close-button"
                                    // style={{ position: 'relative', left: '190px', margin: '10px 10px 10px 10px', top: '0px' }}
                                    onClick={() => setShowCategoryForm(false)}>X</button>
                            </div>
                            <div className="modal-stock-input">
                                <label htmlFor="name">Category name <span className="required">*</span></label>
                                <input type="text" placeholder="Category Name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                            </div>
                            <button onClick={addCategory}> <strong>Add Category</strong></button>
                        </div>
                    </div>
                )}
            </div>

            <nav className="stock-navbar">
                {/* <button onClick={() => setShowSidebar(true)} className="p-2 bg-gray-700 hover:bg-gray-600">
                    ☰ Categories
                </button> */}


                <h1 className="navheading">Restaurant Inventory System </h1>
                {error && <p className="error">{error}</p>}
                <div className="stock-nav-rightside" style={{ display: 'flex' }} >
                    <div className="stock-search-container" >
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="stock-search-input"
                            // style={{ padding: '10px 10px 10px 10px', borderRadius: '12px', marginRight: '10px', marginTop: '-1px' }}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <AiOutlineSearch className="stock-search-icon" />
                    </div>

                    <div className="stock-nav-button">
                        {!isMobile ? (
                            <>
                                <button style={{ margin: '0px 20px 5px 0px' }} onClick={() => setShowForm(true)}><strong>Add Items</strong></button>
                                <button onClick={() => setShowCategoryForm(true)}><strong>Add Category</strong></button>
                                <button style={{ margin: '0px 4px 4px 15px' }} onClick={gotoconsumption}><strong>Consumption</strong></button>
                                <button style={{ margin: '0px 4px 0px 12px', padding: '4px 8px 6px 7px', fontSize: '18px' }} onClick={gotoadmin}><strong>  <IoHome style={{ color: '#5E1E42' }} /></strong></button>


                            </>
                        ) : (
                            <div className="menu-container">
                                <button className="menu-button" onClick={() => setShowMenu(!showMenu)}>{showMenu ? "×" : "⋮"}</button>
                                {showMenu && (
                                    <div className="dropdown-menu">
                                        <button onClick={() => { setShowForm(true); setShowMenu(false); }}> <strong>Add Items</strong></button>
                                        <button onClick={() => { setShowCategoryForm(true); setShowMenu(false); }}><strong>Add Category</strong></button>
                                        <button onClick={() => { gotoconsumption(); setShowMenu(false); }}><strong>Consumption</strong></button>
                                        <button onClick={() => { gotoadmin(); setShowMenu(false); }}><strong>Home</strong></button>


                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            <button
                className="sidebar-toggle"
                onClick={() => setShowSidebar(!showSidebar)}
            >
                {showSidebar ? "× Close" : "☰ Categories"}
            </button>
            {/* Sidebar */}
            <div className="leftcolumn">
                {/* {showSidebar && ( */}
                <div className={`stockcategorybox ${showSidebar ? "show-sidebar" : "hide-sidebar"}`}>
                    {/* <button className="stock-cat-button" onClick={() => setShowSidebar(false)}>
                            × Close
                        </button> */}

                    <h3 className="cat-heading"> <strong>Select Category</strong> </h3>
                    <ul className="categorybox">
                        {categories.map((category) => (
                            <li
                                key={category._id}
                                className={`stockcategory ${selectedCategory === category.name ? "bg-gray-600" : ""}`}
                                style={{ position: "relative" }}
                                onClick={() => {
                                    console.log("Selected Category", category.name);
                                    setSelectedCategory(category.name || category._id);
                                }}
                            >
                                <strong>{category.name}</strong>
                                <button className="stockremoveCategory" onClick={(e) => {
                                    e.stopPropagation(); // Prevents parent `li` click
                                    removeCategory(category._id);
                                }}
                                    style={{ backgroundColor: '#E6C29F', color: '#5E1E42', cursor: 'pointer' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* )} */}
                {/* Main Content */}
                <div className="flex-1">

                    {/* Inventory List */}

                    <div className="stock-container">
                        <ul className="stock-list">
                            {filteredInventory.map((item) => (
                                <li key={item._id} className="stock-item"
                                    style={{ backgroundColor: '#5E1E42' }}
                                >
                                    <div className="stock-item-details">
                                        <div className="stock-item-name" style={{ color: '#E6C29F' }}>
                                            {item.name}
                                        </div>
                                        <hr />
                                        <div className="stock-item-remain-details" style={{ color: 'white' }}>
                                            Remaining Quantity: {item.remainingStock} {item.quantityUnit} <br />
                                            {/* {item.stockHistory.length > 0 ? (
                                                <>Purchase Date: {new Date(item.stockHistory[item.stockHistory.length - 1].purchaseDate).toLocaleDateString()}</>
                                            ) : (
                                                <>No Purchase Record</>
                                            )} */}

                                            {item.stockHistory.length > 0 ? (
                                                <>
                                                    Purchase Date:{" "}
                                                    {item.stockHistory[item.stockHistory.length - 1].purchaseDate
                                                        ? new Date(item.stockHistory[item.stockHistory.length - 1].purchaseDate).toLocaleDateString()
                                                        : item.stockHistory[item.stockHistory.length - 1].ConsumptionDate
                                                            ? new Date(item.stockHistory[item.stockHistory.length - 1].ConsumptionDate).toLocaleDateString()
                                                            : "No Purchase Record"}
                                                </>
                                            ) : (
                                                <>No Purchase Record</>
                                            )}

                                        </div>
                                    </div>
                                    <div className="item-btn" style={{ margin: '5px 0px 0px 0px' }}>
                                        <button className="stock-delete-button" onClick={() => deleteItem(item._id)}> <strong>Delete</strong> </button>
                                        <button className="stock-edit-button" onClick={() => openModal(item)}> <strong>Add New Stock</strong></button>
                                        <button className="stock-History-button" style={{ margin: '0px 11px 0px 0px' }} onClick={() => fetchStockHistory(item._id)}> <strong>History</strong> </button>


                                    </div>


                                </li>

                            ))}
                        </ul>


                        {/* New Stock Modal */}
                        {showModal && selectedItem && (
                            <div className="newstockmodal">
                                <div className="newstockmodal-content">
                                    <div className="Adding-stock-Heading">
                                        <h3>Add New Stock for {selectedItem.name}</h3>
                                        <button onClick={closeModal} className="newstock-cancel-btn">X</button>
                                    </div>
                                    <div className="modal-stock-input">
                                        <label htmlFor="quantity"> New Quantity: <span className="required">*</span></label>
                                        <input
                                            className="newstock-input"
                                            type="number"
                                            name="quantity"
                                            min="0"
                                            value={newStock.quantity}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="modal-stock-input">
                                        <label htmlFor="quantity"> New Purchase Date:<span className="required">*</span></label>

                                        <input
                                            type="date"
                                            name="purchaseDate"
                                            max={today}
                                            value={newStock.purchaseDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <button onClick={handleAddStock}>Submit</button>

                                </div>
                            </div>
                        )}

                        {/* Stock History Modal */}
                        {showhistoryModal && (
                            <div className="Inventory-modal-overlay">
                                <div className="Inventory-modal-content">
                                    <div className="history-heading">
                                        <h3>Stock History</h3>
                                        <button onClick={() => setShowhistoryModal(false)} className="Inventory-close-button">X</button>
                                    </div>

                                    {stockHistory.length > 0 ? (
                                        <ul>
                                            {stockHistory.map((entry, index) => (
                                                <li key={index} className="Inventory-history-item"
                                                    style={{ color: entry.value === "Consumption" ? "red" : "green" }}>
                                                    <strong>{entry.value}:</strong> {entry.quantity}{entry.quantityUnit}  &nbsp;  &nbsp;
                                                    <strong>Date:</strong> {new Date(entry.purchaseDate || entry.ConsumptionDate).toLocaleDateString()}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No stock history available</p>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default App;
