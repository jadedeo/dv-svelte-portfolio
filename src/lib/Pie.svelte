<script>
    import * as d3 from 'd3';

    export let units = "";

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    let arc = arcGenerator({
	startAngle: 0,
	endAngle: 2 * Math.PI
    });

    export let data = [];

    let sliceGenerator = d3.pie().value(d => d.value);
    let arcData;
    let arcs;
    $: {
        arcData = sliceGenerator(data);
        arcs = arcData.map(d => arcGenerator(d));
    }

    //define slice colors
    let colors = d3.scaleOrdinal(d3.schemeSet3);

    export let selectedIndex = -1;
    
    function toggleWedge (index, event) {
        if (!event.key || event.key === "Enter") {
		    selectedIndex = selectedIndex === index ? -1 : index;
	    }
    }
</script>

<div class="container">
    <svg viewBox="-50 -50 100 100">
        {#each arcs as arc, index}
            <path
                d={ arc }
                fill={ colors(index) }
                class:selected={selectedIndex === index}
                on:click={e => toggleWedge(index, e)}
                on:keyup={e => toggleWedge(index, e)}
                tabindex="0"
                role="button"
                aria-label={`slice-${index}`}
                style="--start-angle: { arcData[index]?.startAngle }rad;
	--end-angle: { arcData[index]?.endAngle }rad;"
            />
        {/each}
    </svg>

    <ul class="legend">
        {#each data as d, index}
            <li style="--color: { colors(index) }">
                <span class="swatch"></span>
                <p>{d.label} <em>({d.value} {d.value === 1 ? units : units + "s"})</em></p>
            </li>
        {/each}
    </ul>
</div>


<style>
    svg {
        max-width: 20em;
        margin-block: 2em;
        /* Do not clip shapes outside the viewBox */
        overflow: visible;
    }

    svg:has(path:hover, path:focus-visible) {
        path:not(:hover, :focus-visible) {
            opacity: 50%;
        }
    }

    path {
        transform: rotate(var(--mid-angle))
            translateY(0)
            rotate(calc(-1 * var(--mid-angle)));
        transition: 300ms;
        cursor: pointer;
        outline: none;
        --angle: calc(var(--end-angle) - var(--start-angle));
	    --mid-angle: calc(var(--start-angle) + var(--angle) / 2);

        &.selected {
            transform: rotate(var(--mid-angle))
                translateY(-6px)
                scale(1.1)
                rotate(calc(-1 * var(--mid-angle)));
        }
    }

    .selected {
        --color: oklch(60% 45% 0) !important;

        &:is(path) {
            fill: var(--color);
        }
    }

    ul{
        padding:0;
        display:flex;
        width:100%;
        justify-content: flex-start;
        flex-wrap:wrap;
        column-gap:30px;
    }

    .legend{
        height:fit-content;
    }

    li{
        display:flex;
        align-items:center;
        height:fit-content;
        min-width:150px;
    }

    span.swatch {
        width:15px;
        height:15px;
        display:block;
        aspect-ratio: 1 / 1;
        background-color:var(--color);
        margin-right:10px;
        border-radius:50%;
    }

    .swatch + p {
        margin:3px 0;
    }

    .container{
        display:flex;
        gap:10%;
        align-items:center;
    }

</style>