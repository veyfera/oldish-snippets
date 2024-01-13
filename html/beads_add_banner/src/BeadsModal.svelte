<script>
	import { createEventDispatcher } from 'svelte'
	import { finalPrice, finalLength, finalBeads } from './stores.js';

	const dispatch = createEventDispatcher();
	export let bead;

	function hideAddModal () {
		dispatch('closeModal')
	}

	function addBead (bead, side) {
		if (side == 'left'){
			$finalBeads = [bead].concat($finalBeads);
		}
		else if (side == 'right') {
			$finalBeads.push(bead);
			$finalBeads = $finalBeads;
		}
		else {
			addBead(bead, 'right');
			addBead(bead, 'left');
		}
		$finalLength = $finalLength + bead.size;
		$finalPrice = $finalPrice + bead.price;
		dispatch('closeModal');
	}


	
</script>

		<div class="list-item-modal">
			<div class="list-item-modal__heading">Добавить бусину</div>
			<div class="list-imem-modal__close" on:click="{hideAddModal}">x</div>
			<div class="list-item-modal__btn-container">
				<div class="list-item-modal__left" on:click="{ () => addBead(bead, 'left')}">С лева <img src="images/left.png" alt="‹" class="list-item-modal__img"></div>
				<div class="list-item-modal__both" on:click="{ () => addBead(bead, 'both')}">С обеих сторон <img src="images/both.png" alt="›" class="list-item-modal__img" ></div>
				<div class="list-item-modal__right" on:click="{ () => addBead(bead, 'right')}">С права <img src="images/right.png" alt="›" class="list-item-modal__img"></div>
			</div>
		</div>
