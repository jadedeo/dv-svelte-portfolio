<script>
    import projects from '$lib/projects.json';
    import ProjectList from "$lib/ProjectList.svelte";

    let myGitHubData = {};
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
    <section id="github-stats" class="card">
        <h2>My GitHub Stats</h2>
        {#await fetch("https://api.github.com/users/jadedeo") }
            <p>Loading...</p>
        {:then response}
            {#await response.json()}
                <p>Decoding...</p>
            {:then data}
                <div id="stats-content">
                    <p>Followers: {data.followers}</p>
                    <p>Followers: {data.following}</p>
                    <p>Public Repos: {data.public_repos}</p>
                </div>
            {:catch error}
                <p class="error">
                    Something went wrong: {error.message}
                </p>
            {/await}
        {:catch error}
            <p class="error">
                Something went wrong: {error.message}
            </p>
        {/await}
    </section>
    <div id="latest-projects">
        <h2 class="gallery-heading">Latest Projects</h2>
        <ProjectList data={projects} sliceAt={3} hLevel={3}/>
    </div>
</main>

<style>
#github-stats.card{
    width:100%;
}
#stats-content{
 display: grid;
 grid-template-columns: 1fr 1fr 1fr;
 column-gap:25px;
}

#latest-projects{
    margin-top: 75px;
}
</style>