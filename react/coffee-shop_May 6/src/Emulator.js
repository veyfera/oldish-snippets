import ReactDOM from 'react-dom';

export const emulator = {
  mode: "",
  cb: null,
  displayCb: null,
  StartCash: function(cb) {
    this.mode = 'cash';
    this.cb = cb;
  },
  StopCashin: function(cb) {
    this.mode = '';
  },

  BankCardPurchase: function(ammount, cb, display_cb) {
    this.mode = 'card';
    this.cb = cb;
    this.displayCb = display_cb
  },
  BankCardCancel: function() {
    this.displayCb('Неуспешная трансакция');
    this.cb(false);
    this.mode = '';
  },
  Vend: function(product_idx, cb) {
    this.mode = 'vend';
    this.cb = cb;
  },

};

function Emulator() {
  const modalDiv = document.getElementById('emulator');

  const notesNominal = [ 5000, 2000, 1000, 500, 200, 100, 50, 10, 5 ]
  const coinsNominal = [ 10, 5, 2, 1]

  const handleCash = (ammount) => {
    if(emulator.mode === 'cash') {
      emulator.cb(ammount)
    }
  }

  const handleDisplayCb = (text) => {
    if(emulator.mode === 'card') {
      emulator.displayCb(text);
    }
  }
  
  const handleCard = (result) => {
    if(emulator.mode === 'card') {
      emulator.cb(result);
    }
  }

  const handleVend = (result) => {
    if(emulator.mode === 'vend') {
      emulator.cb(result)
    }
  }

  return ReactDOM.createPortal((
    <>
      <h1>Эмулятор</h1>
      <div className="cash">
      <div>Оплата наличными</div>
      {notesNominal.map(n => <button className="cash__note" key={n} onClick={() => handleCash(n)}>{n}</button>)}
      <br />

      {coinsNominal.map(n => <button className="cash__coin" key={n} onClick={() => handleCash(n)}>{n}</button>)}
      </div>
      <hr />

      <div className="card">Оплата картой</div>
      <ul>
      <li><button onClick={() => handleDisplayCb('Приложите карту к терминалу')}>Приложите карту</button></li>
      <li><button onClick={() => handleDisplayCb('Обработка карты')}>Обработка карты</button></li>
      <li><button onClick={() => handleDisplayCb('Связь с банком')}>Связь с банком</button></li>
      </ul>
      <button onClick={() => handleCard(true)}>Успешная трансакция</button>
      <button onClick={() => handleCard(false)}>Неуспешная трансакция</button>
      <hr />

      <div className="drink">Выдача напитка</div>
      <button onClick={() => handleVend(true)}>Выдать напиток</button>
      <button onClick={() => handleVend(false)}>Напитка нет</button>
    </>
  ), modalDiv)
}

export default Emulator;

