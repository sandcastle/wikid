'use strict';

describe('Parser', function(){

	describe('makeArticle', function(){

		function getArticleResult(text) {
            var iterator = Tokenizer.createIterator(text);
            return Parser.makeArticle(iterator);
        }

        it('should return paragraph', function(){
           var article = getArticleResult('h1. test');

            expect(article).toBeDefined();
            expect(article.paragraphs).toBeDefined();
            expect(article.paragraphs.length).toBe(1);
        });

		it('should return multiple paragraphs', function(){

			var article = getArticleResult('h1. Welcome!\nh2. All about wiki\'s');
			expect(article).toBeDefined();
			expect(article.paragraphs).toBeDefined();
			expect(article.paragraphs.length).toBe(2);
		});
	});

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

		it('should return true for valid rule and forgive blanks', function(){
			expect(getRuleResult('  ----  ')).toBe(true);
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

		it('should parse heading and forgive blanks', function(){

			var result = getHeadingResult('  h2. Welcome!  ');
			expect(isSuccess(result)).toBe(true);
			expect(result.heading.number).toBe(2);
			expect(result.heading.text).toBe('Welcome!');
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

    describe('tryMakeList',function(){

        function getListResult(text){
            var iterator = Tokenizer.createIterator(text);
            return Parser.tryMakeList(iterator);
        }

        it('should parse single line unordered (hyphen) list', function(){

            var result = getListResult('- an item');

            expect(isSuccess(result)).toBe(true);
            expect(result.list.kind).toBe(ListKinds.ul);
            expect(result.list.items).toBeDefined();
            expect(result.list.items.length).toBe(1);
            expect(result.list.items[0]).toBe('an item');
        });

        it('should parse single line unordered (star) list', function(){

            var result = getListResult('* an item');

            expect(isSuccess(result)).toBe(true);
            expect(result.list.kind).toBe(ListKinds.ul);
            expect(result.list.items).toBeDefined();
            expect(result.list.items.length).toBe(1);
            expect(result.list.items[0]).toBe('an item');
        });

        it('should parse multi line unordered list', function(){

            var result = getListResult('- item one\n-  item two\n- item three');

            expect(isSuccess(result)).toBe(true);
            expect(result.list.kind).toBe(ListKinds.ul);
            expect(result.list.items.length).toBe(3);
            expect(result.list.items[0]).toBe('item one');
            expect(result.list.items[1]).toBe('item two');
            expect(result.list.items[2]).toBe('item three');
        });

        it('should parse single line ordered list', function(){

            var result = getListResult('# an item');

            expect(isSuccess(result)).toBe(true);
            expect(result.list.kind).toBe(ListKinds.ol);
            expect(result.list.items).toBeDefined();
            expect(result.list.items.length).toBe(1);
            expect(result.list.items[0]).toBe('an item');
        });

        it('should parse multi line ordered list', function(){

            var result = getListResult('# item one\n#  item two\n# item three');

            expect(isSuccess(result)).toBe(true);
            expect(result.list.kind).toBe(ListKinds.ol);
            expect(result.list.items.length).toBe(3);
            expect(result.list.items[0]).toBe('item one');
            expect(result.list.items[1]).toBe('item two');
            expect(result.list.items[2]).toBe('item three');
        });

		it('should parse multi line unordered list and trim items', function(){

			var result = getListResult('# item one  \n#  item two\t\n# item three ');

			expect(isSuccess(result)).toBe(true);
			expect(result.list.kind).toBe(ListKinds.ol);
			expect(result.list.items.length).toBe(3);
			expect(result.list.items[0]).toBe('item one');
			expect(result.list.items[1]).toBe('item two');
			expect(result.list.items[2]).toBe('item three');
		});
    });

	describe('tryMakeBlockImage', function () {

		function getImageResult(text){
			var iterator = Tokenizer.createIterator(text);
			return Parser.tryMakeBlockImage(iterator);
		}

		function expectValidImage(text, kind, path, alt){

			var result = getImageResult(text);

			expect(isSuccess(result)).toBe(true);
			expect(result.img).toBeDefined();
			expect(result.img.kind).toBe(kind);
			expect(result.img.path).toBe(path);
			expect(result.img.alt).toBe(alt || '');
		}

		it('should parse valid relative image', function(){
			expectValidImage('!image.jpg!', ImageKinds.rel, 'image.jpg');
		});

		it('should parse valid relative image and forgive blanks', function(){
			expectValidImage('  !image.jpg!  ', ImageKinds.rel, 'image.jpg');
		});

		it('should parse valid relative image with alt', function(){
			expectValidImage('!image.jpg|hello!', ImageKinds.rel, 'image.jpg', 'hello');
		});

		it('should parse valid absolute http image', function(){
			expectValidImage('!http://test.com/image.png!', ImageKinds.ext, 'http://test.com/image.png');
		});

		it('should parse valid absolute http image with alt', function(){
			expectValidImage('!http://test.com/image.png|nice image!', ImageKinds.ext, 'http://test.com/image.png', 'nice image');
		});

		it('should parse valid absolute https image', function(){
			expectValidImage('!https://test.com/image.png!', ImageKinds.ext, 'https://test.com/image.png');
		});

		it('should parse valid absolute current protocol image', function(){
			expectValidImage('!//test.com/image.png!', ImageKinds.ext, '//test.com/image.png');
		});

		it('should return false if no image', function(){
			expect(isSuccess(getImageResult('blah'))).toBe(false);
		});
	});

	describe('tryMakeTextParagraph', function () {

		function getTextResult(text){
			var iterator = Tokenizer.createIterator(text);
			return Parser.tryMakeTextParagraph(iterator);
		}

		function expectTextFormatPart(text, kind, value){

			var result = getTextResult(text);

			expect(isSuccess(result)).toBe(true);
			expect(result.text.parts.length).toBe(1);
			expect(result.text.parts[0].kind).toBe(kind);
			expect(result.text.parts[0].value.length).toBe(1);
			expect(result.text.parts[0].value[0].kind).toBe(TextKinds.none);
			expect(result.text.parts[0].value[0].value).toBe(value);
		}

		it('should parse unformatted single world line', function () {

			var result = getTextResult('hello');

			expect(isSuccess(result)).toBe(true);
			expect(result.text.parts.length).toBe(1);
			expect(result.text.parts[0].value).toBe('hello');
		});

		it('should parse unformatted multi word line', function () {

			var result = getTextResult('hello world today');

			expect(isSuccess(result)).toBe(true);
			expect(result.text.parts.length).toBe(1);
			expect(result.text.parts[0].value).toBe('hello world today');
		});

		it('should parse special character with no closing', function () {

			var result = getTextResult('hello *world today');

			expect(isSuccess(result)).toBe(true);
			expect(result.text.parts.length).toBe(1);
			expect(result.text.parts[0].value).toBe('hello *world today');
		});

		it('should parse bold text', function () {
			expectTextFormatPart('*hello*', TextKinds.b, 'hello');
		});

		it('should parse italic text', function () {
			expectTextFormatPart('+hello+', TextKinds.em, 'hello');
		});

		it('should parse nested format text', function () {

			var result = getTextResult('*hello +world+ today*');

			expect(isSuccess(result)).toBe(true);
			expect(result.text.parts.length).toBe(1);

			// outer bold
			var bold = result.text.parts[0];
			expect(bold.kind).toBe(TextKinds.b);
			expect(bold.value.length).toBe(3);

			// nested unformatted
			expect(bold.value[0].kind).toBe(TextKinds.none);
			expect(bold.value[0].value).toBe('hello ');

			// nested em
			expect(bold.value[1].kind).toBe(TextKinds.em);
			expect(bold.value[1].value.length).toBe(1);
			expect(bold.value[1].value[0].kind).toBe(TextKinds.none);
			expect(bold.value[1].value[0].value).toBe('world');

			// nested unformatted
			expect(bold.value[2].kind).toBe(TextKinds.none);
			expect(bold.value[2].value).toBe(' today');
		});
	});

	describe('tryMakeBlockQuote', function () {

		function getQuoteResult(text){
			var iterator = Tokenizer.createIterator(text);
			return Parser.tryMakeBlockQuote(iterator);
		}

		function expectValidQuote(text, quote){
			var result = getQuoteResult(text);
			expect(isSuccess(result)).toBe(true);
			expect(result.bq.text).toBe(quote);
		}

		it('should parse valid block quote', function(){
			expectValidQuote('bq. a wise man once said...', 'a wise man once said...');
		});

		it('should parse valid block quote and forgive blanks', function(){
			expectValidQuote('  bq. a wise man once said...  ', 'a wise man once said...');
		});

		it('should return false fo invalid block quote', function(){
			expect(isSuccess(getQuoteResult('bq testing'))).toBe(false);
		});
	});

});
