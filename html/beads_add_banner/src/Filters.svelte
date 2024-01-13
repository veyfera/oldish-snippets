<script>
	import { filters } from './stores.js';

	var possibleFilters = [
	{name: 'Африка', subcategories: []},
	{name: 'Готика', subcategories: []},
	{name: 'Жемчуг', subcategories: []},
	{name: 'Самые подходящие', subcategories: []},
	{name: 'Натуральные камни', subcategories: ['Круглые', 'Овальные']},
	]


	function handleFilter(filterName) {
		let filterIndex = $filters.indexOf(filterName);

		if (filterIndex >= 0) {
			$filters.splice(filterIndex, 1);
		}
		else {
			$filters.push(filterName);
		}
		// for update of DOM
		$filters = $filters;
		console.log($filters);
	}
</script>

<ul class="catgories-list">
	{#each possibleFilters as possibleFilter}
		{#if possibleFilter.subcategories.length > 0}
			<li class="categories-list__item">{ possibleFilter.name }:
				<ul class="subcategories-list">
					{#each possibleFilter.subcategories as name}
					<li class="categories-list__subitem">
						<input type="checkbox" id="{ possibleFilter.name }" class="css-checkbox">
						<label for="{ name }" class="css-label" on:click="{ () => handleFilter(name) }">{ name }</label>
					</li>
					{/each}
				</ul>
			</li>
		{:else}
			<li class="categories-list__item">
				<input type="checkbox" id="{ possibleFilter.name }" class="css-checkbox">
				<label for="{ possibleFilter.name }" class="css-label" on:click="{ () => handleFilter(possibleFilter.name) }">{ possibleFilter.name }</label>
			</li>
		{/if}
	{/each}

</ul>
