<script>

    import { page } from '$app/stores';
    import "../style.css";

    let pages = [
        { url: "./", title: "Home" },
        { url: "./projects", title: "Projects" },
        { url: "./contact", title: "Contact" },
        { url: "./resume", title: "Resume" },
        { url: "https://github.com/jadedeo", title: "GitHub" }
    ];

</script>

<nav>
	{#each pages as p }
        <a href={ p.url } target={ p.url.startsWith("http") ? "_blank" : null } class:current={ "." + $page.route.id === p.url }>{ p.title }</a>
	{/each}
</nav>

<slot />

<style>
    /* NAVBAR */
    nav {
        padding: 4px;
        margin: 25px 5%;
    }

    nav {
        list-style-type: none;
        display: flex;
        justify-content: end;
        gap: 3%;
    }

    nav a {
        font-weight: bold;
    }

    nav a.current {
        color: var(--accent);
    }
</style>