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

		// append nested text parts
		output += getTextFromParts(para.content.parts);

		// append a line break, if not eof
		if (i < (article.paragraphs.length -1)){
			output += '<br>';
		}
	}

	function getTextFromParts(parts){

		var part,
			text = '';

		for(j = 0; j < parts.length; j++){

			part = parts[j];

			// skip nesting if not formatted
			if (part.kind == TextKinds.none){
				text += part.value;
				continue;
			}

			var tag = '';

			switch(part.kind){

				case TextKinds.b:
					tag = 'b';
					break;
				case TextKinds.em:
					tag = 'em';
					break;
				case TextKinds.ins:
					tag = 'ins';
					break;
				case TextKinds.del:
					tag = 'del';
					break;
				case TextKinds.sup:
					tag = 'sup';
					break;
				case TextKinds.sub:
					tag = 'sub';
					break;
			}

			// create with nest values if required
			text += format('<{0}>{1}</{0}>', tag, getTextFromParts(part.value));
		}

		return text;
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
