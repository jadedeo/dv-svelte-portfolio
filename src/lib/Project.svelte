<script>
    export let data = {};
    export let hLevel = 2;
</script>

<article class="gallery-item card">
    <img src={data.image} alt="">
    <svelte:element this={"h" + hLevel}>{ data.title }</svelte:element>
    <p>{data.description}</p>
</article>

<style>
  .gallery-item {
    min-width: unset;
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 3;
    margin-bottom:50px;
  }
</style>