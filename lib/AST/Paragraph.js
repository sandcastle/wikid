'use strict';

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


/* =========== Paragraph Content Kinds =========== */

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
 * @param {number} type
 * @param {array} items
 * @constructor
 */
function List(kind, items){
    this.kind = kind;
    this.items = items || [];
}

function ListKinds(){ }
ListKinds.unordered = 0;
ListKinds.ordered = 1;

