fetch('/config/')
.then((res) => {return res.json(); })
.then((data) => {
  const stripe = Stripe(data.publicKey);

  const btn = document.getElementsByClassName('buy-all-btn')[0];
  btn.addEventListener('click', function() {
    fetch(`/cart/${this.id}`, {
      method: 'POST',
    })
      .then((res) => { return res.json() })
      .then((data) => {
        console.log(data)
        return stripe.redirectToCheckout({sessionId: data.sessionId})
      })
      .then((res) => {
        console.log(res)
      })
  })

})

