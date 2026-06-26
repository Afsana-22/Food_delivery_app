import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null);

  const addToCart = (item, restaurant) => {
    const restaurantId = typeof restaurant === 'string' ? restaurant : restaurant?._id;
    const restaurantMeta = typeof restaurant === 'string' ? { _id: restaurant } : restaurant;

    setCartItems((prev) => {
      if (prev.length > 0 && prev[0].restaurantId !== restaurantId) {
        if (!window.confirm('Adding items from a new restaurant will clear your current cart. Proceed?')) {
          return prev;
        }
        setCartRestaurant(restaurantMeta || null);
        return [{ ...item, id: item._id || item.id, restaurantId, quantity: 1 }];
      }

      const existing = prev.find((cartItem) => cartItem.id === (item._id || item.id));
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === (item._id || item.id)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      setCartRestaurant(restaurantMeta || null);
      return [...prev, { ...item, id: item._id || item.id, restaurantId, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== id && item._id !== id);
      if (nextItems.length === 0) {
        setCartRestaurant(null);
      }
      return nextItems;
    });
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) => prev.map((item) =>
      (item.id === id || item._id === id)
        ? { ...item, quantity: newQty }
        : item
    ));
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const clearCart = () => {
    setCartItems([]);
    setCartRestaurant(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartRestaurant,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalAmount,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
