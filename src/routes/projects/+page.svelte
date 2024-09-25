<script>
  import projects from '$lib/projects.json';
  import Project from "$lib/Project.svelte";
  import ProjectList from "$lib/ProjectList.svelte";
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>
<main>
  
  <h3 class="gallery-heading">{ projects.length } Projects</h3>
  <ProjectList data={projects} hLevel={2}/>

</main>