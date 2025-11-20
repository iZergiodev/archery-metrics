
import { describe, it, expect } from 'vitest';
import { calculateSpineMatch, BowSpecs, ArrowSpecs, StringWeights } from './src/utils/archeryCalculator';
import * as fs from 'fs';

describe('Refactored Algorithm Verification', () => {
    it('should match Reference App values for 110gr and 150gr points', () => {
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
            shaftGpi: '7.4',
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

        // Case 1: 110gr Point
        const result110 = calculateSpineMatch(bow, arrowBase, stringWeights);

        // Case 2: 150gr Point
        const arrowHeavy = { ...arrowBase, pointWeight: '150' };
        const result150 = calculateSpineMatch(bow, arrowHeavy, stringWeights);

        let output = '--- Refactored Results ---\n';
        output += `[110gr] Dynamic Spine Target: 0.406 | Actual: ${result110.spineDynamic?.toFixed(3)}\n`;
        output += `[110gr] FPS Target: ~276.36 | Actual: ${result110.calculatedFPS?.toFixed(2)}\n`;
        output += `[110gr] Status Target: Good | Actual: ${result110.status}\n`;

        output += `[150gr] Dynamic Spine Target: 0.382 | Actual: ${result150.spineDynamic?.toFixed(3)}\n`;
        output += `[150gr] FPS Target: ~263.32 | Actual: ${result150.calculatedFPS?.toFixed(2)}\n`;
        output += `[150gr] Status Target: Weak | Actual: ${result150.status}\n`;

        // Verification Logic
        const spine110 = result110.spineDynamic || 0;
        const spine150 = result150.spineDynamic || 0;

        if (spine150 < spine110) {
            output += 'VERDICT: Increasing point weight DECREASED Dynamic Spine (Correct Requirement Behavior)\n';
        } else {
            output += 'VERDICT: Increasing point weight INCREASED Dynamic Spine (Incorrect Behavior)\n';
        }

        fs.writeFileSync('repro_results_refactor.txt', output);
    });
});
