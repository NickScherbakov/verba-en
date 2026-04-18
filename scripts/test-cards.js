/**
 * Automated test for all 20 level cards in LEVELS_DATA
 * Tests: structure, passage, questions, options, correct answers, duplicates
 */

const fs = require('fs');
eval(fs.readFileSync('/opt/verba-en/public/js/levels-data.js', 'utf8'));

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, variantId, msg) {
    if (condition) {
        passed++;
    } else {
        failed++;
        errors.push(`  ✗ Variant ${variantId}: ${msg}`);
    }
}

console.log('=== verba-en level cards test ===\n');

// ── Global checks ──────────────────────────────────────────────────────────
assert(Array.isArray(LEVELS_DATA), 0, 'LEVELS_DATA must be an array');
assert(LEVELS_DATA.length === 20, 0, `Expected 20 variants, got ${LEVELS_DATA.length}`);

const allIds = LEVELS_DATA.map(v => v.id);
const uniqueIds = new Set(allIds);
assert(uniqueIds.size === 20, 0, `Duplicate variant IDs: ${allIds.filter((id, i) => allIds.indexOf(id) !== i)}`);

// ── Per-variant checks ─────────────────────────────────────────────────────
for (const variant of LEVELS_DATA) {
    const id = variant.id;

    // Required fields
    assert(typeof variant.id === 'number', id, 'id must be a number');
    assert(typeof variant.title === 'string' && variant.title.length > 0, id, 'title missing');
    assert(typeof variant.topic === 'string' && variant.topic.length > 0, id, 'topic missing');
    assert(typeof variant.maxScore === 'number', id, 'maxScore missing');
    assert(Array.isArray(variant.questions), id, 'questions must be an array');

    // Question count
    const qCount = variant.questions.length;
    assert(qCount >= 7, id, `Too few questions: ${qCount} (min 7)`);
    assert(qCount <= 10, id, `Too many questions: ${qCount} (max 10)`);

    // Passage on reading questions
    const readingQs = variant.questions.filter(q => q.type === 'reading');
    if (readingQs.length > 0) {
        const withPassage = readingQs.filter(q => q.passage);
        assert(withPassage.length === readingQs.length, id,
            `${readingQs.length - withPassage.length} reading questions missing passage`);
        if (withPassage.length > 0) {
            const p = withPassage[0].passage;
            assert(typeof p.title === 'string' && p.title.length > 5, id, 'passage title too short');
            assert(typeof p.text === 'string' && p.text.length > 100, id, `passage text too short: ${p.text.length} chars`);
            assert(!p.title.includes('ответа'), id, `passage title contains noise: "${p.title}"`);
            assert(!p.title.includes('©'), id, 'passage title contains copyright noise');
            assert(!p.text.includes('©'), id, 'passage text contains copyright noise');
        }
    }

    // Per-question checks
    const questionTexts = new Set();
    for (let qi = 0; qi < variant.questions.length; qi++) {
        const q = variant.questions[qi];
        const qid = `${id}.q${qi+1}`;

        // Type
        assert(['multiple-choice', 'reading', 'fill-blank'].includes(q.type), id,
            `q${qi+1}: unknown type "${q.type}"`);

        // Text
        assert(typeof q.text === 'string' && q.text.length > 10, id, `q${qi+1}: text too short`);
        assert(!q.text.includes('©'), id, `q${qi+1}: text contains copyright`);
        assert(!q.text.includes('ООО'), id, `q${qi+1}: text contains publisher noise`);
        assert(!q.text.includes('ТИПОВЫЕ'), id, `q${qi+1}: text contains PDF noise`);

        // Duplicate question texts within variant
        assert(!questionTexts.has(q.text), id, `q${qi+1}: duplicate question text`);
        questionTexts.add(q.text);

        // Options (for multiple-choice and reading)
        if (q.type !== 'fill-blank') {
            assert(Array.isArray(q.options), id, `q${qi+1}: options must be array`);
            assert(q.options.length === 4, id, `q${qi+1}: expected 4 options, got ${q.options.length}`);

            for (let oi = 0; oi < q.options.length; oi++) {
                const opt = q.options[oi];
                assert(typeof opt === 'string' && opt.length > 1, id,
                    `q${qi+1} option ${oi+1}: too short or not string: "${opt}"`);
                assert(!opt.includes('©'), id, `q${qi+1} option ${oi+1}: contains copyright`);
            }

            // Correct answer index
            assert(typeof q.correct === 'number', id, `q${qi+1}: correct must be number`);
            assert(q.correct >= 0 && q.correct <= 3, id,
                `q${qi+1}: correct index ${q.correct} out of range [0-3]`);

            // No duplicate options
            const optSet = new Set(q.options.map(o => o.toLowerCase().trim()));
            assert(optSet.size === 4, id, `q${qi+1}: duplicate options detected`);
        }

        // Points
        assert(typeof q.points === 'number' && q.points > 0, id, `q${qi+1}: points must be positive number`);
    }
}

// ── Across-variant duplicate check ────────────────────────────────────────
const allPassageTitles = LEVELS_DATA
    .map(v => v.questions.find(q => q.passage))
    .filter(q => q && q.passage)
    .map(q => q.passage.title);
const titleSet = new Set(allPassageTitles);
assert(titleSet.size === allPassageTitles.length || allPassageTitles.length === 0, 0,
    `Duplicate passage titles across variants: ${allPassageTitles.filter((t, i) => allPassageTitles.indexOf(t) !== i)}`);

// ── Summary ────────────────────────────────────────────────────────────────
console.log('Results per variant:');
LEVELS_DATA.forEach(v => {
    const rQs = v.questions.filter(q => q.type === 'reading');
    const hasPassage = rQs.some(q => q.passage);
    const status = hasPassage ? '📖' : '📝';
    console.log(`  ${status} Variant ${String(v.id).padStart(2)}: ${v.questions.length} questions | ${v.topic} | passage: ${hasPassage ? v.questions.find(q=>q.passage).passage.title : 'none'}`);
});

console.log(`\n${'─'.repeat(50)}`);
if (failed === 0) {
    console.log(`✅ ALL TESTS PASSED (${passed} checks)`);
} else {
    console.log(`❌ ${failed} FAILED, ${passed} passed`);
    errors.forEach(e => console.log(e));
}

process.exit(failed > 0 ? 1 : 0);
