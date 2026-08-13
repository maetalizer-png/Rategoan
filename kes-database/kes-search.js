import { DB_CONFIG } from './kes-dbconfig.js';
import { InternalLogger, NotificationSystem } from './kes-helpers.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.KesDatabase = KESEMPATAN.KesDatabase || {};

const Config = DB_CONFIG;

const Logger = InternalLogger;

const Notify = NotificationSystem;

// ============================================================
// VECTOR SEARCH
// ============================================================
class VectorSearch {
    constructor(db) {
        this._db = db;
        this._storeName = 'vector_memory';
        this._dimension = 1536;
        this._embeddingModel = null;
        this._modelLoaded = false;

        Logger.debug('VectorSearch', 'Initialized');
    }

    async loadEmbeddingModel() {
        if (this._modelLoaded) {
            return;
        }

        try {
            if (typeof window.transformers !== 'undefined') {
                const { pipeline } = window.transformers;

                this._embeddingModel = await pipeline(
                    'feature-extraction',
                    'Xenova/all-MiniLM-L6-v2'
                );

                this._modelLoaded = true;

                Logger.info('VectorSearch', 'Embedding model loaded');
            } else {
                this._embeddingModel = async function (text) {
                    const hash = Array.from(new TextEncoder().encode(text));
                    const vec = [];

                    for (let i = 0; i < 1536; i++) {
                        vec.push((hash[i % hash.length] / 255) * 2 - 1);
                    }

                    return vec;
                };

                this._modelLoaded = true;

                Logger.warn('VectorSearch', 'Using fallback embedding');
            }
        } catch (e) {
            Logger.error('VectorSearch', 'Failed to load embedding model: ' + e.message);
            throw e;
        }
    }

    async embedText(text) {
        await this.loadEmbeddingModel();

        const result = await this._embeddingModel(text);

        return Array.isArray(result) ? result : result.data || result;
    }

    async addVector(id, vector, metadata) {
        const record = Object.freeze({
            id: id,
            vector: vector,
            metadata: metadata,
            timestamp: Date.now()
        });

        await this._db.bulkInsert(this._storeName, [record]);

        return record;
    }

    async search(queryVector, limit, threshold) {
        limit = limit || 10;
        threshold = threshold || 0.7;

        const all = await this._db.getAllFromStore(this._storeName);

        const results = all.map(function (item) {
            return {
                id: item.id,
                metadata: item.metadata,
                similarity: this._cosineSimilarity(queryVector, item.vector),
                timestamp: item.timestamp
            };
        }.bind(this));

        return results
            .filter(function (r) {
                return r.similarity >= threshold;
            })
            .sort(function (a, b) {
                return b.similarity - a.similarity;
            })
            .slice(0, limit);
    }

    _cosineSimilarity(vecA, vecB) {
        let dot = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async findSimilar(text, embedFn) {
        if (!embedFn) {
            const vector = await this.embedText(text);
            return this.search(vector);
        }

        const vector = await embedFn(text);

        return this.search(vector);
    }

    async getStats() {
        const all = await this._db.getAllFromStore(this._storeName);

        return Object.freeze({
            total: all.length,
            dimension: this._dimension,
            modelLoaded: this._modelLoaded,
            lastIndexed: all.length > 0
                ? Math.max.apply(null, all.map(function (v) {
                    return v.timestamp;
                }))
                : null
        });
    }
}

// ============================================================
// GRAPH QUERY
// ============================================================
class GraphQuery {
    constructor(db) {
        this._db = db;
        this._nodes = new Map();
        this._edges = new Map();
        this._cache = new Map();

        Logger.debug('GraphQuery', 'Initialized');
    }

    async addNode(id, label, properties) {
        const node = Object.freeze({
            id: id,
            label: label,
            properties: properties || {},
            created: Date.now()
        });

        this._nodes.set(id, node);

        await this._db.saveQuantumEncrypted('graph_nodes', id, node);

        this._cache.clear();

        return node;
    }

    async addEdge(source, target, type, properties) {
        const edge = Object.freeze({
            id: source + '->' + target + '|' + type,
            source: source,
            target: target,
            type: type,
            properties: properties || {},
            created: Date.now()
        });

        this._edges.set(edge.id, edge);

        await this._db.saveQuantumEncrypted('graph_edges', edge.id, edge);

        this._cache.clear();

        return edge;
    }

    async getNode(id) {
        return this._nodes.get(id) || await this._db.getEncrypted('graph_nodes', id);
    }

    async getEdges(source, target, type) {
        let results = Array.from(this._edges.values());

        if (source) {
            results = results.filter(function (e) {
                return e.source === source;
            });
        }

        if (target) {
            results = results.filter(function (e) {
                return e.target === target;
            });
        }

        if (type) {
            results = results.filter(function (e) {
                return e.type === type;
            });
        }

        return results;
    }

