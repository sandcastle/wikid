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
 * @param {object} [settings] The format settings.
 * @returns {string} The html representation of the wiki mark-up.
 */
Wikid.toHtml = function(text, settings){

	text = text || '';
	settings = settings || {};

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

			case ParagraphKinds.img:
				appendBlockImage(para);
				break;

			case ParagraphKinds.rule:
				appendRule();
				break;

			case ParagraphKinds.bq:
				appendBlockQuote(para);
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

	function appendBlockQuote(para){
		output += format('<blockquote>{0}</blockquote>', para.content.text);
	}

	function appendBlockImage(para){

		appendImage(para);

		// add line break for block images
		output += '<br>';
	}

	function appendImage(para){

		var path = para.content.path;

		// if we specify an
		if (para.content.kind == ImageKinds.rel && settings.imagePath){
			path = getPathWithSlash(settings.imagePath) + path;
		}

		output += format('<img src="{0}" alt="{1}">',path, para.content.alt);
	}

	function getTextFromParts(parts){

		var part,
			text = '';

		for(j = 0; j < parts.length; j++){

			part = parts[j];

			// skip nesting if not formatted
			if (part.kind === TextKinds.none){
				text += part.value;
				continue;
			}

			if (part.kind === TextKinds.a){
				text += getLinkText(part);
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

	function getLinkText(part){

		var link = part.value;

		switch(link.kind){

			case LinkKinds.anc:
				return format('<a name="{0}"></a>', link.value);

			case LinkKinds.ext:
				return format('<a href="{0}" target="_blank">{1}</a>', link.value, link.text);

			case LinkKinds.att:
				return format('<a href="{0}">{1}</a>', (getPathWithSlash(settings.attachPath) + link.value), link.text);

			case LinkKinds.gto:
				return format('<a href="#{0}">{1}</a>', link.value, link.text);

			case LinkKinds.eml:
				return format('<a href="mailto:{0}">{1}</a>', link.value, link.text);
		}

		return '';
	}

	function appendHeading(para){
		output += format('<h{0}>{1}</h{0}>', para.content.number, para.content.text);
	}

	function appendList(para){

		var isOrdered = (para.content.kind == ListKinds.ol);
		output += isOrdered ? '<ol>' : '<ul>';

		for(var x = 0; x < para.content.items.length; x++){
			output += format('<li>{0}</li>', getTextFromParts(para.content.items[x].parts));
		}

		output += isOrdered ? '</ol>' : '</ul>';
	}
};

/**
 * @description
 * Returns the path with a tailing slash if specified, otherwise an empty string.
 *
 * @param {string} path The path.
 * @returns {string}
 */
function getPathWithSlash(path){

	if (!path || path.length === 0){
		return '';
	}

	return (path.substr(path.length - 1) === '/') ? path : path + '/';
}

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
