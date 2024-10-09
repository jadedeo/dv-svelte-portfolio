<script>
    export let data = {};
    export let hLevel = 2;
</script>

<article class="gallery-item card">
    <img src={data.image} alt="">
    <small>{data.year}</small>
    <svelte:element this={"h" + hLevel}>{ data.title }</svelte:element>
    <p>{data.description}</p>
</article>

<style>
  .gallery-item {
    min-width: unset;
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 4;
    margin-bottom:50px;
  }
  .gallery-item h2,
  .gallery-item h3
  {
    margin: 0;
  }
</style>