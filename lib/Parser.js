'use strict';

/**
 * @description
 * Parses an array of tokens to create an AST.
 */
function Parser(){ }

/**
 * @description
 * Parses an array for tokens from an iterator.
 *
 * @param {TokenIterator} iterator The token iterator.
 */
Parser.parse = function(iterator){
	return makeArticle(iterator);
};

/**
 * @description
 * Tries to parse the article.
 *
 * @param {TokenIterator} iterator The token iterator.
 */
Parser.makeArticle = function(iterator){

	// remove leading whitespace
	iterator.consumeWhileWhitespace();

	var paragraphs = Parser.makeParagraphs(iterator);

	return {
		paragraphs: paragraphs
	};
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

		var paragraph = Parser.makeParagraph(iterator);

		// break if no more found
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

	return null;
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
		var result = /^(\-){4}\s*$/.test(line);

		return { success: result };
	}
};

/**
 * @description
 * Tries to parse a heading 1-6.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @param {Heading} result The parsed heading, or null.
 * @returns {object}
 */
Parser.tryMakeHeading = function(iterator){

	return consumeIf(iterator, tryGetHeading);

	function tryGetHeading(iterator){

		var line = consumeLine(iterator);

		var match = /^h([1-6]).\s+(.+)$/.exec(line);
		if (match === null || match.length !== 3){
			return { success: false };
		}

		return {
			success: true,
			heading: new Heading(parseInt(match[1]), match[2])
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

	var success = false;

	iterator.consumeWhile(function(token){

		if (token.kind == TokenKinds.newline || iterator.eof()){
			success = true;
			return false;
		}

		return (token.kind == TokenKinds.space);
	});

	return success;
};

/**
 * @description
 * Consumes all tokens till a newline is found.
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {string} The concatenated string.
 */
function consumeLine(iterator){

	return iterator.consumeConcatenatedWhile(function(token){
		return (token.kind != TokenKinds.newline && !iterator.eof());
	});
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