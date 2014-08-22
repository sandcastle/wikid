'use strict';

/**
 * @description
 * Parses an array of tokens to create an AST.
 *
 * The parser does not perform any more of sanitization to prevent against
 * script injection, this needs to be managed by the render.
 */
function Parser(){ }

/**
 * @description
 * Parses an array for tokens from an iterator.
 *
 * @param {TokenIterator} iterator The token iterator.
 */
Parser.parse = function(iterator){
	return Parser.makeArticle(iterator);
};

/**
 * @description
 * Tries to parse the article.
 *
 * @param {TokenIterator} iterator The token iterator.
 */
Parser.makeArticle = function(iterator){

	var paragraphs = Parser.makeParagraphs(iterator);

	return new Article(paragraphs);
};

/**
 * @description
 * Tries to parse all paragraphs.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {Array} The paragraphs.
 */
Parser.makeParagraphs = function(iterator){

	var paragraphs = [];

	while(true){

        // stop if we find the end of file
        if (iterator.eof()){
            break;
        }

		var paragraph = Parser.makeParagraph(iterator);
		if (!paragraph){
			break;
		}

		paragraphs.push(paragraph);
	}

	return paragraphs;
};

/**
 * @description
 * Tries to parse a paragraph.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {object} The paragraph.
 */
Parser.makeParagraph = function(iterator){

	// blank line
	if (isSuccess(Parser.tryMakeBlankLine(iterator))){
		return new Paragraph(ParagraphKinds.blank);
	}

	// horizontal rule
	if (isSuccess(Parser.tryMakeHorizontalRule(iterator))){
		return new Paragraph(ParagraphKinds.rule);
	}

	// heading
	var headingResult = Parser.tryMakeHeading(iterator);
	if (isSuccess(headingResult)){
		return new Paragraph(ParagraphKinds.heading, headingResult.heading);
	}

	// list
	var listResult = Parser.tryMakeList(iterator);
	if (isSuccess(listResult)){
		return new Paragraph(ParagraphKinds.list, listResult.list);
	}

	// image
	var imgResult = Parser.tryMakeBlockImage(iterator);
	if (isSuccess(imgResult)){
		return new Paragraph(ParagraphKinds.img, imgResult.img);
	}

	// block quote
	var quoteResult = Parser.tryMakeBlockQuote(iterator);
	if (isSuccess(quoteResult)){
		return new Paragraph(ParagraphKinds.bq, quoteResult.bq);
	}

	//table
	var tableResult = Parser.tryMakeTable(iterator);
	if (isSuccess(tableResult)){
		return new Paragraph(ParagraphKinds.tbl, tableResult.tbl);
	}

	// text
	var textResult = Parser.tryMakeTextParagraph(iterator);
	if (isSuccess(textResult)){
		return new Paragraph(ParagraphKinds.text, textResult.text);
	}

	return null;
};

/**
 * @description
 * Tries to parse a table.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {Object}
 */
Parser.tryMakeTable = function(iterator){

	// TODO: implement table support
	return { success: false };
};

/**
 * @description
 * Tries to parse a block quote.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {Object}
 */
Parser.tryMakeBlockQuote = function(iterator){

	return consumeIf(iterator, tryGetQuote);

	function tryGetQuote(iterator){

		var line = consumeLine(iterator);

		var match = /^\s*bq\.\s+(.+)\s*$/.exec(line);
		if (match === null){
			return { success: false };
		}

		return {
			success: true,
			bq: new Quote(match[1].trim())
		};
	}
};

/**
 * @description
 * Tries to parse a block image.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {Object}
 */
Parser.tryMakeBlockImage = function(iterator){

	return consumeIf(iterator, tryGetBlockImage);

	function tryGetBlockImage(iterator){

		var line = consumeLine(iterator);

		// match image
		var match = /^\s*!([^!]+)!\s*$/.exec(line);
		if (match === null){
			return { success: false };
		}

		return {
			success: true,
			img: new Image(match[1])
		};
	}
};

/**
 * @description
 * Tries to parse a paragraph of text.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {Object}
 */
Parser.tryMakeTextParagraph = function(iterator){

	var parts = Parser.tryMakeTextParts(iterator);
	if (parts.length === 0){
		return { success: false };
	}

	return {
		success: true,
		text: new TextParagraph(parts)
	};
};

/**
 * @description
 * Tries to parse one or more text parts.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {TextPart[]}
 */
Parser.tryMakeTextParts = function(iterator){

	var parts = [];

	while(true){

		var result = consumeIf(iterator, Parser.tryMakeTextPart);

		// part will be null when we hit a new line
		if (!isSuccess(result) || result.part === null){
			break;
		}
		// if the last part and current result are unformatted, just append
		if (parts.length > 0 && result.part.kind == TextKinds.none){

			var lastPart = parts[parts.length - 1];
			if (lastPart.kind == TextKinds.none){
				lastPart.value += result.part.value;
				continue;
			}
		}

		// if formatted, check for nesting
		if (result.part.kind != TextKinds.none && result.part.kind != TextKinds.a){

			// create an iterator from the tokens
			var nestedIterator = new TokenIterator(result.part.value || []);

			// overwrite the text with parts
			result.part.value = Parser.tryMakeTextParts(nestedIterator);
		}

		parts.push(result.part);
	}

	return parts;
};

