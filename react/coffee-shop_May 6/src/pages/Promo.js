import { Link } from 'react-router-dom';
import promoImg from '../assets/promo.png';

export default function Promo() {
  return (
    <>
      <Link to="/products">
        <img src={promoImg} alt="Коснитесь экрана" className="promo" />
      </Link>
    </>
  );
}
