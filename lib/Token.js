'use strict';

/**
 * @description
 * A single token.
 *
 * @constructor
 * @param {number} kind The kind of token.
 * @param {string} [text] The token text.
 */
function Token(kind, text){

    var that = this;

    that.kind = kind;
    that.text = text || '';
}

/**
 * @description
 * Determines if the specified token is equal to the current instance.
 *
 * @param {Token} token
 * @returns {boolean}
 */
Token.prototype.equal = function(token){

    if (!token){
        return false;
    }

    return this.kind === token.kind && this.text === token.text;
};
