'use strict';

/**
 * @description
 * The wikid parser.
 */
function Wikid(){ }

/**
 * @description
 * Parses the specified wiki markup and converts to html.
 *
 * @param {string} text The wiki markup.
 * @returns {string} The html representation of the wiki mark-up.
 */
Wikid.toHtml = function(text){

    var iterator = Tokenizer.createIterator(text);
	var article = Parser.parse(iterator);

	// TODO: convert the AST to an article

	return '';
};