/**
 * @description
 * Tries to part a text part (formatted or unformatted).
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {object}
 */
Parser.tryMakeTextPart = function(iterator){

	// abort if eof
	if (iterator.eof()){
		return { success: false };
	}

	var token = iterator.peek();

	// if we find the end of the paragraph, then stop
	if (token.kind == TokenKinds.newline){

		iterator.consume();

		return {
			success: true,
			part : null
		};
	}

	// try parse formatted part
	var result = consumeIf(iterator, Parser.tryMakeFormatPart);
	if (isSuccess(result)){
		return {
			success: true,
			part: result.part
		};
	}

	//consume the special token that did not match any format
	var unformatted = iterator.consume().text;

	// consume till the next special character
	unformatted += iterator.consumeConcatenatedWhile(function(token){
		return (token.kind != TokenKinds.special && token.kind != TokenKinds.newline);
	});

	// return unformatted if found
	var part;
	if (unformatted.length > 0){
		part = new TextPart(TextKinds.none, unformatted);
	}

	return {
		success: (part !== null),
		part: part
	};
};

/**
 * @description
 * Tries to parse a formatted text part.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {object}
 */
Parser.tryMakeFormatPart = function(iterator){

	var result;

	// bold
	result = Parser.tryMakeFormat(iterator, TextKinds.b, '*');
	if (isSuccess(result)){
		return result;
	}

	// em
	result = Parser.tryMakeFormat(iterator, TextKinds.em, '+');
	if (isSuccess(result)){
		return result;
	}

	// underline
	result = Parser.tryMakeFormat(iterator, TextKinds.ins, '_');
	if (isSuccess(result)){
		return result;
	}

	// strike through
	result = Parser.tryMakeFormat(iterator, TextKinds.del, '-');
	if (isSuccess(result)){
		return result;
	}

	// super script
	result = Parser.tryMakeFormat(iterator, TextKinds.sup, '^');
	if (isSuccess(result)){
		return result;
	}

	// sub script
	result = Parser.tryMakeFormat(iterator, TextKinds.sub, '~');
	if (isSuccess(result)){
		return result;
	}

	result = Parser.tryMakeLink(iterator);
	if (isSuccess(result)){
		return {
			success: true,
			part: new TextPart(TextKinds.a, result.link)
		};
	}

	return { success: false };
};

/**
 * @description
 * Tries to parse a link.
 *
 * @param {TokenIterator} iterator The token iterator.
 */
Parser.tryMakeLink = function(iterator){

	return consumeIf(iterator, tryGetLink);

	function tryGetLink(iterator){

		if (iterator.eof() || iterator.peek().text !== '['){
			return { success: false };
		}

		var found = false,
			text = '';

		while(true){

			// if eof or end of line reached, we didn't find the closing token
			if (iterator.eof() || iterator.peek().kind == TokenKinds.newline){
				return { success: false };
			}

			var token = iterator.consume();
			text += token.text;

			// if we find a closing token, success!
			if (token.text === ']'){
				found = true;
				break;
			}
		}

		// attachment ([attach:file.doc])
		var match = /^\[\s*attach:\s*([^\]]+?)\s*\]$/.exec(text);
		if (match){
			return {
				success: true,
				link: new Link(LinkKinds.att, match[1], match[1])
			}
		}

		// anchors ([a:name])
		match = /^\[\s*a:\s*([a-zA-Z0-9_\-]+)\s*\]$/.exec(text);
		if (match){
			return {
				success: true,
				link: new Link(LinkKinds.anc, match[1])
			}
		}

		// internal link ([goto:text|name])
		match = /^\[\s*goto:\s*([^\]]+?)\s*\|\s*([a-zA-Z0-9_\-]+)\s*\]$/.exec(text);
		if (match){
			return {
				success: true,
				link: new Link(LinkKinds.gto, match[2], match[1])
			}
		}

		// email ([mailto:test@testing.io])
		match = /^\[\s*mailto:\s*([^\]]+?)\s*\]$/.exec(text);
		if (match){
			return {
				success: true,
				link: new Link(LinkKinds.eml, match[1], match[1])
			}
		}

		// external link - advanced ([text|http://text])
		match = /^\[\s*([^\]]+?)\s*\|\s*([^\]\|]+?)\s*\]$/.exec(text);
		if (match){
			return {
				success: true,
				link: new Link(LinkKinds.ext, match[2], match[1])
			}
		}

		// external link - basic ([http://text])
		match = /^\[\s*([^\]]+?)\s*\]$/.exec(text);
		if (match){
			return {
				success: true,
				link: new Link(LinkKinds.ext, match[1], match[1])
			}
		}

		return { success: false };
	}
};

/**
 * @description
 * Tries to parse a formatted text part.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @param {number} kind The kind of text part.
 * @param {string} char The format char that wraps text.
 * @returns {object}
 */
