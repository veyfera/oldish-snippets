fetch('/config/')
.then((res) => {return res.json(); })
.then((data) => {
  const stripe = Stripe(data.publicKey);

  const buttons = document.getElementsByTagName('button')

  buttons[0].addEventListener('click', function() {
    fetch(`/buy/${this.id}`)
      .then((res) => { return res.json() })
      .then((data) => {
        console.log(data)
        return stripe.redirectToCheckout({sessionId: data.sessionId})
      })
      .then((res) => {
        console.log(res)
      })
  })

  buttons[1].addEventListener('click', function() {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      fetch(`/cart/add/${this.id}`)
      .then((res) => { return res.json() })
        .then((data) => {
          console.log('data: ', data);
          cartId = data.cartId
          localStorage.setItem('cartId', cartId)

          const cartLink = document.querySelector("a[href='/cart/']");
          cartLink.href = cartLink.href + cartId;
        })
    } else {
      fetch(`/cart/add/${this.id}/${cartId}`)
      .then((res) => { return res.json() })
        .then((data) => {
          if (data.ok) {
            alert("Item successfully added to cart")
          }
        })
    }
  })

})

