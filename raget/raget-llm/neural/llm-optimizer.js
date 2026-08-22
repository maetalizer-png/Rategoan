function sgdUpdateMatrix(matrix, grad, learningRate) {
    return matrix.map(function (row, i) {
        return row.map(function (v, j) { return v - learningRate * grad[i][j]; });
    });
}

function sgdUpdateVector(vector, grad, learningRate) {
    return vector.map(function (v, i) { return v - learningRate * grad[i]; });
}

function sgdUpdate(param, grad, learningRate) {
    const is2D = Array.isArray(param[0]);
    return is2D ? sgdUpdateMatrix(param, grad, learningRate) : sgdUpdateVector(param, grad, learningRate);
}

function createAdamState(param) {
    const is2D = Array.isArray(param[0]);
    const rows = param.length;
    const cols = is2D ? param[0].length : 1;
    const size = is2D ? rows * cols : rows;
    return {
        m: new Float32Array(size),
        v: new Float32Array(size),
        t: 0,
        is2D: is2D,
        rows: rows,
        cols: cols
    };
}

function adamUpdateVector(vector, grad, state, config) {
    state.t += 1;
    const out = new Array(vector.length);
    const biasCorr1 = 1 - Math.pow(config.beta1, state.t);
    const biasCorr2 = 1 - Math.pow(config.beta2, state.t);

    for (let i = 0; i < vector.length; i++) {
        state.m[i] = config.beta1 * state.m[i] + (1 - config.beta1) * grad[i];
        state.v[i] = config.beta2 * state.v[i] + (1 - config.beta2) * grad[i] * grad[i];
        const mHat = state.m[i] / biasCorr1;
        const vHat = state.v[i] / biasCorr2;
        out[i] = vector[i] - config.learningRate * mHat / (Math.sqrt(vHat) + config.epsilon);
    }

    return out;
}

function adamUpdateMatrix(matrix, grad, state, config) {
    state.t += 1;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const out = new Array(rows);
    const biasCorr1 = 1 - Math.pow(config.beta1, state.t);
    const biasCorr2 = 1 - Math.pow(config.beta2, state.t);

    for (let i = 0; i < rows; i++) {
        out[i] = new Array(cols);
        const rowOffset = i * cols;
        for (let j = 0; j < cols; j++) {
            const idx = rowOffset + j;
            state.m[idx] = config.beta1 * state.m[idx] + (1 - config.beta1) * grad[i][j];
            state.v[idx] = config.beta2 * state.v[idx] + (1 - config.beta2) * grad[i][j] * grad[i][j];
            const mHat = state.m[idx] / biasCorr1;
            const vHat = state.v[idx] / biasCorr2;
            out[i][j] = matrix[i][j] - config.learningRate * mHat / (Math.sqrt(vHat) + config.epsilon);
        }
    }

    return out;
}

function createAdamConfig(overrides) {
    overrides = overrides || {};
    return Object.assign({
        learningRate: 1e-3,
        beta1: 0.9,
        beta2: 0.999,
        epsilon: 1e-8
    }, overrides);
}

function adamUpdate(param, grad, state, config) {
    return state.is2D
        ? adamUpdateMatrix(param, grad, state, config)
        : adamUpdateVector(param, grad, state, config);
}

export const LLMOptimizer = {
    sgdUpdate: sgdUpdate,
    createAdamState: createAdamState,
    createAdamConfig: createAdamConfig,
    adamUpdate: adamUpdate
};
