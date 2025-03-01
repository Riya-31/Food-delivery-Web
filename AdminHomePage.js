import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CircularProgress, List, ListItem, ListItemText, Grid, Paper, AppBar, Toolbar, IconButton, Drawer, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { BASE_URL } from '../config';
import io from "socket.io-client";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { MdOutlinePendingActions } from "react-icons/md";
import { PiCookingPotBold, PiChefHatBold } from "react-icons/pi";
import { SiTicktick } from "react-icons/si";
import { VscGraph } from "react-icons/vsc";
import { CgLogOut } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { MdRestaurantMenu } from "react-icons/md";
import { RiDiscountPercentLine } from "react-icons/ri";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Tooltip from '@mui/material/Tooltip';
import Swal from 'sweetalert2';
import DeleteIcon from '@mui/icons-material/Delete';
import { InputAdornment } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createGlobalStyle } from "styled-components";
import { motion } from "framer-motion";

// Global Styles for DatePicker Popup (Calendar)
const GlobalStyles = createGlobalStyle`
.react-datepicker {
    background: #5E1E42 !important; /* Deep Plum */
    border-radius: 10px;
    padding: 10px;
    color: #F8F8F8 !important; /* Ivory White */
    border: 1px solid #E6C29F !important; /* Champagne Gold */
    box-shadow: 0px 4px 12px rgba(230, 194, 159, 0.5); /* Soft Gold Shadow */
}

.react-datepicker__header {
    background-color: #3A1B2C !important; /* Deep Mauve */
    border-bottom: 1px solid #E6C29F !important; /* Champagne Gold */
}

.react-datepicker__day-names .react-datepicker__day-name {
    color: #E6C29F !important; /* Champagne Gold */
}

.react-datepicker__current-month,
.react-datepicker-time__header,
.react-datepicker-year-header {
    color: #E6C29F !important; /* Champagne Gold */
    font-weight: bold;
}

.react-datepicker__day {
    color: #F8F8F8 !important; /* Ivory White */
}

.react-datepicker__day:hover {
    background: #E6C29F !important; /* Champagne Gold */
    color: #5E1E42 !important; /* Deep Plum */
    border-radius: 50%;
    transition: all 0.3s ease-in-out;
}

.react-datepicker__day--selected {
    background: #E6C29F !important; /* Champagne Gold */
    color: #5E1E42 !important; /* Deep Plum */
    font-weight: bold;
    border-radius: 50%;
    transition: all 0.3s ease-in-out;
}

.react-datepicker__day--today {
    border: 1px solid #E6C29F !important; /* Champagne Gold outline for today */
    border-radius: 50%;
}

.react-datepicker__navigation {
    top: 10px !important;
}

.react-datepicker__navigation-icon::before {
    border-color: #E6C29F !important; /* Champagne Gold navigation arrows */
}
`;

const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 }, // Start smaller
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

