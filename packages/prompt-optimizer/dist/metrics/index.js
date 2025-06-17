/**
 * Metrics for evaluating prompt optimization results
 * Based on DSPy's metrics system
 */
/**
 * Normalizes text for comparison by removing extra whitespace and converting to lowercase
 */
function normalizeText(text) {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
}
/**
 * Extracts answer from various formats (string, object with answer field, etc.)
 */
function extractAnswer(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (value && typeof value === 'object') {
        if (value.answer)
            return String(value.answer);
        if (value.output)
            return String(value.output);
        if (value.response)
            return String(value.response);
    }
    return String(value);
}
/**
 * Checks if the predicted answer exactly matches the expected answer
 * Supports both string and array answers with optional fraction matching
 */
export function answerExactMatch(example, prediction, trace, frac = 1.0) {
    const expectedAnswer = extractAnswer(example.output);
    const predictedAnswer = extractAnswer(prediction.output);
    // Handle array answers
    if (Array.isArray(example.output)) {
        const expectedAnswers = example.output.map(extractAnswer).map(normalizeText);
        const normalizedPredicted = normalizeText(predictedAnswer);
        const matches = expectedAnswers.filter(expected => normalizeText(expected) === normalizedPredicted).length;
        return Math.min(matches / (expectedAnswers.length * frac), 1.0);
    }
    // Handle single answer
    const normalizedExpected = normalizeText(expectedAnswer);
    const normalizedPredicted = normalizeText(predictedAnswer);
    return normalizedExpected === normalizedPredicted ? 1.0 : 0.0;
}
/**
 * Checks if the predicted answer appears in any of the provided passages/context
 */
export function answerPassageMatch(example, prediction, trace) {
    const predictedAnswer = extractAnswer(prediction.output);
    const normalizedPredicted = normalizeText(predictedAnswer);
    // Get context from various sources
    let context = [];
    if (Array.isArray(prediction.metadata?.context)) {
        context = prediction.metadata.context.map(String);
    }
    else if (Array.isArray(example.context)) {
        context = example.context.map(String);
    }
    else if (typeof prediction.metadata?.context === 'string') {
        context = [prediction.metadata.context];
    }
    else if (typeof example.context === 'string') {
        context = [example.context];
    }
    if (context.length === 0) {
        return 0.0;
    }
    // Check if the predicted answer appears in any passage
    for (const passage of context) {
        const normalizedPassage = normalizeText(passage);
        if (normalizedPassage.includes(normalizedPredicted)) {
            return 1.0;
        }
    }
    return 0.0;
}
/**
 * Fuzzy string matching using Levenshtein distance
 */
function levenshteinDistance(s1, s2) {
    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i++) {
        matrix[0][i] = i;
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[j][0] = j;
    }
    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // deletion
            matrix[j - 1][i] + 1, // insertion
            matrix[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    return matrix[s2.length][s1.length];
}
/**
 * Fuzzy answer matching using edit distance with configurable threshold
 */
export function answerFuzzyMatch(example, prediction, trace, threshold = 0.8) {
    const expectedAnswer = extractAnswer(example.output);
    const predictedAnswer = extractAnswer(prediction.output);
    const normalizedExpected = normalizeText(expectedAnswer);
    const normalizedPredicted = normalizeText(predictedAnswer);
    if (normalizedExpected === normalizedPredicted) {
        return 1.0;
    }
    const maxLength = Math.max(normalizedExpected.length, normalizedPredicted.length);
    if (maxLength === 0) {
        return 1.0;
    }
    const distance = levenshteinDistance(normalizedExpected, normalizedPredicted);
    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold ? similarity : 0.0;
}
/**
 * Checks if predicted answer contains the expected answer as a substring
 */
export function answerContainsMatch(example, prediction, trace) {
    const expectedAnswer = extractAnswer(example.output);
    const predictedAnswer = extractAnswer(prediction.output);
    const normalizedExpected = normalizeText(expectedAnswer);
    const normalizedPredicted = normalizeText(predictedAnswer);
    return normalizedPredicted.includes(normalizedExpected) ? 1.0 : 0.0;
}
/**
 * Numeric answer matching with tolerance
 */
export function answerNumericMatch(example, prediction, trace, tolerance = 0.01) {
    const expectedAnswer = extractAnswer(example.output);
    const predictedAnswer = extractAnswer(prediction.output);
    const expectedNum = parseFloat(expectedAnswer);
    const predictedNum = parseFloat(predictedAnswer);
    if (isNaN(expectedNum) || isNaN(predictedNum)) {
        return 0.0;
    }
    const difference = Math.abs(expectedNum - predictedNum);
    const relativeError = difference / Math.abs(expectedNum);
    return relativeError <= tolerance ? 1.0 : 0.0;
}
/**
 * Creates a composite metric that combines multiple metrics
 */
export function createCompositeMetric(metrics) {
    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    return {
        name: `composite_${metrics.map(m => m.metric.name).join('_')}`,
        evaluate: (example, prediction, trace) => {
            const weightedScores = metrics.map(({ metric, weight }) => {
                const score = metric.evaluate(example, prediction, trace);
                return score * weight;
            });
            return weightedScores.reduce((sum, score) => sum + score, 0) / totalWeight;
        },
    };
}
// Pre-built metric instances
export const ExactMatch = {
    name: 'exact_match',
    evaluate: answerExactMatch,
};
export const PassageMatch = {
    name: 'passage_match',
    evaluate: answerPassageMatch,
};
export const FuzzyMatch = {
    name: 'fuzzy_match',
    evaluate: (example, prediction, trace) => answerFuzzyMatch(example, prediction, trace, 0.8),
};
export const ContainsMatch = {
    name: 'contains_match',
    evaluate: answerContainsMatch,
};
export const NumericMatch = {
    name: 'numeric_match',
    evaluate: (example, prediction, trace) => answerNumericMatch(example, prediction, trace, 0.01),
};
/**
 * Factory function to create custom exact match metric with specific fraction
 */
export function createExactMatchMetric(frac = 1.0) {
    return {
        name: `exact_match_${frac}`,
        evaluate: (example, prediction, trace) => answerExactMatch(example, prediction, trace, frac),
    };
}
/**
 * Factory function to create custom fuzzy match metric with specific threshold
 */
export function createFuzzyMatchMetric(threshold = 0.8) {
    return {
        name: `fuzzy_match_${threshold}`,
        evaluate: (example, prediction, trace) => answerFuzzyMatch(example, prediction, trace, threshold),
    };
}
/**
 * Factory function to create custom numeric match metric with specific tolerance
 */
export function createNumericMatchMetric(tolerance = 0.01) {
    return {
        name: `numeric_match_${tolerance}`,
        evaluate: (example, prediction, trace) => answerNumericMatch(example, prediction, trace, tolerance),
    };
}
//# sourceMappingURL=index.js.map