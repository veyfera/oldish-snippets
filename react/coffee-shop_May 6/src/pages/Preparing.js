import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useContext, useState } from 'react';

import { emulator } from '../Emulator';
import { CartContext } from '../App';

export default function Preparing() {
  const {cart, setCart} = useContext(CartContext);
  const navigate = useNavigate();

  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  
  const tick = () => {
    if(sec < 60) {
      setSec(sec + 1);
    } else if(sec === 60) {
      setSec(0);
      setMin(min + 1);
    } else if (min === 60){
      setMin(0);
    }
  }

  useEffect(() => {
    setTimeout(tick, 1000);
  })

  const cb = (result) => {
    setCart([]);
    if(result) {
      navigate('/drink-ready');
    } else {
      navigate('/drink-unavailable');
    }
  }

  emulator.Vend(cart[0], cb);

  return (
    <>
    <div className="timer__loader">
      <div className="timer__time">
        {min<10?'0'+min:min}:{sec<10 ?'0'+sec:+sec}
      </div>
      <div className="timer__text">Приготовление напитка</div>
    </div>
    </>
  );
}
