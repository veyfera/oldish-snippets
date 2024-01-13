<script>
	import { finalBeads } from './stores.js';


</script>


{#each $finalBeads as bead, i}
<!-- <div class="result_bead" style="transform: rotate({-i * 15 * 0}deg); margin-left: {i*20}px; margin-top: {-i*14}px;"> -->
	<div class="result_bead" style="transform: rotate({-i * (360 / $finalBeads.length)}deg);" >
		<img src="images/{bead.img}.png" style="transform: rotate({i * (360 / $finalBeads.length)}deg);"  alt="bead">
	</div>
{/each}
