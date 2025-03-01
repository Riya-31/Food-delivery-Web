// OrderSummary.js

import React, { useState, useEffect } from 'react';
import '../css/Cart.css';
import '../css/OrderSummary.css';
// import Navbar from './Navbar';
import { BASE_URL } from '../config';
import Logger from './Logger';

function OrderSummary({ orderDetails }) {
    // console.log("orderdetails", orderDetails);
    const [timer, setTimer] = useState(300000); // 5 minutes in milliseconds
    const [isDisabled, setIsDisabled] = useState(false);
    const selectedMerchantEmail = sessionStorage.getItem('selectedMerchantEmail');
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);

    // Initialize Logger
    const logger = new Logger(`${BASE_URL}/api/logs/customer`);

    useEffect(() => {
        const calculateTotal = () => {
            let newTotal = orderDetails.totalAmount; // Use total amount from backend
            setTotalAfterDiscount(newTotal);        // Set the total directly
        };

        calculateTotal();
    }, []);


    // useEffect(() => {
    //     const countdown = setInterval(() => {
    //         setTimer(prevTimer => {
    //             if (prevTimer <= 1000) {
    //                 clearInterval(countdown);
    //                 setIsDisabled(true);
    //                 return 0;
    //             }
    //             return prevTimer - 1000;
    //         });
    //     }, 1000);

    //     return () => clearInterval(countdown);
    // }, []);

    // const formatTime = (milliseconds) => {
    //     const minutes = Math.floor(milliseconds / 60000);
    //     const seconds = Math.floor((milliseconds % 60000) / 1000);
    //     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    // };

    if (!orderDetails) {
        return <div>Loading...</div>;
    }

    // function openOrders() {
    //     window.location.href = '/orders';
    // }


    return (

        <div className="order-summary-container">
            <header className="order-summary-header">
                <h1 className="restaurant-name">Devlok Street Food and Resort</h1>
                <h2 className="thank-you-message">Thank you for placing order with us!</h2>
            </header>

            <main className="order-summary-main">
                <div className='first-para'>
                    <section className="customer-details">
                        <h2 className="section-heading">Customer Details</h2>
                        <p><b>Name:</b> {orderDetails.customer[0].name}</p>
                        <p><b>Email:</b> {orderDetails.customer[0].email}</p>
                        <p><b>Contact:</b> {orderDetails.customer[0].contact}</p>
                        {/* Only show Table No. if Mode of Payment is "Dine-in" */}
                        <p><b>OrderType:</b> {orderDetails.type}</p>
                        {orderDetails.type === "Dine-in" && (
                            <p>
                                <b>Table No.: </b>
                                {orderDetails.table ? orderDetails.table : <span style={{ color: "red" }}>You did not mention a table number.</span>}
                            </p>
                        )}
                    </section>
                    <section className="sub-details">
                        <h2 className="section-heading">Order Summary</h2>
                        <p><b>Order No:</b> {orderDetails.orderNo ? orderDetails.orderNo : "Not available"}</p>
                        <p><b>Mode of Payment:</b> {orderDetails.modeOfPayment}</p>

                        <p><b>Total Items:</b> {orderDetails.totalItems}</p>
                        <p><b>Total Amount (Incl. Tax):</b> ₹{totalAfterDiscount.toFixed(2)}</p>
                    </section>
                </div>
                <section className="order-details">
                    <h3 className="section-heading">Ordered Items</h3>
                    <div className="ordered-items-table-container">
                        <table>
                            <tr>
                                <th>Sr. No</th>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Price (₹)</th>
                                <th>Total (₹)</th>
                            </tr>
                            {/* {console.log(orderDetails)} */}
                            {orderDetails.items.map((item, index) => (

                                <tr key={item._id}>
                                    <td>{index + 1}</td>
                                    <td>{item.name} {(item.measurement)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price.toFixed(2)}</td>
                                    <td>{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </table>
                    </div>
                </section>
            </main>

            <footer className="order-summary-footer">
                <p>Have a question about your order? Contact us at <b>support@devlok.com</b> or call <b>02020202020</b>.</p>
                {/* <button className="go-to-orders-button" onClick={openOrders}>Go to My Orders</button> */}
            </footer>
        </div>
    );
};


export default OrderSummary;
