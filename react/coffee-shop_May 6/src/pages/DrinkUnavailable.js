import { Link, useNavigate } from 'react-router-dom';
import warningIcon from '../assets/warning.svg';

export default function DrinkUnavailable() {
  const navigate = useNavigate();

  return (
    <div className="page drink-unavailable">
      <div className="page__progress">
        <img src={warningIcon} alt="" />
        Данного напитка нет в наличии
      </div>
      <button onClick={() => navigate('/products')}>Вернуться на главную</button>
    </div>
  );
}
