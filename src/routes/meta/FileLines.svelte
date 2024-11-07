<script>
    import * as d3 from 'd3';

    import { scale } from 'svelte/transition';
    import { flip as originalFlip } from "svelte/animate";



    export let lines = [];

    let files = [];
    $: {
        files = d3.groups(lines, d => d.file).map(([name, lines]) => {
            return {name, lines};
        });

        files = d3.sort(files, d => -d.lines.length);
    }

    files = d3.sort(files, d => -d.lines.length);

    export let colors = d3.scaleOrdinal(d3.schemeTableau10);

    function getFlip () {
        return originalFlip;
    }
    $: flip = getFlip(files);


</script>

<div class="">
    <h2>Codebase evolution</h2>
    <dl class="files">
        {#each files as file (file.name) }
            <div in:scale animate:flip={{duration: 3000}}>
                <dt>
                    <code>{file.name}</code>
                    <p><small>{file.lines.length} lines</small></p>
                </dt>
                <!-- <dd>{file.lines.length} lines</dd> -->
                 <dd>
                    {#each file.lines as line (line.line) }
                        <!-- <p>{line.type}</p> -->
                        <div class="line" style="background-color: {colors(line.type)};"></div>
                    {/each}
                 </dd>
            </div>
        {/each}
    </dl>
</div>



<style>
    .line {
        display: flex;
        width: .5em;
        aspect-ratio: 1;
        background: steelblue;
        border-radius: 50%;
    }


/* dl {
    display: grid;

    & > div {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: subgrid;

    }
} */

dl > div {
    display: grid;
    grid-template-columns: 45% 55%;
    gap:20px;
}

dt{
    grid-column: 1;
    /* width:50%; */
    overflow-wrap: break-word; 
}

dd {
	grid-column: 2;
	display: flex;
	flex-wrap: wrap;
	align-items: start;
	align-content: start;
	gap: .15em;
	padding-top: .6em;
	margin-left: 0;
}

dt p{
    margin-top:0;
}

small {
    opacity: 40%;
}
</style>