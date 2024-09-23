import { createContext, useContext } from "react";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const Star = ({ filled }) => {
    return <span>{filled ? "★" : "☆"}</span>;
  };

  const values = {
    Star,
  };

  return <CartContext.Provider value={values}>{children}</CartContext.Provider>;
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };
