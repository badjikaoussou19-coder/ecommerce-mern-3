import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  const add = (product, quantity = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i._id === product._id);
      if (found) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, stock: product.stock, quantity: Math.min(i.quantity + quantity, product.stock) } : i
        );
      }
      return [
        ...prev,
        { _id: product._id, name: product.name, price: product.price, image: product.image, stock: product.stock, quantity: Math.min(quantity, product.stock) },
      ];
    });

  const remove = (id) => setItems((prev) => prev.filter((i) => i._id !== id));

  const setQuantity = (id, quantity) =>
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i)));

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQuantity, clear, total, count }}>{children}</CartContext.Provider>
  );
}
