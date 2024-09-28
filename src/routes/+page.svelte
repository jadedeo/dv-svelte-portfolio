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
            <small><a href="https://storyset.com/business" target="_blank" class="uppercase fade">Illustrations by Storyset</a></small>
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
                    <small class="uppercase fade">Followers</small>
                    <small class="uppercase fade">Following</small>
                    <small class="uppercase fade">Public Repos</small>
                    <span class="stats-value">{data.followers}</span>
                    <span class="stats-value">{data.following}</span>
                    <span class="stats-value">{data.public_repos}</span>
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
    margin-top:50px;
}
#stats-content{
 display: grid;
 grid-template-columns: 1fr 1fr 1fr;
 grid-template-rows: auto auto;
 column-gap: 25px;
 row-gap: 0;
}

.stats-value{
    font-weight: bold;
    font-size: 2rem;
}

.uppercase{
    text-transform: uppercase;
}

.fade{
    color: gray;
}

#latest-projects{
    margin-top: 50px;
}
</style>