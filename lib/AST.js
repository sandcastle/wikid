'use strict';

/* ===================== AST ===================== */

function Article(paragraphs){
	this.paragraphs = paragraphs || [];
}

function ParagraphKinds(){ }
ParagraphKinds.blank 	= 0;	// blank line
ParagraphKinds.text 	= 1;	// text paragraph
ParagraphKinds.heading 	= 2;	// heading (1-6)
ParagraphKinds.list 	= 3;	// list (ordered or unordered)
ParagraphKinds.rule 	= 4;	// horizontal rule
ParagraphKinds.img 		= 5;	// block image
ParagraphKinds.bq 		= 6;	// block quote

/**
 * @param {number} kind
 * @param {object} [content]
 * @constructor
 */
function Paragraph(kind, content){
	this.kind = kind;
	this.content = content;
}

/**
 * @param {number} number
 * @param {string} text
 * @constructor
 */
function Heading(number, text){
	this.number = number;
	this.text = text || '';
}

/**
 * @param {string} text
 * @constructor
 */
function Quote(text){
	this.text = text;
}

/**
 * @param {number} kind
 * @param {Array} items
 * @constructor
 */
function List(kind, items){
    this.kind = kind;
    this.items = items || [];
}

function ListKinds(){ }
ListKinds.ul = 0;
ListKinds.ol = 1;

/**
 * @param {Array} parts
 * @constructor
 */
function TextParagraph(parts){
	this.parts = parts;
}

/**
 * @param {number} kind
 * @param {string|object} value
 * @constructor
 */
function TextPart(kind, value){
	this.kind = kind;
	this.value = value;
}

function TextKinds(){ }
TextKinds.none 	= 0;	// unformatted
TextKinds.b 	= 1;	// bold
TextKinds.em 	= 2;	// italic
TextKinds.ins 	= 3;	// underline
TextKinds.del 	= 4;	// strike through
TextKinds.sup 	= 5;	// super script
TextKinds.sub 	= 6;	// sub script
TextKinds.img 	= 7;	// image - not supported yet
TextKinds.a 	= 8;	// link

/**
 * @param {number} kind The image kind.
 * @param {string} path The image path (relative or absolute).
 * @param {string} [alt] The alternative text.
 * @constructor
 */
function Image(kind, path, alt){
	this.kind = kind;
	this.path = path;
	this.alt = alt || '';
}

function ImageKinds() { }
ImageKinds.rel	= 0;	// relative path
ImageKinds.ext	= 1;	// absolute (external) path

/**
 * @param {LinkKinds} kind
 * @param {object} value
 * @constructor
 */
function Link(kind, value, text){
	this.kind = kind;
	this.value = value;
	this.text = text || '';
}

function LinkKinds() { }
LinkKinds.ext	= 0;	// external
LinkKinds.att	= 1;	// attachment
LinkKinds.anc	= 2;	// internal anchor definition
LinkKinds.gto 	= 3;	// internal anchor goto
LinkKinds.eml	= 4;	// email (mailto)
