"use strict";

describe("Tokenizer", function() {
  describe("createIterator", function() {
    it("should create a valid iterator", function() {
      var iterator = Tokenizer.createIterator("hello");

      expect(iterator.getIndex()).toBe(0);
      expect(iterator.count()).toBe(1);
    });
  });

  describe("tokenize", function() {
    describe("kinds", function() {
      function expectKindFrom(input, kind, text) {
        var tokens = Tokenizer.tokenize(input);

        expect(tokens.length).toBe(1);
        expect(tokens[0].kind).toBe(kind);
        expect(tokens[0].text).toBe(text);
      }

      it("should recognise letter tokens", function() {
        expectKindFrom("g", TokenKinds.text, "g");
      });

      it("should recognise multi letter tokens", function() {
        expectKindFrom("ask", TokenKinds.text, "ask");
      });

      it("should recognise alpha numeric tokens", function() {
        expectKindFrom("h3ll0", TokenKinds.text, "h3ll0");
      });

      it("should recognise number tokens", function() {
        expectKindFrom("1", TokenKinds.number, "1");
      });

      it("should recognise special tokens", function() {
        expectKindFrom("[", TokenKinds.special, "[");
      });

      it("should recognise punctuation tokens", function() {
        expectKindFrom(";", TokenKinds.punctuation, ";");
      });

      it("should recognise symbol tokens", function() {
        expectKindFrom("$", TokenKinds.symbol, "$");
      });

      it("should recognise space tokens", function() {
        expectKindFrom(" ", TokenKinds.space, " ");
      });

      it("should recognise tab tokens", function() {
        expectKindFrom("\t", TokenKinds.space, " ");
      });
    });

    describe("normalize", function() {
      function expectNewLineTokenFrom(input) {
        var tokens = Tokenizer.tokenize(input);

        expect(tokens.length).toBe(1);
        expect(tokens[0].kind).toBe(TokenKinds.newline);
        expect(tokens[0].text).toBe("\n");
      }

      it("should replace carriage returns", function() {
        expectNewLineTokenFrom("\r");
      });

      it("should replace windows new lines", function() {
        expectNewLineTokenFrom("\r\n");
      });

      it("should replace unicode paragraph separators", function() {
        expectNewLineTokenFrom("\u2029");
      });

      it("should replace unicode line separators", function() {
        expectNewLineTokenFrom("\u2028");
      });

      it("should replace unicode BOM", function() {
        expect(Tokenizer.tokenize("\uFEFF").length).toBe(0);
      });
    });
  });
});
