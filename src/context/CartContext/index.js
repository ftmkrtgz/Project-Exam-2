import { useState, createContext, useContext } from "react";

const CartContext = createContext();

const defaultCart = JSON.parse(localStorage.getItem("cart")) || [];

const CartProvider = ({ children }) => {
  const [items, setItems] = useState(defaultCart);

  const addToCart = (product) => {
    const existingProductIndex = items.findIndex(
      (item) => item.id === product.id
    );
    if (existingProductIndex !== -1) {
      const newCartItems = [...items];
      newCartItems[existingProductIndex].quantity += 1;
      setItems(newCartItems);
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (product) => {
    setItems(items.filter((item) => item.id !== product.id));
  };

  const Star = ({ filled }) => {
    return <span>{filled ? "★" : "☆"}</span>;
  };

  const emptyCart = () => setItems([]);
  const values = {
    items,
    setItems,
    addToCart,
    removeFromCart,
    emptyCart,
    Star,
  };

  return <CartContext.Provider value={values}>{children}</CartContext.Provider>;
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };
