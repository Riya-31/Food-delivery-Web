

import React, { useState, useEffect, useRef } from 'react';
import '../css/Cart.css';
import Footer from "./Footer";
import OrderSummary from './OrderSummary';
import { BASE_URL, RAZORPAY_KEY } from '../config';
import Logger from './Logger';
import Swal from 'sweetalert2';
import { IoHome } from "react-icons/io5";
import { FaTrash } from 'react-icons/fa';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import gsap from "gsap";
// import Lottie from "lottie-react";
// import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { HiShoppingCart } from "react-icons/hi2";

function Cart() {
    //const { cart } = useCartContext();
    const userEmail = sessionStorage.getItem('userEmail');
    const [userOrderCancelled, setUserOrderCancelled] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderSummaryData, setOrderSummaryData] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    // const total = cartItems.reduce((sum, product) => sum + product.amount * product.quantity, 0);
    // const discount = total * 0.10;
    const penalty = userOrderCancelled === 4 ? 15 : userOrderCancelled === 11 ? 45 : userOrderCancelled === 16 ? 75 : userOrderCancelled > 16 ? 105 : 0;
    // const totalAfterDiscount = total - discount + penalty;
    // const totalAfterDiscount = total - discount + 49;
    const [userName, setUserName] = useState('');
    const [userLocation, setUserLocation] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userMobile, setUserMobile] = useState('');
    const [loading, setLoading] = useState(true);
    const selectedMerchantEmail = sessionStorage.getItem('selectedMerchantEmail');
    const [refreshKey, setRefreshKey] = useState(0);
    const [total, setTotal] = useState(0); // MRP Total
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(0); // Total after applying discount
    const [discount, setDiscount] = useState(0); // Discount amount
    const [tax, setTax] = useState(0); // GST Tax
    // In your Cart component
    const [showModal, setShowModal] = useState(false);
    const [totalItemsInCart, setTotalItemsInCart] = useState(0);
    const [errors, setErrors] = useState({});
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        contact: ''
    });

    // Initialize Logger
    const logger = new Logger(`${BASE_URL}/api/logs/customer`);

    // const handleRemoveItem = async (itemName) => {
    //     try {
    //         await removeFromCart(itemName);
    //         setRefreshKey(prevKey => prevKey + 1); // Increment key to force re-render
    //     } catch (error) {
    //         console.error('Error:', error.message);
    //     }
    // };


    // Model for Terms & Condition 
    const handleTermsClick = () => {
        setShowTermsModal(true);
    };
    const closeModal = () => {
        setShowTermsModal(false);
    };

    const submitButton = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        setSnackbarMessage("Your TableNo. is saved. Please proceed to checkout");
        setSnackbarOpen(true);
    };


    // for Dine-in or Takeaway
    const handleOrderTypeChange = (type) => {
        setUserData((prevData) => ({
            ...prevData,
            orderType: type,
            tableNo: type === "Dine-in" ? prevData.tableNo : null, // Clear tableNo if Takeaway is selected
        }));
    };
    // Constraints for Name , Email and Contact
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        if (name === "name" && !/^[A-Za-z\s]*$/.test(value)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                name: "Name should contain only alphabets and spaces.",
            }));
            return;
        }
        if (name === "contact" && !/^\d{0,10}$/.test(value)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                contact: "Contact number should be a 10-digit number.",
            }));
            return;
        }

        if (name === "email") {
            if (!/^([^\s@]+@[^\s@]+\.[^\s@]+)$/.test(value)) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    email: "Please enter a valid email address",
                }));
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    email: "",
                }));
            }
        }

        setUserData({
            ...userData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('User data submitted:', userData);


    };

    // For Calculate the values 
    useEffect(() => {
        const calculateTotal = () => {
            let newTotal = 0;
            let newDiscount = 0;
            let newTax = 0;

            // Calculate the total for all cart items
            cartItems.forEach(item => {
                const itemTotal = item.price * item.quantity;
                newTotal += itemTotal;
            });
            // Apply some discount logic (e.g., 10% off)
            // newDiscount = newTotal * 0.1;  // Example: 10% discount
            newTax = newTotal * 0.05;      //  15% GST tax

            // Final total after discount
            const finalTotal = newTotal + newTax;

            setTotal(newTotal);
            setDiscount(newDiscount);
            setTax(newTax);
            setTotalAfterDiscount(finalTotal);
        };

        calculateTotal();
    }, [cartItems]);


    // Removing the items from Cart Page
    const handleRemoveItem = (itemName, itemMeasurement) => {
        const updatedCart = cartItems.filter((item) => !(item.name === itemName && item.measurement === itemMeasurement));


        // Update localStorage and state
        console.log("updated CART", updatedCart);
        setCartItems(updatedCart);
        localStorage.setItem('Cart', JSON.stringify(updatedCart));

        if (itemMeasurement) {
            setSnackbarMessage(
                `Removing ${itemName} ${itemMeasurement}`);
            setSnackbarOpen(true);
        }
        else {
            setSnackbarMessage(
                `Removing ${itemName} `);
            setSnackbarOpen(true);
        }
        window.dispatchEvent(new Event('cartUpdated'));
    };



    // Get the Item data from the Home page using localStorage.  
    useEffect(() => {
        // Retrieve the stored cart from localStorage
        const storedCart = JSON.parse(localStorage.getItem("Cart")) || [];
        setCartItems(storedCart);

        // Calculate and store the total quantity in sessionStorage
        const totalQuantity = storedCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
        sessionStorage.setItem("totalItemsInCart", totalQuantity);

        // Update state for initial load
        setTotalItemsInCart(totalQuantity);

        const handleCartUpdate = () => {
            const updatedCart = JSON.parse(localStorage.getItem("Cart")) || [];
            setCartItems(updatedCart);

            // Update total quantity when cart changes
            const updatedTotal = updatedCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
            sessionStorage.setItem("totalItemsInCart", updatedTotal);
            setTotalItemsInCart(updatedTotal);
        };

        window.addEventListener("cartUpdated", handleCartUpdate);

        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdate);
        };
    }, []);


    // Increment or Decrement an item's quantity
    const updateCartItem = (itemName, itemMeasurement, delta) => {
        const updatedCart = cartItems.map(item => {
            if (item.name === itemName && item.measurement === itemMeasurement) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        });

        localStorage.setItem('Cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);

        window.dispatchEvent(new Event('cartUpdated'));
    };

    // useEffect(() => {
    //     const fetchUserData = async () => {
    //         try {
    //             const response = await fetch(`${BASE_URL}/api/getUserByEmail?email=${userEmail}`);
    //             if (response.ok) {
    //                 const userData = await response.json();
    //                 setUserName(userData.name);
    //                 setUserPassword(userData.password);
    //                 const fullLocation = userData.location;
    //                 // Split the address into an array by commas
    //                 const addressParts = fullLocation.split(',');

    //                 // Remove the last two elements from the array
    //                 const trimmedAddressParts = addressParts.slice(0, -2);

    //                 // Join the remaining elements back into a string
    //                 const trimmedAddress = trimmedAddressParts.join(',');

    //                 setUserLocation(trimmedAddress);
    //                 setUserOrderCancelled(userData.cancelledOrders);
    //                 setSelectedAddress(trimmedAddress);
    //                 setUserMobile(userData.phoneNumber);
    //             } else {
    //                 console.error('Failed to fetch user data');
    //                 logger.log('Failed to fetch user data', 'ERROR');
    //             }
    //         } catch (error) {
    //             console.error('Error fetching user data:', error);
    //             logger.log(`Error fetching user data: ${error}`, 'ERROR');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     if (userEmail) {
    //         fetchUserData();
    //     }
    // }, [userEmail]);

    // const fetchCartItems = async () => {
    //     try {
    //         const response = await fetch(`${BASE_URL}/api/cart/product/${userEmail}/${selectedMerchantEmail}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch cart items');
    //         }
    //         const data = await response.json();
    //         return data;
    //     } catch (error) {
    //         console.error('Error fetching cart items:', error.message);
    //         logger.log(`Error fetching cart items: ${error.message}`, 'ERROR');
    //         throw error;
    //     }
    // };

    // useEffect(() => {
    //     if (userEmail) {
    //         fetchCartItems()
    //             .then((data) => {
    //                 setCartItems(data);
    //             })
    //             .catch((error) => {
    //                 console.error('Failed to fetch cart items on mount:', error);
    //             });
    //     }
    // }, [userEmail]);

    // useEffect(() => {
    //     const fetchUserData = async () => {
    //         try {
    //             const response = await fetch(`${BASE_URL}/api/getUserByEmail?email=${userEmail}`);
    //             if (response.ok) {
    //                 const userData = await response.json();
    //                 setUserOrderCancelled(userData.cancelledOrders);
    //             } else {
    //                 console.error('Failed to fetch user data');
    //                 logger.log('Failed to fetch user data', 'ERROR');
    //             }
    //         } catch (error) {
    //             console.error('Error fetching user data:', error);
    //             logger.log(`Error fetching user data: ${error}`, 'ERROR');
    //         }
    //     };

    //     if (userEmail) {
    //         fetchUserData();
    //     }
    // }, [userEmail]);

    // useEffect(() => {
    //     const fetchAddresses = async () => {
    //         try {
    //             const response = await fetch(`${BASE_URL}/api/address/getAddressesByEmail?email=${userEmail}`);
    //             if (response.ok) {
    //                 const addressesData = await response.json();
    //                 setAddresses(addressesData);
    //             } else {
    //                 console.error('Failed to fetch addresses');
    //                 logger.log('Failed to fetch addresses', 'ERROR');
    //             }
    //         } catch (error) {
    //             console.error('Error fetching addresses:', error);
    //             logger.log(`Error fetching addresses: ${error}`, 'ERROR');
    //         }
    //     };

    //     if (userEmail) {
    //         fetchAddresses();
    //     }
    // }, [userEmail]);

    // useEffect(() => {
    //     if (selectedAddress) {
    //         setCustomerName(selectedAddress.rcvrName);
    //         setCustomerEmail(selectedAddress.email);
    //         setCustomerContact(selectedAddress.rcvrPhone);
    //     }
    // }, [selectedAddress]);

    // Fetch wallet balance
    // useEffect(() => {
    //     const fetchWalletBalance = async () => {
    //         try {
    //             const response = await fetch(`${BASE_URL}/api/wallet/getUserByEmail?email=${userEmail}`);
    //             if (response.ok) {
    //                 const wallet = await response.json();
    //                 setWalletBalance(wallet.balance);
    //             } else {
    //                 console.error('Failed to fetch wallet balance');
    //                 logger.log('Failed to fetch wallet balance', 'ERROR');
    //             }
    //         } catch (error) {
    //             console.error('Error fetching wallet balance:', error);
    //             logger.log(`Error fetching wallet balance: ${error}`, 'ERROR');
    //         }
    //     };

    //     if (userEmail) {
    //         fetchWalletBalance();
    //     }
    // }, [userEmail]);

    // 


    // Handling the increment or decrement function
    const handleIncrement = (itemName, itemMeasurement) => {
        updateCartItem(itemName, itemMeasurement, 1);

    };
    const handleDecrement = (itemName, quantity, itemMeasurement) => {
        if (quantity > 1) {
            updateCartItem(itemName, itemMeasurement, -1);
        }
        else {
            if (itemMeasurement) {
                handleRemoveItem(itemName, itemMeasurement)
                setSnackbarMessage(
                    `Removing ${itemName} ${itemMeasurement}`);
                setSnackbarOpen(true);
            }
            else {
                handleRemoveItem(itemName)
                setSnackbarMessage(
                    `Removing ${itemName} `);
                setSnackbarOpen(true);
            }
        }

    }

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    function backToHome() {
        window.location.href = '/menu';
    }

    function backToMenu() {
        window.location.href = '/menu';
    }

    function addNewAdd() {
        window.location.href = '/form';
    }

    const loadRazorpay = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    // const checkStock = async (orderSummary) => {
    //     try {
    //         const response = await fetch(`${BASE_URL}/api/orders/checkStock/`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(orderSummary.items),
    //         });

    //         if (response.ok) {
    //             return true;
    //         } else {
    //             const errorData = await response.json();
    //             Swal.fire({
    //                 icon: 'warning',
    //                 title: 'Out of Stock',
    //                 text: `Some items are out of stock: ${errorData.outOfStockItems.map(item => `${item.name} (Available: ${item.availableQuantity})`).join(', ')}`,
    //             });
    //             return false;
    //         }
    //     } catch (error) {
    //         console.error('Error checking stock:', error);
    //         logger.log(`Error checking stock: ${error}`, 'ERROR');
    //         alert('Failed to check stock. Please try again.');
    //         return false;
    //     }
    // };

    // function parseAddress(address) {
    //     if (!address) {
    //         throw new Error("Address is null or undefined");
    //     }

    //     const parts = address.split(',');

    //     // Ensure that we have at least 5 parts
    //     if (parts.length < 5) {
    //         throw new Error("Address format is incorrect");
    //     }

    //     // Extract components
    //     const rcvrName = parts[0].trim();
    //     const street = parts[1].trim();
    //     const city = parts[2].trim();
    //     const state = parts[3].trim();
    //     const zipcode = parts[4].trim();

    //     return { rcvrName, address: { street, city, state, zipcode } };
    // }

    // let parsedAddress = null;

    // try {
    //     parsedAddress = parseAddress(selectedAddress);
    // } catch (error) {
    //     console.error('Error parsing address:', error.message);
    // }

    const displayRazorpay = async () => {

        const orderSummary = {
            orderId: `order_${Date.now()}`,
            paymentId: `razorpay_${Date.now()}`,
            modeOfPayment: 'Razorpay',
            items: cartItems.map(item => ({
                item_Id: item._id,
                name: item.name,
                quantity: item.quantity,
                measurement: item.measurement,
                price: item.price,

            })),
            totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: totalAfterDiscount,
            customer: [{
                name: userData.name,  // User name from the modal form
                email: userData.email,  // User email from the modal form
                contact: userData.contact,

            }],
            type: userData.orderType,
            table: userData.tableNo,
            tax: tax

        };

        // const isStockAvailable = await checkStock(orderSummary);

        // if (!isStockAvailable) {
        //     return;
        // }

        const res = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            console.log("returning");
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const data = await fetch(`${BASE_URL}/api/orders/create-order`, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //     body: JSON.stringify({ amount: totalAfterDiscount, currency: 'INR' }),
            // }).then((t) => t.json());
            body: JSON.stringify({
                amount: totalAfterDiscount,
                currency: 'INR',
                orderSummary: orderSummary,  // Send the full order summary to the backend
            }),
        }).then((response) => response.json());
        console.log("Submit", data);



        const options = {
            key: `${RAZORPAY_KEY}`,
            amount: data.amount,
            currency: data.currency,
            name: 'Shopping Cart',
            description: 'Test Transaction',
            order_id: data.id,
            handler: async function (response) {
                try {
                    const paymentDetails = await fetch(`${BASE_URL}/api/orders/fetch-payment-details/${response.razorpay_payment_id}`)
                        .then(res => res.json());

                    orderSummary.paymentId = response.razorpay_payment_id;
                    orderSummary.modeOfPayment = paymentDetails.method;
                    console.log("paiseee", data.amount);
                    console.log("id", response.razorpay_payment_id);
                    const captureResponse = await fetch(`${BASE_URL}/api/orders/capture-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amountInPaise: (data.amount / 100), // Amount in paisa
                            paymentId: response.razorpay_payment_id,
                        }),
                    });

                    if (!captureResponse.ok) {
                        throw new Error('Failed to capture payment');
                    }
                    console.log("Payment captured successfully:", captureResponse);
                    // Save order in the backend 
                    const saveOrderResponse = await fetch(`${BASE_URL}/api/orders/save-order`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderSummary),
                    }).then(res => res.json());

                    if (!saveOrderResponse.order) throw new Error("Failed to save order");
                    console.log("Save-order", orderSummary);
                    // ✅ Store orderNo from backend response
                    setOrderSummaryData({
                        ...orderSummary,
                        orderNo: saveOrderResponse.order.orderNo, // Assign order number
                    });

                    setOrderPlaced(true);

                    setCartItems([]); // Clear cart items
                    setTotal(0); // Reset total amount
                    setTax(0); // Reset tax value

                    localStorage.removeItem('Cart'); // Example for localStorage


                } catch (error) {
                    console.error('Error processing payment:', error);
                    logger.log(`Error processing payment: ${error}`, 'ERROR');
                    alert('Payment failed. Please try again.');
                }
            },
            prefill: {
                name: userData.name,  // Prefill user details in Razorpay
                email: userData.email,
                contact: userData.contact,
            },
            // notes: {
            //     address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zipcode}`,
            // },
            theme: {
                color: '#007bff',
            },
            modal: {
                ondismiss: function () {
                    setShowModal(true); // Show the modal when the user closes the payment window
                }
            }
        };



        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

    };

    const handleContinuePayment = () => {
        setShowModal(false); // Close modal
        displayRazorpay(); // Retry payment
    };

    const handleAbortPayment = () => {
        setShowModal(false); // Close modal

    };



    // const handleWalletPayment = async () => {
    //     if (walletBalance < totalAfterDiscount) {
    //         alert('Insufficient wallet balance');
    //         return;
    //     }

    //     const orderSummary = {
    //         orderId: `order_${Date.now()}`,
    //         paymentId: `wallet_${Date.now()}`,
    //         modeOfPayment: 'Wallet',
    //         items: cartItems.map(item => ({
    //             item_Id: item.item_Id,
    //             name: item.p_name,
    //             quantity: item.quantity,
    //             amount: item.amount,
    //             // image: item.image,
    //             // merchant: item.m_name || 'Unknown Merchant',
    //             // m_email: item.m_email || 'No Email'
    //         })),
    //         totalItems: cartItems.reduce((sum, product) => sum + product.quantity, 0),
    //         totalAmount: totalAfterDiscount,
    //         // discount: discount,
    //         customer: {
    //             name: userName,
    //             email: customerEmail,
    //             contact: userMobile,
    //             // address: selectedAddress
    //         }
    //     };

    //     setOrderSummaryData(orderSummary);
    //     setOrderPlaced(true);

    //     try {
    //         // Deduct the amount from the wallet balance
    //         const walletPayload = {
    //             email: userEmail,
    //             amount: -totalAfterDiscount,  // Deducting amount
    //             paymentMethod: 'Wallet',
    //         };

    //         const response = await fetch(`${BASE_URL}/api/wallet/addMoney`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(walletPayload),
    //         });

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             console.error('Error response from addMoney endpoint:', errorText);
    //             logger.log(`Error response from addMoney endpoint: ${errorText}`, 'ERROR');
    //             alert('Failed to process wallet payment. Please try again.');
    //             return;
    //         }

    //         // Fetch the updated wallet balance
    //         const updatedWalletResponse = await fetch(`${BASE_URL}/api/wallet/getUserByEmail?email=${userEmail}`);
    //         if (updatedWalletResponse.ok) {
    //             const wallet = await updatedWalletResponse.json();
    //             setWalletBalance(wallet.balance);
    //         }

    //         // Save the order
    //         await fetch(`${BASE_URL}/api/orders/save-order`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(orderSummary),
    //         });

    //         // clearCart();
    //     } catch (error) {
    //         console.error('Error handling wallet payment:', error);
    //         logger.log(`Error handling wallet payment: ${error}`, 'ERROR');
    //         alert('An error occurred. Please try again.');
    //     }
    // };


    const cartRef = useRef(null);

    useEffect(() => {
        if (cartRef.current) {
            gsap.from(cartRef.current.children, {
                scale: 0.75,
                opacity: 0,
                stagger: 0.2,
                ease: "elastic.out(1, 0.5)",
                duration: 1.5,
            });
        }
    }, [cartItems.length]); // Re-run animation when cart items change

    const removeItemAnimation = (itemName, measurement) => {
        const itemElement = document.getElementById(`cart-item-${itemName}-${measurement}`);
        if (itemElement) {
            gsap.to(itemElement, {
                opacity: 0,
                y: -100,
                ease: "back.in(1)",
                duration: 0.5,
                onComplete: () => handleRemoveItem(itemName, measurement), // Remove item after animation
            });
        }
    };
    return (
        <div>
            <div>
                <div className="header">
                    <h1 className="headM">
                        <div >
                            <img className=''
                                onClick={backToHome}
                                src="/images/8-removebg-preview.png"
                                alt="Devlok Food Street and Resort"
                                style={{
                                    width: "200px", height: "41.5px", cursor: "pointer", marginTop: '7px'
                                }}
                            />
                        </div>
                    </h1>
                    <div className="home-containerr" onClick={backToHome}>
                        <IoHome style={{ color: '#cbb396' }} />
                    </div>
                </div>
                {/* <div className="marqueecart"> */}
                {/* <button className="menuB" onClick={handleToggleChange} style={{ backgroundColor: '#f1c40f', border: 'none', color: 'black', borderRadius: '0' }}>☰ MENU</button> */}
                {/* <p>
                        🍝 𝙒𝙝𝙚𝙧𝙚 𝙩𝙝𝙚 𝙩𝙖𝙨𝙩𝙚 𝙤𝙛 𝙩𝙝𝙚 𝙢𝙤𝙪𝙣𝙩𝙖𝙞𝙣𝙨 𝙢𝙚𝙚𝙩𝙨 𝙩𝙝𝙚 𝙨𝙤𝙪𝙡 𝙤𝙛 𝙝𝙤𝙨𝙥𝙞𝙩𝙖𝙡𝙞𝙩𝙮 🍝
                        🎉 Hungry for More? Get Exclusive Discounts! 🍔📲
                        👉 Grab the app & start saving today! 🚀

                    </p> */}
                {/* </div> */}
                <div className='shoppingCart'>
                    {orderPlaced ? (
                        <>
                            <h3>Order Summary</h3>
                            {/* <button className='backToHome' onClick={backToHome}><IoHome /><span className='tooltiptext'>Home</span></button> */}
                        </>
                    ) : (
                        <>
                            {/* <h3>Your Cart</h3> */}
                            {cartItems.length > 0 && <img src="/images/emptyCart3.png"></img>}
                            {/* <button className='backToHome' onClick={backToHome}><IoHome /><span className='tooltiptext'>Home</span></button> */}
                        </>
                    )}
                </div>
                <div>
                    {orderPlaced ? (
                        <OrderSummary orderDetails={orderSummaryData} />
                    ) : (
                        <div className={cartItems.length === 0 ? 'emptyCartSection' : 'Cart'}>
                            {cartItems.length === 0 ? (
                                <div className='emptyCartSection'>
                                    <div className='emptyCart'>
                                        <div className='imageWrapper'>
                                            <img
                                                src="/images/emptyCart2.png"
                                                alt="Devlok Food Street and Resort"
                                                className='emptyCartImage'
                                            />
                                        </div>


                                    </div>

                                    <img src='/images/Empty.png' alt='Empty Cart' className='emptyCartText'></img>
                                    <p className='emptyP'>Your cart is waiting for you to add some amazing Foods. Order now and fill it up!</p>
                                    <br />
                                    <button className="explore-button" onClick={backToMenu}>
                                        Continue Ordering
                                    </button>
                                </div>

                            ) : (
                                <>

                                    <div className='leftside'>
                                        {/* <ul className='ittem'>
                                        <h3>Items </h3>
                                       
                                        {console.log("cartitem", cartItems)}
                                        {cartItems.map((item) => {
                                            const totalPrice = (item.price && item.quantity) ? (item.price * item.quantity).toFixed(2) : '0.00';
                                            return (
                                                <li key={`${item._id}-${item.measurement}`}>

                                                    <div className="CartItemDetails">
                                                        <div className='ImageSizefix'>
                                                            <img src={`${BASE_URL}/${item.image}`} alt={item.name} className="CartItemImage" />
                                                        </div>
                                                        {console.log("item", item)}
                                                        <div className='miniheading'>
                                                            <h4>{item.name} {item.measurement}</h4>
                                                            <p>{item.description}</p>
                                                        </div>

                                                        <div className='contentset'>
                                                            <p> <strong> ₹{totalPrice}</strong></p>
                                                            <div className="QuantityControls">

                                                                <div className="quantityStepper">
                                                                    <button
                                                                        aria-label="Decrease Quantity"
                                                                        className="quantityStepper-button decrement"
                                                                        onClick={() => handleDecrement(item.name, item.quantity, item.measurement)}>
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                        </svg>
                                                                    </button>

                                                                    <input
                                                                        type="text"
                                                                        className="quantityStepper-input"
                                                                        value={item.quantity}
                                                                        readOnly
                                                                    />

                                                                    <button
                                                                        aria-label="Increase Quantity"
                                                                        className="quantityStepper-button increment"
                                                                        onClick={() => handleIncrement(item.name, item.measurement)}
                                                                    >
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                <button className="removeProduct" onClick={() => handleRemoveItem(item.name, item.measurement)}
                                                                >
                                                                    <svg

                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="removeIcon"
                                                                    >
                                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                    </svg>
                                                                </button>


                                                            </div>
                                                           


                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul> */}

                                        <ul className="ittem" ref={cartRef}>
                                            <h3>Items</h3>
                                            {cartItems.map((item) => {
                                                const totalPrice = item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : "0.00";
                                                return (
                                                    <li key={`${item._id}-${item.measurement}`} id={`cart-item-${item.name}-${item.measurement}`} className="cart-item">
                                                        <div className="CartItemDetails">
                                                            <div className="ImageSizefix">
                                                                <img src={`${BASE_URL}/${item.image}`} alt={item.name} className="CartItemImage" />
                                                            </div>
                                                            <div className="miniheading">
                                                                <h4>{item.name} {item.measurement}</h4>
                                                                <p>{item.description}</p>
                                                            </div>

                                                            <div className="contentset">
                                                                <p><strong>₹{totalPrice}</strong></p>
                                                                <div className="QuantityControls">
                                                                    <div className="quantityStepper">
                                                                        <button
                                                                            aria-label="Decrease Quantity"
                                                                            className="quantityStepper-button decrement"
                                                                            onClick={() => handleDecrement(item.name, item.quantity, item.measurement)}
                                                                        >
                                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                            </svg>
                                                                        </button>

                                                                        <input type="text" className="quantityStepper-input" value={item.quantity} readOnly />

                                                                        <button
                                                                            aria-label="Increase Quantity"
                                                                            className="quantityStepper-button increment"
                                                                            onClick={() => handleIncrement(item.name, item.measurement)}
                                                                        >
                                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                    <button className="removeProduct" onClick={() => removeItemAnimation(item.name, item.measurement)}>
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        <div className="address-box">
                                            <div className="address-title">You have ordered at</div>
                                            <div className="address-details">
                                                <h4>Devlok Food Street and Resort</h4>
                                                <p>Dehradun, 201002</p>
                                                <span>Contact: 02020202020</span>
                                                <br />
                                                <span>Email: support@devlok.com</span>
                                            </div>
                                            <div className="address-message">
                                                As per your location, you are within the order acceptance limit.
                                            </div>
                                            <div className="address-terms" onClick={handleTermsClick}>

                                                <span>T&amp;C FOR ORDER ACCEPTANCE</span>
                                            </div>
                                            {showTermsModal && (
                                                <div className="modall-overllay">
                                                    <div className="modall">
                                                        <h3>Terms & Conditions</h3>
                                                        <p>
                                                            This feature is currently under development. Stay tuned for updates!
                                                        </p>
                                                        <button onClick={closeModal} className="closee-button">
                                                            Close
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className='TotalItemDetailss'>

                                        <div className="modal-overlay">
                                            <div className="modal-content">
                                                <h3>Enter Your Details</h3>
                                                <form onSubmit={handleSubmit}>
                                                    <div className="modal-input">
                                                        <label htmlFor="name">Name <span className="required">*</span></label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            value={userData.name}
                                                            onChange={handleInputChange}
                                                            pattern="^[A-Za-z\s]+$"
                                                            title="Name should contain only alphabets and spaces."
                                                            required
                                                        />
                                                        {errors.name && <p className="error-message">{errors.name}</p>}
                                                    </div>


                                                    <div className="modal-input">
                                                        <label htmlFor="email">Email <span className="required">*</span></label>
                                                        <input
                                                            type="text"
                                                            id="email"
                                                            name="email"
                                                            value={userData.email}
                                                            onChange={handleInputChange}
                                                            // pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                                            // title="Please enter a valid email address."
                                                            required
                                                        />
                                                        {errors.email && <p className="error-message">{errors.email}</p>}
                                                    </div>


                                                    <div className="modal-input">
                                                        <label htmlFor="contact">Contact <span className="required">*</span></label>
                                                        <input
                                                            type="text"
                                                            id="contact"
                                                            name="contact"
                                                            value={userData.contact}
                                                            onChange={handleInputChange}
                                                            pattern="^\d{10}$"
                                                            title="Contact number should be a 10-digit number."
                                                            required
                                                        />
                                                        {errors.contact && <p className="error-message">{errors.contact}</p>}
                                                    </div>
                                                    <div className="modal-input">
                                                        <label>Select Order Type  <span className="required">*</span></label>
                                                        <div className="toggle-buttons">
                                                            <button
                                                                type="button"
                                                                className={`toggle-button ${userData.orderType === "Dine-in" ? 'active' : ""}`}
                                                                onClick={() => handleOrderTypeChange("Dine-in")}
                                                            >
                                                                Dine-in
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`toggle-button ${userData.orderType === "Takeaway" ? 'active' : ''}`}
                                                                onClick={() => handleOrderTypeChange("Takeaway")}
                                                            >
                                                                Takeaway
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Table No. Input (Only for Dine-in) */}
                                                    {userData.orderType === "Dine-in" && (
                                                        <div className="modal-input">
                                                            <label htmlFor="tableNo">Table No. </label>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '103%' }}>
                                                                <input
                                                                    type="text"
                                                                    id="tableNo"
                                                                    name="tableNo"
                                                                    value={userData.tableNo || ""}
                                                                    onChange={handleInputChange}
                                                                    required

                                                                />
                                                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', marginTop: '10px' }} >
                                                                    <button onClick={submitButton}
                                                                        type="submit"
                                                                        disabled={!userData.tableNo}
                                                                        className={`toggle-button ${!userData.tableNo ? 'button-disabled' : ''}`}
                                                                    >Submit</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: '25px' }}>
                                                        <h3>Payment Details</h3>
                                                    </div>
                                                    <div className='paydetails'>
                                                        <p>Total Items : <b>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</b></p>
                                                        <p>MRP Total : <b>₹{total.toFixed(2)}</b></p>
                                                        <p>GST : <b>₹{tax.toFixed(2)}</b></p>

                                                        {/* <p>Product Discount: <b className='greenClass'>Rs.{discount.toFixed(2)}</b></p> */}
                                                        <hr style={{ border: '1px solid #5a3e36' }} />
                                                        <p><>Total :</> <b className='blackClass'>₹{totalAfterDiscount.toFixed(2)}</b></p>
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={displayRazorpay}
                                                            disabled={!total || !userData.name || !userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email) || !userData.contact || userData.contact.length !== 10 || !userData.orderType}
                                                            className={`button ${!total || !userData.name || !userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email) || !userData.contact || userData.contact.length !== 10 || !userData.orderType ? 'button-disabled' : ''}`}
                                                        >
                                                            PROCEED TO CHECKOUT
                                                        </button>
                                                        {showModal && (
                                                            <div className="modal-overlay-payment">
                                                                <div className="modal-content-payment">
                                                                    <h2>Payment Canceled</h2>
                                                                    <p>Do you want to retry the payment or go back to the cart?</p>
                                                                    <button className="abort-btn" onClick={handleAbortPayment}>Abort</button>
                                                                    <button className="continue-btn" onClick={handleContinuePayment}>Continue</button>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                </form>
                                            </div>
                                        </div>



                                    </div>




                                </>

                            )}


                        </div>

                    )
                    }

                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={3000}
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



                </div >
            </div >
            <div className='footercart'>
                {/* Your content here */}
                <Footer />
            </div>
        </div>
    );
}

export default Cart;


