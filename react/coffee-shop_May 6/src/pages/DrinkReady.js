import { Link, useNavigate } from 'react-router-dom';
import drinkIcon from '../assets/ready.svg';

export default function PaymentError() {

  return (
    <Link to="/" className="page drink-ready">
      <img src={drinkIcon} alt="" />
      Напиток готов!
      <div>вы можете забрать его</div>
    </Link>
  );
}
