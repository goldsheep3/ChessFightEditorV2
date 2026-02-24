// Shared validation patterns and constants

// Pattern for entity IDs (forms, effects, terms, etc.)
const ID_PATTERN = /^[a-z0-9][a-z0-9\-_]*$/;

// Pattern for set codes
const SET_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-_]*$/;

// Alignment options for effects
const ALIGNMENT_OPTIONS = ['positive', 'neutral', 'negative'];

// Rarity options for cards
const RARITY_OPTIONS = ['R', 'SR', 'SSR'];

// Validation helper functions
function validateId(id, fieldName = 'ID') {
    if (!ID_PATTERN.test(id)) {
        throw new Error(`${fieldName}格式无效！必须以小写字母或数字开头，只能包含小写字母、数字、下划线和短横线。`);
    }
    return true;
}

function validateSetCode(code) {
    if (!SET_CODE_PATTERN.test(code)) {
        throw new Error('套组代码格式无效！必须以字母或数字开头，只能包含字母、数字、下划线和短横线。');
    }
    return true;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ID_PATTERN,
        SET_CODE_PATTERN,
        ALIGNMENT_OPTIONS,
        RARITY_OPTIONS,
        validateId,
        validateSetCode
    };
}
