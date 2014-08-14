Wikid.js
=========

> A js based wiki parser

So, why another markup language? I needed a js based wiki parser for my [claims.io](http://claims.io/) product. 

For most non-technical users [Markdown](http://daringfireball.net/projects/markdown/) can be hard to grasp (the double space line endings annoy me). I have used the wikis in both [JIRA](https://www.atlassian.com/software/jira) and [You Track](http://www.jetbrains.com/youtrack/) for many years, so decided to take the best parts of both languages and provide a javascript option.

Installation
----------
_Coming soon_

To install the Wikid.js parser execute one of the following commands.

Node.js install:

```
npm install wikid --save
```
  
Client side install:

```
bower install wikid --save
```

Usage
----------
To convert wiki text to html, you simply need to call the `Wikid.toHtml(text)` function and pass in the text you wish to convert.

```
var html = Wikid.toHtml('*hello* _world_!');
```

_If you have some free time, feel free to send a PR for `Wikid.toText(text)` (a function for stripping out the markup)._

Wiki Format
----------
_Coming soon_

* [Text](#)  
* [Headings](#)   
* [Links](#)  
* [Lists](#)  
* [Images](#)  
* [Attachments](#)  
* [Tables](#)  
* [Misc](#)


EBNF
----------
_Under Development_

The wiki format conforms to the following EBNF ([Extended Backus-Naur Form](http://en.wikipedia.org/wiki/Extended_Backus-Naur_Form)) definition.

Article:

    WikiArticle
        =   [ Whitespaces ] , Paragraphs , EOF
        ;
    Paragraphs
        =   { Paragraph }*
        ;
    Paragraph
        =   NoWikiBlock
        |   Blanks , ParagraphSeparator
        |   [ Blanks ] 
                (   Heading
                |   HorizontalRule
                |   List
                |   TextParagraph
                ) ,
            [ ParagraphSeparator ]
        ;
    ParagraphSeparator
        =   { NewLine }+
        |   EOF
        ;

Text:

    TextParagraph
        =   { TextLines }+
        ;
    TextLines
        =   { TextLine }* TextLineSeparator
        ;
    TextLine
        =   [ Blanks ] , { TextFormatted | TextUnformatted }*
        ;
    TextFormatted
        =   TextItalic
        |   TextBold
        ;
    TextUnformatted
        =   UnicodeText - 
            ( TextLineSeparator 
            | NoWiki
            | TextFormatted
            )
        ;
    TextItalic
        =   Plus , 
            (   { UnicodeText
                | TextBold
                }+
            ) - ( Plus | TextLineSeparator ) , Plus
        ;
    TextBold
        =   Star , 
            (   { UnicodeText
                | TextItalic
                }+
            ) - ( Star | TextLineSeparator ) , Star
        ;
    NoWikiBlock
        =   NoWiki , ( UnicodeText - NoWiki ) , NoWiki
        ;
    TextLineSeparator
        =   NewLine
        |   EOF
        ;

Headings:

    Heading
        =   Heading1
        |   Heading2
        |   Heading3
        |   Heading4
        |   Heading5
        |   Heading6
            { Blanks }+ , HeadingContent , [ Blanks ] , ParagraphSeparator
        ;
    Heading1
        =   "h1."
        ;
    Heading2
        =   "h2."
        ;
    Heading3
        =   "h3."
        ;
    Heading4
        =   "h4."
        ;
    Heading5
        =   "h5."
        ;
    Heading6
        =   "h6."
        ;
    HeadingContent
        =   UnicodeText - ParagraphSeparator
        ;

Rule:

    HorizontalRule
        = "----" , [ Blanks ] , ParagraphSeparator
        ;

Lists:

    List
        =   ( ListUnordered | ListOrdered ) , EndOfList
        ;
    ListUnordered
        =   { ListUnorderedItem }+
        ;
    ListUnorderedItem
        =   ( Star | Hyphen ) , ListItemContent
        ;
    ListOrdered
        =   { ListOrderedItem }+ 
        ;
    ListOrderedItem
        =   Hash , ListItemContent
        ;
    ListItemContent
        =   Blanks , TextLine , ListItemSeparator
        ;
    ListItemSeparator
        =   [ Blanks ] , NewLine
        |   EOF
        ;
    EndOfList
        =   NewLine
        |   EOF
        ;

Basics:

    NoWiki
        =   "{nowiki}"
        ;
    Whitespaces
        =   { NewLine | Blanks }*
        ;
    NewLine
        =   ?line feed?
        ;
    UnicodeText
        =   { UnicodeCharacter }*   
        ;
    UnicodeCharacter
        =   ?Unicode character?
        ;
    Blanks
        =   { ?space? | ?tab? | ?space variant? }*
        ;
    EOF
        =   ?end of file?
        ;
        
    Escaped
        =   "\" , ( Star | Hash | Hyphen | Plus )
        ;
    Star    
        =   "*" 
        ;
    Hash
        =   "#"
        ;
    Hyphen
        =   "-"
        ;
    Plus
        =   "+"
        ;
    
        

Inspiration for this definition was derived from the [Creole](http://dirkriehle.com/wp-content/uploads/2008/01/a4-junghans.pdf) Grammar.

I'm by no means a grammar expert, if you have any suggestions on how to improve it I'd be keen to hear from you.
