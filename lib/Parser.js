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
 * Tries to parse a list (ordered or unordered).
 *
 * @param {TokenIterator} iterator The token iterator.
 * @returns {object}
 */
Parser.tryMakeList = function(iterator){

	// unordered (dots)
	var result = consumeIf(iterator, function(i){
        return tryConsumeList(i, /^(\-|\*)\s+(.+)$/, ListKinds.unordered);
    });

    // if found, don't try ordered
	if (isSuccess(result)){
		return result;
	}

	// ordered (numbers)
	return consumeIf(iterator, function(i){
        return tryConsumeList(i, /^(#)\s+(.+)$/, ListKinds.ordered);
    });

    function tryConsumeList(iterator, xpr, kind){

        var items = [];

        while (true){

            var result = consumeIf(iterator, function(i){ return tryConsumeListItem(i, xpr); });

            if (!isSuccess(result)){
                break;
            }

            items.push(result.item);
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

        // if not eof, consume line ending
        if (iterator.peek().kind == TokenKinds.newline){
            iterator.consume();
        }

        return {
            success: true,
            item: match[2]
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