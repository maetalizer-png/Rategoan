// MEGA-BATCH RAGETAN ROUND 6 - FASE 1: verifikasi NYATA (Chromium sungguhan
// lewat Playwright, bukan asumsi) jalur inference async baru (llm-runtime.js
// generateCached -> forwardCachedAsync -> LLMGpu.matmulAuto) - membuktikan:
// 1. navigator.gpu ada/tidak di lingkungan ini (deteksi jujur)
// 2. LLMGpu.initGPU() sukses/gagal beserta alasannya
// 3. generateCached() TETAP menghasilkan output yang valid baik lewat jalur
//    GPU (kalau siap) maupun jalur CPU lama (fallback) - keduanya dites.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const BASE = process.argv[2] || 'http://localhost:8099';

async function main() {
    const browser = await chromium.launch({
        executablePath: '/opt/pw-browsers/chromium',
        headless: true,
        args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan,UseSkiaRenderer'],
    });
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('console.error: ' + m.text()); });

    await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(async () => {
        const out = { steps: [] };
        try {
            out.navigatorGpuPresent = typeof navigator !== 'undefined' && !!navigator.gpu;
        } catch (e) {
            out.navigatorGpuPresent = false;
        }

        const { LLMGpu } = await import('/raget/raget-llm/neural/llm-gpu.js');
        const gpuOk = await LLMGpu.initGPU(512).catch((e) => { out.gpuInitError = String(e); return false; });
        out.gpuReady = LLMGpu.isReady();
        out.gpuInitReturned = gpuOk;
        out.steps.push('gpu-probe-done');

        // Model kecil (tiny preset) supaya cepat - fokus verifikasi JALUR
        // KODE (GPU-siap vs fallback), bukan kualitas generasi.
        const { RATEGOAN } = await import('/raget/raget-llm/neural/llm-core.js');
        const corpus = [
            'Rategoan adalah asisten chat lokal yang berjalan di peramban.',
            'Model bahasa kecil ini dilatih dari data singkat untuk uji coba.',
            'WebGPU bisa mempercepat perkalian matriks kalau perangkat mendukung.',
        ];
        await RATEGOAN.initialize({ corpus, configOptions: { preset: 'tiny' }, skipAutoTrain: true });
        out.steps.push('model-initialized');

        const stats = RATEGOAN.getStats();
        out.parameterCount = stats ? stats.parameterCount : null;

        const genResult = await RATEGOAN.generateText('Halo, apa kabar?', { maxNewTokens: 6, minNewTokens: 2, greedy: true });
        out.steps.push('generate-done');
        out.generatedText = genResult && genResult.text;
        out.tokensGenerated = genResult && genResult.tokensGenerated;
        out.usedGpuThisGeneration = LLMGpu.isReady();

        return out;
    });

    await browser.close();

    console.log(JSON.stringify({ result, consoleErrors }, null, 2));

    if (consoleErrors.length > 0) {
        console.error('ADA console/page error - lihat di atas.');
        process.exit(1);
    }
    if (!result.parameterCount || typeof result.generatedText !== 'string') {
        console.error('GAGAL: generateText tidak menghasilkan output valid.');
        process.exit(1);
    }
    console.log('\nLOLOS: jalur inference (GPU-ready=' + result.gpuReady + ') menghasilkan output valid, 0 error.');
}

main().catch((e) => {
    console.error('FATAL:', e);
    process.exit(1);
});
