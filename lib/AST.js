'use strict';

/* ===================== AST ===================== */

function Article(paragraphs){
	this.paragraphs = paragraphs || [];
}

function ParagraphKinds(){ }
ParagraphKinds.blank = 0;
ParagraphKinds.text = 1;
ParagraphKinds.heading = 2;
ParagraphKinds.list = 3;
ParagraphKinds.rule = 4;

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
TextKinds.none = 0;
TextKinds.b = 1;
TextKinds.em = 2;
TextKinds.ins = 3;
TextKinds.del = 4;
TextKinds.sup = 5;
TextKinds.sub = 6;
