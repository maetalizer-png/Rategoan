function randnGaussian() {
    let u = 0;
    let v = 0;
    while (u === 0) { u = Math.random(); }
    while (v === 0) { v = Math.random(); }
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function randomMatrix(rows, cols, std) {
    const m = new Array(rows);
    for (let i = 0; i < rows; i++) {
        const row = new Array(cols);
        for (let j = 0; j < cols; j++) {
            row[j] = randnGaussian() * std;
        }
        m[i] = row;
    }
    return m;
}

function zerosVector(n) {
    return new Array(n).fill(0);
}

function zerosMatrix(rows, cols) {
    const m = new Array(rows);
    for (let i = 0; i < rows; i++) {
        m[i] = new Array(cols).fill(0);
    }
    return m;
}

function matmul(A, B) {
    const m = A.length;
    const k = A[0] ? A[0].length : 0;
    const k2 = B.length;
    const n = B[0] ? B[0].length : 0;
    if (k !== k2) {
        throw new Error('[LLMEmbedding] matmul: dimensi tidak cocok (' + k + ' vs ' + k2 + ')');
    }
    const result = new Array(m);
    for (let i = 0; i < m; i++) {
        const row = new Array(n).fill(0);
        for (let p = 0; p < k; p++) {
            const aip = A[i][p];
            if (aip === 0) continue;
            const Brow = B[p];
            for (let j = 0; j < n; j++) {
                row[j] += aip * Brow[j];
            }
        }
        result[i] = row;
    }
    return result;
}

function transpose(A) {
    const rows = A.length;
    const cols = A[0] ? A[0].length : 0;
    const result = zerosMatrix(cols, rows);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = A[i][j];
        }
    }
    return result;
}

function addVectors(a, b) {
    return a.map(function (v, i) { return v + b[i]; });
}

function addMatrices(A, B) {
    return A.map(function (row, i) { return addVectors(row, B[i]); });
}

function addBiasRows(A, bias) {
    return A.map(function (row) { return addVectors(row, bias); });
}

function scaleVector(v, scalar) {
    return v.map(function (x) { return x * scalar; });
}

function scaleMatrix(A, scalar) {
    return A.map(function (row) { return scaleVector(row, scalar); });
}

function dotProduct(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}

function createEmbeddingMatrix(vocabSize, dModel, initStd) {
    return randomMatrix(vocabSize, dModel, initStd);
}

function lookupEmbeddings(embeddingMatrix, tokenIds) {
    return tokenIds.map(function (id) {
        if (id < 0 || id >= embeddingMatrix.length) {
            throw new Error('[LLMEmbedding] token id ' + id + ' di luar jangkauan vocab (0-' + (embeddingMatrix.length - 1) + ')');
        }
        return embeddingMatrix[id].slice();
    });
}

const positionalEncodingPool = new Map(); 

function getPositionalEncoding(seqLen, dModel) {
    let pool = positionalEncodingPool.get(dModel);
    if (!pool) {
        pool = [];
        positionalEncodingPool.set(dModel, pool);
    }
    while (pool.length < seqLen) {
        const pos = pool.length;
        const row = new Array(dModel);
        for (let i = 0; i < dModel; i += 2) {
            const angle = pos / Math.pow(10000, i / dModel);
            row[i] = Math.sin(angle);
            if (i + 1 < dModel) {
                row[i + 1] = Math.cos(angle);
            }
        }
        pool.push(row);
    }
    return pool.slice(0, seqLen);
}

function addPositionalEncoding(embeddings, posEnc) {
    return addMatrices(embeddings, posEnc);
}

export const LLMEmbedding = {
    
    randnGaussian: randnGaussian,
    randomMatrix: randomMatrix,
    zerosVector: zerosVector,
    zerosMatrix: zerosMatrix,
    matmul: matmul,
    transpose: transpose,
    addVectors: addVectors,
    addMatrices: addMatrices,
    addBiasRows: addBiasRows,
    scaleVector: scaleVector,
    scaleMatrix: scaleMatrix,
    dotProduct: dotProduct,
    
    createEmbeddingMatrix: createEmbeddingMatrix,
    lookupEmbeddings: lookupEmbeddings,
    getPositionalEncoding: getPositionalEncoding,
    addPositionalEncoding: addPositionalEncoding
};
