document.addEventListener('DOMContentLoaded', function() {

    const sale = document.getElementById('sale-date');

    let saleDate = new Date();
    saleDate = saleDate.setDate(saleDate.getDate() + (1 + 7 - saleDate.getDay()) % 7);
    sale.innerHTML = new Date(saleDate).toLocaleDateString('ru-RU', {day: 'numeric', month:'numeric', year: '2-digit'}) + '!'

})
