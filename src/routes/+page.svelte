<script>
    import projects from '$lib/projects.json';
    import ProjectList from "$lib/ProjectList.svelte";
  </script>

<svelte:head>
	<title>My Portfolio (with Svelte!)</title>
</svelte:head>
<main>
    <div class="columns card">
        <div>
            <img src="images/home.png" alt="illustration"/>
        </div>
        <div>
            <h1>Hi, I'm Jade.</h1>
            <p>
            I'm a first semester MHCI student taking Data Visualization as one
            of my electives. This portfolio site will eventually feature my
            class projects.
            </p>
            <small><a href="https://storyset.com/business" target="_blank">Illustrations by Storyset</a></small>
        </div>
    </div>
    <div id="latest-projects">
        <h2 class="gallery-heading">Latest Projects</h2>
        <ProjectList data={projects} sliceAt={3} hLevel={3}/>
    </div>
</main>

<style>
#latest-projects{
    margin-top: 75px;
}
</style>