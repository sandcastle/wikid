'use strict';

describe('Token', function () {

    describe('equals', function () {

        it('should return true for equals tokens', function() {

            var token1 = new Token(TokenKinds.text, 'hello');
            var token2 = new Token(TokenKinds.text, 'hello');

            expect(token1.equals(token2)).toBe(true);
        });

        it('should return false when the token kind differs', function() {

            var token1 = new Token(TokenKinds.space, 'hello');
            var token2 = new Token(TokenKinds.text, 'hello');

            expect(token1.equals(token2)).toBe(false);
        });

        it('should return false when the token kind differs', function() {

            var token1 = new Token(TokenKinds.text, 'hello');
            var token2 = new Token(TokenKinds.text, 'world');

            expect(token1.equals(token2)).toBe(false);
        });
    });

});
