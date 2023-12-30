import { Swiper, Navigation } from 'swiper';
Swiper.use([Navigation]);

document.addEventListener('DOMContentLoaded', () => {

    const swiper = new Swiper('.swiper', {
    // Optional parameters
    loop: false,
    slidesPerView: 'auto',
    spaceBetween: 32,

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        },
    });

    //Button handlers

    const toggleView = document.getElementById('schedule-type-btn');
    const listView = document.getElementById('list-view');
    const tableView = document.getElementById('event-table');
    const viewLabel = toggleView.getElementsByTagName('span')[0];
    const weeks = document.getElementById('weeks');

    toggleView.addEventListener('click', () => {
        listView.toggleAttribute('hidden');
        tableView.toggleAttribute('hidden');
        weeks.toggleAttribute('hidden');

        if (viewLabel.innerHTML === 'Список') {
            viewLabel.innerHTML = 'Таблица';
        }
        else {
            viewLabel.innerHTML = 'Список';
        }
    });

    const programTxt = document.getElementById('programTxt');
    const programBtn = document.getElementById('programBtn');

    programBtn.addEventListener('click', () => {
        if (!programTxt.className){
            programTxt.className = 'show-block';
            programBtn.className = 'expanded-btn';
            return
        };
        programTxt.className = '';
        programBtn.className = '';
    });

    const addBtn = document.getElementById('addBtn');

    addBtn.addEventListener('click', () => {
        addBtn.toggleAttribute('enabled');
    });

    const tableBtns = document.getElementsByClassName('calendar-btn');

    Array.from(tableBtns).forEach(btn => {
        btn.addEventListener('click', function() {
            this.toggleAttribute('enabled');
        });
    });




})
