<script>
    import Project from "$lib/Project.svelte";
    export let data = {};
    export let hLevel = 2;
    export let sliceAt;
    $: sliceAtCalculated = typeof sliceAt === 'number' ? sliceAt : data.length;
</script>

<div class="gallery">
    {#each data.slice(0, sliceAtCalculated) as p}
        <Project data={p} hLevel={hLevel}/>
    {/each}
</div>

<style>
    .gallery {
        column-gap: 15px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;

        @media screen and (max-width: 769px) {
            grid-template-columns: 1fr 1fr;
        }

        @media screen and (max-width: 480px) {
            grid-template-columns: auto;
        }
    }
</style>