import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';

import { CartContext } from '../../App';
import { products } from '../../data';
import cardIcon from '../../assets/card.svg';
import cashIcon from '../../assets/cash.svg';

export default function PaymentMethods() {
  const {cart, setCart}= useContext(CartContext);
  const totalCost = products.filter(p => cart.includes(p.id)).reduce((a, cv) => a+cv.price, 0)
  const navigate = useNavigate();

  const handleBack = () => {
    setCart([]);
    navigate('/products');
  }

  return (
    <div className="page payment-methods">
      <div className="page__progress">
        <div>
          Итого к оплате {totalCost} ₽
        </div>
        <div>
          выберите способ оплаты
        </div>
      </div>

      <div className="page__buttons">
        <button onClick={() => navigate('cash')}>
          Наличными
        </button>
        <button onClick={() => navigate('card')}>
          Картой
        </button>
        <button onClick={handleBack}>
          Отмена
        </button>
      </div>
    </div>
  );
}
