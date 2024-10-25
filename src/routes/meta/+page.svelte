<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import Pie from "$lib/Pie.svelte";


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
        averageFileLength = d3.mean(fileLengths, d => d[1]).toFixed(0);
        longestFile = d3.max(fileLengths, d => d[1]);
        longestLine = d3.max(data, d => d.length);

        workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.toLocaleString("en", {dayPeriod: "short"}));
        maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

        console.log('commits', commits);
        // console.log("fileLengths", fileLengths);
        // console.log("averageFileLength", averageFileLength);
        // console.log('workByPeriod', workByPeriod);
        // console.log('maxPeriod', maxPeriod);
        // console.log('Longest File:', longestFile);
        // console.log('Longest Line:', longestLine);
    });

    let xScale, yScale;
    let xAxis, yAxis;  

    $: xScale = d3.scaleTime()
        .domain(timeDomain)
        .range([usableArea.left, usableArea.right])
        .nice();

    let timeDomain;
    $: timeDomain = d3.extent(data, d => d.datetime);

    $: yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

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
    $: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};

    let cursor = {x: 0, y: 0};


    //ADD BRUSHING
    let svg;
    $: {
        d3.select(svg).call(d3.brush().on("start brush end", brushed));
        d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
    }
    
    let brushSelection = null;
    $: brushSelection;
    // $: console.log("Current brush selection:", brushSelection);


    function brushed (evt) {

        brushSelection = evt.selection;
    }

    function isCommitSelected (commit) {
        if (!brushSelection) {
            return false;
        }
        let min = {x: brushSelection[0][0], y: brushSelection[0][1]};
        let max = {x: brushSelection[1][0], y: brushSelection[1][1]};
        let x = xScale(commit.date);
        let y = yScale(commit.hourFrac);
        let selected = x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
    }


    $: selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    $: hasSelection = brushSelection && selectedCommits.length > 0;
$:console.log('selectedCommits', selectedCommits);
    import { format } from 'd3-format';
    const percentFormat = format(".1%");

    $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(d => d.lines);
    $: console.log('selectedLines',selectedLines);
    $: languageBreakdown = d3.rollups(selectedLines,
            (v) => d3.sum(v, leaf => leaf.length),
            d => d.type
        );
    // $: console.log('languageBreakdown', languageBreakdown);


</script>

    <div class="card">
        <table>
            <tbody>
            <tr> 
                <td>Total LOC</td> 
                <td>Total commits</td> 
                <td>Number of files</td> 
                <td>Averge File Length</td> 
                <td>Most Active Period</td> 
                <td>Longest File</td> 
                <td>Longest Line</td> 
            </tr> 
            <tr>
                <td>{data.length}</td> 
                <td>{commits.length}</td> 
                <td>{numFiles}</td>
                <td>{averageFileLength}</td>
                <td>{maxPeriod}</td>
                <td>{longestFile}</td>
                <td>{longestLine}</td>
            </tr> 
        </tbody>
        </table>
        <!-- <p>Total LOC: {data.length}</p>
        <p>Total commits: {commits.length}</p>
        <p>Number of files: {numFiles}</p>
        <p>Averge File Length: {averageFileLength}</p>
        <p>Most Active Period: {maxPeriod}</p>
        <p>Longest File: {longestFile}</p>
        <p>Longest Line: {longestLine}</p> -->
    </div>

    <div id="scatterplot" class="card">
        <h2>Commits by time of day</h2>
        
        <svg viewBox="0 0 {width} {height}" bind:this={svg}>
            <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
            <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
            <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
            

            <g class="dots">
                {#each commits as commit, index }
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

        <Pie data={Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: lines}))} units="line"/>
        
    </div>


    

<style>
    svg {
		overflow: visible;
	}

    #scatterplot{
        color:black;
        margin-top:100px;
        padding:30px;
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

</style>