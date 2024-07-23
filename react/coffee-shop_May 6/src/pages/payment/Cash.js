import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import { emulator } from '../../Emulator';
import { CartContext } from '../../App';
import { products } from '../../data';

export default function CashPayment() {
  const {cart, setCart} = useContext(CartContext);
  const navigate = useNavigate();

  const totalAmmount = cart.length && products.find(p => p.id === cart[0]).price;
  const [inputCash, setInputCash] = useState(0);

  function cb (ammount) {
    setInputCash(inputCash+ammount);
    console.log(inputCash)
  }

  const handleBack = () => {
    emulator.StopCashin(cb)
    navigate('/payment')
  }

  const handleNext = () => {
    emulator.StopCashin(cb)
    navigate('/preparing')
  }

  useEffect(() => {
    emulator.StartCash(cb)
  }, [inputCash])

  return (
    <div className="page cash">
      <div className="page__progress">
        Итого {totalAmmount} ₽
        <br />
        Внесенно {inputCash} ₽
      </div>

      <div className="page__buttons">
      { inputCash >= totalAmmount &&
        <button onClick={handleNext}>Продолжить</button>
      }
        <button onClick={handleBack}>
          Отмена
        </button>
      </div>
    </div>
  );
}