Parser.tryMakeFormat = function(iterator, kind, char){

	// ensure the opening char is found
	if (iterator.eof() || iterator.peek().text !== char){
		return { success: false };
	}

	return consumeIf(iterator, tryConsumeFormatPart);

	function tryConsumeFormatPart(iterator){

		//consume opening token
		iterator.consume();

		var found = false,
			tokens = [];

		while(true){

			// if eof or end of line reached, we didn't find the closing token
			if (iterator.eof() || iterator.peek().kind == TokenKinds.newline){
				found = false;
				break;
			}

			var token = iterator.consume();

			// if we find a closing token, success!
			if (token.text === char){
				found = true;
				break;
			}

			tokens.push(token);
		}

		return {
			success: found,
			part: (found ? new TextPart(kind, tokens) : null)
		};
	}
};

/**
 * @description
 * Tries to parse a blank line.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {object}
 */
Parser.tryMakeBlankLine = function(iterator){
	return { success: (Parser.tryConsumeOnlyBlanksTillNewLine(iterator)) };
};

/**
 * @description
 * Tries to parse a horizontal line.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {object}
 */
Parser.tryMakeHorizontalRule = function(iterator){

	return consumeIf(iterator, tryConsumeHyphens);

	function tryConsumeHyphens(iterator){

		var line = consumeLine(iterator);
		var result = /^\s*(\-){4}\s*$/.test(line);

		return { success: result };
	}
};

/**
 * @description
 * Tries to parse a heading 1-6.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {object}
 */
Parser.tryMakeHeading = function(iterator){

	return consumeIf(iterator, tryGetHeading);

	function tryGetHeading(iterator){

		var line = consumeLine(iterator);

		var match = /^\s*h([1-6]).\s+(.+)\s*$/.exec(line);
		if (match === null || match.length !== 3){
			return { success: false };
		}

		return {
			success: true,
			heading: new Heading(parseInt(match[1]), match[2].trim())
		};
	}
};

/**
 * @description
 * Tries to parse a list (ordered or unordered).
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {object}
 */
Parser.tryMakeList = function(iterator){

	// unordered (dots)
	var result = consumeIf(iterator, function(i){
        return tryConsumeList(i, /^(\-|\*)\s+(.+)$/, ListKinds.ul);
    });

    // if found, don't try ordered
	if (isSuccess(result)){
		return result;
	}

	// ol (numbers)
	return consumeIf(iterator, function(i){
        return tryConsumeList(i, /^(#)\s+(.+)$/, ListKinds.ol);
    });

    function tryConsumeList(iterator, xpr, kind){

        var items = [];

        while (true){

            var result = consumeIf(iterator, function(i){ return tryConsumeListItem(i, xpr); });

            if (!isSuccess(result)){
                break;
            }

            items.push({ parts: result.parts });
        }

        if (items.length === 0){
            return { success: false };
        }

        return {
            success: true,
            list: new List(kind, items)
        };
    }

    function tryConsumeListItem(iterator, xpr){

        var line = consumeLine(iterator);

        var match = xpr.exec(line);
        if (match === null || match.length !== 3){
            return { success: false };
        }

		// parse the item text for nesting
		var nestedIterator = Tokenizer.createIterator((match[2] || '').trim());
		var itemParts = Parser.tryMakeTextParts(nestedIterator);

        return {
            success: true,
            parts: itemParts
        };
    }
};

/**
 * @description
 * Tries to consume only blanks till a new line is found or the end of file is reached.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {boolean} True if successful, else false.
 */
Parser.tryConsumeOnlyBlanksTillNewLine = function(iterator){

    return isSuccess(consumeIf(iterator, tryGetBlanks));

    function tryGetBlanks(iterator){

        iterator.consumeWhile(function(token){
            return (token.kind == TokenKinds.space);
        });

        // we should expect to find a newline now that blanks have stopped
        if (iterator.eof() || iterator.peek().kind == TokenKinds.newline){
            iterator.consume();
            return { success: true };
        }

        return { success: false };
    }
};

/**
 * @description
 * Consumes all tokens till a newline is found.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {string} The concatenated string.
 */
function consumeLine(iterator){

	var result = iterator.consumeConcatenatedWhile(function(token){
		return (token.kind != TokenKinds.newline && !iterator.eof());
	});

	if (iterator.peek().kind == TokenKinds.newline){
		iterator.consume();
	}

	return result;
}

/**
 * @description
 * Helper function that resets the index if the predicate is not successful.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @param {function} predicate The predicate.
 * @returns {object} The result.
 */
function consumeIf(iterator, predicate){

	var index = iterator.getIndex();

	var result = predicate(iterator);
	if (isSuccess(result)){
		return result;
	}

	iterator.setIndex(index);
	return result;
}

/**
 * @description
 * Returns if the result object was successful.
 *
 * @param {{success:boolean}} result The result to test.
 * @returns {boolean} True if successful, else false.
 */
function isSuccess(result){
	return (typeof result.success != 'undefined' && result.success === true);
}
