'use strict';

describe('Wikid', function () {

    describe('toHtml', function () {

        it('should render heading', function(){
            expect(Wikid.toHtml('h1. test')).toBe('<h1>test</h1>');
        });

		it('should render blank', function(){
			expect(Wikid.toHtml('  \n')).toBe('<br>');
		});

		it('should render rule', function(){
			expect(Wikid.toHtml('----')).toBe('<hr>');
		});

		it('should render ordered list', function(){
			expect(Wikid.toHtml('# item one\n# item two')).toBe('<ol><li>item one</li><li>item two</li></ol>');
		});

		it('should render unordered list', function(){
			expect(Wikid.toHtml('* item one\n* item two')).toBe('<ul><li>item one</li><li>item two</li></ul>');
		});

		it('should render unformatted text', function(){
			expect(Wikid.toHtml('hello world')).toBe('hello world');
		});

		it('should render br for text, except for eof', function(){
			expect(Wikid.toHtml('hello\nworld')).toBe('hello<br>world');
		});

		it('should render heading and unformatted text', function(){
			expect(Wikid.toHtml('h1. Welcome\nHow are you?')).toBe('<h1>Welcome</h1>How are you?');
		});
    });

});
