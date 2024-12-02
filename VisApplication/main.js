/**
 * A Starting Template for Lab in Vis Applications course module in TNM093
 * -------------------------------------
 *
 * IMPORTANT:
 * - This is a basic template serving as a starting template and NOT intended to cover all requirements.
 * - You are encouraged to implement the lab in your own way.
 * - Feel free to ignore this template if you prefer to start from scratch.
 *
 */


// Main simulation logic

// Select the SVG container
const svg = d3.select("#simulation-area");
const width = svg.attr("width");
const height = svg.attr("height");

// examples of default settings that can be changed later
let rows = parseInt(document.getElementById("rows").value, 10);
let cols = parseInt(document.getElementById("cols").value, 10);
let restoreForce = parseFloat(document.getElementById("restore-force").value);
let damping = parseFloat(document.getElementById("damping").value);
const nodeRadius = 10;
const timeStep = 0.016;
const padding = 50;

// Arrays to hold positions, velocities, and forces
let positions = [];
let velocities = [];
let forces = [];
let masses = [];
let selectedNode = null;
let isRunning = false;

/**
 * Initialize the grid with nodes and reset their positions, velocities, and forces.
 */
function initializeGrid() {
    positions = [];
    previousPositions = [];
    velocities = [];
    forces = [];
    masses = [];
    const xStep = (width - 2 * padding) / (cols - 1);
    const yStep = (height - 2 * padding) / (rows - 1);

    for (let i = 0; i < rows; i++) {
        const positionRow = [];
        const prevPositionsRow = [];
        const velocityRow = [];
        const forceRow = [];
        const massRow = []; 
        for (let j = 0; j < cols; j++) {
            const x = padding + j * xStep;
            const y = padding + i * yStep;
            positionRow.push([padding + j * xStep, padding + i * yStep]); // ! TODO: think about how to calculate initial positions for the nodes
            prevPositionsRow.push([x, y]); // Initial position
            velocityRow.push([0, 0]); // Initial velocity
            forceRow.push([0, 0]); // Initial force
            massRow.push(1); // Mass
        }
        positions.push(positionRow);
        previousPositions.push(prevPositionsRow);
        velocities.push(velocityRow);
        forces.push(forceRow);
        masses.push(massRow);
    }
    drawNodes();
    drawEdges();
}

/**
 * Draw the nodes (circles) on the SVG.
 */
function drawNodes() {
    const nodes = svg.selectAll("circle").data(positions.flat());

    nodes
        .enter()
        .append("circle")
        .attr("r", nodeRadius)
        .merge(nodes)
        .attr("cx", (d) => d[0]) // X-koordinat
        .attr("cy", (d) => d[1]) // Y-koordinat
        .attr("fill", (d) =>
            selectedNode && d === selectedNode ? "red" : "blue" // Markera vald nod
        )
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .call(
            d3.drag()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded)
        )
        .on("click", (event, d) => {
            // Markera den valda noden
            selectedNode = d;
            drawNodes(); // Uppdatera färger
        });

    nodes.exit().remove();
}


function dragStarted(event, d){
    d3.select(this).attr("fill", "red");
    const nodeIndex = getNodeIndex(d);
    if(nodeIndex){
        simulation.alphaTarget(0.3).restart();
        positions[nodeIndex[0]][nodeIndex[1]].fx = event.x;
        positions[nodeIndex[0]][nodeIndex[1]].fy = event.y;
    }
}

function dragged(event, d){
    const nodeIndex = getNodeIndex(d);
    if(nodeIndex){
        const[i, j] = nodeIndex;
        positions[i][j][0] = event.x;
        positions[i][j][1] = event.y;

        d3.select(this)
            .attr("cx", event.x)
            .attr("cy", event.y);

            drawEdges();
    }
}

function dragEnded(event, d) {
    d3.select(this).attr("fill", "blue");

    const nodeIndex = getNodeIndex(d);
    if (nodeIndex) {
        const [i, j] = nodeIndex;

        // Sätt nodens position till "fixerad" tillfälligt
        positions[i][j].fx = positions[i][j][0];
        positions[i][j].fy = positions[i][j][1];

        // Gradvis släpp positionen tillbaka till simuleringen
        setTimeout(() => {
            positions[i][j].fx = null;
            positions[i][j].fy = null;
        }, 500); // Släpp efter 500 ms (justera efter behov)

        // Nollställ hastighet för att undvika acceleration
        velocities[i][j] = [0, 0];

        // Rensa eventuella kickkrafter
        forces[i][j] = [0, 0];
    }
}


function getNodeIndex(node) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (positions[i][j] === node) {
                return [i, j];
            }
        }
    }
    return null;
}



/**
 * Draw the edges (lines) connecting the nodes.
 */
function drawEdges() {
    const edges = [];     // TODO: add your implementation here to connect the nodes with lines.
for(let i = 0; i < rows; i++) {
    for(let j = 0; j < cols; j++) {
        if(i < rows - 1) {
            edges.push([positions[i][j], positions[i + 1][j]]);
        }
        if(j < cols - 1) {
            edges.push([positions[i][j], positions[i][j + 1]]);
        }
        if(i < rows - 1 && j < cols - 1) {
            edges.push([positions[i][j], positions[i + 1][j + 1]]);
        }
        if(i < rows - 1 && j > 0) {
            edges.push([positions[i][j], positions[i + 1][j - 1]]);
        }
    }
}
    const lines = svg.selectAll("line").data(edges);
    lines
        .enter()
        .append("line")
        .merge(lines)
        .attr("x1", (d) => d[0][0])
        .attr("y1", (d) => d[0][1])
        .attr("x2", (d) => d[1][0])
        .attr("y2", (d) => d[1][1])
        .attr("stroke", "black")
        .attr("stroke-width", 1);

        lines.exit().remove();
}