    async shortestPath(source, target, maxDepth) {
        maxDepth = maxDepth || 5;

        const cacheKey = source + '->' + target + '|' + maxDepth;

        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        const visited = new Set();
        const queue = [{
            node: source,
            path: [source],
            depth: 0
        }];

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.node === target) {
                this._cache.set(cacheKey, current.path);
                return current.path;
            }

            if (current.depth >= maxDepth) {
                continue;
            }

            const edges = await this.getEdges(current.node);

            for (const edge of edges) {
                if (!visited.has(edge.target)) {
                    visited.add(edge.target);

                    queue.push({
                        node: edge.target,
                        path: current.path.concat(edge.target),
                        depth: current.depth + 1
                    });
                }
            }
        }

        this._cache.set(cacheKey, null);

        return null;
    }

    async getStats() {
        return Object.freeze({
            nodes: this._nodes.size,
            edges: this._edges.size,
            cacheSize: this._cache.size
        });
    }
}

// ============================================================
// FULL-TEXT SEARCH
// ============================================================
class FullTextSearch {
    constructor(db) {
        this._db = db;
        this._index = new Map();
        this._documents = new Map();
        this._idf = new Map();
        this._docLengths = new Map();
        this._avgDocLength = 0;
        this._k1 = 1.2;
        this._b = 0.75;
        this._language = Config.ftsLanguage || 'id';
        this._stopwords = new Map();

        this._loadStopwords();

        Logger.debug('FullTextSearch', 'Initialized with language: ' + this._language);
    }

    _loadStopwords() {
        const stopwordsData = {
            id: [
                'yang', 'dan', 'di', 'dari', 'ke', 'pada', 'dengan', 'untuk',
                'dalam', 'atas', 'oleh', 'karena', 'sebagai', 'ini', 'itu',
                'adalah', 'atau', 'serta', 'akan', 'telah', 'tidak', 'sangat', 'juga'
            ],
            en: [
                'the', 'a', 'an', 'of', 'for', 'on', 'at', 'to', 'in', 'with',
                'without', 'by', 'from', 'up', 'down', 'off', 'over', 'under',
                'etc', 'and', 'or', 'but', 'nor', 'for', 'yet', 'so'
            ],
            es: [
                'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de',
                'en', 'por', 'para', 'con', 'sin', 'sobre', 'entre', 'hasta',
                'desde', 'durante', 'según'
            ],
            fr: [
                'le', 'la', 'les', 'un', 'une', 'des', 'de', 'en', 'par',
                'pour', 'avec', 'sans', 'sur', 'entre', 'jusque', 'depuis',
                'pendant', 'selon'
            ]
        };

        const langs = Object.keys(stopwordsData);

        for (const lang of langs) {
            this._stopwords.set(lang, new Set(stopwordsData[lang]));
        }

        if (!this._stopwords.has(this._language)) {
            this._stopwords.set(this._language, new Set(stopwordsData.id));
        }
    }

    async indexDocument(id, text, metadata) {
        const tokens = this._tokenize(text);

        this._documents.set(id, {
            text: text,
            metadata: metadata,
            tokens: tokens,
            length: tokens.length
        });

        this._docLengths.set(id, tokens.length);

        const uniqueTerms = new Set(tokens);

        for (const term of uniqueTerms) {
            if (!this._index.has(term)) {
                this._index.set(term, new Set());
            }

            this._index.get(term).add(id);
        }

        this._updateIDF();

        this._avgDocLength = Array.from(this._docLengths.values()).reduce(function (a, b) {
            return a + b;
        }, 0) / this._docLengths.size;

        await this._db.saveQuantumEncrypted('fts_index', id, {
            text: text,
            metadata: metadata,
            tokens: tokens
        });
    }

    async search(query, limit, options) {
        options = options || {};
        limit = limit || 10;

        const queryTokens = this._tokenize(query);
        const candidateDocs = new Set();
        const fuzzyThreshold = options.fuzzy || 0.8;

        for (const term of queryTokens) {
            if (this._index.has(term)) {
                for (const docId of this._index.get(term)) {
                    candidateDocs.add(docId);
                }
            }

            if (options.fuzzy !== false) {
                for (const [indexTerm, docSet] of this._index) {
                    const distance = this._levenshtein(term, indexTerm);
                    const maxLen = Math.max(term.length, indexTerm.length);

                    if (distance / maxLen < (1 - fuzzyThreshold)) {
                        for (const docId of docSet) {
                            candidateDocs.add(docId);
                        }
                    }
                }
            }
        }

        const scores = [];

        for (const docId of candidateDocs) {
            const doc = this._documents.get(docId);

            if (!doc) {
                continue;
            }

            let score = 0;

            for (const term of queryTokens) {
                const tf = doc.tokens.filter(function (t) {
                    return t === term;
                }).length;

                const idf = this._idf.get(term) || 0;
                const docLen = this._docLengths.get(docId) || 1;

                const numerator = tf * (this._k1 + 1);
                const denominator = tf + this._k1 * (
                    1 - this._b + this._b * (docLen / this._avgDocLength)
                );

                score += idf * (numerator / denominator);
            }

            scores.push({
                id: docId,
                score: score,
                metadata: doc.metadata,
                text: doc.text
            });
        }

        return scores.sort(function (a, b) {
            return b.score - a.score;
        }).slice(0, limit);
    }

