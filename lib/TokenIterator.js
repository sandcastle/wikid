"use strict";

/**
 * @description
 * A token iterator.
 *
 * @param {Token[]} tokens The tokens to iterate over.
 */
function TokenIterator(tokens) {
  var that = this;
  that._tokens = tokens || [];
  that._index = 0;
}

/**
 * @description
 * Returns the current index of the iterator.
 *
 * @returns {Number} The current iterator index.
 */
TokenIterator.prototype.getIndex = function() {
  return this._index;
};

/**
 * @description
 * Sets the index of the iterator.
 *
 * @param {Number} index The new index of the iterator.
 */
TokenIterator.prototype.setIndex = function(index) {
  if (index < this._tokens.length) {
    this._index = index;
  }
};

/**
 * @description
 * Consumes the specified number of tokens specified, one if count not specified.
 *
 * @param {Number} [count] The number of tokens to consume, if not specified - 1 will be consumed.
 * @returns {Token} The last token that was consumed.
 */
TokenIterator.prototype.consume = function(count) {
  if (typeof count == "undefined" || count === null) {
    count = 1;
  }

  this._index += count;

  return this.peek(-1);
};

/**
 * @description
 * Consumes tokens while the predicate is true.
 *
 * @param {Function} predicate The predicate to determine when to stop consuming.
 */
TokenIterator.prototype.consumeWhile = function(predicate) {
  var that = this;

  while (predicate(that.peek()) && !that.eof()) {
    that.consume();
  }
};

/**
 * @description
 * Consumes tokens while the predicate is true, then returns the concatenated string.
 *
 * @param {Function} predicate The predicate to determine when to stop consuming.
 * @returns {String}
 */
TokenIterator.prototype.consumeConcatenatedWhile = function(predicate) {
  var that = this,
    s = "";

  while (predicate(that.peek()) && !that.eof()) {
    s += that.consume().text;
  }

  return s;
};

/**
 * @description
 * Consumes while they continue to be whitespaces.
 */
TokenIterator.prototype.consumeWhileWhitespace = function() {
  this.consumeWhile(function(token) {
    return token.kind == TokenKinds.space;
  });
};

/**
 * @description
 * Peek at the token stream.
 *
 * @param {number} [count] The number of tokens ahead to skip.
 * @returns {Token} The token.
 */
TokenIterator.prototype.peek = function(count) {
  if (typeof count == "undefined" || count === null) {
    count = 0;
  }

  if (this._index + count < this._tokens.length) {
    return this._tokens[this._index + count];
  }

  return new Token(TokenKinds.none);
};

/**
 * @description
 * Returns the total number of tokens.
 *
 * @returns {number} The total token count.
 */
TokenIterator.prototype.count = function() {
  return this._tokens.length;
};

/**
 * @description
 * Returns the number of remaining tokens based on the current position.
 *
 * @returns {number} The remaining token count.
 */
TokenIterator.prototype.remainingCount = function() {
  return Math.max(0, this._tokens.length - this._index);
};

/**
 * @description
 * Returns if there are any more tokens after the current index.
 *
 * @returns {boolean} True if the end of the file (no more tokens remaining).
 */
TokenIterator.prototype.eof = function() {
  return this.remainingCount() === 0;
};
