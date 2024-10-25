<script>
  import projects from '$lib/projects.json';
  import ProjectList from "$lib/ProjectList.svelte";
  import Pie from '$lib/Pie.svelte';
  import * as d3 from 'd3';

  //add search field
  let query = "";

  let filteredProjects;
  $: filteredProjects = projects.filter(project => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });

  let rolledData;

  // Make sure the variable definition is *outside* the block
  let pieData;

  $: {
    // Initialize to an empty object every time this runs
    pieData = {};

    rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);
    console.log('rolledData', rolledData);

    // Calculate rolledData and pieData based on filteredProjects here
    pieData = rolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
    
  }

  let selectedYearIndex = -1;
  let selectedYear;
  $: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;

  let filteredByYear;
  $: filteredByYear = projects.filter(project => {
    if (selectedYear) {
      return project.year === selectedYear;
    }

    return true;
  });


</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>
<main>
  <h3 class="gallery-heading">{ filteredProjects.length } Projects</h3>
  {#if filteredProjects.length > 0}
    <Pie data={pieData} bind:selectedIndex={selectedYearIndex} units="project"/>
  {/if}

  <input class="search-input" type="search" bind:value={query}
  aria-label="Search projects" placeholder="🔍     Search projects…" />

  {#if filteredProjects.length > 0}
    <ProjectList data={filteredProjects} hLevel={2}/>
  {:else}
    <p>No projects found.</p>
  {/if}

</main>

<style>
  .search-input{
    margin:20px 0;
    border:0;
    padding:25px 35px;
    border-radius:10px;
    background-color: color-mix(in oklch, var(--card-background), canvas 75%);
    font-size:16px;
  }
</style>