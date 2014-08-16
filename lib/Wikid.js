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

	var i,
		j,
		para,
		output = '';

	for(i = 0; i < article.paragraphs.length; i++){

		para = article.paragraphs[i];

		switch(para.kind){

			case ParagraphKinds.blank:
				appendBlank();
				break;

			case ParagraphKinds.text:
				appendText(para);
				break;

			case ParagraphKinds.heading:
				appendHeading(para);
				break;

			case ParagraphKinds.list:
				appendList(para);
				break;

			case ParagraphKinds.rule:
				appendRule();
				break;
		}
	}

	return output;

	function appendBlank(){
		output += '<br>';
	}

	function appendRule(){
		output += '<hr>';
	}

	function appendText(para){

		var part;

		for(j = 0; j < para.content.parts.length; j++){

			part = para.content.parts[j];

			if (part.kind == TextKinds.unformatted){
				output += part.value;
			}

			// TODO: add support for other kinds
		}

		// append a line break, if not eof
		if (i < (article.paragraphs.length -1)){
			output += '<br>';
		}
	}

	function appendHeading(para){
		output += format('<h{0}>{1}</h{0}>', para.content.number, para.content.text);
	}

	function appendList(para){

		var isOrdered = (para.content.kind == ListKinds.ol);
		output += isOrdered ? '<ol>' : '<ul>';

		for(j = 0; j < para.content.items.length; j++){

			//TODO: add formatting inside items
			output += format('<li>{0}</li>', para.content.items[j]);
		}

		output += isOrdered ? '</ol>' : '</ul>';
	}
};

/**
 * @description
 * Formats a string by injecting parameters.
 *
 * @example
 * format('{0} is {1} years of age.', 'Sam', 30);
 *
 * @param {string} text The text for format.
 * @returns {string}
 */
function format(text){
	var args = arguments;

	return text.replace(/{(\d+)}/g, function(match, number) {

		var index = parseInt(number) + 1;
		return typeof args[index] != 'undefined'
			? args[index]
			: match;
	});
}
