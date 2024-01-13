<script>
	import { filters, finalPrice, finalLength, finalBeads } from './stores.js';
	import BeadsModal from './BeadsModal.svelte';
	let showModal = false;
	let selectedBead = undefined;

	let beads = [
	{id: '1', price: 23, size: 2, img: '1', shape: 'oval', theme: 'Африка'},
	{id: '2', price: 19, size: 2, img: '2', shape: 'oval', theme: 'Африка'},
	{id: '3', price: 21, size: 2, img: '3', shape: 'oval', theme: 'Готика'},
	{id: '4', price: 23, size: 2, img: '4', shape: 'oval', theme: 'Готика'},
	{id: '5', price: 21, size: 2, img: '5', shape: 'oval', theme: 'Готика'},
	{id: '6', price: 25, size: 2, img: '6', shape: 'oval', theme: 'Готика'},
	{id: '7', price: 20, size: 1, img: '7', shape: 'round', theme: 'Готика'},
	{id: '8', price: 25, size: 1, img: '8', shape: 'round', theme: 'Готика'},
	{id: '9', price: 24, size: 1, img: '9', shape: 'round', theme: 'Готика'},
	{id: '10', price: 17, size: 1, img: '10', shape: 'round', theme: 'Готика'},
	{id: '11', price: 15, size: 1, img: '11', shape: 'round', theme: 'Готика'},
	{id: '15', price: 16, size: 1, img: '11', shape: 'round', theme: 'Готика'},
	{id: '13', price: 25, size: 2, img: '13', shape: 'oval', theme: 'Африка'},
	{id: '14', price: 19, size: 2, img: '14', shape: 'oval', theme: 'Африка'},
	{id: '12', price: 20, size: 2, img: '12', shape: 'oval', theme: 'Готика'},
	]
	function filterBead (bead){
		console.log(bead)
		if ($filters.includes(bead.theme) || $filters.length == 0 ) return true
		else return false
	}

	function showAddModal(bead) {
		showModal = true;
		selectedBead = bead;
	}

	function closeAddModal () {
		showModal = false;
	}
</script>


<ul class="items-list">
	{#each beads.filter(item => $filters.includes(item.theme) || $filters.length == 0) as bead}

	<!-- {#each beads.filter(filterBead) as bead} -->
	<li class="list-item">
		<img class="list-item__img" src="images/{bead.img}.png" alt="bead pic">
		<div class="list-item__description">
			<div class="list-item__price">{bead.price}$</div>
			<div class="add-btn" on:click="{ () => showAddModal(bead) }">Добавить</div>
		</div>
	</li>
	{/each}
	{#if showModal}
	<BeadsModal bead={selectedBead} on:closeModal="{closeAddModal}"/>
	{/if}
</ul>
