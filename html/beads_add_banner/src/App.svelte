<script>
	import Filters from './Filters.svelte'
	import Beads from './Beads.svelte'
	import Result from './Result.svelte'

	import { filters, finalPrice, finalLength } from './stores.js';

</script>

<aside class="left">
	<div class="categories">
		<div class="categories__heading">Показывать категории: <div class="categries__toggle">‹</div></div>
		<Filters />
	</div>

	<Beads />
</aside>

<div class="result-wrapper">
	<div class="result-wrapper__price">
		Итого: <span>{ $finalPrice }$</span>
	</div>
	<div class="result">
		<Result />
	</div>
	<div class="result-wrapper__length">Длинна в см: { $finalLength }</div>
	<div class="result-wrapper__order">Заказать »</div>
</div>

