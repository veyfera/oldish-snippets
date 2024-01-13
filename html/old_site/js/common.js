document.addEventListener('DOMContentLoaded', function() {

	// $('body').hide()
    const projectSlider = new Swiper('.projects__slider', {
        loop: true,
		slidesPerView: 2,
		speed: 1800,
		centeredSlides: true,
        autoplay: true,
		navigation: {
			nextEl: '.projects-slider__next',
			prevEl: '.projects-slider__prev'
		},
        effect: 'coverflow',
        coverflowEffect: {
            rotate: 30,
            slideShadows: false,
        },
	})


    const logo1 = new Typewriter('#logo1', {
        strings: ['mai'],
        delay: 300,
        loop: true,
        cursor: '',
        autoStart: true,
        pauseFor: 3000
    });
    const logo2 = new Typewriter('#logo2', {
        strings: ['efyev'],
        delay: 300,
        loop: true,
        cursor: '',
        autoStart: true,
        pauseFor: 3000
    });


    MicroModal.init({
		openTrigger: 'data-micromodal-open',
		closeTrigger: 'data-micromodal-close',
		disableScroll: true,
		disableFocus: true,
		awaitOpenAnimation: true,
		awaitCloseAnimation: true
	})


    //INTERACTIVE MODAL
    const data = {
        sinenrgems: {
            heading: 'Дизайн конструктора украшений',
            text: 'Дизайн конструктора бус и браслетов для ювелирной компании Sinnergems. Владелец компании собрался делать сайт и рассматривал разные варианты дизайна. Я нарисовал свое видение дизайна сайта и выслал ему. Дизайн ему понравился, но так как сайт задумывался быть большим и сложным над ним сейчас работает команда профи, и возьмут ли они что то из моей идеи, это на их усмотрение.',
            link: '#',
            technologies: '&lt;Figma /&gt;'
        },
        ezichestvo: {
            heading: 'Сайт Ежичество',
            text: 'Ежичество это мой новый Pet проект. С начала появилось название, потом идея. Начал накапливаться материал для наполнения и потом наступил долгий этап дизайна. Нужно было нарисовать много картинок, продумать общий стиль а так же добавить мелкте детали благодоря которым сайт должен ожить. Этап верстки завершен, сейчас идет создание логики на React js, дальше предстоит разработать backend и базу данных.',
            link: '#',
            technologies: '&lt;Figma /&gt; &lt;React /&gt;'
        },
        history: {
            heading: 'Сайт Исторический Навигатор',
            text: 'Сайт предназначен для размещения материалов по истории и географии для онлайн школы. В нем материал разделен по тематике на курсы (древний мир, древняя Русь, история России и.т.п), которые разделенны на отдельные уроки. В каждом уроке есть: слайд-шоу, главные темы урока, а так же ссылки на доп материал для чтения и просмотра. А еще на каждой странице есть современная карта мира для наглядности материала урока. <a href="https://history.raar-prog.ru/" target="_blank">Сам сайт</a>',
            link: '#',
            technologies: '&lt;Figma /&gt; &lt;JS /&gt;'
        },
        povarezik: {
            heading: 'Сайт вегетарианских рецептов',
            text: 'Сайт изначально задумывался как детский по этому главной идеей этого проекта была простота использования и отсутствие системы логина для пользователя. День рождения проекта Поварёжик 12-е марта 2021 года и его ведут 2 отменных повара Бладушка и Алинчик, эти ёжики творят под совместным творческим псевдонимом Поварёжик.',
            link: '#',
            technologies: '&lt;Figma /&gt; &lt;React /&gt; &lt;MariaDb /&gt; &lt;Flask /&gt;'
        },
        photovolshebnitsa: {
            heading: 'Личный сайт визитка для профессионального фотографа',
            text: 'Проект начинался со стадии идеи, потом был создан дизайн в который заказчик внес свои коррективы. Дальше происходила верстка и посадка на WinterCMS, с системой оповещения о заявках по почте. <a href="https://photovolshebnitsa.ru/" target="_blank">Сам сайт</a>',
            link: '',
            technologies: '&lt;Figma /&gt; &lt;JS /&gt; &lt;WinterCMS /&gt;'
        },
        shastra: {
            heading: 'Приложение для Android и IOS',
            text: 'Приложение для мобильных телефонов для офлайн чтения книг. Появился заказ с техническим заданием сделать приложения по типу готового приложения из AppStore. С самого начала клиент вел себя не очень вежливо, но с горем пополам договорились о сроках и оплате, началась работа. После демонстрации первой рабочей версси клиент начал придираться ко всему и откровенно хамить. Посоветовавшись с опытным разработчиком, я ответил на все вопроссы клиента, и пожелал ему удачи в поисках нового разработчика.',
            link: '',
            technologies: '&lt;React Native /&gt;'
        },
    }

    let modalImg = document.querySelector('.modal-content__img');
    let modalHeading = document.querySelector('.content-desc__text h2');
    let modalText = document.querySelector('.content-desc__text p');
    let modalTechnologies = document.querySelector('.content-desc__info p');
    //change img of modal
    $('.projects__img').click((e) => {
        let src = e.target.style.backgroundImage;
        let name = src.slice(12, -6)
        src = src.replace('.png', '2.png')
        console.log(src, name);

        modalImg.style.backgroundImage = src;
        modalHeading.innerHTML = data[name].heading;
        modalText.innerHTML = data[name].text;
        modalTechnologies.innerHTML = data[name].technologies;
    })



})
