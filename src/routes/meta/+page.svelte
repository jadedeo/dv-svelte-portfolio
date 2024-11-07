<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import Pie from "$lib/Pie.svelte";
    import FileLines from "../meta/FileLines.svelte"
    import Scrolly from "svelte-scrolly";



    let width = 1000, height = 600;
    let margin = {top: 10, right: 10, bottom: 30, left: 40};
    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;
  
    let data = [];
    let commits = [];

    let numFiles;
    let fileLengths;
    let averageFileLength;
    let workByPeriod;
    let maxPeriod;
    let longestFile;
    let longestLine;
    

    onMount(async () => {
        data = await d3.csv("loc.csv", row => ({
            ...row,
            line: Number(row.line),
            depth: Number(row.depth),
            length: Number(row.length),
            date: new Date(row.date + "T00:00" + row.timezone),
            datetime: new Date(row.datetime)
        }));
        console.log('DATA:', data);

        // gives us array where each element is an array with two values:
        // unique commit identifier
        // array of objects for lines that have been modified by that commit
        commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
            let first = lines[0];
            let {author, date, time, timezone, datetime} = first;
            let ret = {
                id: commit,
                url: "https://github.com/jadedeo/dv-svelte-portfolio/commit/" + commit,
                author, date, time, timezone, datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length
            };

            // Like ret.lines = lines
            // but non-enumerable so it doesn’t show up in JSON.stringify
            Object.defineProperty(ret, "lines", {
                value: lines,
                configurable: true,
                writable: true,
                enumerable: false,
            });

            return ret;
        });

        numFiles = d3.groups(data, d => d.file).length;

        fileLengths = d3.rollups(data, v => d3.max(v, v => v.line), d => d.file);
        averageFileLength = d3.mean(fileLengths, d => d[1])?.toFixed(0);
        longestFile = d3.max(fileLengths, d => d[1]);
        longestLine = d3.max(data, d => d.length);

        workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.toLocaleString("en", {dayPeriod: "short"}));
        maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

        console.log('commits', commits);
    });




    // let timeDomain;
    $: timeDomain = d3.extent(data, d => d.datetime);

    let xScale, yScale;
    $: xScale = d3.scaleTime()
        .domain(timeDomain)
        .range([usableArea.left, usableArea.right])
        .nice();

    $: yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    let xAxis, yAxis;  
    $: {
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(d3.axisLeft(yScale));
        d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));

    }

    let yAxisGridlines;
    $: {
        d3.select(yAxisGridlines).call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));
    }

    //ADD TOOLTIPS
    let hoveredIndex = -1;
    $: hoveredCommit = filteredCommits[hoveredIndex] ?? hoveredCommit ?? {};

    let cursor = {x: 0, y: 0};


    //ADD BRUSHING
    let svg;
    $: {
        d3.select(svg).call(d3.brush().on("start brush end", brushed));
        d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
    }


    function brushed (evt) {
        let brushSelection = evt.selection;
        selectedCommits = !brushSelection ? [] : filteredCommits.filter(commit => {
            let min = {x: brushSelection[0][0], y: brushSelection[0][1]};
            let max = {x: brushSelection[1][0], y: brushSelection[1][1]};
            let x = xScale(commit.date);
            let y = yScale(commit.hourFrac);

            return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
    }

    let selectedCommits = [];

    function isCommitSelected (commit) {
        return selectedCommits.includes(commit);
    }

    $: hasSelection = selectedCommits.length > 0;
    $: console.log('selectedCommits', selectedCommits);

    import { format } from 'd3-format';
  import Scatterplot from './Scatterplot.svelte';
    const percentFormat = format(".1%");

    $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(d => d.lines);
    $: console.log('selectedLines',selectedLines);
    $: languageBreakdown = d3.rollups(filteredLines,
            (v) => d3.sum(v, leaf => leaf.length),
            d => d.type
        );

    function dotInteraction (evt, index) {
        if(evt.type=="click" || (evt.type=="keyup" && evt.key=="Enter")){
            selectedCommits = [filteredCommits[index]];
        }
    }

    let commitProgress = 100;
    let fileSizeProgress = commitProgress;
    
    $: fileSizeTimeScale = d3.scaleTime()
        .domain(timeDomain)
        .range([0, 100]);
    $: fileSizeMaxTime = fileSizeTimeScale.invert(fileSizeProgress);
    $: fileSizeProgressLabel = fileSizeMaxTime.toLocaleString("en", {dateStyle: "long", timeStyle: "short"});


    $: timeScale = d3.scaleTime()
        .domain(timeDomain)
        .range([0, 100]);
    $: commitMaxTime = timeScale.invert(commitProgress);

    $: commitProgressLabel = commitMaxTime.toLocaleString("en", {dateStyle: "long", timeStyle: "short"});

    let filteredCommits;
    $: {
        filteredCommits = commits.filter((commit) => commit.datetime <= commitMaxTime);
        console.log("FILTERED COMMITS:", filteredCommits);
    }

    let filteredLines;
    $: {
        filteredLines = data.filter((item) => item.datetime <= commitMaxTime);
        console.log("FILTERED LINES:", filteredLines);
    }

    let colors = d3.scaleOrdinal(d3.schemeCategory10);

    let fileSizeFilteredLines;
    $: {
        fileSizeFilteredLines = data.filter((item) => item.datetime <= fileSizeMaxTime);
        // console.log("FILTERED LINES:", fileSizeFilteredLines);
    }



</script>

<div class="main-container">
    <div class="card">
        <h2 id="gen-project-stats">General Project Stats</h2>
        <div class="gen-stats">
            <h3>Total LOC</h3> 
            <h3>Total commits</h3> 
            <h3>Number of Files</h3> 
            <h3>Averge File Length</h3> 
            <h3>Most Active Period</h3> 
            <h3>Longest File</h3> 
            <h3>Longest Line</h3> 
        
            <p>{data.length}</p> 
            <p>{commits.length}</p> 
            <p>{numFiles}</p>
            <p>{averageFileLength}</p>
            <p>{maxPeriod}</p>
            <p>{longestFile}</p>
            <p>{longestLine}</p>
        </div>
    </div>

    <div class="card">
        <Scrolly bind:progress={ commitProgress } --scrolly-viz-width="50%">
            {#each commits as commit, index }
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis maximus gravida. Aenean ornare arcu sed urna vulputate dapibus. Aenean ut ante suscipit, sagittis augue ac, rhoncus nisl. Aliquam fringilla ante vitae turpis fermentum, sit amet ultrices felis tristique. Maecenas ac dui sem. Maecenas vel volutpat ex, sit amet sodales tellus. Sed mattis nibh risus, in hendrerit odio mollis a.
                </p>
                <p>
                    Suspendisse libero leo, varius eu eros eu, sodales pharetra ante. Pellentesque eget volutpat leo. Phasellus et leo ut arcu mollis vehicula. Cras sagittis tincidunt lectus, sed laoreet libero dignissim vitae. Nam eget tempor libero, quis pellentesque leo.
                <hr>
            {/each}
            <svelte:fragment slot="viz" class="viz-container">
                <!-- <label>Show commits until:
                    <input type=range min="-1" max={commitMaxTime} bind:value={commitProgress}>
                    <time>
                        {commitProgressLabel}
                    </time>
                </label> -->

                <div id="scatterplot" class="">
                    <h2>Commits by time of day</h2>
                    
                    <svg viewBox="0 0 {width} {height}" bind:this={svg}>
                        <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
                        <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
                        <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
                        
            
                        <g class="dots">
                            {#each filteredCommits as commit, index(commit.id) }
                                <circle
                                    cx={ xScale(commit.datetime) }
                                    cy={ yScale(commit.hourFrac) }
                                    r="5"
                                    fill="#8dd3c7"
                                    class:selected={isCommitSelected(commit)}
                                    on:mouseenter={evt => {
                                        hoveredIndex = index;
                                        cursor = {x: evt.x, y: evt.y};
                                    }}
                                    on:mouseleave={evt => hoveredIndex = -1}
                                    on:click={evt => {
                                        dotInteraction(evt, index);
                                    }}
                                    on:keyup={evt => {
                                        dotInteraction(evt, index);
                                    }}
                                />
                            {/each}
                        </g>            
                    </svg>
            
            
            
                    <dl class="info tooltip" hidden={hoveredIndex === -1} style="top: {cursor.y}px; left: {cursor.x}px">
                        <dt>Commit</dt>
                        <dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id }</a></dd>
                    
                        <dt>Date</dt>
                        <dd>{ hoveredCommit.datetime?.toLocaleString("en", {dateStyle: "full"}) }</dd>
                    
                        <dt>Time</dt>
                        <dd>{ hoveredCommit.datetime?.toLocaleString("en", {timeStyle: "short"}) }</dd>
            
                        <dt>Author</dt>
                        <dd>{hoveredCommit.author }</dd>
            
                        <dt>Lines</dt>
                        <dd>{hoveredCommit.totalLines }</dd>
                    </dl>
            
                    <p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>
            
                </div>
        
        
                <div class="">
                    {#if languageBreakdown.length > 0}
                        <div class="language-stats">
                            <dl>
                                {#each languageBreakdown as [language, lines]}
                                
                                <div class="lang-stat">
                                    <dt>{language}</dt>
                                    <dd>{lines}</dd>
                                </div>
                                {/each}
                            </dl>
                        </div>
                    {:else}
                        <p>No data to display.</p>
                    {/if}
            
                    <Pie data={Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: lines}))} units="line" colors={colors}/>
                    
                </div>
        
            </svelte:fragment>
        </Scrolly>
    </div>

    <!-- <hr> -->

    <div class="card">
        <Scrolly bind:progress={ fileSizeProgress } --scrolly-layout="viz-first" --scrolly-viz-width="1.5fr" throttle="5" debounce=30>
            {#each commits as commit, index }
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis maximus gravida. Aenean ornare arcu sed urna vulputate dapibus. Aenean ut ante suscipit, sagittis augue ac, rhoncus nisl. Aliquam fringilla ante vitae turpis fermentum, sit amet ultrices felis tristique. Maecenas ac dui sem. Maecenas vel volutpat ex, sit amet sodales tellus. Sed mattis nibh risus, in hendrerit odio mollis a.
                </p>
                <p>
                    Suspendisse libero leo, varius eu eros eu, sodales pharetra ante. Pellentesque eget volutpat leo. Phasellus et leo ut arcu mollis vehicula. Cras sagittis tincidunt lectus, sed laoreet libero dignissim vitae. Nam eget tempor libero, quis pellentesque leo.
                </p>
                <hr>
                
            {/each}
            <svelte:fragment slot="viz">
                <!-- <label>Show commits until:
                    <input type=range min="-1" max={fileSizeMaxTime} bind:value={fileSizeProgress}>
                    <time>
                        {fileSizeProgressLabel}
                    </time>
                </label> -->
                <FileLines lines={fileSizeFilteredLines} colors={colors}/>
            </svelte:fragment>
        </Scrolly>
    </div>

</div>

<style>
    hr{
        width:100%;
        border: 0.5px solid black;
    }

    .main-container{
        display:flex;
        flex-direction: column;
        gap:75px;
        margin:100px 0;
        height:100%;
    }

    .main-container .card{
        max-width: calc(100% - 100px);
    }

    section {
        width: 100%;
        overflow: hidden;
    }

    /* input[type="range"]{
        width:100%;
    } */

    svg {
		overflow: visible;
	}

    #scatterplot{
        color:black;
        /* margin-top:100px; */
        /* padding:30px; */
    }

    .gridlines {
	    stroke-opacity: .2;
    }

    dl.info {
        display: grid;
        grid-template-columns: auto auto;
        gap: 0.5em 1em;
        margin: 0;
        padding: 15px;

        transition-duration: 500ms;
        transition-property: opacity, visibility;

        &[hidden]:not(:hover, :focus-within) {
            opacity: 0;
            visibility: hidden;
        }
    }

    .tooltip dt,
    .lang-stat dt {
        font-weight: normal; 
        color: #555;
        margin: 0; 
        text-transform: uppercase;
        
    }

    .tooltip dt{
        text-align: right;
    }

    .tooltip dd {
        margin: 0;
    }

   .tooltip{
        position:fixed;
        top: 1em;
        left: 1em;
        box-shadow: 5px 5px 5px gray;
        border-radius:5px;
        backdrop-filter: blur(3px);
    }

    circle {
        transition: 200ms;
        transform-origin: center;
        transform-box: fill-box;


        &:hover {
            transform: scale(1.5);
        }

        @starting-style {
            r: 0;
        }
    }

    circle.selected {
        fill: #ff725e;
    }

    @keyframes marching-ants {
        to {
            stroke-dashoffset: -8; /* 5 + 3 */
        }
    }

    svg :global(.selection) {
        fill-opacity: 10%;
        stroke: black;
        stroke-opacity: 40%;
        stroke-dasharray: 5 3;
        animation: marching-ants 2s linear infinite;
    }

    .lang-stat{
        display:grid;
        grid-template-columns: 1fr;
    }
    .lang-stat dd{
        margin:0;
    }
    .language-stats dl{
        display:flex;
        gap:150px;
    }

    td{
        padding-right:20px;
    }


    .gen-stats{
        display:grid;
        grid-template-columns: auto auto auto auto auto auto auto;
        column-gap:20px;
    }

    .gen-stats h3, #gen-project-stats{
        margin-bottom:0;
    }
</style>