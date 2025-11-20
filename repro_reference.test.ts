
import { describe, it, expect } from 'vitest';
import { calculateSpineMatch, BowSpecs, ArrowSpecs, StringWeights } from './src/utils/archeryCalculator';

describe('Reproduction and Sensitivity Analysis', () => {
    it('should reproduce the current state and verify point weight sensitivity', () => {
        const bow: BowSpecs = {
            iboVelocity: '335',
            drawLength: '29',
            drawWeight: '54.5',
            braceHeight: '7.25',
            axleToAxle: '34.5',
            percentLetoff: '70',
            camAggressiveness: 'medium'
        };

        const arrowBase: ArrowSpecs = {
            shaftLength: '28',
            pointWeight: '110',
            insertWeight: '0',
            shaftGpi: '7.4', // Corrected to match Reference App
            fletchQuantity: '3',
            weightEach: '5.9',
            wrapWeight: '0',
            nockWeight: '7',
            bushingPin: '0',
            staticSpine: '0.400'
        };

        const stringWeights: StringWeights = {
            peep: '10',
            dLoop: '6',
            nockPoint: '2',
            silencers: '0',
            silencerDfc: '0',
            releaseType: 'mechanical',
            stringMaterial: 'unknown'
        };



        const fs = require('fs');
        const resultBase = calculateSpineMatch(bow, arrowBase, stringWeights);
        let output = '--- Reproduction Results (Base Case) ---\n';
        output += `Calculated FPS: ${resultBase.calculatedFPS?.toFixed(2)} (Expected: ~276.36)\n`;

        output += `Total Arrow Weight: ${resultBase.arrowTotalWeight.toFixed(2)} (Expected: ~341.90)\n`;
        output += `Dynamic Spine: ${resultBase.spineDynamic?.toFixed(3)} (Expected: ~0.406)\n`;
        output += `Match Index: ${resultBase.matchIndex?.toFixed(3)}\n`;
        output += `Status: ${resultBase.status}\n`;

        output += '\n--- Point Weight Sensitivity Test ---\n';
        const arrowHeavy = { ...arrowBase, pointWeight: '150' }; // Increase point weight
        const resultHeavy = calculateSpineMatch(bow, arrowHeavy, stringWeights);
        output += `Base Point Weight: 110gr -> Dynamic Spine: ${resultBase.spineDynamic?.toFixed(3)}\n`;
        output += `Heavy Point Weight: 150gr -> Dynamic Spine: ${resultHeavy.spineDynamic?.toFixed(3)}\n`;

        if ((resultHeavy.spineDynamic || 0) > (resultBase.spineDynamic || 0)) {
            output += 'VERDICT: Increasing point weight INCREASED dynamic spine value (Weaker behavior). [CORRECT direction for deflection]\n';
        } else {
            output += 'VERDICT: Increasing point weight DECREASED dynamic spine value (Stiffer behavior). [INCORRECT direction]\n';
        }
        fs.writeFileSync('repro_results.txt', output);

    });
});
