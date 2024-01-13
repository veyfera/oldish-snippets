import { useState, useEffect } from 'react';
import { initialiseTradeTimer } from '../utils';

interface TimerProps {
    delaySeconds:number
    nextUser:Function
}

const TurnTimer = ({delaySeconds, nextUser}:TimerProps) => {
    const [delay, setDelay] = useState(delaySeconds);
    const hours = Math.floor(delay / 3600);
    const minutes = Math.floor(delay / 60);
    const seconds = Math.floor(delay % 60);


    const decrementTimer = () => {
        setDelay(delay - 1);
        clearInterval(timer);
        if (delay === 0) {
            setDelay(delaySeconds);
            nextUser();
        }
    }
    
    const timer = setInterval(decrementTimer, 1000);

  return (
    <div>
        {hours}:{minutes}:{seconds}
    </div>
  );
}

export default TurnTimer;
