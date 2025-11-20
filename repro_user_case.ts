
import { calculateSpineMatch } from './src/utils/archeryCalculator.ts';

// Common specs
const bowBase = {
    drawWeight: '54.5',
    iboVelocity: '335',
    braceHeight: '7.25',
    axleToAxle: '34.5',
    percentLetoff: '70',
};

const arrowBase = {
    pointWeight: '150',
    insertWeight: '0',
    fletchQuantity: '3',
    weightEach: '5.9',
    wrapWeight: '0',
    nockWeight: '7',
    bushingPin: '0',
    staticSpine: '0.400',
};

const stringWeights = {
    peep: '10',
    dLoop: '6',
    nockPoint: '2',
    silencers: '0',
    silencerDfc: '0',
    releaseType: 'Post Gate Release',
    stringMaterial: 'unknown' as const,
};

// Case A: User's Input in My App (DL 29, GPI 7.1)
const caseA_Bow = { ...bowBase, drawLength: '29' };
const caseA_Arrow = { ...arrowBase, shaftLength: '28', shaftGpi: '7.10' };

// Case B: User's Input in Reference App (DL 31, GPI 7.4)
const caseB_Bow = { ...bowBase, drawLength: '31' };
const caseB_Arrow = { ...arrowBase, shaftLength: '28', shaftGpi: '7.40' };

console.log('=== Case A: User App Input (DL 29", GPI 7.1) ===');
const resultA = calculateSpineMatch(caseA_Bow, caseA_Arrow, stringWeights);
console.log(`FPS: ${resultA.calculatedFPS?.toFixed(2)} (Expected in App: ~267.2)`);
console.log(`TAW: ${resultA.arrowTotalWeight.toFixed(2)} (Expected in App: 373.5)`);
console.log(`Match Index: ${resultA.matchIndex?.toFixed(3)}`);

console.log('\n=== Case B: Reference App Input (DL 31", GPI 7.4) ===');
const resultB = calculateSpineMatch(caseB_Bow, caseB_Arrow, stringWeights);
console.log(`FPS: ${resultB.calculatedFPS?.toFixed(2)} (Target Ref: 280.23)`);
console.log(`TAW: ${resultB.arrowTotalWeight.toFixed(2)} (Target Ref: 381.90)`);
console.log(`Match Index: ${resultB.matchIndex?.toFixed(3)}`);
