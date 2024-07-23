import { Link, useNavigate } from 'react-router-dom';

export default function PaymentError() {
  const navigate = useNavigate();

  return (
    <>
    Оплата не прошла
    <button onClick={() => navigate("/payment/card")}>Попробовать еще раз</button>
    <button onClick={() => navigate("/")}>Отмена</button>
    </>
  );
}
