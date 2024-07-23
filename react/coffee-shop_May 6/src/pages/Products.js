import { Link, useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react';

import { CartContext } from '../App';
import { categories, products } from '../data';
import phoneIcon from '../assets/phone-icon.png';

export default function Products() {
  const {cart, setCart} = useContext(CartContext);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const navigate = useNavigate();

  const purchase = (product) => {
    setCart([...cart, product.id]);
    console.log(cart);
    navigate('/payment');
  }

  return (
    <>
    <header className="products__header" style={{backgroundColor: selectedCategory.color}}>
      <div className="txt">
        Выбор напитка
      </div>

      <div className="login">
        <img src={phoneIcon} alt="" />
        <Link to="">Вход</Link>
        /
        <Link to="">регистрация</Link>
      </div>
    </header>

    <div className="products__categories">
    {categories.map(c => (
      <div className="products__categories-item" style={c.id === selectedCategory.id ?{backgroundColor: 'white',}:null} key={c.id} onClick={() => setSelectedCategory(c)}>
        <div className="products__categories-decoration" style={c.id === selectedCategory.id ?{backgroundColor: c.color,}:null}></div>
        <img src={'/images/'+c.img} style={c.id === selectedCategory.id ? {filter: 'grayscale(0)'}:null} alt="" />
        {c.name}
      </div>
    ))}
    </div>

    <div className="products">

      <div className="products__decoration" style={{backgroundColor: selectedCategory.color}}></div>
      <h3>{selectedCategory.name}</h3>

      <ul className="products__items">
      {products.filter(pr => pr.cat === selectedCategory.id).map(p => (
        <div className="product__item" key={p.id} onClick={() => purchase(p)}>
          <img src={'/images/products/'+p.img} alt="" />
          <div className="product__name">
            {p.name}
          </div>
          <div className="product__price">
            <span>от</span> {p.price} ₽
          </div>
        </div>
      ))}
      </ul>

    </div>
    </>
  );
}
