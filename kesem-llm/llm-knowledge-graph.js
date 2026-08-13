const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

// ============================================================
// GRAPH DASAR
// ============================================================
function createGraph() {
    return {
        nodes: new Map(),  // id -> { id, type, label, meta }
        edges: []          // { from, to, relation, weight }
    };
}

function addNode(graph, id, type, label, meta) {
    if (!graph.nodes.has(id)) {
        graph.nodes.set(id, { id: id, type: type, label: label, meta: meta || {} });
    } else {
        // Node sudah ada — perbarui label/meta tapi jangan bikin duplikat
        const existing = graph.nodes.get(id);
        existing.label = label || existing.label;
        existing.meta = Object.assign({}, existing.meta, meta || {});
    }
    return graph.nodes.get(id);
}

function addEdge(graph, from, to, relation, weight) {
    if (!graph.nodes.has(from) || !graph.nodes.has(to)) {
        throw new Error('[LLMKnowledgeGraph] addEdge butuh node "' + from + '" dan "' + to + '" sudah ada (panggil addNode dulu)');
    }
    graph.edges.push({ from: from, to: to, relation: relation, weight: typeof weight === 'number' ? weight : 1 });
}

function getNeighbors(graph, id) {
    return graph.edges
        .filter(function (e) { return e.from === id || e.to === id; })
        .map(function (e) {
            const neighborId = e.from === id ? e.to : e.from;
            return { node: graph.nodes.get(neighborId), relation: e.relation, weight: e.weight };
        });
}

// BFS terbatas kedalaman — dipakai buat ambil "sekitar" 1 topik/agent
// tanpa menelusuri seluruh graph (bisa besar seiring waktu).
function getSubgraph(graph, startId, depth) {
    depth = Number.isInteger(depth) ? depth : 1;
    const visited = new Set([startId]);
    let frontier = [startId];

    for (let d = 0; d < depth; d++) {
        const nextFrontier = [];
        frontier.forEach(function (id) {
            getNeighbors(graph, id).forEach(function (n) {
                if (n.node && !visited.has(n.node.id)) {
                    visited.add(n.node.id);
                    nextFrontier.push(n.node.id);
                }
            });
        });
        frontier = nextFrontier;
    }

    const subNodes = Array.from(visited).map(function (id) { return graph.nodes.get(id); });
    const subEdges = graph.edges.filter(function (e) { return visited.has(e.from) && visited.has(e.to); });
    return { nodes: subNodes, edges: subEdges };
}

// ============================================================
// RINGKASAN TEKS (dipakai llm-context-builder.js buat masuk ke prompt)
// ============================================================
function toSummaryText(graph, startId, depth) {
    const sub = getSubgraph(graph, startId, depth || 1);
    if (sub.edges.length === 0) {
        return '';
    }
    const lines = sub.edges.map(function (e) {
        const fromLabel = graph.nodes.get(e.from) ? graph.nodes.get(e.from).label : e.from;
        const toLabel = graph.nodes.get(e.to) ? graph.nodes.get(e.to).label : e.to;
        return fromLabel + ' —' + e.relation + '→ ' + toLabel;
    });
    return lines.join('; ');
}

function getStats(graph) {
    return { nodeCount: graph.nodes.size, edgeCount: graph.edges.length };
}

// ============================================================
// SERIALISASI (Map tidak JSON-safe langsung — sama seperti
// vocabulary di llm-checkpoint.js)
// ============================================================
function serializeGraph(graph) {
    return {
        nodes: Array.from(graph.nodes.entries()),
        edges: graph.edges
    };
}

function deserializeGraph(serialized) {
    const graph = createGraph();
    (serialized.nodes || []).forEach(function (entry) {
        graph.nodes.set(entry[0], entry[1]);
    });
    graph.edges = (serialized.edges || []).slice();
    return graph;
}

export const LLMKnowledgeGraph = {
    createGraph: createGraph,
    addNode: addNode,
    addEdge: addEdge,
    getNeighbors: getNeighbors,
    getSubgraph: getSubgraph,
    toSummaryText: toSummaryText,
    getStats: getStats,
    serializeGraph: serializeGraph,
    deserializeGraph: deserializeGraph
};

window.LLMKnowledgeGraph = LLMKnowledgeGraph;

Logger.info('LLMKnowledgeGraph', 'llm-knowledge-graph.js loaded');
