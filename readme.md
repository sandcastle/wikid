So, why another wiki language? I needed a wiki format for my [claims.io](http://claims.io/) product. I find that [Markdown](http://daringfireball.net/projects/markdown/) is too hard for most non-technical users and after using the wiki in both [JIRA](https://www.atlassian.com/software/jira) and [You Track](http://www.jetbrains.com/youtrack/) on a daily basis for many years I decided to take the best parts of both languages.

Installation
----------
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
To convert wiki text to html, you simply need to call the `Wikid.toHtml` function and pass in the text you wish to convert.

```
var html = Wikid.toHtml('*hello* _world_!');
```

Wiki Format
----------
The Wikid wiki format is based off the You Track and JIRA wiki formats.

_Pages coming soon..._

EBNF
----------

The wiki format conforms to the following EBNF ([Extended Backus-Naur Form](http://en.wikipedia.org/wiki/Extended_Backus-Naur_Form)) definition.

    testing :=  testing | test
    
    test := 'test'