    _tokenize(text) {
        let tokens = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(function (t) {
                return t.length > 1;
            });

        const stopwords = this._stopwords.get(this._language) || new Set();

        tokens = tokens.filter(function (t) {
            return !stopwords.has(t);
        });

        tokens = tokens.map(function (t) {
            return this._stem(t);
        }.bind(this));

        return tokens;
    }

    _stem(word) {
        if (word.endsWith('ing')) {
            return word.slice(0, -3);
        }

        if (word.endsWith('ed')) {
            return word.slice(0, -2);
        }

        if (word.endsWith('es')) {
            return word.slice(0, -2);
        }

        if (word.endsWith('s')) {
            return word.slice(0, -1);
        }

        if (word.endsWith('tion')) {
            return word.slice(0, -4);
        }

        if (word.endsWith('ment')) {
            return word.slice(0, -4);
        }

        if (word.endsWith('idad')) {
            return word.slice(0, -4);
        }

        if (word.endsWith('mente')) {
            return word.slice(0, -5);
        }

        return word;
    }

    _levenshtein(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b[i - 1] === a[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        )
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    _updateIDF() {
        const totalDocs = this._documents.size;

        for (const [term, docSet] of this._index) {
            const df = docSet.size;

            this._idf.set(
                term,
                Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1)
            );
        }
    }

    async getStats() {
        return Object.freeze({
            terms: this._index.size,
            documents: this._documents.size,
            avgDocLength: this._avgDocLength,
            language: this._language,
            stopwords: this._stopwords.get(this._language).size
        });
    }
}

// ============================================================
// GEOSPATIAL QUERY
// ============================================================
class GeospatialQuery {
    constructor(db, storeName) {
        this._db = db;
        this._storeName = storeName || 'locations';
        this._locations = new Map();
        this._grid = new Map();

        Logger.debug('GeospatialQuery', 'Initialized');
    }

    async addLocation(id, name, lat, lng, metadata) {
        const location = Object.freeze({
            id: id,
            name: name,
            lat: lat,
            lng: lng,
            metadata: metadata || {},
            created: Date.now()
        });

        this._locations.set(id, location);

        const gridKey = Math.floor(lat / 1) + ',' + Math.floor(lng / 1);

        if (!this._grid.has(gridKey)) {
            this._grid.set(gridKey, new Set());
        }

        this._grid.get(gridKey).add(id);

        await this._db.saveQuantumEncrypted(this._storeName, id, location);

        return location;
    }

    async getLocation(id) {
        return this._locations.get(id) || await this._db.getEncrypted(this._storeName, id);
    }

    async findNearby(lat, lng, radiusKm) {
        const all = Array.from(this._locations.values());
        const results = [];

        for (const loc of all) {
            const distance = this._haversine(lat, lng, loc.lat, loc.lng);

            if (distance <= radiusKm) {
                results.push(Object.assign({}, loc, {
                    distance: distance
                }));
            }
        }

        return results.sort(function (a, b) {
            return a.distance - b.distance;
        });
    }

    _haversine(lat1, lon1, lat2, lon2) {
        const R = 6371;

        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    async getStats() {
        return Object.freeze({
            locations: this._locations.size,
            gridCells: this._grid.size
        });
    }
}

// ============================================================
// TIME-SERIES ANALYTICS
// ============================================================
class TimeSeriesAnalytics {
    constructor(db) {
        this._db = db;
        this._series = new Map();

        Logger.debug('TimeSeriesAnalytics', 'Initialized');
    }

    async addPoint(seriesId, value, timestamp) {
        timestamp = timestamp || Date.now();

        const point = Object.freeze({
            timestamp: timestamp,
            value: value
        });

        if (!this._series.has(seriesId)) {
            this._series.set(seriesId, []);
        }

        const series = this._series.get(seriesId);

        series.push(point);

        if (series.length > 10000) {
            series.shift();
        }

        await this._db.saveQuantumEncrypted('timeseries_' + seriesId, 'latest', point);

        return point;
    }

