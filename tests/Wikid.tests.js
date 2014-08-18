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

		it('should render heading and unformatted text', function(){
			expect(Wikid.toHtml('h1. Welcome\nHow are you?')).toBe('<h1>Welcome</h1>How are you?');
		});

		describe('text', function () {

			it('should render unformatted text', function(){
				expect(Wikid.toHtml('hello world')).toBe('hello world');
			});

			it('should render nested formatted text', function(){
				expect(Wikid.toHtml('*hello and _good_ morning*')).toBe('<b>hello and <ins>good</ins> morning</b>');
			});

			it('should render bold text', function(){
				expect(Wikid.toHtml('*hello world*')).toBe('<b>hello world</b>');
			});

			it('should render italic text', function(){
				expect(Wikid.toHtml('+hello world+')).toBe('<em>hello world</em>');
			});

			it('should render underline text', function(){
				expect(Wikid.toHtml('_hello world_')).toBe('<ins>hello world</ins>');
			});

			it('should render strike through text', function(){
				expect(Wikid.toHtml('-hello world-')).toBe('<del>hello world</del>');
			});

			it('should render super script text', function(){
				expect(Wikid.toHtml('^hello world^')).toBe('<sup>hello world</sup>');
			});

			it('should render sub script text', function(){
				expect(Wikid.toHtml('~hello world~')).toBe('<sub>hello world</sub>');
			});

			it('should render br for text, except for eof', function(){
				expect(Wikid.toHtml('hello\nworld')).toBe('hello<br>world');
			});
		});

    });

});
