function createConstantSchedule(baseLr) {
    return { type: 'constant', baseLr: baseLr };
}

function createLinearWarmupSchedule(baseLr, warmupSteps, totalSteps) {
    return { type: 'linearWarmup', baseLr: baseLr, warmupSteps: warmupSteps, totalSteps: totalSteps };
}

function createCosineSchedule(baseLr, warmupSteps, totalSteps) {
    return { type: 'cosine', baseLr: baseLr, warmupSteps: warmupSteps, totalSteps: totalSteps };
}

function getLearningRate(schedule, step) {
    if (schedule.type === 'constant') {
        return schedule.baseLr;
    }

    if (step <= schedule.warmupSteps) {
        
        return schedule.baseLr * (step / Math.max(1, schedule.warmupSteps));
    }

    const progress = Math.min(1, (step - schedule.warmupSteps) / Math.max(1, schedule.totalSteps - schedule.warmupSteps));

    if (schedule.type === 'linearWarmup') {
        return schedule.baseLr * (1 - progress);
    }

    if (schedule.type === 'cosine') {
        return schedule.baseLr * 0.5 * (1 + Math.cos(Math.PI * progress));
    }

    throw new Error('[LLMScheduler] tipe jadwal "' + schedule.type + '" tidak dikenal');
}

export const LLMScheduler = {
    createConstantSchedule: createConstantSchedule,
    createLinearWarmupSchedule: createLinearWarmupSchedule,
    createCosineSchedule: createCosineSchedule,
    getLearningRate: getLearningRate
};