    async getPoints(seriesId, from, to, limit) {
        limit = limit || 1000;

        const series = this._series.get(seriesId) || [];

        let filtered = series;

        if (from) {
            filtered = filtered.filter(function (p) {
                return p.timestamp >= from;
            });
        }

        if (to) {
            filtered = filtered.filter(function (p) {
                return p.timestamp <= to;
            });
        }

        filtered = filtered.slice(-limit);

        return filtered;
    }

    async aggregate(seriesId, interval, fn) {
        const points = await this.getPoints(seriesId);

        if (points.length === 0) {
            return [];
        }

        const result = [];

        let currentBucket = points[0].timestamp - (points[0].timestamp % interval);
        let bucketData = [];

        for (const p of points) {
            const bucketStart = p.timestamp - (p.timestamp % interval);

            if (bucketStart > currentBucket) {
                const values = bucketData.map(function (d) {
                    return d.value;
                });

                let agg = 0;

                if (fn === 'avg') {
                    agg = values.reduce(function (a, b) {
                        return a + b;
                    }, 0) / values.length;
                } else if (fn === 'sum') {
                    agg = values.reduce(function (a, b) {
                        return a + b;
                    }, 0);
                } else if (fn === 'min') {
                    agg = Math.min.apply(null, values);
                } else if (fn === 'max') {
                    agg = Math.max.apply(null, values);
                } else if (fn === 'count') {
                    agg = values.length;
                }

                result.push({
                    timestamp: currentBucket,
                    value: agg,
                    count: values.length
                });

                currentBucket = bucketStart;
                bucketData = [];
            }

            bucketData.push(p);
        }

        if (bucketData.length > 0) {
            const values = bucketData.map(function (d) {
                return d.value;
            });

            let agg = 0;

            if (fn === 'avg') {
                agg = values.reduce(function (a, b) {
                    return a + b;
                }, 0) / values.length;
            } else if (fn === 'sum') {
                agg = values.reduce(function (a, b) {
                    return a + b;
                }, 0);
            } else if (fn === 'min') {
                agg = Math.min.apply(null, values);
            } else if (fn === 'max') {
                agg = Math.max.apply(null, values);
            } else if (fn === 'count') {
                agg = values.length;
            }

            result.push({
                timestamp: currentBucket,
                value: agg,
                count: values.length
            });
        }

        return result;
    }

    async forecast(seriesId, steps, method) {
        method = method || 'linear';

        const points = await this.getPoints(seriesId);

        if (points.length < 2) {
            return [];
        }

        const n = points.length;

        const x = points.map(function (p, i) {
            return i;
        });

        const y = points.map(function (p) {
            return p.value;
        });

        const sumX = x.reduce(function (a, b) {
            return a + b;
        }, 0);

        const sumY = y.reduce(function (a, b) {
            return a + b;
        }, 0);

        const sumXY = x.reduce(function (a, b, i) {
            return a + b * y[i];
        }, 0);

        const sumX2 = x.reduce(function (a, b) {
            return a + b * b;
        }, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const forecast = [];

        for (let i = 1; i <= steps; i++) {
            const nextX = n + i - 1;

            forecast.push({
                timestamp: Date.now() + i * (
                    points[points.length - 1].timestamp -
                    points[points.length - 2].timestamp
                ),
                value: slope * nextX + intercept,
                isPrediction: true,
                method: method
            });
        }

        return forecast;
    }

    async getStats() {
        return Object.freeze({
            series: this._series.size,
            totalPoints: Array.from(this._series.values()).reduce(function (sum, arr) {
                return sum + arr.length;
            }, 0)
        });
    }
}

// ============================================================
// QUERY PARSER
// ============================================================
class QueryParser {
    constructor(db) {
        this._db = db;

        Logger.debug('QueryParser', 'Initialized');
    }

    async parseAndExecute(query, params) {
        const trimmed = query.trim();

        if (trimmed.toUpperCase().startsWith('WITH')) {
            return await this._parseCTE(trimmed, params);
        } else if (trimmed.toUpperCase().startsWith('SELECT')) {
            return await this._parseSelect(trimmed, params);
        } else if (trimmed.toUpperCase().startsWith('INSERT')) {
            return await this._parseInsert(trimmed, params);
        } else if (trimmed.toUpperCase().startsWith('UPDATE')) {
            return await this._parseUpdate(trimmed, params);
        } else if (trimmed.toUpperCase().startsWith('DELETE')) {
            return await this._parseDelete(trimmed, params);
        } else {
            throw new Error('Unsupported query type');
        }
    }