/**
 * Calculate forces acting on each node.
 * This function is a placeholder for students to implement force calculations.
 */
function calculateForces() {
    // Nollställ krafter
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            forces[i][j] = [0, 0];
        }
    }

    // Beräkna krafter mellan grannar
    const neighbors = [
        [0, 1], [1, 0], [1, 1], [1, -1], // Rätt, Nedåt, Diagonal (SE, SW)
    ];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            for (const [di, dj] of neighbors) {
                const ni = i + di;
                const nj = j + dj;
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    const deltaX = positions[ni][nj][0] - positions[i][j][0];
                    const deltaY = positions[ni][nj][1] - positions[i][j][1];
                    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                    const restLength = (di === 0 || dj === 0) 
                        ? (width - 2 * padding) / (cols - 1) 
                        : Math.sqrt(2) * (width - 2 * padding) / (cols - 1);

                    // Beräkna fjäderkraft
                    const springForceMagnitude = restoreForce * (distance - restLength);
                    const springForceX = springForceMagnitude * (deltaX / distance);
                    const springForceY = springForceMagnitude * (deltaY / distance);

                    forces[i][j][0] += springForceX;
                    forces[i][j][1] += springForceY;

                    // Motsatt kraft på grannen
                    forces[ni][nj][0] -= springForceX;
                    forces[ni][nj][1] -= springForceY;
                }
            }
        }
    }

    // Normalisera krafter med massan
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            forces[i][j][0] /= masses[i][j];
            forces[i][j][1] /= masses[i][j];
        }
    }
}


let integrationMethod = "verlet";

function updatePositions() {
    if (integrationMethod === "verlet") {
        updatePositionsVerlet();
    } else if (integrationMethod === "euler") {
        updatePositionsEuler();
    }
}

function updatePositionsVerlet() {
    calculateForces();

    const maxVelocity = 10; // Begränsa maximal hastighet
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const currentPos = positions[i][j];
            const prevPos = previousPositions[i][j];
            const acceleration = [
                forces[i][j][0], // Kraft i X-riktning
                forces[i][j][1], // Kraft i Y-riktning
            ];

            // Verlet position update
            let nextPos = [
                2 * currentPos[0] - prevPos[0] + timeStep ** 2 * acceleration[0],
                2 * currentPos[1] - prevPos[1] + timeStep ** 2 * acceleration[1],
            ];

            // Begränsa hastighet
            const velocityX = nextPos[0] - currentPos[0];
            const velocityY = nextPos[1] - currentPos[1];
            const speed = Math.sqrt(velocityX ** 2 + velocityY ** 2);

            if (speed > maxVelocity) {
                const scale = maxVelocity / speed;
                nextPos[0] = currentPos[0] + velocityX * scale;
                nextPos[1] = currentPos[1] + velocityY * scale;
            }

            // Om noden är fixerad, använd fixerade positioner
            if (currentPos.fx != null && currentPos.fy != null) {
                nextPos[0] = currentPos.fx;
                nextPos[1] = currentPos.fy;
            }

            // Uppdatera tidigare och nuvarande positioner
            previousPositions[i][j] = [...currentPos];
            positions[i][j] = [...nextPos];
        }
    }

    drawNodes();
    drawEdges();
}

function updatePositionsEuler(){
    calculateForces();

    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            const currentPos = positions[i][j];
            const velocity = velocities[i][j];

            const acceleration = [
                forces[i][j][0],
                forces[i][j][1],
            ];

            velocity[0] += timeStep * acceleration[0];
            velocity[1] += timeStep * acceleration[1];

            currentPos[0] += timeStep * velocity[0];
            currentPos[1] += timeStep * velocity[1];
        }
    }
    drawNodes();
    drawEdges();
}


/**
 * Main simulation loop.
 * Continuously updates the simulation as long as `isRunning` is true.
 */
function simulationLoop() {
    if (!isRunning) return;

    // TODO: think about how to implement the simulation loop. below are some functions that you might find useful.
    updatePositions();
    requestAnimationFrame(simulationLoop);
}

// ********** Event listeners examples for controls **********

// Start/Stop simulation
document.getElementById("toggle-simulation").addEventListener("click", () => {
    isRunning = !isRunning;
    document.getElementById("toggle-simulation").innerText = isRunning ? "Stop Simulation" : "Start Simulation";
    if (isRunning) simulationLoop();
});

// Update grid rows
document.getElementById("rows").addEventListener("input", (e) => {
    rows = parseInt(e.target.value, 10);
    initializeGrid();
});

// Update grid columns
document.getElementById("cols").addEventListener("input", (e) => {
    cols = parseInt(e.target.value, 10);
    initializeGrid();
});

// Update restore force
document.getElementById("restore-force").addEventListener("input", (e) => {
    restoreForce = parseFloat(e.target.value);
    document.getElementById("restore-force-value").textContent = restoreForce.toFixed(2);
});

// Update damping
document.getElementById("damping").addEventListener("input", (e) => {
    damping = parseFloat(e.target.value);
    document.getElementById("damping-value").textContent = damping.toFixed(2);
});

document.getElementById("integration-method").addEventListener("change", (e) => {
    integrationMethod = e.target.value;
});

document.getElementById("set-mass").addEventListener("click", () => {
    if (selectedNode) {
        const massInput = parseFloat(document.getElementById("mass-input").value);
        const nodeIndex = getNodeIndex(selectedNode);
        if (nodeIndex) {
            const [i, j] = nodeIndex;
            masses[i][j] = massInput;
        }
    } else {
        alert("Välj en nod först!");
    }
});



// Initialize the simulation
initializeGrid();
// additional functions 