function AdminHomePage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openDrawer, setOpenDrawer] = useState(false); // State to control the Drawer (sidebar)
    const [activeSection, setActiveSection] = useState("pendingOrders"); // State to control which section is active (Pending Orders, Reports)
    const [items, setItems] = useState([]);
    const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
    const [openEditItemDialog, setOpenEditItemDialog] = useState(false);
    const [formData, setFormData] = useState({
        item_Id: '',
        name: '',
        category: '',
        image: '',
        images: null,
        description: '',
        quantity: [{ measurement: '', price: '' }],
    });
    const [coupons, setCoupons] = useState([]);
    const [openEditCouponDialog, setOpenEditCouponDialog] = useState(false);
    const [openAddCouponDialog, setOpenAddCouponDialog] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [openAddCategoryDialog, setOpenAddCategoryDialog] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [categoryImage, setCategoryImage] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [chefs, setChefs] = useState([]);
    const [openAddChefDialog, setOpenAddChefDialog] = useState(false);

    const navigate = useNavigate(); // Initialize navigate hook

    useEffect(() => {
        console.log("Trying to connect socket...", `${BASE_URL}`);
        const socket = io(`${BASE_URL}`);

        socket.on('orderPlaced', (newOrder) => {
            setOrders(prevOrders => [...prevOrders, newOrder]);
        });

        return () => {
            socket.off('orderPlaced');
            socket.disconnect();
        };
    }, []);

    const fetchOrders = async (date) => {
        setLoading(true);
        setError("");
        try {
            const formattedDate = date.toISOString().split("T")[0]; // Format the date for the backend
            const response = await fetch(`${BASE_URL}/api/admin/fetchOrderByDate?date=${formattedDate}`);
            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (err) {
            setError("Error fetching orders. Please try again later.");
            Swal.fire({ title: 'Error!', text: `An error occurred while fetching the orders: ${err}`, icon: 'error', confirmButtonText: 'OK' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(selectedDate); // Fetch orders whenever the selected date changes
    }, [selectedDate]); // Dependency on selectedDate

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/coupon/getAllCoupon`);
                const data = await response.json();
                setCoupons(data);
            } catch (error) {
                Swal.fire({ title: 'Error!', text: `An error occurred while fetching coupons: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
            }
        };
        fetchCoupons();
    }, []);

    useEffect(() => {
        const fetchChefs = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/chef/getAllChefs`);
                const data = await response.json();
                if (data.chefs) {
                    setChefs(data.chefs);  // Extract chefs array from the response
                } else {
                    console.error("No chefs found in the response");
                }
            } catch (error) {
                Swal.fire({ title: 'Error!', text: `An error occurred while fetching chefs: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
            }
        };
        fetchChefs();
    }, []);

    useEffect(() => {
        // Fetch the categories when the component loads
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/items/category`);
                const data = await response.json();
                setCategories(data);  // Set the categories state
            } catch (err) {
                setError('Failed to load categories');
            }
        };

        fetchCategories();
    }, []);

    const handleUpdateItem = async (event) => {
        event.preventDefault(); // Prevents default form submission

        const itemId = formData.item_Id; // Extract item ID from formData
        const updatedData = { ...formData }; // Extract updated data from formData

        try {
            const response = await fetch(`${BASE_URL}/api/items/update/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Error updating item');
            }

            const updatedItem = await response.json();
            setItems((prevItems) => prevItems.map((item) => (item.item_Id === itemId ? updatedItem : item)));
            Swal.fire({ title: 'Success!', text: 'The item updated successfully.', icon: 'success', confirmButtonText: 'OK' });
            handleClose(); // Close the dialog after successful update
        } catch (error) {
            Swal.fire({ title: 'Error!', text: `An error occurred while updating item: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
        }
    };

    // Handle Edit Item (Prefill data for editing)
    const handleEditItemClick = (item) => {
        setFormData({
            item_Id: item.item_Id,
            name: item.name,
            category: item.category,
            image: item.image.startsWith('/images/') ? item.image.replace('/images/', '') : item.image,
            description: item.description,
            quantity: item.quantity,
        });
        setOpenEditItemDialog(true);
    };

    // Handle Item Delete
    const handleDeleteItemClick = async (item) => {
        const { isConfirmed } = await Swal.fire({
            title: `Are you sure you want to delete the item: "${item.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (!isConfirmed) return;

        try {
            const response = await fetch(`${BASE_URL}/api/items/deleteItem/${item.item_Id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire({ title: 'Error!', text: `Failed to delete item: ${errorData.message}`, icon: 'error', confirmButtonText: 'OK' });
                return;
            }

            const updatedItem = await response.json();
            setItems((prevItems) => prevItems.filter((i) => i.item_Id !== item.item_Id));
            Swal.fire({ title: 'Success!', text: 'The item deleted successfully.', icon: 'success', confirmButtonText: 'OK' });
        } catch (error) {
            Swal.fire({ title: 'Error!', text: `An error occurred while deleting the item: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
        }
    };

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);  // Toggle the Drawer open/close
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        setOpenDrawer(false);  // Close the drawer when a menu item is clicked
    };

    const handleLogOut = async () => {
        setOpenDrawer(false);
        const { isConfirmed } = await Swal.fire({
            title: `Are you sure you want to logout?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, go ahead!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (!isConfirmed) return;

        navigate("/adminLogin", { replace: true });
    }
    // Filter orders based on their status
    const pendingOrdersHere = orders.filter(order => order.orderStatus === 0);
    const preparingOrders = orders.filter(order => order.orderStatus === 1);
    const completedOrders = orders.filter(order => order.orderStatus === 2);

    const handleAddItemClickOpen = () => {
        setFormData({
            item_Id: "",
            name: "",
            category: "",
            image: "",
            images: null,
            description: "",
            quantity: [{ measurement: "", price: "" }]
        });
        setOpenAddItemDialog(true);
    };

    const handleClose = () => {
        setOpenEditItemDialog(false);
        setOpenAddItemDialog(false);
        setOpenAddCouponDialog(false);
        setOpenEditCouponDialog(false);
        setOpenAddCategoryDialog(false);
        setOpenAddChefDialog(false);
        setNewCategory("");
        setCategoryImage(null);
        setError("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleQuantityChange = (index, field, value) => {
        const updatedQuantity = [...formData.quantity];
        updatedQuantity[index][field] = value;
        setFormData({ ...formData, quantity: updatedQuantity });
    };

    // Function to add a new quantity entry
    const addQuantityField = () => {
        setFormData({
            ...formData,
            quantity: [...formData.quantity, { measurement: "", price: "" }]
        });
    };

    // Function to remove a quantity entry
    const removeQuantityField = (index) => {
        const newQuantity = [...formData.quantity];
        newQuantity.splice(index, 1);
        setFormData({ ...formData, quantity: newQuantity });
    };

    const handleSubmitItem = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();

        // Append all other fields to formData
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'quantity') {
                // Serialize 'quantity' array to JSON
                formDataToSend.append(key, JSON.stringify(value));
            } else if (key !== 'images') {
                formDataToSend.append(key, value);
            }
        });

        // Append the image file
        if (formData.images) {
            formDataToSend.append('images', formData.images);
        }

        try {
            const response = await fetch(`${BASE_URL}/api/items/addItem`, {
                method: 'POST',
                body: formDataToSend, // Don't stringify FormData
            });

            // Handle errors based on status codes
            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    Swal.fire({
                        title: 'Duplicate Item!',
                        text: 'Item with the same ID already exists.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false, // Prevents closing by clicking outside
                        allowEscapeKey: false,    // Prevents closing by pressing Escape
                        didOpen: () => {
                            document.querySelector('.swal2-popup').style.zIndex = '2000';
                            document.querySelector('.swal2-container').style.zIndex = '2000';
                        }
                    });
                    // setOpenAddItemDialog(false);
                } else {
                    throw new Error('Error creating item');
                }
                return;
            }

            const updatedItem = await response.json();
            setItems((prevItems) => [...prevItems, updatedItem]);
            Swal.fire({ title: 'Success!', text: 'The item was created successfully.', icon: 'success', confirmButtonText: 'OK', });
            setOpenAddItemDialog(false);
        } catch (error) {
            Swal.fire({ title: 'Error!', text: `An error occurred while creating the item: ${error.message}`, icon: 'error', confirmButtonText: 'OK', });
        }
    };

    const handleAddCouponClickOpen = () => {
        setFormData({
            code: "",
            expire: "",
            applicable: "",
            amount: "",
            minOrder: "",
            unit: "",
            maxLimit: ""
        });
        setOpenAddCouponDialog(true);
    };

    const handleAddChefClickOpen = () => {
        setFormData({
            name: "",
            email: "",
            password: ""
        });
        setOpenAddChefDialog(true);
    };

    const handleSubmitCoupon = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${BASE_URL}/api/coupon/addCoupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    Swal.fire({
                        title: 'Duplicate Coupon!',
                        text: 'Coupon with the same code already exists.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false, // Prevents closing by clicking outside
                        allowEscapeKey: false,    // Prevents closing by pressing Escape
                        didOpen: () => {
                            document.querySelector('.swal2-popup').style.zIndex = '2000';
                            document.querySelector('.swal2-container').style.zIndex = '2000';
                        }
                    });
                } else {
                    throw new Error('Error creating coupon');
                }
                return;
            }

            const updatedCoupon = await response.json();
            setCoupons((prevCoupons) => [...prevCoupons, updatedCoupon]);
            Swal.fire({ title: 'Success!', text: 'The coupon created successfully', icon: 'success', confirmButtonText: 'OK' });
            setOpenAddCouponDialog(false);
        } catch (error) {
            Swal.fire({ title: 'Error!', text: `An error occurred while creating the coupon: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
        }
    };

    const handleSubmitChef = async (event) => {
        event.preventDefault();
        if (formData.password.length <= 4) {
            Swal.fire({
                title: 'Error!',
                text: 'The chef password should be more then 5 digits long',
                icon: 'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false, // Prevents closing by clicking outside
                allowEscapeKey: false, // Prevents closing by pressing Escape
                didOpen: () => {
                    document.querySelector('.swal2-popup').style.zIndex = '2000';
                    document.querySelector('.swal2-container').style.zIndex = '2000';
                }
            });
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/api/chef/createChef`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    Swal.fire({
                        title: 'Duplicate Chef Email!',
                        text: 'Chef with the same email ID already exists.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false, // Prevents closing by clicking outside
                        allowEscapeKey: false, // Prevents closing by pressing Escape
                        didOpen: () => {
                            document.querySelector('.swal2-popup').style.zIndex = '2000';
                            document.querySelector('.swal2-container').style.zIndex = '2000';
                        }
                    });
                } else {
                    throw new Error('Error creating chef');
                }
                return;
            }

            // Fetch the updated list of chefs
            const updatedResponse = await fetch(`${BASE_URL}/api/chef/getAllChefs`);
            if (!updatedResponse.ok) {
                throw new Error('Error fetching updated chefs');
            }

            const updatedChefs = await updatedResponse.json();
            setChefs(updatedChefs.chefs); // Update the state with the new list of chefs

            Swal.fire({
                title: 'Success!',
                text: 'The chef is created successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            setOpenAddChefDialog(false);
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: `An error occurred while creating the chef: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleDeleteChefClick = async (chefs) => {
        const { isConfirmed } = await Swal.fire({
            title: `Are you sure you want to delete the data of chef: "${chefs.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (!isConfirmed) return;

        try {
            const response = await fetch(`${BASE_URL}/api/chef/deleteChef/${chefs._id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseBody = await response.text(); // Get the raw response text

            // Log the response to check the content
            console.log('Response:', responseBody);

            if (!response.ok) {
                // Attempt to parse the response as JSON if it's valid
                try {
                    const errorData = JSON.parse(responseBody);
                    Swal.fire({ title: 'Error!', text: `Failed to delete chef data: ${errorData.message}`, icon: 'error', confirmButtonText: 'OK' });
                    return;
                } catch (err) {
                    Swal.fire({ title: 'Error!', text: 'Server error: Unable to process JSON', icon: 'error', confirmButtonText: 'OK' });
                    return;
                }
            }
            const data = JSON.parse(responseBody); // If the response is JSON
            setChefs(prevChefs => prevChefs.filter((chefItem) => chefItem._id !== chefs._id));
            Swal.fire({ title: 'Success!', text: 'The data of chef was deleted successfully.', icon: 'success', confirmButtonText: 'OK' });
        } catch (error) {
            Swal.fire({ title: 'Error!', text: `An error occurred while deleting the chef data: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
        }
    };

    const handleUpdateCoupon = async (event) => {
        event.preventDefault(); // Prevents default form submission

        const code = formData.code; // Extract coupon code from formData
        const updatedData = { ...formData }; // Extract updated data from formData

        try {
            const response = await fetch(`${BASE_URL}/api/coupon/updateCoupon/${code}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Error updating coupon');
            }

            const updatedCoupon = await response.json();;
            setCoupons((prevCoupons) => prevCoupons.map((coupon) => coupon.code === code ? { ...coupon, ...updatedData } : coupon));
            Swal.fire({ title: 'Success!', text: 'The coupon updated successfully.', icon: 'success', confirmButtonText: 'OK' });
            handleClose(); // Close the dialog after successful update
        } catch (error) {
            Swal.fire({ title: 'Error!', text: `An error occurred while updating the coupon: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
        }
    };

    const handleEditCouponClick = (coupon) => {
        setFormData({
            code: coupon.code,
            expire: coupon.expire,
            applicable: coupon.applicable,
            amount: coupon.amount,
            minOrder: coupon.minOrder,
            unit: coupon.unit,
            maxLimit: coupon.maxLimit
        });
        setOpenEditCouponDialog(true);
    };

    const handleDeleteCouponClick = async (code) => {
        const { isConfirmed } = await Swal.fire({
            title: `Are you sure you want to delete the coupon: "${code}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (!isConfirmed) return;

        try {
            const response = await fetch(`${BASE_URL}/api/coupon/deleteCoupon/${code}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire({ title: 'Error!', text: `Failed to delete coupon: ${errorData.message}`, icon: 'error', confirmButtonText: 'OK' });
                return;
            }

            const updatedCoupon = await response.json();
            setCoupons((prevCoupons) => prevCoupons.filter((coupon) => coupon.code !== code));
            Swal.fire({ title: 'Success!', text: 'The coupon was deleted successfully.', icon: 'success', confirmButtonText: 'OK' });
        } catch (error) {
            Swal.fire({ title: 'Error!', text: `An error occurred while deleting the coupon: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0]; // Get the selected file
        setFormData((prev) => ({ ...prev, images: file })); // Store the file in state
    };

    const handleCategoryChange = async (category) => {
        setSelectedCategory(category);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/api/items/getItems/${category}`);
            const data = await response.json();
            setItems(data);  // Set items based on selected category
        } catch (err) {
            setError('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            setError("Category name cannot be empty");
            return;
        }

        // Create FormData to send the data along with the image
        const formDataToSend = new FormData();

        // Append the category name
        formDataToSend.append('name', newCategory.trim());

        // Append the image if it's present
        if (categoryImage) {  // Assuming `categoryImage` is the file from the file input
            formDataToSend.append('image', categoryImage);
        }

        let response; // Declare response properly
        try {
            response = await fetch(`${BASE_URL}/api/items/category`, {
                method: "POST",
                body: formDataToSend, // Send FormData directly (no need for headers)
            });

            const responseData = await response.json(); // Store the parsed JSON response

            if (response.ok) {
                setCategories((prevCategories) => [...prevCategories, responseData]); // Update categories
                Swal.fire({ title: 'Success!', text: 'The category was created successfully', icon: 'success', confirmButtonText: 'OK' });
                setNewCategory("");
                setCategoryImage(null);
                setError("");
                handleClose(); // Close the dialog
            } else {
                if (response.status === 400) {
                    Swal.fire({
                        title: 'Duplicate Category Name!',
                        text: 'A category with the same name already exists.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            document.querySelector('.swal2-popup').style.zIndex = '2000';
                            document.querySelector('.swal2-container').style.zIndex = '2000';
                        }
                    });
                } else {
                    throw new Error(responseData.message || 'Failed to add category');
                }
            }
        } catch (err) {
            console.error('Error creating category:', err);
            Swal.fire({ title: 'Error!', text: `An error occurred: ${err.message}`, icon: 'error', confirmButtonText: 'OK' });
        }
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the first file from the input
        if (file) {
            setCategoryImage(file); // Store the file in state
        }
    };

    const handleOpenAddCategoryDialog = () => {
        setOpenAddCategoryDialog(true);
    };

    const handleCategoryDelete = async (categoryId) => {
        const { isConfirmed } = await Swal.fire({
            title: `Are you sure you want to delete this category?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (!isConfirmed) return;

        try {
            const response = await fetch(`${BASE_URL}/api/items/category/${categoryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete category');
            }

            const result = await response.json();
            setCategories((prevCategories) => prevCategories.filter(category => category._id !== categoryId));
            Swal.fire({ title: 'Success!', text: `The category deleted successfully`, icon: 'success', confirmButtonText: 'OK' });
        } catch (error) {
            Swal.fire({ title: 'Error!', text: `An error occurred while deleting the category: ${error.message}`, icon: 'error', confirmButtonText: 'OK' });
        }
    };

    
     // Inventory and Consumption Navigation
     function gotoconsumption() {
        window.location.href = '/consumption';
    }

    function Gotoinventory() {
        window.location.href = '/stock';
    }

    return (
        <>
            {/* AppBar with menu icon */}
            <AppBar position="fixed" sx={{ zIndex: 1250, backgroundColor: "#5E1E42", color: '#E6C29F' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        DEVLOK FOOD STREET AND RESORT
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Drawer (left sidebar) */}
            <Drawer anchor="left" open={openDrawer} onClose={toggleDrawer} sx={{ zIndex: 1200, width: 250, flexShrink: 0, marginTop: '0', '.MuiDrawer-paper': { top: '60px' } }} >
                <Box sx={{ paddingTop: '10px', width: 250, height: 'calc(100% - 50px)', display: 'flex', flexDirection: 'column', backgroundColor: "#d9b99b", }} role="presentation" >
                    {/* Close button inside the Drawer */}
                    <IconButton onClick={toggleDrawer} sx={{ alignSelf: 'flex-end', padding: 1, color: "#5E1E42" }}>
                        <CloseIcon />
                    </IconButton>
                    <List>
                        <ListItem button onClick={() => handleSectionChange("pendingOrders")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <MdOutlinePendingActions style={{ fontSize: '22px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Pending Orders" />
                        </ListItem>
                        <ListItem button onClick={() => handleSectionChange("preparingOrders")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <PiCookingPotBold style={{ fontSize: '21px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Preparing Orders" />
                        </ListItem>
                        <ListItem button onClick={() => handleSectionChange("completedOrders")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <SiTicktick style={{ fontSize: '17px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Completed Orders" />
                        </ListItem>
                        <ListItem button onClick={() => handleSectionChange("items")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <MdRestaurantMenu style={{ fontSize: '21px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Items" />
                        </ListItem>
                        <ListItem button onClick={() => handleSectionChange("coupons")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <RiDiscountPercentLine style={{ fontSize: '21px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Coupons" />
                        </ListItem>
                        <ListItem button onClick={() => handleSectionChange("chef")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <PiChefHatBold style={{ fontSize: '21px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Chefs" />
                        </ListItem>
                        {/* <ListItem button onClick={() => handleSectionChange("reports")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <VscGraph style={{ fontSize: '21px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Reports" />
                        </ListItem> */}
                          <ListItem button onClick={() => Gotoinventory("Restaurant Inventory")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <VscGraph style={{ fontSize: '21px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Restaurant Inventory" />
                        </ListItem>
                        <ListItem button onClick={() => gotoconsumption("Update Consumption")} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <VscGraph style={{ fontSize: '21px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="Update Consumption" />
                        </ListItem>
                        <ListItem button onClick={() => handleLogOut()} sx={{
                            backgroundColor: "#5E1E42", color: "#E6C29F", marginBottom: '10px',
                            '&:hover': {
                                cursor: 'pointer', // Add hover effect
                                backgroundColor: "#3A1B2C",
                            },
                        }} >
                            <CgLogOut style={{ fontSize: '21px', paddingRight: '5px' }} />{" "}
                            <ListItemText primary="LogOut" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box sx={{ py: 4, marginLeft: 0, height: '95vh' }} >
                {activeSection === "pendingOrders" && (
                    <motion.div initial="hidden" animate="visible" variants={scaleInVariants}>
                        <Typography variant="h4" gutterBottom sx={{
                            textAlign: "center", paddingTop: "50px", paddingBottom: "10px", display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                        }} >
                            <b sx={{ color: "#3A1B2C" }}>Pending Orders</b>
                            <GlobalStyles /> {/* Apply global styles */}
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="yyyy-MM-dd"
                                calendarClassName="custom-calendar"
                                popperProps={{
                                    modifiers: [
                                        {
                                            name: "preventOverflow",
                                            options: {
                                                boundary: "window",
                                            },
                                        },
                                    ],
                                }}
                                customInput={
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        placeholder="Select a date"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarToday sx={{ color: "#E6C29F", fontSize: "18px" }} />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: "8px",
                                                backgroundColor: "#5E1E42", // Deep Plum Background
                                                fontSize: "14px",
                                                color: "#F8F8F8", // Ivory White Text
                                                cursor: "pointer",
                                                transition: "all 0.3s ease-in-out",
                                                "&:hover": {
                                                    borderColor: "#E6C29F", // Champagne Gold on hover
                                                    boxShadow: "0px 4px 8px rgba(230, 194, 159, 0.5)", // Soft glow
                                                },
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#3A1B2C" }, // Deep Mauve border
                                                    "&:hover fieldset": { borderColor: "#E6C29F" }, // Champagne Gold on hover
                                                    "&.Mui-focused fieldset": { borderColor: "#E6C29F" }, // Champagne Gold focus
                                                },
                                                "& input": {
                                                    textAlign: "center",
                                                    cursor: "pointer",
                                                    color: "#F8F8F8", // Ivory White Text
                                                },
                                                "&::placeholder": {
                                                    color: "#E6C29F", // Champagne Gold placeholder
                                                },
                                            },
                                        }}
                                    />
                                }
                            />
                        </Typography>
                        {loading ? (
                            <CircularProgress />
                        ) : error ? (
                            <Typography color="error">{error}</Typography>
                        ) : pendingOrdersHere.length > 0 ? (
                            <Grid container spacing={2}>
                                {pendingOrdersHere
                                    .sort((a, b) => b.onPriority - a.onPriority) // Sort by priority, showing prioritized orders first
                                    .map((order) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={order._id}>
                                            <Paper
                                                sx={{
                                                    padding: 2,
                                                    boxShadow: 3,
                                                    borderRadius: "8px",
                                                    height: "300px",
                                                    maxWidth: "100%",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    backgroundColor: "#5E1E42", // Deep Plum Background
                                                    color: "#E6C29F",
                                                    transition: "all 0.3s ease-in-out", // Smooth transition for hover effect
                                                    "&:hover": {
                                                        transform: "scale(1.05)", // Zoom-in effect
                                                        boxShadow: "0px 6px 12px #3a1b2c",
                                                    },
                                                }}
                                            >
                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginBottom: 1, fontSize: "20px" }} >
                                                    Order No.: {order.orderNo}
                                                </Typography>
                                                <Typography variant="body2" sx={{ marginBottom: 1, color: "#F8F8F8" }}>
                                                    Type: {order.type}
                                                    <br />
                                                    Total Amount: ₹{order.totalAmount}
                                                    <br />
                                                    Mode of Payment: {order.modeOfPayment}
                                                    <br />
                                                    Order ID: {order.orderId}
                                                    <br />
                                                    Payment ID: {order.paymentId}
                                                </Typography>
                                                <Box sx={{ flex: 1, overflow: "auto", padding: "4px" }}>
                                                    <List>
                                                        {order.items.map((item, index) => (
                                                            <ListItem key={index} sx={{ padding: "6px 0" }}>
                                                                <ListItemText
                                                                    primary={
                                                                        <>
                                                                            {item.name}
                                                                            {item.measurement && (
                                                                                <Typography
                                                                                    component="span"
                                                                                    sx={{ color: "#E6C29F", fontWeight: "bold", marginLeft: "4px" }}
                                                                                >
                                                                                    {item.measurement}
                                                                                </Typography>
                                                                            )}
                                                                            {" x "}
                                                                            {item.quantity}
                                                                        </>
                                                                    }
                                                                    secondary={
                                                                        <Typography sx={{ color: "#F8F8F8", fontSize: "12px" }}>
                                                                            Price: ₹{item.price}
                                                                        </Typography>
                                                                    }
                                                                    sx={{ marginBottom: 0 }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Box>
                                                <Button
                                                    variant="contained"
                                                    sx={{
                                                        marginTop: "10px",
                                                        backgroundColor: "#3A1B2C",
                                                        color: '#E6C29F',
                                                        transition: "all 0.3s ease-in-out",
                                                        "&:hover": {
                                                            backgroundColor: "#7A2E5D",
                                                            boxShadow: "0px 4px 10px rgba(230, 194, 159, 0.6)",
                                                            transform: "scale(1.08)", // Button also zooms slightly on hover
                                                        },
                                                        "&.Mui-disabled": {
                                                            backgroundColor: "#4E1A32", // Custom disabled color (darker mauve)
                                                            color: "#A78E8E", // Light grayish text to indicate it's disabled
                                                            opacity: 0.7, // Slight transparency
                                                            cursor: "not-allowed",
                                                        },
                                                    }}
                                                    onClick={async () => {
                                                        try {
                                                            if (order.onPriority === 0) {
                                                                const response = await fetch(`${BASE_URL}/api/admin/priority/${order.orderId}`, {
                                                                    method: "PUT",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                    },
                                                                });
                                                                if (response.ok) {
                                                                    const updatedOrder = await response.json();
                                                                    setOrders((prevOrders) =>
                                                                        prevOrders.map((o) =>
                                                                            o.orderId === updatedOrder.order.orderId ? updatedOrder.order : o
                                                                        )
                                                                    );
                                                                    Swal.fire({
                                                                        title: "Success!",
                                                                        text: "The order priority updated successfully.",
                                                                        icon: "success",
                                                                        confirmButtonText: "OK",
                                                                    });
                                                                } else {
                                                                    const errorData = await response.json();
                                                                    Swal.fire({
                                                                        title: "Error!",
                                                                        text: `Failed to update the order priority: ${errorData.message}`,
                                                                        icon: "error",
                                                                        confirmButtonText: "OK",
                                                                    });
                                                                }
                                                            }
                                                        } catch (error) {
                                                            Swal.fire({
                                                                title: "Error!",
                                                                text: `Failed to update order priority: ${error.message}`,
                                                                icon: "error",
                                                                confirmButtonText: "OK",
                                                            });
                                                        }
                                                    }}
                                                    disabled={order.onPriority !== 0} // Disable if priority is not 0
                                                >
                                                    {order.onPriority === 0 ? "SET ON PRIORITY" : "ON PRIORITY"}
                                                </Button>
                                            </Paper>
                                        </Grid>
                                    ))}
                            </Grid>
                        ) : (
                            // <Typography sx={{ paddingLeft: "30px" }}>No pending orders for now.</Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",  // Align items vertically
                                    alignItems: "center",     // Center items horizontally
                                    justifyContent: "center", // Center items vertically
                                    height: "100%",          // Take full height of the viewport
                                }}
                            >
                                <img src="/Enjoy Food 4.gif" alt="No Orders" style={{ width: "200px", height: "200px", marginBottom: "20px" }} />
                                <Typography sx={{ paddingLeft: "30px", textAlign: "center" }}>
                                    No pending orders for now.
                                </Typography>
                            </Box>
                        )}
                    </motion.div>
                )}

                {activeSection === "preparingOrders" && (
                    <motion.div initial="hidden" animate="visible" variants={scaleInVariants}>
                        <Typography variant="h4" gutterBottom sx={{
                            textAlign: "center", paddingTop: "50px", paddingBottom: "10px", display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                        }} >
                            <b sx={{ color: "#3A1B2C" }}>Preparing Orders</b>
                            <GlobalStyles /> {/* Apply global styles */}
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="yyyy-MM-dd"
                                calendarClassName="custom-calendar"
                                popperProps={{
                                    modifiers: [
                                        {
                                            name: "preventOverflow",
                                            options: {
                                                boundary: "window",
                                            },
                                        },
                                    ],
                                }}
                                customInput={
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        placeholder="Select a date"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarToday sx={{ color: "#E6C29F", fontSize: "18px" }} />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: "8px",
                                                backgroundColor: "#5E1E42", // Deep Plum Background
                                                fontSize: "14px",
                                                color: "#F8F8F8", // Ivory White Text
                                                cursor: "pointer",
                                                transition: "all 0.3s ease-in-out",
                                                "&:hover": {
                                                    borderColor: "#E6C29F", // Champagne Gold on hover
                                                    boxShadow: "0px 4px 8px rgba(230, 194, 159, 0.5)", // Soft glow
                                                },
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#3A1B2C" }, // Deep Mauve border
                                                    "&:hover fieldset": { borderColor: "#E6C29F" }, // Champagne Gold on hover
                                                    "&.Mui-focused fieldset": { borderColor: "#E6C29F" }, // Champagne Gold focus
                                                },
                                                "& input": {
                                                    textAlign: "center",
                                                    cursor: "pointer",
                                                    color: "#F8F8F8", // Ivory White Text
                                                },
                                                "&::placeholder": {
                                                    color: "#E6C29F", // Champagne Gold placeholder
                                                },
                                            },
                                        }}
                                    />
                                }
                            />
                        </Typography>
                        {loading ? (
                            <CircularProgress />
                        ) : error ? (
                            <Typography color="error">{error}</Typography>
                        ) : preparingOrders.length > 0 ? (
                            <Grid container spacing={2}>
                                {preparingOrders && preparingOrders.length > 0 && preparingOrders.map((order) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={order._id}>
                                        <Paper
                                            sx={{
                                                padding: 2,
                                                boxShadow: 3,
                                                borderRadius: "8px",
                                                height: "300px",
                                                maxWidth: "100%",
                                                overflow: "hidden",
                                                display: "flex",
                                                flexDirection: "column",
                                                backgroundColor: "#5E1E42", // Deep Plum Background
                                                color: "#E6C29F",
                                                transition: "all 0.3s ease-in-out", // Smooth transition for hover effect
                                                "&:hover": {
                                                    transform: "scale(1.05)", // Zoom-in effect
                                                    boxShadow: "0px 6px 12px #3a1b2c",
                                                },
                                            }}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 1 }}                                            >
                                                Order No.: {order.orderNo}
                                            </Typography>
                                            <Typography variant="body2" sx={{ marginBottom: 1, color: "#F8F8F8" }}>
                                                Type: {order.type}
                                                <br />
                                                Total Amount: ₹{order.totalAmount}
                                                <br />
                                                Mode of Payment: {order.modeOfPayment}
                                                <br />
                                                Order ID: {order.orderId}
                                                <br />
                                                Payment ID: {order.paymentId}
                                            </Typography>
                                            <Box sx={{ flex: 1, overflow: 'auto', padding: '4px' }} >
                                                <List>
                                                    {order.items.map((item, index) => (
                                                        <ListItem key={index} sx={{ padding: '6px 0' }}>
                                                            <ListItemText
                                                                primary={
                                                                    <>
                                                                        {item.name}
                                                                        {item.measurement && (
                                                                            <Typography
                                                                                component="span"
                                                                                sx={{ color: "#E6C29F", fontWeight: "bold", marginLeft: "4px" }}
                                                                            >
                                                                                {item.measurement}
                                                                            </Typography>
                                                                        )}
                                                                        {" x "}
                                                                        {item.quantity}
                                                                    </>
                                                                }
                                                                secondary={
                                                                    <Typography sx={{ color: "#F8F8F8", fontSize: "12px" }}>
                                                                        Price: ₹{item.price}
                                                                    </Typography>
                                                                }
                                                                sx={{ marginBottom: 0 }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            // <Typography sx={{ paddingLeft: '30px' }}>No order is being prepared right now.</Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",  // Align items vertically
                                    alignItems: "center",     // Center items horizontally
                                    justifyContent: "center", // Center items vertically
                                    height: "100%",          // Take full height of the viewport
                                }}
                            >
                                <img src="/Enjoy Food 4.gif" alt="No Orders" style={{ width: "200px", height: "200px", marginBottom: "20px" }} />
                                <Typography sx={{ paddingLeft: "30px", textAlign: "center" }}>
                                    No order is being prepared right now.
                                </Typography>
                            </Box>
                        )}
                    </motion.div>
                )}

                {activeSection === "completedOrders" && (
                    <motion.div initial="hidden" animate="visible" variants={scaleInVariants}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: "center", paddingTop: "50px", paddingBottom: "10px", display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', }} >
                            <b sx={{ color: "#3A1B2C" }}>Completed Orders</b>
                            <GlobalStyles /> {/* Apply global styles */}
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="yyyy-MM-dd"
                                calendarClassName="custom-calendar"
                                popperProps={{
                                    modifiers: [
                                        {
                                            name: "preventOverflow",
                                            options: {
                                                boundary: "window",
                                            },
                                        },
                                    ],
                                }}
                                customInput={
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        placeholder="Select a date"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarToday sx={{ color: "#E6C29F", fontSize: "18px" }} />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: "8px",
                                                backgroundColor: "#5E1E42", // Deep Plum Background
                                                fontSize: "14px",
                                                color: "#F8F8F8", // Ivory White Text
                                                cursor: "pointer",
                                                transition: "all 0.3s ease-in-out",
                                                "&:hover": {
                                                    borderColor: "#E6C29F", // Champagne Gold on hover
                                                    boxShadow: "0px 4px 8px rgba(230, 194, 159, 0.5)", // Soft glow
                                                },
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "#3A1B2C" }, // Deep Mauve border
                                                    "&:hover fieldset": { borderColor: "#E6C29F" }, // Champagne Gold on hover
                                                    "&.Mui-focused fieldset": { borderColor: "#E6C29F" }, // Champagne Gold focus
                                                },
                                                "& input": {
                                                    textAlign: "center",
                                                    cursor: "pointer",
                                                    color: "#F8F8F8", // Ivory White Text
                                                },
                                                "&::placeholder": {
                                                    color: "#E6C29F", // Champagne Gold placeholder
                                                },
                                            },
                                        }}
                                    />
                                }
                            />
                        </Typography>
                        {loading ? (
                            <CircularProgress />
                        ) : error ? (
                            <Typography color="error">{error}</Typography>
                        ) : completedOrders.length > 0 ? (
                            <Grid container spacing={2}>
                                {completedOrders && completedOrders.length > 0 && completedOrders.map((order) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={order._id}>
                                        <Paper
                                            sx={{
                                                padding: 2,
                                                boxShadow: 3,
                                                borderRadius: "8px",
                                                height: "300px",
                                                maxWidth: "100%",
                                                overflow: "hidden",
                                                display: "flex",
                                                flexDirection: "column",
                                                backgroundColor: "#5E1E42", // Deep Plum Background
                                                color: "#E6C29F",
                                                transition: "all 0.3s ease-in-out", // Smooth transition for hover effect
                                                "&:hover": {
                                                    transform: "scale(1.05)", // Zoom-in effect
                                                    boxShadow: "0px 6px 12px #3a1b2c",
                                                },
                                            }}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 1, }} >
                                                Order No.: {order.orderNo}
                                            </Typography>
                                            <Typography variant="body2" sx={{ marginBottom: 1, color: "#F8F8F8" }}>
                                                Type: {order.type}
                                                <br />
                                                Total Amount: ₹{order.totalAmount}
                                                <br />
                                                Mode of Payment: {order.modeOfPayment}
                                                <br />
                                                Order ID: {order.orderId}
                                                <br />
                                                Payment ID: {order.paymentId}
                                            </Typography>
                                            <Box sx={{ flex: 1, overflow: 'auto', padding: '4px' }} >
                                                <List>
                                                    {order.items.map((item, index) => (
                                                        <ListItem key={index} sx={{ padding: '6px 0' }}>
                                                            <ListItemText
                                                                primary={
                                                                    <>
                                                                        {item.name}
                                                                        {item.measurement && (
                                                                            <Typography
                                                                                component="span"
                                                                                sx={{ color: "#E6C29F", fontWeight: "bold", marginLeft: "4px" }}
                                                                            >
                                                                                {item.measurement}
                                                                            </Typography>
                                                                        )}
                                                                        {" x "}
                                                                        {item.quantity}
                                                                    </>
                                                                }
                                                                secondary={
                                                                    <Typography sx={{ color: "#F8F8F8", fontSize: "12px" }}>
                                                                        Price: ₹{item.price}
                                                                    </Typography>
                                                                }
                                                                sx={{ marginBottom: 0 }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            // <Typography sx={{ paddingLeft: '30px' }}>No completed orders for today.</Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",  // Align items vertically
                                    alignItems: "center",     // Center items horizontally
                                    justifyContent: "center", // Center items vertically
                                    height: "100%",          // Take full height of the viewport
                                }}
                            >
                                <img src="/Enjoy Food 4.gif" alt="No Orders" style={{ width: "200px", height: "200px", marginBottom: "20px" }} />
                                <Typography sx={{ paddingLeft: "30px", textAlign: "center" }}>
                                    No completed orders for today.
                                </Typography>
                            </Box>
                        )}
                    </motion.div>
                )}

                {activeSection === "items" && (
                    <motion.div initial="hidden" animate="visible" variants={scaleInVariants}>
                        <Box sx={{ position: "relative", display: "flex", alignItems: "center", paddingTop: "50px", paddingBottom: "10px" }} >
                            <Typography variant="h4" gutterBottom sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                                <b>Items</b>
                            </Typography>
                            <Button variant="contained" sx={{
                                marginLeft: "auto", backgroundColor: "#5E1E42", color: "#E6C29F", fontWeight: "bold", textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#7A2B5D", // Darker shade for hover
                                    color: "#FFDAB9", // Light peach color for hover text
                                    border: "none"
                                }
                            }} onClick={handleAddItemClickOpen} >
                                <Tooltip title="Add Item" arrow>
                                    + Add Item
                                </Tooltip>
                            </Button>
                            {/* Dialog for Add Item Form */}
                            <Dialog open={openAddItemDialog} onClose={handleClose}>
                                <DialogTitle sx={{ textAlign: "center" }}>
                                    <b>Add New Item</b>
                                    <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ position: 'absolute', right: 15, top: 8, color: (theme) => theme.palette.grey[500] }} >
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent>
                                    <form onSubmit={handleSubmitItem}>
                                        <Grid container spacing={2} sx={{ marginTop: "0px" }}>
                                            <Grid container spacing={2} sx={{ marginTop: "1px", marginLeft: "1px" }}>
                                                <Grid item xs={6}>
                                                    <TextField fullWidth label="Item ID" name="item_Id" value={formData.item_Id} onChange={(e) => {
                                                        const upperCaseItemId = e.target.value.toUpperCase();
                                                        handleInputChange({ target: { name: "item_Id", value: upperCaseItemId } });
                                                    }} required />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField fullWidth label="Name" name="name" value={formData.name} onChange={(e) => {
                                                        const formattedName = e.target.value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
                                                        handleInputChange({ target: { name: "name", value: formattedName } });
                                                    }} required />
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField select fullWidth label="Category" name="category" value={formData.category} onChange={handleInputChange} required SelectProps={{ native: true }} InputLabelProps={{ shrink: true }} sx={{ marginTop: 1 }}                                                >
                                                    <option value="" disabled>Select a category</option>
                                                    {categories && categories.length > 0 && categories.map((category) => (
                                                        <option key={category._id} value={category.name}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField fullWidth label="Add Image" type="file" name="images" inputProps={{ accept: "image/*" }} onChange={handleImageUpload} required InputLabelProps={{ shrink: true }} sx={{ marginTop: 1 }} />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField fullWidth label="Description" name="description" value={formData.description} onChange={(e) => {
                                                    const formattedDescription = e.target.value.toLowerCase().replace(/(^\w|\.\s*\w)/g, (char) => char.toUpperCase());
                                                    handleInputChange({ target: { name: "description", value: formattedDescription } });
                                                }} required />
                                            </Grid>

                                            {/* Quantity Fields - Dynamic */}
                                            {formData.quantity.map((q, index) => (
                                                <Grid container spacing={2} key={index} alignItems="center" sx={{ marginTop: "0px" }}>
                                                    <Grid item xs={5.5} sx={{ marginLeft: 2 }}>
                                                        <TextField label="Measurement" value={q.measurement} onChange={(e) => {
                                                            const formattedMeasurement = e.target.value.toLowerCase().replace(/^\w/, (char) => char.toUpperCase());
                                                            handleQuantityChange(index, 'measurement', formattedMeasurement);
                                                        }} fullWidth required />
                                                    </Grid>
                                                    <Grid item xs={5.5}>
                                                        <TextField label="Price" type="number" value={q.price} onChange={(e) => handleQuantityChange(index, 'price', e.target.value)} fullWidth required
                                                            sx={{
                                                                "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                                                                    WebkitAppearance: "none",
                                                                    margin: 0,
                                                                },
                                                                "& input[type='number']": {
                                                                    MozAppearance: "textfield", // For Firefox
                                                                },
                                                            }} />
                                                    </Grid>
                                                    <Grid item xs={0.5} sx={{ marginLeft: -2.5 }}>
                                                        {/* Remove quantity field button (only if more than one) */}
                                                        {formData.quantity.length > 1 && (
                                                            <IconButton onClick={() => removeQuantityField(index)} color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            ))}
                                            <DialogActions sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                                <Box sx={{ display: "flex", gap: 2 }}>
                                                    <Button onClick={handleClose} sx={{
                                                        color: "black",
                                                        "&:hover": {
                                                            backgroundColor: "#7A2B5D", // Darker shade for hover
                                                            color: "#FFDAB9", // Light peach color for hover text
                                                            border: "none"
                                                        }
                                                    }}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={addQuantityField} sx={{
                                                        backgroundColor: "#5e1e42", color: "#E6C29F",
                                                        "&:hover": {
                                                            backgroundColor: "#7A2B5D", // Darker shade for hover
                                                            color: "#FFDAB9", // Light peach color for hover text
                                                            border: "none"
                                                        }
                                                    }}>
                                                        Add quantity
                                                    </Button>
                                                    <Button sx={{
                                                        backgroundColor: "#5e1e42", color: "#E6C29F",
                                                        "&:hover": {
                                                            backgroundColor: "#7A2B5D", // Darker shade for hover
                                                            color: "#FFDAB9", // Light peach color for hover text
                                                            border: "none"
                                                        }
                                                    }} type="submit" color="primary">
                                                        Add Item
                                                    </Button>
                                                </Box>
                                            </DialogActions>
                                        </Grid>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, marginBottom: 3 }}>
                            {categories && categories.length > 0 && categories.map((category) => (
                                <Button key={category._id} variant="outlined"
                                    sx={{
                                        padding: "10px 20px", borderRadius: "20px", backgroundColor: selectedCategory === category.name ? "#5e1e42" : "#fff", color: selectedCategory === category.name ? "#fff" : "#000", fontWeight: "bold",
                                        "&:hover": {
                                            backgroundColor: selectedCategory === category.name ? "#5e1e42" : "#E6C29F",
                                            color: selectedCategory === category.name ? "#fff" : "#000",
                                        },
                                    }}
                                    onClick={() => handleCategoryChange(category.name)}
                                    endIcon={
                                        <IconButton onClick={(e) => { e.stopPropagation(); handleCategoryDelete(category._id); }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                >
                                    {category.name}
                                </Button>
                            ))}
                            {/* Add Category Button */}
                            <Button variant="contained" onClick={handleOpenAddCategoryDialog} sx={{
                                padding: "10px 20px", borderRadius: "20px", backgroundColor: "#5E1E42", color: "#E6C29F", fontWeight: "bold",
                                "&:hover": {
                                    backgroundColor: "#7A2B5D", // Darker shade for hover
                                    color: "#FFDAB9", // Light peach color for hover text
                                    border: "none"
                                }
                            }}>
                                + Add Category
                            </Button>
                        </Box>

                        {/* Dialog for adding category */}
                        <Dialog open={openAddCategoryDialog} onClose={handleClose}>
                            <DialogTitle sx={{ textAlign: "center" }}>
                                <b>Add New Category</b>
                                <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ position: 'absolute', right: 15, top: 8, color: (theme) => theme.palette.grey[500] }} >
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <TextField fullWidth label="Category Name" value={newCategory} onChange={(e) => {
                                    const formattedCategory = e.target.value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
                                    setNewCategory(formattedCategory);
                                }} error={!!error} helperText={error} sx={{ marginTop: 1 }} />
                                <Button variant="outlined" component="label" sx={{ marginTop: 2 }}>
                                    Upload Image
                                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                                </Button>
                                {categoryImage && (
                                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                                        {categoryImage.name}
                                    </Typography>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} sx={{
                                    color: "black",
                                    "&:hover": {
                                        backgroundColor: "#7A2B5D", // Darker shade for hover
                                        color: "#FFDAB9", // Light peach color for hover text
                                        border: "none"
                                    }
                                }}>
                                    Cancel
                                </Button>
                                <Button sx={{
                                    backgroundColor: "#5e1e42", color: "#E6C29F", "&:hover": {
                                        backgroundColor: "#7A2B5D", // Darker shade for hover
                                        color: "#FFDAB9", // Light peach color for hover text
                                        border: "none"
                                    }
                                }} onClick={handleAddCategory} color="primary" variant="contained">
                                    Add
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Typography color="error" sx={{ textAlign: "center", marginTop: 4 }}>
                                {error}
                            </Typography>
                        ) : (
                            items.length > 0 ? (
                                <Grid container spacing={3}>
                                    {items && items.length > 0 && items.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={item._id} sx={{ marginBottom: "35px" }}>
                                            <Paper sx={{ padding: 2, boxShadow: 3, borderRadius: "8px", textAlign: "left", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#5e1e42" }} >
                                                <img src={`${BASE_URL}/${item.image}`} alt={item.name} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }} />
                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginTop: 2, color: "#E6C29F", fontSize: '30px', textAlign: "center" }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Item ID: {item.item_Id}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Category: {item.category}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Description: {item.description}
                                                </Typography>
                                                <List>
                                                    {item.quantity.map((q, index) => (
                                                        <ListItem key={index} sx={{ padding: 0, color: "white" }}>
                                                            <ListItemText primary={`Measurement: ${q.measurement}`} secondary={`Price: ₹${q.price}`} secondaryTypographyProps={{ sx: { color: "white" } }} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                <Grid sx={{ textAlign: "center" }}>
                                                    <Button sx={{
                                                        marginTop: 2, marginLeft: 2, backgroundColor: "#3a1b2c", color: "#E6C29F", fontWeight: "bold",
                                                        "&:hover": {
                                                            border: "none",
                                                            backgroundColor: "#7A2E5D",
                                                            boxShadow: "0px 4px 10px rgba(230, 194, 159, 0.6)",
                                                            transform: "scale(1.08)", // Button also zooms slightly on hover
                                                        }
                                                    }} onClick={() => handleEditItemClick(item)}>
                                                        <Tooltip title="Edit Item" arrow>
                                                            <BiSolidEditAlt style={{ fontSize: "24px", cursor: "pointer" }} />
                                                        </Tooltip>
                                                    </Button>
                                                    <Button sx={{
                                                        marginTop: 2, marginLeft: 2, backgroundColor: "#3a1b2c", color: "#E6C29F", fontWeight: "bold",
                                                        "&:hover": {
                                                            border: "none",
                                                            backgroundColor: "#7A2E5D",
                                                            boxShadow: "0px 4px 10px rgba(230, 194, 159, 0.6)",
                                                            transform: "scale(1.08)", // Button also zooms slightly on hover
                                                        }
                                                    }} onClick={() => handleDeleteItemClick(item)}>
                                                        <Tooltip title="Delete Item" arrow>
                                                            <MdDelete style={{ fontSize: "24px", cursor: "pointer" }} />
                                                        </Tooltip>
                                                    </Button>
                                                </Grid>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                // <Typography sx={{ textAlign: "center", marginTop: 4 }}>
                                //     No items found for the selected category.
                                // </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",  // Align items vertically
                                        alignItems: "center",     // Center items horizontally
                                        justifyContent: "center", // Center items vertically
                                        height: "100%",          // Take full height of the viewport
                                    }}
                                >
                                    <img src="/Enjoy Food 4.gif" alt="No Orders" style={{ width: "200px", height: "200px", marginBottom: "20px" }} />
                                    <Typography sx={{ paddingLeft: "30px", textAlign: "center" }}>
                                        No items found for the selected category.
                                    </Typography>
                                </Box>
                            )
                        )}

                        {/* Dialog for Edit Item Form */}
                        <Dialog open={openEditItemDialog} onClose={handleClose}>
                            <DialogTitle sx={{ textAlign: "center" }}>
                                <b>Edit Item</b>
                                <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ position: 'absolute', right: 15, top: 8, color: (theme) => theme.palette.grey[500] }} >
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <form onSubmit={handleUpdateItem}>
                                    <Grid container spacing={2} sx={{ marginTop: "0px" }}>
                                        <Grid container spacing={2} sx={{ marginTop: "1px", marginLeft: "1px" }}>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Item ID" name="item_Id" value={formData.item_Id} onChange={handleInputChange} required disabled />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} required disabled />
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField select fullWidth label="Category" name="category" value={formData.category} onChange={handleInputChange} required
                                                SelectProps={{
                                                    native: true,
                                                }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{
                                                    marginTop: 1,
                                                }}
                                            >
                                                <option value="" disabled>Select a category</option>
                                                {categories && categories.length > 0 && categories.map((category) => (
                                                    <option key={category._id} value={category.name}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Image URL" name="image" value={formData.image} onChange={handleInputChange} disabled />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Description" name="description" value={formData.description} onChange={(e) => {
                                                const formattedDescription = e.target.value.toLowerCase().replace(/(^\w|\.\s*\w)/g, (char) => char.toUpperCase());
                                                handleInputChange({ target: { name: "description", value: formattedDescription } });
                                            }} required />
                                        </Grid>

                                        {/* Quantity fields */}
                                        {formData.quantity.map((q, index) => (
                                            <Grid container spacing={2} key={index} sx={{ marginTop: "1px", marginLeft: "1px" }}>
                                                <Grid item xs={5.5}>
                                                    <TextField label="Measurement" value={q.measurement} onChange={(e) => {
                                                        const formattedMeasurement = e.target.value.toLowerCase().replace(/^\w/, (char) => char.toUpperCase()); handleQuantityChange(index, 'measurement', formattedMeasurement);
                                                    }} fullWidth required />
                                                </Grid>
                                                <Grid item xs={5.5}>
                                                    <TextField label="Price" type="number" value={q.price} onChange={(e) => handleQuantityChange(index, 'price', e.target.value)} fullWidth required
                                                        sx={{
                                                            "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                                                                WebkitAppearance: "none",
                                                                margin: 0,
                                                            },
                                                            "& input[type='number']": {
                                                                MozAppearance: "textfield", // For Firefox
                                                            },
                                                        }} />
                                                </Grid>
                                                <Grid item xs={0.5} sx={{ marginLeft: -2.5 }}>
                                                    {/* Remove quantity field button (only if more than one) */}
                                                    {formData.quantity.length > 1 && (
                                                        <IconButton onClick={() => removeQuantityField(index)} color="error">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <DialogActions sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                            <Box sx={{ display: "flex", gap: 2 }}>
                                                <Button onClick={handleClose} sx={{
                                                    color: "black",
                                                    "&:hover": {
                                                        backgroundColor: "#7A2B5D", // Darker shade for hover
                                                        color: "#FFDAB9", // Light peach color for hover text
                                                        border: "none"
                                                    }
                                                }}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={addQuantityField} sx={{
                                                    backgroundColor: "#5e1e42", color: "#E6C29F",
                                                    "&:hover": {
                                                        backgroundColor: "#7A2B5D", // Darker shade for hover
                                                        color: "#FFDAB9", // Light peach color for hover text
                                                        border: "none"
                                                    }
                                                }}>
                                                    Add quantity
                                                </Button>
                                                <Button sx={{
                                                    backgroundColor: "#5e1e42", color: "#E6C29F",
                                                    "&:hover": {
                                                        backgroundColor: "#7A2B5D", // Darker shade for hover
                                                        color: "#FFDAB9", // Light peach color for hover text
                                                        border: "none"
                                                    }
                                                }} type="submit" color="primary">
                                                    Save
                                                </Button>
                                            </Box>
                                        </DialogActions>
                                    </Grid>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                )}

                {activeSection === "coupons" && (
                    <motion.div initial="hidden" animate="visible" variants={scaleInVariants}>
                        <Box sx={{ position: "relative", display: "flex", alignItems: "center", paddingTop: "50px", paddingBottom: "10px" }} >
                            <Typography variant="h4" gutterBottom sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                                <b>Coupons</b>
                            </Typography>
                            <Button variant="contained" sx={{
                                marginLeft: "auto", backgroundColor: "#5E1E42", color: "#E6C29F", fontWeight: "bold", textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#7A2B5D", // Darker shade for hover
                                    color: "#FFDAB9", // Light peach color for hover text
                                    border: "none"
                                }
                            }} onClick={handleAddCouponClickOpen} >
                                <Tooltip title="Add Coupon" arrow>
                                    + Add Coupon
                                </Tooltip>
                            </Button>
                            {/* Dialog for Add Coupon Form */}
                            <Dialog open={openAddCouponDialog} onClose={handleClose}>
                                <DialogTitle sx={{ textAlign: "center" }}>
                                    <b>Add New Coupon</b>
                                    <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ position: 'absolute', right: 15, top: 8, color: (theme) => theme.palette.grey[500] }} >
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent>
                                    <form onSubmit={handleSubmitCoupon}>
                                        <Grid container spacing={2} sx={{ marginTop: 1 }}>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Code" name="code" value={formData.code} onChange={(e) => {
                                                    const upperCaseCode = e.target.value.toUpperCase();
                                                    handleInputChange({ target: { name: "code", value: upperCaseCode } });
                                                }} required />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Expiry (in days)" name="expire" value={formData.expire} onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Allow only numbers
                                                    if (/^\d*$/.test(value)) {
                                                        handleInputChange(e);
                                                    }
                                                }}
                                                    required
                                                    inputProps={{
                                                        inputMode: 'numeric', // Optional: for mobile device number keyboard
                                                        pattern: '[0-9]*' // HTML5 pattern for numeric input
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <TextField select fullWidth label="Applicable" name="applicable" value={formData.applicable} onChange={handleInputChange} required
                                                    SelectProps={{
                                                        native: true, // Using native select for better accessibility
                                                    }}
                                                    InputLabelProps={{
                                                        shrink: true, // Ensures the label stays on top when the field is empty
                                                    }}
                                                    sx={{
                                                        marginTop: 1, // Adds margin to prevent overlap
                                                    }}
                                                >
                                                    <option value="" disabled>Select the applicable user</option>
                                                    <option value="New User">New User</option>
                                                    <option value="All User">All User</option>
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={6} sx={{ marginTop: 1 }}>
                                                <TextField fullWidth label="Amount" type="number" name="amount" value={formData.amount} onChange={handleInputChange} required
                                                    sx={{
                                                        "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                                                            WebkitAppearance: "none",
                                                            margin: 0,
                                                        },
                                                        "& input[type='number']": {
                                                            MozAppearance: "textfield", // For Firefox
                                                        },
                                                    }} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField select fullWidth label="Unit" name="unit" value={formData.unit} onChange={(event) => {
                                                    handleInputChange(event);
                                                    // Automatically set Max Limit to 0 when Unit is Rs.
                                                    if (event.target.value === "Rs.") {
                                                        setFormData((prev) => ({ ...prev, maxLimit: 0 }));
                                                    }
                                                }} required
                                                    SelectProps={{
                                                        native: true, // Using native select for better accessibility
                                                    }}
                                                    InputLabelProps={{
                                                        shrink: true, // Ensures the label stays on top when the field is empty
                                                    }}
                                                    sx={{
                                                        marginTop: 1, // Adds margin to prevent overlap
                                                    }}
                                                >
                                                    <option value="" disabled>Select an unit</option>
                                                    <option value="%">%</option>
                                                    <option value="Rs.">Rs.</option>
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Min Order" type="number" name="minOrder" value={formData.minOrder} onChange={handleInputChange} required
                                                    sx={{
                                                        "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                                                            WebkitAppearance: "none",
                                                            margin: 0,
                                                        },
                                                        "& input[type='number']": {
                                                            MozAppearance: "textfield", // For Firefox
                                                        },
                                                    }} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Max Limit" type="number" name="maxLimit" value={formData.maxLimit} onChange={handleInputChange} required disabled={formData.unit === "Rs."}
                                                    sx={{
                                                        "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                                                            WebkitAppearance: "none",
                                                            margin: 0,
                                                        },
                                                        "& input[type='number']": {
                                                            MozAppearance: "textfield", // For Firefox
                                                        },
                                                    }} />
                                            </Grid>
                                            <DialogActions sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                                <Box sx={{ display: "flex", gap: 2 }}>
                                                    <Button onClick={handleClose} sx={{
                                                        color: "black",
                                                        "&:hover": {
                                                            backgroundColor: "#7A2B5D", // Darker shade for hover
                                                            color: "#FFDAB9", // Light peach color for hover text
                                                            border: "none"
                                                        }
                                                    }}>
                                                        Cancel
                                                    </Button>
                                                    <Button sx={{
                                                        backgroundColor: "#5e1e42", color: "#E6C29F",
                                                        "&:hover": {
                                                            backgroundColor: "#7A2B5D", // Darker shade for hover
                                                            color: "#FFDAB9", // Light peach color for hover text
                                                            border: "none"
                                                        }
                                                    }} type="submit" color="primary">
                                                        Add
                                                    </Button>
                                                </Box>
                                            </DialogActions>
                                        </Grid>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </Box>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Typography color="error" sx={{ textAlign: "center", marginTop: 4 }}>
                                {error}
                            </Typography>
                        ) : (
                            coupons.length > 0 ? (
                                <Grid container spacing={3}>
                                    {coupons && coupons.length > 0 && coupons.map((coupon) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={coupon._id} sx={{ marginBottom: "35px" }}>
                                            <Paper sx={{ padding: 2, boxShadow: 3, borderRadius: "8px", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#5e1e42" }} >
                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginTop: 2, color: "#E6C29F", fontSize: "30px" }}>
                                                    {coupon.code}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Expiry: {coupon.expire} days
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Applicable: {coupon.applicable}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Amount: {coupon.unit === '%' ? `${coupon.amount}%` : `₹${coupon.amount}`}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Min Order: ₹{coupon.minOrder}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Max Limit: ₹{coupon.maxLimit}
                                                </Typography>
                                                <Grid>
                                                    <Button sx={{
                                                        marginTop: 2, marginRight: 2, backgroundColor: "#3a1b2c", color: "#E6C29F", fontWeight: "bold",
                                                        "&:hover": {
                                                            border: "none",
                                                            backgroundColor: "#7A2E5D",
                                                            boxShadow: "0px 4px 10px rgba(230, 194, 159, 0.6)",
                                                            transform: "scale(1.08)", // Button also zooms slightly on hover
                                                        }
                                                    }} onClick={() => handleEditCouponClick(coupon)} >
                                                        <Tooltip title="Edit Coupon" arrow>
                                                            <BiSolidEditAlt style={{ fontSize: "24px", cursor: "pointer" }} />
                                                        </Tooltip>
                                                    </Button>
                                                    <Button sx={{
                                                        marginTop: 2, marginLeft: 2, backgroundColor: "#3a1b2c", color: "#E6C29F", fontWeight: "bold",
                                                        "&:hover": {
                                                            border: "none",
                                                            backgroundColor: "#7A2E5D",
                                                            boxShadow: "0px 4px 10px rgba(230, 194, 159, 0.6)",
                                                            transform: "scale(1.08)", // Button also zooms slightly on hover
                                                        }
                                                    }} onClick={() => handleDeleteCouponClick(coupon.code)} >
                                                        <Tooltip title="Delete Coupon" arrow>
                                                            <MdDelete style={{ fontSize: "24px", cursor: "pointer" }} />
                                                        </Tooltip>
                                                    </Button>
                                                </Grid>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                // <Typography sx={{ textAlign: "center", marginTop: 4 }}>
                                //     No coupons have been added yet.
                                // </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",  // Align items vertically
                                        alignItems: "center",     // Center items horizontally
                                        justifyContent: "center", // Center items vertically
                                        height: "100%",          // Take full height of the viewport
                                    }}
                                >
                                    <img src="/Enjoy Food 4.gif" alt="No Orders" style={{ width: "200px", height: "200px", marginBottom: "20px" }} />
                                    <Typography sx={{ paddingLeft: "30px", textAlign: "center" }}>
                                        No coupons have been added yet.
                                    </Typography>
                                </Box>
                            )
                        )}

                        {/* Dialog for Edit Coupon Form */}
                        <Dialog open={openEditCouponDialog} onClose={handleClose}>
                            <DialogTitle sx={{ textAlign: "center" }}>
                                <b>Edit Coupon</b>
                                <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ position: 'absolute', right: 15, top: 8, color: (theme) => theme.palette.grey[500] }} >
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <form onSubmit={handleUpdateCoupon}>
                                    <Grid container spacing={2} sx={{ marginTop: 1 }}>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="Code" name="code" value={formData.code} onChange={handleInputChange} required disabled />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="Expiry (in days)" name="expire" value={formData.expire} onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only numbers
                                                if (/^\d*$/.test(value)) {
                                                    handleInputChange(e);
                                                }
                                            }}
                                                required
                                                inputProps={{
                                                    inputMode: 'numeric', // Optional: for mobile device number keyboard
                                                    pattern: '[0-9]*' // HTML5 pattern for numeric input
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField select fullWidth label="Applicable" name="applicable" value={formData.applicable} onChange={handleInputChange} required
                                                SelectProps={{
                                                    native: true, // Using native select for better accessibility
                                                }}
                                                InputLabelProps={{
                                                    shrink: true, // Ensures the label stays on top when the field is empty
                                                }}
                                                sx={{
                                                    marginTop: 1, // Adds margin to prevent overlap
                                                }}
                                            >
                                                <option value="" disabled>Select the applicable user</option>
                                                <option value="New User">New User</option>
                                                <option value="All User">All User</option>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={6} sx={{ marginTop: 1 }}>
                                            <TextField fullWidth label="Amount" type="number" name="amount" value={formData.amount} onChange={handleInputChange} required
                                                sx={{
                                                    "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                                                        WebkitAppearance: "none",
                                                        margin: 0,
                                                    },
                                                    "& input[type='number']": {
                                                        MozAppearance: "textfield", // For Firefox
                                                    },
                                                }} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField select fullWidth label="Unit" name="unit" value={formData.unit} onChange={(event) => {
                                                handleInputChange(event);
                                                // Automatically set Max Limit to 0 when Unit is Rs.
                                                if (event.target.value === "Rs.") {
                                                    setFormData((prev) => ({ ...prev, maxLimit: 0 }));
                                                }
                                            }} required
                                                SelectProps={{
                                                    native: true, // Using native select for better accessibility
                                                }}
                                                InputLabelProps={{
                                                    shrink: true, // Ensures the label stays on top when the field is empty
                                                }}
                                                sx={{
                                                    marginTop: 1, // Adds margin to prevent overlap
                                                }}
                                            >
                                                <option value="" disabled>Select an unit</option>
                                                <option value="%">%</option>
                                                <option value="Rs.">Rs.</option>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="Min Order" type="number" name="minOrder" value={formData.minOrder} onChange={handleInputChange} required
                                                sx={{
                                                    "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                                                        WebkitAppearance: "none",
                                                        margin: 0,
                                                    },
                                                    "& input[type='number']": {
                                                        MozAppearance: "textfield", // For Firefox
                                                    },
                                                }} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="Max Limit" type="number" name="maxLimit" value={formData.maxLimit} onChange={handleInputChange} required disabled={formData.unit === "Rs."}
                                                sx={{
                                                    "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                                                        WebkitAppearance: "none",
                                                        margin: 0,
                                                    },
                                                    "& input[type='number']": {
                                                        MozAppearance: "textfield", // For Firefox
                                                    },
                                                }} />
                                        </Grid>
                                        <DialogActions sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                            <Box sx={{ display: "flex", gap: 2 }}>
                                                <Button onClick={handleClose} sx={{
                                                    color: "black",
                                                    "&:hover": {
                                                        backgroundColor: "#7A2B5D", // Darker shade for hover
                                                        color: "#FFDAB9", // Light peach color for hover text
                                                        border: "none"
                                                    }
                                                }}>
                                                    Cancel
                                                </Button>
                                                <Button sx={{
                                                    backgroundColor: "#5e1e42", color: "#E6C29F",
                                                    "&:hover": {
                                                        backgroundColor: "#7A2B5D", // Darker shade for hover
                                                        color: "#FFDAB9", // Light peach color for hover text
                                                        border: "none"
                                                    }
                                                }} type="submit" color="primary">
                                                    Save
                                                </Button>
                                            </Box>
                                        </DialogActions>
                                    </Grid>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                )}

                {activeSection === "chef" && (
                    <motion.div initial="hidden" animate="visible" variants={scaleInVariants}>
                        <Box sx={{ position: "relative", display: "flex", alignItems: "center", paddingTop: "50px", paddingBottom: "10px" }} >
                            <Typography variant="h4" gutterBottom sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                                <b>Chefs</b>
                            </Typography>
                            <Button variant="contained" sx={{
                                marginLeft: "auto", backgroundColor: "#5E1E42", color: "#E6C29F", fontWeight: "bold", textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#7A2B5D", // Darker shade for hover
                                    color: "#FFDAB9", // Light peach color for hover text
                                    border: "none"
                                }
                            }} onClick={handleAddChefClickOpen} >
                                <Tooltip title="Add Chef" arrow>
                                    + Add Chef
                                </Tooltip>
                            </Button>
                            {/* Dialog for Add Coupon Form */}
                            <Dialog open={openAddChefDialog} onClose={handleClose}>
                                <DialogTitle sx={{ textAlign: "center" }}>
                                    <b>Add New Chef</b>
                                    <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ position: 'absolute', right: 15, top: 8, color: (theme) => theme.palette.grey[500] }} >
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent>
                                    <form onSubmit={handleSubmitChef}>
                                        <Grid container spacing={2} sx={{ marginTop: 1 }}>
                                            <Grid item xs={12}>
                                                <TextField fullWidth label="Chef's Name" name="name" value={formData.name} onChange={(e) => {
                                                    const capitalizedName = e.target.value.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
                                                    handleInputChange({ target: { name: "name", value: capitalizedName } });
                                                }} required />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField fullWidth label="Chef's Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField fullWidth label="Chef's Password" name="password" value={formData.password} onChange={handleInputChange} required />
                                            </Grid>
                                            <DialogActions sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                                <Box sx={{ display: "flex", gap: 2 }}>
                                                    <Button onClick={handleClose} sx={{
                                                        color: "black",
                                                        "&:hover": {
                                                            backgroundColor: "#7A2B5D", // Darker shade for hover
                                                            color: "#FFDAB9", // Light peach color for hover text
                                                            border: "none"
                                                        }
                                                    }}>
                                                        Cancel
                                                    </Button>
                                                    <Button sx={{
                                                        backgroundColor: "#5e1e42", color: "#E6C29F",
                                                        "&:hover": {
                                                            backgroundColor: "#7A2B5D", // Darker shade for hover
                                                            color: "#FFDAB9", // Light peach color for hover text
                                                            border: "none"
                                                        }
                                                    }} type="submit" color="primary">
                                                        Add
                                                    </Button>
                                                </Box>
                                            </DialogActions>
                                        </Grid>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </Box>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Typography color="error" sx={{ textAlign: "center", marginTop: 4 }}>
                                {error}
                            </Typography>
                        ) : (
                            Array.isArray(chefs) && chefs.length > 0 ? (
                                <Grid container spacing={3}>
                                    {chefs && chefs.length > 0 && chefs.map((chefs) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={chefs._id} sx={{ marginBottom: "35px" }}>
                                            <Paper sx={{ padding: 2, boxShadow: 3, borderRadius: "8px", textAlign: "left", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#5e1e42" }} >
                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginTop: 2, textAlign: "center", color: "#E6C29F", fontSize: "25px" }}>
                                                    {chefs.chefId}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Name: {chefs.name}
                                                </Typography>
                                                <Typography variant="body2" color="white">
                                                    Email: {chefs.email}
                                                </Typography>
                                                <Grid sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Button sx={{
                                                        marginTop: 2, marginLeft: 2, backgroundColor: "#3a1b2c", color: "#E6C29F", fontWeight: "bold",
                                                        "&:hover": {
                                                            border: "none",
                                                            backgroundColor: "#7A2E5D",
                                                            boxShadow: "0px 4px 10px rgba(230, 194, 159, 0.6)",
                                                            transform: "scale(1.08)", // Button also zooms slightly on hover
                                                        }
                                                    }} onClick={() => handleDeleteChefClick(chefs)} >
                                                        <Tooltip title="Delete Chef Data" arrow>
                                                            <MdDelete style={{ fontSize: "24px", cursor: "pointer" }} />
                                                        </Tooltip>
                                                    </Button>
                                                </Grid>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                // <Typography sx={{ textAlign: "center", marginTop: 4 }}>
                                //     No chefs have been added yet.
                                // </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",  // Align items vertically
                                        alignItems: "center",     // Center items horizontally
                                        justifyContent: "center", // Center items vertically
                                        height: "100%",          // Take full height of the viewport
                                    }}
                                >
                                    <img src="/Enjoy Food 4.gif" alt="No Orders" style={{ width: "200px", height: "200px", marginBottom: "20px" }} />
                                    <Typography sx={{ paddingLeft: "30px", textAlign: "center" }}>
                                        No chefs have been added yet.
                                    </Typography>
                                </Box>
                            )
                        )}
                    </motion.div>
                )}
            </Box >
        </>
    );
}

export default AdminHomePage;