    async _parseCTE(query, params) {
        const cteRegex = /WITH\s+(\w+)\s+AS\s*\((.+?)\)\s*,?/gi;
        const ctes = {};

        let match;
        let remainingQuery = query;

        while ((match = cteRegex.exec(query)) !== null) {
            const name = match[1];
            const subquery = match[2];

            ctes[name] = subquery;

            remainingQuery = remainingQuery.replace(match[0], '');
        }

        for (const [, subquery] of Object.entries(ctes)) {
            await this._parseSelect(subquery, params);
        }

        const mainQuery = remainingQuery.trim();

        let finalQuery = mainQuery;

        for (const [name] of Object.entries(ctes)) {
            finalQuery = finalQuery.replace(
                new RegExp('\\b' + name + '\\b', 'g'),
                '_temp_' + name
            );
        }

        const result = await this._parseSelect(finalQuery, params);

        return result;
    }

    async _parseSelect(query, params) {
        const selectMatch = query.match(/SELECT\s+(.+)\s+FROM\s+(\w+)/i);

        if (!selectMatch) {
            throw new Error('Invalid SELECT syntax');
        }

        const fields = selectMatch[1].split(',').map(function (s) {
            return s.trim();
        });

        const table = selectMatch[2];
        const fromSubquery = table.match(/\((.+)\)/);

        let tableName = table;
        let subqueryData = null;

        if (fromSubquery) {
            subqueryData = await this._parseSelect(fromSubquery[1], params);
            tableName = 'subquery';
        }

        const joinMatch = query.match(/JOIN\s+(\w+)\s+ON\s+(.+)/i);

        let joinTable = null;
        let joinCondition = null;

        if (joinMatch) {
            joinTable = joinMatch[1];
            joinCondition = joinMatch[2].trim();
        }

        const whereMatch = query.match(
            /WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+HAVING|\s+ORDER\s+BY|\s+LIMIT|\s+OFFSET|$)/i
        );

        const whereClause = whereMatch ? whereMatch[1] : '';

        const groupMatch = query.match(
            /GROUP\s+BY\s+(.+?)(?:\s+HAVING|\s+ORDER\s+BY|\s+LIMIT|\s+OFFSET|$)/i
        );

        const groupBy = groupMatch
            ? groupMatch[1].split(',').map(function (s) {
                return s.trim();
            })
            : [];

        const havingMatch = query.match(
            /HAVING\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s+OFFSET|$)/i
        );

        const havingClause = havingMatch ? havingMatch[1] : '';

        const windowMatch = query.match(/ROW_NUMBER\s*\(\)\s*OVER\s*\((.+?)\)/i);

        let windowFn = null;
        let windowPartition = '';

        if (windowMatch) {
            windowFn = 'ROW_NUMBER';
            windowPartition = windowMatch[1].trim();
        }

