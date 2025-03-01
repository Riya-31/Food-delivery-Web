// useCart.js

import React, { useState, useContext, createContext, useEffect } from 'react';
import { BASE_URL } from '../config';
import Logger from './Logger';
import Swal from 'sweetalert2';

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

function useCartProvider() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const userEmail = sessionStorage.getItem('userEmail');

    // Initialize Logger
    const logger = new Logger(`${BASE_URL}/api/logs/customer`);

    const addToCart = async (item) => {
        try {
            const response = await fetch(`${BASE_URL}/api/cart/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: item.name,
                    quantity: item.quantity,
                    amount: item.merchant.price,
                    email: userEmail,
                    m_email: item.merchant.m_email,
                    m_name: item.merchant.m_name,
                    item_Id: item.item_Id,
                    weight: item.weight,
                    unit: item.unit
                }),
            });

            const responseBody = await response.json(); // Read the response body once

            if (!response.ok) {
                if (response.status === 400) {
                    // Show a beautiful alert for limited stock
                    Swal.fire({
                        icon: 'warning',
                        title: 'Limited Stock',
                        text: 'The requested quantity is not in stock. Please try a lower quantity.',
                    });
                    throw new Error('Limited stock');
                } else {
                    console.error('Failed to add item to cart:', responseBody.message || responseBody);
                    logger.log(`Failed to add item to cart: ${responseBody.message || responseBody}`, 'ERROR');
                    throw new Error(responseBody.message || 'Failed to add item to cart');
                }
            } else {
                setCart(prevCart => [...prevCart, responseBody]);
            }
        } catch (error) {
            console.error('Error adding item to cart:', error.message);
            logger.log(`Error adding item to cart: ${error.message}`, 'ERROR');
            throw error; // Ensure the error is propagated for further handling
        }
    };

    const updateCartItem = async (itemName, quantityChange) => {
        try {
            const endpoint = quantityChange > 0 ? 'increment' : 'decrement';
            const response = await fetch(`${BASE_URL}/api/cart/${endpoint}/${itemName}/${userEmail}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Limited Stock',
                        text: errorData.message || 'The requested quantity is not in stock. Please try a lower quantity.',
                    });
                }
                console.error(`Failed to update item quantity: ${errorData.message || 'Unknown error'}`);
                logger.log(`Failed to update item quantity: ${errorData.message || 'Unknown error'}`, 'ERROR');
                return; // Exit the function gracefully without rethrowing the error
            }

            const updatedItem = await response.json();
            setCart(prevCart =>
                prevCart.map(item =>
                    item.name === itemName ? { ...item, quantity: updatedItem.quantity } : item
                )
            );
        } catch (error) {
            console.error('Error updating item quantity:', error.message);
            logger.log('Error updating item quantity:', error.message);
        }
    };

    const removeFromCart = async (itemName) => {
        try {
            const response = await fetch(`${BASE_URL}/api/cart/remove/${itemName}/${userEmail}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }

            console.log('Removing item:', itemName);

            // Update the cart state to remove the item
            setCart(prevCart => {
                const updatedCart = prevCart.filter(item => item.name !== itemName);
                console.log('Updated cart:', updatedCart); // Check updated cart
                window.location.reload();
                return updatedCart;
            });

        } catch (error) {
            console.error('Error removing item from cart:', error.message);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/cart/empty-cart/${userEmail}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to clear cart');
            }
            setCart([]);
        } catch (error) {
            console.error('Error clearing cart:', error.message);
            throw error;
        }
    };

    const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);


    return { cart, loading, error, addToCart, updateCartItem, removeFromCart, clearCart, getCartCount };
}

export const CartProvider = ({ children }) => {
    const cart = useCartProvider();

    return (
        <CartContext.Provider value={cart}>
            {children}
        </CartContext.Provider>
    );
};
