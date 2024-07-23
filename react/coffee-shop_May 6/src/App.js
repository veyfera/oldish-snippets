import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useState, createContext } from 'react';
import Emulator from './Emulator.js';

import Promo from './pages/Promo';
import Products from './pages/Products';
import Preparing from './pages/Preparing';
import DrinkReady from './pages/DrinkReady';
import DrinkUnavailable from './pages/DrinkUnavailable';

import PaymentMethods from './pages/payment/PaymentMethods';
import CashPayment from './pages/payment/Cash';
import CardPayment from './pages/payment/Card';
import PaymentError from './pages/payment/PaymentError';


export const CartContext = createContext();

function App() {
  const [cart, setCart] = useState([]);

  return (
    <>
    <CartContext.Provider value={{ cart, setCart }}>
      <Routes>
        <Route path="" element={<Promo />}></Route>
        <Route path="products" element={<Products />}></Route>

        <Route path="payment" element={<PaymentMethods />}></Route>
        <Route path="payment/cash" element={<CashPayment />}></Route>
        <Route path="payment/card" element={<CardPayment />}></Route>
        <Route path="payment/error" element={<PaymentError />}></Route>

        <Route path="preparing" element={<Preparing />}></Route>
        <Route path="drink-ready" element={<DrinkReady />}></Route>
        <Route path="drink-unavailable" element={<DrinkUnavailable />}></Route>
      </Routes>
    </CartContext.Provider>
    <Emulator />
    </>
  );
}

export default App;
