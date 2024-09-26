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

    // theme switcher logic
    let localStorage = globalThis.localStorage ?? {};
    $: localStorage.colorScheme = colorScheme;

    let colorScheme = localStorage.colorScheme ? localStorage.colorScheme : "light-dark";

    let root = globalThis?.document?.documentElement;
    $: root?.style.setProperty("color-scheme", colorScheme);
    
    root?.style.setProperty("color-scheme", colorScheme);

</script>

<nav>
	{#each pages as p }
        <a href={ p.url } target={ p.url.startsWith("http") ? "_blank" : null } class:current={ "." + $page.route.id === p.url }>{ p.title }</a>
	{/each}
</nav>

<label class="color-scheme">
    Theme:
    <select bind:value={ colorScheme }>
        <option value="light-dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
</label>

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

    /* THEME SWITCHER*/
    .color-scheme {
        position: absolute;
        top: 75px;
        right: 5%;
        }
</style>