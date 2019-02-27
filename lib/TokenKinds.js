"use strict";

/**
 * @description
 * All token kinds.
 */
function TokenKinds() {}

/**
 * @description
 * Not a token.
 *
 * @type {number}
 */
TokenKinds.none = 0;

/**
 * @description
 * A text token.
 *
 * @type {number}
 */
TokenKinds.text = 1;

/**
 * @description
 * A number token.
 *
 * @type {number}
 */
TokenKinds.number = 2;

/**
 * @description
 * A symbol token.
 *
 * @type {number}
 */
TokenKinds.symbol = 3;

/**
 * @description
 * A punctuation token.
 *
 * @type {number}
 */
TokenKinds.punctuation = 4;

/**
 * @description
 * A white space token.
 *
 * @type {number}
 */
TokenKinds.space = 5;

/**
 * @description
 * A new line token.
 *
 * @type {number}
 */
TokenKinds.newline = 6;

/**
 * @description
 * A special token.
 *
 * @type {number}
 */
TokenKinds.special = 7;

/**
 * @description
 * An unknown token.
 *
 * @type {number}
 */
TokenKinds.unknown = 8;
