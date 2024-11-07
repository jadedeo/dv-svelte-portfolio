<script>
    import * as d3 from 'd3';

    export let units = "";

    export let data = [];

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    let arc = arcGenerator({
	startAngle: 0,
	endAngle: 2 * Math.PI
    });

    let sliceGenerator = d3.pie().value(d => d.value).sort(null);

    let oldData = [];
    let pieData;
    let arcData;
    let arcs;
    let wedges = {};
    // $: console.log('wedges', wedges);
    
    export let colors = d3.scaleOrdinal(d3.schemeSet3); //define slice colors
    export let selectedIndex = -1;
    export let transitionDuration = 3000;

    $: {
        //important to sort before calculating arcData and arcs; otherwise data will be out of sync!!
        pieData = d3.sort(data, d => d.label);

        arcData = sliceGenerator(pieData);
        arcs = arcData.map(d => arcGenerator(d));
        // oldData = pieData;
        oldData = pieData.map(d => ({...d}));
        pieData = pieData.map((d, i) => ({...d, ...arcData[i], arc: arcs[i]}));

        // console.log('pieData',pieData);
        transitionArcs();
    };
    
    function toggleWedge (index, event) {
        if (!event.key || event.key === "Enter") {
		    selectedIndex = selectedIndex === index ? -1 : index;
	    }
    }

    function transitionArcs() {
        let wedgeElements = Object.values(wedges);

        d3.selectAll(wedgeElements).transition("arc")
            .duration(transitionDuration)
            .styleTween("d", function (_, index) {
                let wedge = this;

                // Calculations that will only be done once per element go here
                let label = Object.keys(wedges)[index];
                let d = pieData.find(d => d.label === label);
                let d_old = oldData.find(d => d.label === label);



                if (!d || !d_old) {
                    return;
                }

                // console.log("LABEL", label);
                // console.log("D", d);
                // console.log("D_OLD", d_old);

                // Always clone objects first, see note in https://d3js.org/d3-interpolate/value#interpolateObject
                let from = d_old ? {...d_old} : getEmptyArc(label, oldData);
                let to = {...d};
                let angleInterpolator = d3.interpolate(from, to);
                // console.log("angleInterpolator", angleInterpolator);

                let interpolator = t => `path("${ arcGenerator(angleInterpolator(t)) }")`;

                // console.log("HERE", interpolator);
                return interpolator;

            });
    }

    function getEmptyArc (label, data = pieData) {
        // Union of old and new labels in the order they appear
        let labels = d3.sort(new Set([...oldData, ...pieData].map(d => d.label)));
        let labelIndex = labels.indexOf(label);
        let sibling;
        for (let i = labelIndex - 1; i >= 0; i--) {
            sibling = data.find(d => d.label === labels[i]);
            if (sibling) {
                break;
            }
        }

        let angle = sibling?.endAngle ?? 0;
        return {startAngle: angle, endAngle: angle};
    }


</script>

<div class="container">
    <!-- <input type=number bind:value={transitionDuration}> -->
    <svg viewBox="-50 -50 100 100">
        {#each pieData as d, index (d.label)}
            <path
                d={d.arc}
                bind:this={ wedges[d.label] }
                fill={ colors(d.label) }
                class:selected={selectedIndex === index}
                on:click={e => toggleWedge(index, e)}
                on:keyup={e => toggleWedge(index, e)}
                tabindex="0"
                role="button"
                aria-label={`slice-${index}`}
                style="--start-angle: { d.startAngle }rad;
	--end-angle: { d.endAngle }rad;"
            />
        {/each}
    </svg>

    <ul class="legend">
        {#each pieData as d, index}
            <li style="--color: { colors(d.label) }">
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
        fill-opacity: 75%;

        transform: rotate(var(--mid-angle))
            translateY(0)
            rotate(calc(-1 * var(--mid-angle)));
        transition: 3000ms;
        transition-property: transform, opacity, fill;

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