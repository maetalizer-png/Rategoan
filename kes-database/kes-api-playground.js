import { InternalLogger } from './kes-helpers.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.KesDatabase = KESEMPATAN.KesDatabase || {};

const Logger = InternalLogger;

function renderJson(elementId, data) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.style.color = '';
    element.textContent = JSON.stringify(data, null, 2);
}

function renderError(elementId, message) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.style.color = '#b00020';
    element.textContent = 'Error: ' + message;
}

// ============================================================
// GRAPHQL-LIKE API
// ============================================================
class GraphQLAPI {
    constructor(db) {
        this._db = db;

        Logger.debug('GraphQLAPI', 'Initialized');
    }

    async query(queryString) {
        const parsed = this._parseGraphQL(queryString);
        const sql = this._toSQL(parsed);

        return await this._db.executeQuery(sql);
    }

    _parseGraphQL(queryString) {
        const lines = queryString.split('\n').map(function (line) {
            return line.trim();
        }).filter(function (line) {
            return line;
        });

        const fields = [];
        let current = null;

        for (const line of lines) {
            if (line.startsWith('{')) {
                continue;
            }

            if (line.endsWith('{')) {
                const name = line.replace('{', '').trim();

                current = name;

                fields.push({
                    name: name,
                    children: []
                });
            } else if (line.endsWith('}')) {
                current = null;
            } else if (current) {
                const child = line.replace(',', '').trim();

                const parent = fields.find(function (field) {
                    return field.name === current;
                });

                if (parent) {
                    parent.children.push(child);
                }
            } else {
                const field = line.replace(',', '').trim();

                if (!field.includes('{')) {
                    fields.push({
                        name: field,
                        children: []
                    });
                }
            }
        }

        return fields;
    }

    _toSQL(parsed) {
        const selectFields = parsed.map(function (field) {
            return field.name;
        }).join(', ');

        return 'SELECT ' + selectFields + ' FROM users';
    }
}

// ============================================================
// VISUAL QUERY BUILDER
// ============================================================
class QueryBuilder {
    constructor(db) {
        this._db = db;

        Logger.debug('QueryBuilder', 'Initialized');
    }

    renderUI(containerId) {
        const container = document.getElementById(containerId);

        if (!container) {
            Logger.warn('QueryBuilder', 'Container not found');
            return;
        }

        const html = `
            <div style="font-family:sans-serif;padding:1rem;border:1px solid #ccc;border-radius:8px;background:#f9f9f9;">
                <h3>Visual Query Builder</h3>
                <div>
                    <label>Table: <input id="qb-table" value="users" style="padding:4px;border-radius:4px;"></label>
                    <label>Fields: <input id="qb-fields" value="*" style="padding:4px;border-radius:4px;"></label>
                    <label>Where: <input id="qb-where" value="age > 20" style="padding:4px;border-radius:4px;"></label>
                    <button id="qb-execute" style="padding:4px 12px;border-radius:4px;background:#4CAF50;color:white;border:none;">Execute</button>
                </div>
                <pre id="qb-result" style="margin-top:1rem;background:white;padding:1rem;border-radius:4px;max-height:300px;overflow:auto;"></pre>
            </div>
        `;

        container.innerHTML = html;

        document.getElementById('qb-execute').addEventListener('click', async function () {
            const table = document.getElementById('qb-table').value;
            const fields = document.getElementById('qb-fields').value;
            const where = document.getElementById('qb-where').value;

            let query = 'SELECT ' + fields + ' FROM ' + table;

            if (where) {
                query += ' WHERE ' + where;
            }

            try {
                const result = await this._db.executeQuery(query);
                renderJson('qb-result', result);
            } catch (error) {
                renderError('qb-result', error.message);
            }
        }.bind(this));
    }
}

// ============================================================
// INTERACTIVE PLAYGROUND
// ============================================================
class Playground {
    constructor(db) {
        this._db = db;

        Logger.debug('Playground', 'Initialized');
    }

    renderUI(containerId) {
        const container = document.getElementById(containerId);

        if (!container) {
            Logger.warn('Playground', 'Container not found');
            return;
        }

        const html = `
            <div style="font-family:sans-serif;padding:1rem;border:1px solid #ccc;border-radius:8px;background:#f9f9f9;">
                <h3>Interactive Documentation Playground</h3>
                <p>Example query:</p>
                <ul>
                    <li><code>SELECT * FROM users</code></li>
                </ul>
                <div>
                    <label>Query: <input id="play-query" style="width:70%;padding:4px;border-radius:4px;" placeholder="Enter SQL-like query"></label>
                    <button id="play-execute" style="padding:4px 12px;border-radius:4px;background:#2196F3;color:white;border:none;">Run</button>
                </div>
                <pre id="play-result" style="margin-top:1rem;background:white;padding:1rem;border-radius:4px;max-height:300px;overflow:auto;"></pre>
            </div>
        `;

        container.innerHTML = html;

        document.getElementById('play-execute').addEventListener('click', async function () {
            const query = document.getElementById('play-query').value;

            try {
                const result = await this._db.executeQuery(query);
                renderJson('play-result', result);
            } catch (error) {
                renderError('play-result', error.message);
            }
        }.bind(this));
    }
}

export { GraphQLAPI, QueryBuilder, Playground };

KESEMPATAN.KesDatabase.GraphQLAPI = GraphQLAPI;
KESEMPATAN.KesDatabase.QueryBuilder = QueryBuilder;
KESEMPATAN.KesDatabase.Playground = Playground;
