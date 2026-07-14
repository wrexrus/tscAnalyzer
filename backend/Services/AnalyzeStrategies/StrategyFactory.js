import { AnalyzeStrategy } from './AnalyzeStrategy.js';
import { OptimizeStrategy } from './OptimizeStrategy.js';
import { ConvertStrategy } from './ConvertStrategy.js';
import { TestStrategy } from './TestStrategy.js';


export const getStrategy = (mode) => {
    switch (mode) {
        case 'analyze': return AnalyzeStrategy;
        case 'optimize': return OptimizeStrategy;
        case 'convert': return ConvertStrategy;
        case 'test': return TestStrategy;
        default: return AnalyzeStrategy;
    }
};
