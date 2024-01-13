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
            heading: 'Design of jewelry constructor',
            text: 'Design for necklace and bracelet constructor of the jewelry company Sinnergems. Owner of the company decided to create a website and was looking for design ideas. I made my design and sent it to him and he liked it. The site is going to be big and complex so a team of professionals are working on it, and they might or might not use parts of my design.',
            link: '#',
            technologies: '&lt;Figma /&gt;'
        },
        ezichestvo: {
            heading: 'Ezichestvo website',
            text: 'Ezichestvo is my current pet project. First the name was made up, then the idea formed. Later on the content for filling the website started gathering and then came the long design stage. I had to draw a lot of pictures, create a style and of course add some small details for the website to come alive. HTML layout is finished and right now I am writing the frontend login with React js. After that I will have to create a backend and database.',
            link: '#',
            technologies: '&lt;Figma /&gt; &lt;React /&gt;'
        },
        history: {
            heading: 'Historical Navigator website',
            text: 'The website is made for posting information related to history an geography courses of an online school. The material is divided based on time and location (ancient world, ancient Rus, history of Russia, etc.), they are divided further on into lessons. Each lesson contains a sideshow, main points of the lesson and links for extra reading and watching. Also each page includes the modern world map for reference. <a href="https://history.raar-prog.ru/" target="_blank">Link to website</a>',
            link: '#',
            technologies: '&lt;Figma /&gt; &lt;JS /&gt;'
        },
        povarezik: {
            heading: 'Website for vegetarian recipes',
            text: '03/12/2021 Is the birthday of the Povarezik project. The main idea of this website is to make is user friendly by, keeping everything simple and not having to log in to use all the functionality. The target audience is kids of school age.',
            link: '#',
            technologies: '&lt;Figma /&gt; &lt;React /&gt; &lt;MariaDb /&gt; &lt;Flask /&gt;'
        },
        photovolshebnitsa: {
            heading: 'Personal promo website for a professional photographer',
            text: 'The project started out as an idea. Then I created the design, which was modified according to the customers preferences. And finally the HTML layout was made and WinterCMS was installed. This website sends all requests from clients to the owner\'s email. <a href="https://photovolshebnitsa.ru/" target="_blank">Link to website</a>',
            link: '',
            technologies: '&lt;Figma /&gt; &lt;JS /&gt; &lt;WinterCMS /&gt;'
        },
        shastra: {
            heading: 'App for Android and IOS',
            text: 'App for reading books off line. There was a task to create an app based on a ready app from AppStore. From the very beginning the client was not so polite but some how or other we agreed on deadlines and price, the work began. During the presentation of the first working version, the client started to criticize everything and became really rude. I asked for advise from an experienced developer. Replied to all of client\'s questions and wished him good luck in finding a new developer',
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
