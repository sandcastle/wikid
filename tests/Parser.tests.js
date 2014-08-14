'use strict';

describe('Parser', function(){

	describe('makeParagraph', function(){

		function getParagraphResult(text){
			var iterator = Tokenizer.createIterator(text);
			return Parser.makeParagraph(iterator);
		}

		it('should return blank when found', function(){
			expect(getParagraphResult(' ').kind).toBe(ParagraphKinds.blank);
		});

		it('should return rule when found', function(){
			expect(getParagraphResult('----').kind).toBe(ParagraphKinds.rule);
		});

		it('should return heading when found', function(){
			expect(getParagraphResult('h2. testing').kind).toBe(ParagraphKinds.heading);
		});
	});

	describe('tryMakeBlankLine', function(){

		function getBlankLineResult(text){
			var iterator = Tokenizer.createIterator(text);
			return isSuccess(Parser.tryMakeBlankLine(iterator));
		}

		it('should return true with no space', function(){
			expect(getBlankLineResult('\n')).toBe(true);
		});

		it('should return true with single space', function(){
			expect(getBlankLineResult(' \n')).toBe(true);
		});

		it('should return true with multiple spaces', function(){
			expect(getBlankLineResult(' 	\n')).toBe(true);
		});

		it('should return true if empty and eof', function(){
			expect(getBlankLineResult('')).toBe(true);
		});
	});

	describe('tryMakeHorizontalRule', function(){

		function getRuleResult(text){
			var iterator = Tokenizer.createIterator(text);
			return isSuccess(Parser.tryMakeHorizontalRule(iterator));
		}

		it('should return true for valid rule', function(){
			expect(getRuleResult('----')).toBe(true);
		});

		it('should return true for valid rule', function(){
			expect(getRuleResult('----  ')).toBe(true);
		});

		it('should return false if no rule', function(){
			expect(getRuleResult('--')).toBe(false);
		});
	});

	describe('tryMakeHeading', function(){

		function getHeadingResult(text){
			var iterator = Tokenizer.createIterator(text);
			return Parser.tryMakeHeading(iterator);
		}

		function expectValidHeading(number){
			var result = getHeadingResult('h' + number +  '. Welcome!');
			expect(isSuccess(result)).toBe(true);
			expect(result.heading.number).toBe(number);
			expect(result.heading.text).toBe('Welcome!');
		}

		it('should parse heading 1 to 6', function(){
			for (var i = 1; i <= 6; i++) {
				expectValidHeading(i);
			}
		});

		it('should return false if invalid heading number', function(){
			expect(isSuccess(getHeadingResult('h7. Welcome!', {}))).toBe(false);
		});

		it('should return false if invalid heading format', function(){
			expect(isSuccess(getHeadingResult('h1 Welcome!', {}))).toBe(false);
		});

		it('should return false if no text', function(){
			expect(isSuccess(getHeadingResult('h1.', {}))).toBe(false);
		});
	});

});