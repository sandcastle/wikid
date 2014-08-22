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

	var EMAIL_REGEX 			= /^([A-Za-z0-9._%+-]+@\S*[^\s.;,(){}<>"])$/,
		URI_REGEX 				= /^((ftp|https?):\/\/\S*[^\s.;,()\{\}<>"])$/,
		ANCHOR_REGEX 			= /^[a-zA-Z0-9_\-]+$/,
		SURROGATE_PAIR_REGEX 	= /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
		NON_ALPHANUMERIC_REGEX 	= /([^\#-~| |!])/g;

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
		output += format('<blockquote>{0}</blockquote>', sanitizeText(para.content.text));
	}

	function appendBlockImage(para){

		appendImage(para);

		// add line break for block images
		output += '<br>';
	}

	function appendImage(para){

		var path = para.content.path;

		//if not an absolute uri and we have a path, then append
		if (!/^(ftp|https?):\/\/.*/.test(path) && settings.imagePath){
			path = getPathWithSlash(settings.imagePath) + path;
		}

		output += format('<img src="{0}" alt="">', sanitizeUri(path));
	}

	function getTextFromParts(parts){

		var part,
			text = '';

		for(j = 0; j < parts.length; j++){

			part = parts[j];

			// skip nesting if not formatted
			if (part.kind === TextKinds.none){
				text += sanitizeText(part.value);
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
				return renderAnchorOnlyIfValid(link.value);

			case LinkKinds.gto:
				return renderGotoOnlyIfValid(link.value, link.text);

			case LinkKinds.eml:
				return renderMailtoOnlyIfValid(link.value);

			case LinkKinds.ext:
				return renderLinkOnlyIfValid(link.value, link.text);

			case LinkKinds.att:
				return renderLinkOnlyIfValid((getPathWithSlash(settings.attachPath) + link.value), link.text);
		}

		return '';

		function renderAnchorOnlyIfValid(name){

			var clean = sanitizeAnchor(name);
			if (clean === ''){
				return sanitizeText(text);
			}

			return format('<a name="{0}"></a>', name);
		}

		function renderGotoOnlyIfValid(name, text){

			var clean = sanitizeAnchor(name);
			if (clean === ''){
				return sanitizeText(text);
			}

			return format('<a href="#{0}">{1}</a>', clean, sanitizeText(text));
		}

		function renderMailtoOnlyIfValid(email){

			// if the email is unsafe then render text only
			var clean = sanitizeEmail(email);
			if (clean === ''){
				return '';
			}

			return format('<a href="mailto:{0}">{1}</a>', clean, sanitizeText(email));
		}

		function renderLinkOnlyIfValid(uri, text){

			// if the link is unsafe then render text only
			var clean = sanitizeUri(uri);
			if (clean === ''){
				return sanitizeText(text);
			}

			return format('<a href="{0}" target="_blank">{1}</a>', clean, sanitizeText(text));
		}
	}

	function appendHeading(para){
		output += format('<h{0}>{1}</h{0}>', para.content.number, sanitizeText(para.content.text));
	}

	function appendList(para){

		var isOrdered = (para.content.kind == ListKinds.ol);
		output += isOrdered ? '<ol>' : '<ul>';

		for(var x = 0; x < para.content.items.length; x++){
			output += format('<li>{0}</li>', getTextFromParts(para.content.items[x].parts));
		}

		output += isOrdered ? '</ol>' : '</ul>';
	}

	function sanitizeAnchor(name){

		if (ANCHOR_REGEX.test(name)) {
			return name;
		}

		return '';
	}

	function sanitizeEmail(uri){

		if (EMAIL_REGEX.test(uri)){
			return uri;
		}

		return '';
	}

	function sanitizeUri(uri){

		uri = encodeURI(uri);

		if (URI_REGEX.test(uri)){
			return uri;
		}

		return '';
	}

	/**
	 * @description
	 * Encodes all all entities to protect against script injection.
	 *
	 * Adapted from angular.js - Misko Hevery (misko@hevery.com)
	 * https://github.com/angular/angular.js/blob/master/src/ngSanitize/sanitize.js
	 *
	 * @param value
	 * @returns {*}
	 */
	function sanitizeText(value) {

		return value.
			replace(/&/g, '&amp;').
			replace(SURROGATE_PAIR_REGEX, function (value) {
				var hi = value.charCodeAt(0);
				var low = value.charCodeAt(1);
				return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
			}).
			replace(NON_ALPHANUMERIC_REGEX, function(value){
				return '&#' + value.charCodeAt(0) + ';';
			}).
			replace(/</g, '&lt;').
			replace(/>/g, '&gt;');
	}

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
