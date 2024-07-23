import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import { emulator } from '../../Emulator';
import { CartContext } from '../../App';
import { products } from '../../data';
import cardIcon from '../../assets/card.svg';

export default function CardPayment() {
  const {cart, setCart} = useContext(CartContext);
  const navigate = useNavigate();

  const cb = (success) => {
    if(success) {
      setTransactionProgress('Трансакция прошла успешно');
      setTimeout(() => navigate('/preparing'), 3000);
    } else {
      setTransactionProgress('Трансакция не прошла');
      setTimeout(() => navigate('/payment/error'), 3000);
    }
  }

  const handleCancel = () => {
    emulator.BankCardCancel();
    setTimeout(() => navigate('/payment/error'), 3000);
  }

  const [transactionProgress, setTransactionProgress] = useState('Подготовка...');
  const totalAmmount = cart.length && products.find(p => p.id === cart[0]).price;

  useEffect(() => {
    emulator.BankCardPurchase(totalAmmount, cb, setTransactionProgress)
  }, [])

  return (
    <div className="page card-payment">
      <div className="page__progress card-payment__progress">
        <img src={cardIcon} alt="" />
        {transactionProgress}
      </div>
      <button onClick={handleCancel}>Отмена</button>
    </div>
  );
}
