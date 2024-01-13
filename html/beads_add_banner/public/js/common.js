document.addEventListener('DOMContentLoaded', function() {

	var hideCategories = false;
	var categories = $('.catgories-list')
		categories.slideToggle();//Remove later
	document.querySelector('.categries__toggle').addEventListener('click', function() {
		categories.slideToggle();
		if (hideCategories) {
			this.style.transform = 'rotate(90deg)'
		}
		else {
			this.style.transform = 'rotate(-90deg)'
		}
		hideCategories = !hideCategories;
	})

})
