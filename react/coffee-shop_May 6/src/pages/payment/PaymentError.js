import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';

import { CartContext } from '../../App';
import errorIcon from '../../assets/error.svg';

export default function PaymentError() {
  const {cart, setCart} = useContext(CartContext);
  const navigate = useNavigate();

  const handleCancel = () => {
    setCart([]);
    navigate('/');
  }

  return (
    <div className="page payment-error">
    <div className="page__progress">
      <img src={errorIcon} alt="" />
      Оплата не прошла
    </div>
    <div className="page__buttons">
      <button onClick={() => navigate('/payment/card')}>Попробовать еще раз</button>
      <button onClick={handleCancel}>Отмена</button>
    </div>
    </div>
  );
}