        const orderMatch = query.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|\s+OFFSET|$)/i);

        const orderBy = orderMatch ? orderMatch[1] : '';
        const orderDir = query.includes('DESC') ? 'DESC' : 'ASC';

        const limitMatch = query.match(/LIMIT\s+(\d+)/i);
        const offsetMatch = query.match(/OFFSET\s+(\d+)/i);

        const limit = limitMatch ? parseInt(limitMatch[1]) : 100;
        const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;

        let all;

        if (subqueryData) {
            all = subqueryData;
        } else {
            all = await this._db.getAllFromStore(tableName);
        }

        if (joinTable && joinCondition) {
            const joinData = await this._db.getAllFromStore(joinTable);
            const condParts = joinCondition.split(/\s*=\s*/);

            if (condParts.length === 2) {
                const leftKey = condParts[0].trim().replace(tableName + '.', '');
                const rightKey = condParts[1].trim().replace(joinTable + '.', '');

                const joined = [];

                for (const leftRow of all) {
                    for (const rightRow of joinData) {
                        if (leftRow[leftKey] === rightRow[rightKey]) {
                            joined.push(Object.assign({}, leftRow, rightRow));
                        }
                    }
                }

                all = joined;
            }
        }

        let filtered = all;

        if (whereClause) {
            filtered = filtered.filter(function (record) {
                return this._evaluateWhere(record, whereClause);
            }.bind(this));
        }

        if (groupBy.length > 0) {
            const groups = {};

            for (const record of filtered) {
                const key = groupBy.map(function (k) {
                    return record[k];
                }).join('|');

                if (!groups[key]) {
                    groups[key] = [];
                }

                groups[key].push(record);
            }

            const aggregated = [];

            for (const [key, group] of Object.entries(groups)) {
                const row = {};
                const keys = key.split('|');

                groupBy.forEach(function (k, i) {
                    row[k] = keys[i];
                });

                const aggMatch = fields[0].match(/(COUNT|SUM|AVG|MIN|MAX)\s*\((.+?)\)/i);

                if (aggMatch) {
                    const aggFunc = aggMatch[1].toUpperCase();
                    const aggField = aggMatch[2].trim();

                    if (aggFunc === 'COUNT') {
                        row[aggFunc.toLowerCase()] = group.length;
                    } else if (aggFunc === 'SUM') {
                        row[aggFunc.toLowerCase()] = group.reduce(function (s, r) {
                            return s + (parseFloat(r[aggField]) || 0);
                        }, 0);
                    } else if (aggFunc === 'AVG') {
                        const sum = group.reduce(function (s, r) {
                            return s + (parseFloat(r[aggField]) || 0);
                        }, 0);

                        row[aggFunc.toLowerCase()] = group.length > 0 ? sum / group.length : 0;
                    } else if (aggFunc === 'MIN') {
                        const vals = group.map(function (r) {
                            return parseFloat(r[aggField]) || 0;
                        });

                        row[aggFunc.toLowerCase()] = vals.length > 0 ? Math.min.apply(null, vals) : 0;
                    } else if (aggFunc === 'MAX') {
                        const vals = group.map(function (r) {
                            return parseFloat(r[aggField]) || 0;
                        });

                        row[aggFunc.toLowerCase()] = vals.length > 0 ? Math.max.apply(null, vals) : 0;
                    }
                }

                aggregated.push(row);
            }

            filtered = aggregated;
        }

        if (windowFn === 'ROW_NUMBER' && windowPartition) {
            const partitionKey = windowPartition.replace(/PARTITION\s+BY\s+/i, '').trim();
            const rows = filtered;
            const partitions = {};

            for (const row of rows) {
                const key = row[partitionKey];

                if (!partitions[key]) {
                    partitions[key] = [];
                }

                partitions[key].push(row);
            }

            let i = 0;

            for (const [, group] of Object.entries(partitions)) {
                let rank = 1;

                for (const row of group) {
                    row.row_number = rank++;
                    filtered[i++] = row;
                }
            }
        }

        if (orderBy) {
            const key = orderBy.trim();

            filtered.sort(function (a, b) {
                const valA = a[key] || '';
                const valB = b[key] || '';

                if (orderDir === 'DESC') {
                    return valA < valB ? 1 : -1;
                }

                return valA > valB ? 1 : -1;
            });
        }

        const paginated = filtered.slice(offset, offset + limit);

        if (fields.length === 1 && fields[0] === '*') {
            return paginated;
        }

        return paginated.map(function (record) {
            const obj = {};

            for (const field of fields) {
                obj[field] = record[field];
            }

            return obj;
        });
    }

    _evaluateWhere(record, whereClause) {
        const conditions = whereClause.split(/\s+AND\s+/i);

        for (const cond of conditions) {
            const likeMatch = cond.match(/(\w+)\s+LIKE\s+['"](.+?)['"]/i);

            if (likeMatch) {
                const key = likeMatch[1];
                const pattern = likeMatch[2].replace(/%/g, '.*');
                const value = record[key] || '';

                if (!new RegExp(pattern, 'i').test(value)) {
                    return false;
                }

                continue;
            }

            const inMatch = cond.match(/(\w+)\s+IN\s*\((.+?)\)/i);

            if (inMatch) {
                const key = inMatch[1];

                const values = inMatch[2].split(',').map(function (v) {
                    return v.trim().replace(/['"]/g, '');
                });

                if (!values.includes(record[key])) {
                    return false;
                }

                continue;
            }

            const betweenMatch = cond.match(/(\w+)\s+BETWEEN\s+([\d.]+)\s+AND\s+([\d.]+)/i);

            if (betweenMatch) {
                const key = betweenMatch[1];
                const low = parseFloat(betweenMatch[2]);
                const high = parseFloat(betweenMatch[3]);
                const val = parseFloat(record[key]);

                if (val < low || val > high) {
                    return false;
                }

                continue;
            }

            const opMatch = cond.match(/(\w+)\s*([><]=?|!=|<>)\s*['"]?([^'"]+)['"]?/);

            if (opMatch) {
                const key = opMatch[1];
                const op = opMatch[2];
                const value = opMatch[3].trim();
                const val = record[key];

                if (op === '=') {
                    if (val != value) {
                        return false;
                    }
                } else if (op === '>') {
                    if (parseFloat(val) <= parseFloat(value)) {
                        return false;
                    }
                } else if (op === '<') {
                    if (parseFloat(val) >= parseFloat(value)) {
                        return false;
                    }
                } else if (op === '>=') {
                    if (parseFloat(val) < parseFloat(value)) {
                        return false;
                    }
                } else if (op === '<=') {
                    if (parseFloat(val) > parseFloat(value)) {
                        return false;
                    }
                } else if (op === '!=' || op === '<>') {
                    if (val == value) {
                        return false;
                    }
                }
            } else {
                const parts = cond.split(/\s*=\s*/);

                if (parts.length === 2) {
                    const key = parts[0].trim();
                    const value = parts[1].trim().replace(/['"]/g, '');

                    if (record[key] != value) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    async _parseInsert(query, params) {
        const match = query.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);

        if (!match) {
            throw new Error('Invalid INSERT syntax');
        }

        const table = match[1];

        const columns = match[2].split(',').map(function (s) {
            return s.trim();
        });

        const values = match[3].split(',').map(function (s) {
            return s.trim().replace(/['"]/g, '');
        });

        const record = {};

        for (let i = 0; i < columns.length; i++) {
            record[columns[i]] = values[i] || params[i] || '';
        }

        const id = record.id || Date.now().toString(36);

        await this._db.saveQuantumEncrypted(table, id, record);

        return Object.assign({ id: id }, record);
    }

    async _parseUpdate(query, params) {
        const match = query.match(/UPDATE\s+(\w+)\s+SET\s+(.+)\s+WHERE\s+(.+)/i);

        if (!match) {
            throw new Error('Invalid UPDATE syntax');
        }

        const table = match[1];
        const setClause = match[2];
        const whereClause = match[3];

        const sets = setClause.split(',').map(function (s) {
            return s.trim();
        });

        const updates = {};

        for (const set of sets) {
            const parts = set.split(/\s*=\s*/);

            if (parts.length === 2) {
                updates[parts[0].trim()] = parts[1].trim().replace(/['"]/g, '');
            }
        }

        const all = await this._db.getAllFromStore(table);

        const toUpdate = all.filter(function (record) {
            return this._evaluateWhere(record, whereClause);
        }.bind(this));

        for (const record of toUpdate) {
            for (const key in updates) {
                record[key] = updates[key];
            }

            await this._db.saveQuantumEncrypted(table, record.id, record);
        }

        return toUpdate;
    }

    async _parseDelete(query, params) {
        const match = query.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);

        if (!match) {
            throw new Error('Invalid DELETE syntax');
        }

        const table = match[1];
        const whereClause = match[2];

        const all = await this._db.getAllFromStore(table);

        const toDelete = all.filter(function (record) {
            return this._evaluateWhere(record, whereClause);
        }.bind(this));

        for (const record of toDelete) {
            await this._db.deleteRecord(table, record.id);
        }

        return toDelete;
    }
}

// ============================================================
// AI QUERY OPTIMIZER
// ============================================================
class AIQueryOptimizer {
    constructor(db) {
        this._db = db;
        this._patterns = new Map();
        this._queryHistory = [];
        this._maxHistory = 1000;

        Logger.debug('AIQueryOptimizer', 'Initialized');
    }

    async optimizeQuery(query, params) {
        const fingerprint = this._fingerprint(query);
        const pattern = this._patterns.get(fingerprint);

        if (pattern) {
            const optimized = this._applyOptimizations(query, pattern);
            return await this._executeOptimized(optimized, params);
        }

        const start = performance.now();
        const result = await this._db._executeQuery(query, params);
        const duration = performance.now() - start;

        this._learn(query, duration);

        return result;
    }

    _fingerprint(query) {
        return query.replace(/\d+/g, '?').replace(/\s+/g, ' ').trim();
    }

    _learn(query, duration) {
        const fingerprint = this._fingerprint(query);

        if (!this._patterns.has(fingerprint)) {
            this._patterns.set(fingerprint, {
                count: 0,
                totalDuration: 0,
                avgDuration: 0
            });
        }

        const pattern = this._patterns.get(fingerprint);

        pattern.count++;
        pattern.totalDuration += duration;
        pattern.avgDuration = pattern.totalDuration / pattern.count;

        this._queryHistory.push({
            query: query,
            duration: duration,
            timestamp: Date.now()
        });

        if (this._queryHistory.length > this._maxHistory) {
            this._queryHistory.shift();
        }
    }

    _applyOptimizations(query, pattern) {
        if (pattern.avgDuration > 500 && pattern.count > 5) {
            const tables = query.match(/FROM\s+(\w+)/gi);

            if (tables) {
                const table = tables[0].replace(/FROM\s+/i, '');
                const fields = query.match(/WHERE\s+(\w+)\s*[=<>]/i);

                if (fields) {
                    const field = fields[1];

                    Logger.info('AIQueryOptimizer', 'Index recommended: ' + table + '.' + field);

                    Notify.info('AI Optimizer', 'Index recommended on ' + table + '.' + field);
                }
            }
        }

        return query;
    }

    async _executeOptimized(query, params) {
        return await this._db._executeQuery(query, params);
    }

    getStats() {
        return Object.freeze({
            patterns: this._patterns.size,
            history: this._queryHistory.length
        });
    }

    getRecommendations() {
        const recommendations = [];

        for (const [fingerprint, pattern] of this._patterns) {
            if (pattern.avgDuration > 500 && pattern.count > 5) {
                recommendations.push({
                    query: fingerprint,
                    avgDuration: pattern.avgDuration,
                    count: pattern.count,
                    suggestion: 'Consider adding indexes or optimizing query'
                });
            }
        }

        return recommendations.sort(function (a, b) {
            return b.avgDuration - a.avgDuration;
        });
    }
}

// ============================================================
// SELF-OPTIMIZING INDEXES
// ============================================================
class IndexOptimizer {
    constructor(db) {
        this._db = db;
        this._indexes = new Map();
        this._usageStats = new Map();
        this._recommendations = [];

        Logger.debug('IndexOptimizer', 'Initialized');
    }

    async analyzeQuery(query) {
        const whereMatch = query.match(/WHERE\s+(\w+)\s*[=><]/i);

        if (whereMatch) {
            const tableMatch = query.match(/FROM\s+(\w+)/i);

            if (tableMatch) {
                const table = tableMatch[1];
                const column = whereMatch[1];
                const key = table + '.' + column;

                const current = this._usageStats.get(key) || {
                    count: 0,
                    lastUsed: 0
                };

                this._usageStats.set(key, {
                    count: current.count + 1,
                    lastUsed: Date.now()
                });

                if (current.count > 5) {
                    this._recommendIndex(table, column);
                }
            }
        }
    }

    _recommendIndex(table, column) {
        const usage = this._usageStats.get(table + '.' + column);
        const count = usage ? usage.count : 0;

        const suggestion = {
            table: table,
            column: column,
            indexName: 'idx_' + table + '_' + column,
            query: 'CREATE INDEX idx_' + table + '_' + column + ' ON ' + table + '(' + column + ')',
            confidence: Math.min(95, count * 10),
            suggestedAt: Date.now()
        };

        const exists = this._recommendations.some(function (r) {
            return r.table === table && r.column === column;
        });

        if (!exists) {
            this._recommendations.push(suggestion);

            Logger.info('IndexOptimizer', 'Recommended index: ' + suggestion.indexName);

            Notify.info('Index Optimizer', 'Recommended index on ' + table + '.' + column);
        }
    }

    getRecommendations() {
        return this._recommendations.sort(function (a, b) {
            return b.confidence - a.confidence;
        }).slice(0, 10);
    }

    getStats() {
        return Object.freeze({
            tracked: this._usageStats.size,
            recommendations: this._recommendations.length
        });
    }
}

// ============================================================
// QUERY STREAMING
// ============================================================
class QueryStream {
    constructor(db) {
        this._db = db;
        this._activeStreams = new Map();

        Logger.debug('QueryStream', 'Initialized');
    }

    async *streamQuery(query, params, batchSize) {
        batchSize = batchSize || 100;

        let offset = 0;
        let hasMore = true;

        const streamId = query + '|' + Date.now().toString(36);

        this._activeStreams.set(streamId, {
            cancelled: false
        });

        while (hasMore) {
            const streamState = this._activeStreams.get(streamId);

            if (streamState && streamState.cancelled) {
                this._activeStreams.delete(streamId);
                break;
            }

            const paginatedQuery = query + ' LIMIT ? OFFSET ?';
            const paginatedParams = [].concat(params, batchSize, offset);

            const results = await this._db._executeQuery(paginatedQuery, paginatedParams);

            if (results.length === 0) {
                hasMore = false;
            } else {
                for (const result of results) {
                    yield result;
                }

                offset += batchSize;
            }
        }

        this._activeStreams.delete(streamId);
    }

    cancelStream(streamId) {
        const stream = this._activeStreams.get(streamId);

        if (stream) {
            stream.cancelled = true;
        }
    }

    getStats() {
        return Object.freeze({
            activeStreams: this._activeStreams.size
        });
    }
}

export {
    VectorSearch, GraphQuery, FullTextSearch, GeospatialQuery,
    TimeSeriesAnalytics, QueryParser, AIQueryOptimizer, IndexOptimizer, QueryStream
};

KESEMPATAN.KesDatabase.VectorSearch = VectorSearch;
KESEMPATAN.KesDatabase.GraphQuery = GraphQuery;
KESEMPATAN.KesDatabase.FullTextSearch = FullTextSearch;
KESEMPATAN.KesDatabase.GeospatialQuery = GeospatialQuery;
KESEMPATAN.KesDatabase.TimeSeriesAnalytics = TimeSeriesAnalytics;
KESEMPATAN.KesDatabase.QueryParser = QueryParser;
KESEMPATAN.KesDatabase.AIQueryOptimizer = AIQueryOptimizer;
KESEMPATAN.KesDatabase.IndexOptimizer = IndexOptimizer;
KESEMPATAN.KesDatabase.QueryStream = QueryStream;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('Search', 'Loaded');
}
