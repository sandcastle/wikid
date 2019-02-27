"use strict";

describe("TokenIterator", function() {
  var sut;

  describe("index", function() {
    beforeEach(function() {
      sut = new TokenIterator([
        new Token(TokenKinds.special, "*"),
        new Token(TokenKinds.text, "hello"),
        new Token(TokenKinds.special, "*")
      ]);
    });

    it("should start with an index of zero", function() {
      expect(sut.getIndex()).toBe(0);
    });

    it("should increment the index on consume", function() {
      sut.consume();
      expect(sut.getIndex()).toBe(1);
    });

    it("should not increment the index on peek", function() {
      sut.peek();
      expect(sut.getIndex()).toBe(0);
    });

    it("should set the correct index if set", function() {
      sut.setIndex(1);
      expect(sut.getIndex()).toBe(1);
    });

    it("should not set the correct index if larger than the token count", function() {
      sut.setIndex(1);
      sut.setIndex(10);
      expect(sut.getIndex()).toBe(1);
    });

    it("should decrement remaining count on consume", function() {
      expect(sut.remainingCount()).toBe(3);
      sut.consume();
      expect(sut.remainingCount()).toBe(2);
    });
  });

  describe("consumeWhile", function() {
    it("should consume while predicate true", function() {
      sut = new TokenIterator([
        new Token(TokenKinds.text, "hello"),
        new Token(TokenKinds.space, " "),
        new Token(TokenKinds.special, "*"),
        new Token(TokenKinds.text, "world"),
        new Token(TokenKinds.special, "*")
      ]);

      sut.consumeWhile(function(token) {
        return token.kind != TokenKinds.special;
      });
      expect(sut.getIndex()).toBe(2);
    });
  });

  describe("consumeConcatenatedWhile", function() {
    it("should consume while predicate true and return string", function() {
      sut = new TokenIterator([
        new Token(TokenKinds.text, "hello"),
        new Token(TokenKinds.space, " "),
        new Token(TokenKinds.special, "*"),
        new Token(TokenKinds.text, "world"),
        new Token(TokenKinds.special, "*"),
        new Token(TokenKinds.newline, "\n")
      ]);

      var result = sut.consumeConcatenatedWhile(function(token) {
        return token.kind != TokenKinds.newline;
      });
      expect(result).toBe("hello *world*");
    });
  });

  describe("consumeWhileWhitespace", function() {
    it("should consume whitespace tokens", function() {
      sut = new TokenIterator([
        new Token(TokenKinds.space, " "),
        new Token(TokenKinds.text, "test")
      ]);

      sut.consumeWhileWhitespace();
      expect(sut.getIndex()).toBe(1);
    });

    it("should consume all continuous whitespace tokens", function() {
      sut = new TokenIterator([
        new Token(TokenKinds.space, " "),
        new Token(TokenKinds.space, " "),
        new Token(TokenKinds.space, " "),
        new Token(TokenKinds.text, "test")
      ]);

      sut.consumeWhileWhitespace();
      expect(sut.getIndex()).toBe(3);
    });
  });
});
