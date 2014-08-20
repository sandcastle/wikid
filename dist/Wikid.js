(function(root) {
  'use strict';
  /**
   * @description
   * The wikid parser.
   */
  function Wikid() {
  }

  /**
   * @description
   * Parses the specified wiki markup and converts to html.
   *
   * @param {string} text The wiki markup.
   * @param {object} [settings] The format settings.
   * @returns {string} The html representation of the wiki mark-up.
   */
  Wikid.toHtml = function(text, settings) {

    text = text || '';
    settings = settings || {};

    var iterator = Tokenizer.createIterator(text);
    var article = Parser.parse(iterator);

    var i,
      j,
      para,
      output = '';

    for (i = 0; i < article.paragraphs.length; i++) {

      para = article.paragraphs[i];

      switch (para.kind) {

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

    function appendBlank() {
      output += '<br>';
    }

    function appendRule() {
      output += '<hr>';
    }

    function appendText(para) {

      // append nested text parts
      output += getTextFromParts(para.content.parts);

      // append a line break, if not eof
      if (i < (article.paragraphs.length - 1)) {
        output += '<br>';
      }
    }

    function appendBlockQuote(para) {
      output += format('<blockquote>{0}</blockquote>', para.content.text);
    }

    function appendBlockImage(para) {

      appendImage(para);

      // add line break for block images
      output += '<br>';
    }

    function appendImage(para) {

      var path = para.content.path;

      // if we specify an
      if (para.content.kind == ImageKinds.rel && settings.imagePath) {
        path = getPathWithSlash(settings.imagePath) + path;
      }

      output += format('<img src="{0}" alt="{1}">', path, para.content.alt);
    }

    function getTextFromParts(parts) {

      var part,
        text = '';

      for (j = 0; j < parts.length; j++) {

        part = parts[j];

        // skip nesting if not formatted
        if (part.kind === TextKinds.none) {
          text += part.value;
          continue;
        }

        if (part.kind === TextKinds.a) {
          text += getLinkText(part);
          continue;
        }

        var tag = '';

        switch (part.kind) {

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

    function getLinkText(part) {

      var link = part.value;

      switch (link.kind) {

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

    function appendHeading(para) {
      output += format('<h{0}>{1}</h{0}>', para.content.number, para.content.text);
    }

    function appendList(para) {

      var isOrdered = (para.content.kind == ListKinds.ol);
      output += isOrdered ? '<ol>' : '<ul>';

      for (var x = 0; x < para.content.items.length; x++) {
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
  function getPathWithSlash(path) {

    if (!path || path.length === 0) {
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
  function format(text) {
    var args = arguments;

    return text.replace(/{(\d+)}/g, function(match, number) {

      var index = parseInt(number) + 1;
      return typeof args[index] != 'undefined'
        ? args[index]
        : match;
    });
  }

  /**
   * @description
   * All token kinds.
   */
  function TokenKinds() {
  }

  /**
   * @description
   * Not a token.
   *
   * @type {number}
   */
  TokenKinds.none = 0;

  /**
   * @description
   * A text token.
   *
   * @type {number}
   */
  TokenKinds.text = 1;

  /**
   * @description
   * A number token.
   *
   * @type {number}
   */
  TokenKinds.number = 2;

  /**
   * @description
   * A symbol token.
   *
   * @type {number}
   */
  TokenKinds.symbol = 3;

  /**
   * @description
   * A punctuation token.
   *
   * @type {number}
   */
  TokenKinds.punctuation = 4;

  /**
   * @description
   * A white space token.
   *
   * @type {number}
   */
  TokenKinds.space = 5;

  /**
   * @description
   * A new line token.
   *
   * @type {number}
   */
  TokenKinds.newline = 6;

  /**
   * @description
   * A special token.
   *
   * @type {number}
   */
  TokenKinds.special = 7;

  /**
   * @description
   * An unknown token.
   *
   * @type {number}
   */
  TokenKinds.unknown = 8;

  /**
   * @description
   * A single token.
   *
   * @constructor
   * @param {number} kind The kind of token.
   * @param {string} [text] The token text.
   */
  function Token(kind, text) {

    var that = this;

    that.kind = kind;
    that.text = text || '';
  }

  /**
   * @description
   * Determines if the specified token is equals to the current instance.
   *
   * @param {Token} token
   * @returns {boolean}
   */
  Token.prototype.equals = function(token) {

    if (!token) {
      return false;
    }

    return this.kind === token.kind && this.text === token.text;
  };

  /**
   * @description
   * A token iterator.
   *
   * @param {Token[]} tokens The tokens to iterate over.
   */
  function TokenIterator(tokens) {

    var that = this;
    that._tokens = tokens || [];
    that._index = 0;
  }

  /**
   * @description
   * Returns the current index of the iterator.
   *
   * @returns {number} The current iterator index.
   */
  TokenIterator.prototype.getIndex = function() {
    return this._index;
  };

  /**
   * @description
   * Sets the index of the iterator.
   *
   * @param {number} index The new index of the iterator.
   */
  TokenIterator.prototype.setIndex = function(index) {

    if (index < this._tokens.length) {
      this._index = index;
    }
  };

  /**
   * @description
   * Consumes the specified number of tokens specified, one if count not specified.
   *
   * @param {number} [count] The number of tokens to consume, if not specified - 1 will be consumed.
   * @returns {Token} The last token that was consumed.
   */
  TokenIterator.prototype.consume = function(count) {

    if (typeof count == 'undefined' || count === null) {
      count = 1;
    }

    this._index += count;

    return this.peek(-1);
  };

  /**
   * @description
   * Consumes tokens while the predicate is true.
   *
   * @param {function} predicate The predicate to determine when to stop consuming.
   */
  TokenIterator.prototype.consumeWhile = function(predicate) {

    var that = this;

    while (predicate(that.peek()) && !that.eof()) {
      that.consume();
    }
  };

  /**
   * @description
   * Consumes tokens while the predicate is true, then returns the concatenated string.
   *
   * @param {function} predicate The predicate to determine when to stop consuming.
   * @returns {string}
   */
  TokenIterator.prototype.consumeConcatenatedWhile = function(predicate) {

    var that = this,
      s = '';

    while (predicate(that.peek()) && !that.eof()) {
      s += (that.consume()).text;
    }

    return s;
  };

  /**
   * @description
   * Consumes while they continue to be whitespaces.
   */
  TokenIterator.prototype.consumeWhileWhitespace = function() {

    this.consumeWhile(function(token) {
      return token.kind == TokenKinds.space;
    });
  };

  /**
   * @description
   * Peek at the token stream.
   *
   * @param {number} [count] The number of tokens ahead to skip.
   * @returns {Token} The token.
   */
  TokenIterator.prototype.peek = function(count) {

    if (typeof count == 'undefined' || count === null) {
      count = 0;
    }

    if (this._index + count < this._tokens.length) {
      return this._tokens[this._index + count];
    }

    return new Token(TokenKinds.none);
  };

  /**
   * @description
   * Returns the total number of tokens.
   *
   * @returns {number} The total token count.
   */
  TokenIterator.prototype.count = function() {
    return this._tokens.length;
  };

  /**
   * @description
   * Returns the number of remaining tokens based on the current position.
   *
   * @returns {number} The remaining token count.
   */
  TokenIterator.prototype.remainingCount = function() {
    return Math.max(0, this._tokens.length - this._index);
  };

  /**
   * @description
   * Returns if there are any more tokens after the current index.
   *
   * @returns {boolean} True if the end of the file (no more tokens remaining).
   */
  TokenIterator.prototype.eof = function() {
    return this.remainingCount() === 0;
  };

  /**
   * @description
   * String tokenizer that is used by the wiki parser.
   */
  function Tokenizer() {
  }

  /**
   * @description
   * Creates a token iterator for the specified text.
   *
   * @param {string} text The string to tokenize and iterate over.
   * @returns {TokenIterator} The token iterator.
   */
  Tokenizer.createIterator = function(text) {
    return new TokenIterator(Tokenizer.tokenize(text));
  };

  /**
   * @description
   * Tokenize the text.
   *
   * @param {string} text The text to tokenize.
   * @returns {Token[]} The tokens from the text.
   */
  Tokenizer.tokenize = function(text) {

    text = text || '';

    // unicode categories adapted from http://xregexp.com/plugins/#unicode
    // char analysis adapted from https://github.com/mishoo/uglifyjs2

    var UNICODE_CATEGORIES = {

      // letter
      L: "0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05270531-055605590561-058705D0-05EA05F0-05F20620-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280840-085808A008A2-08AC0904-0939093D09500958-09610971-09770979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10CF10CF20D05-0D0C0D0E-0D100D12-0D3A0D3D0D4E0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC-0EDF0F000F40-0F470F49-0F6C0F88-0F8C1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510C710CD10D0-10FA10FC-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1BBA-1BE51C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11CF51CF61D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209C21022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2CF22CF32D00-2D252D272D2D2D30-2D672D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31BA31F0-31FF3400-4DB54E00-9FCCA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78B-A78EA790-A793A7A0-A7AAA7F8-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDAAE0-AAEAAAF2-AAF4AB01-AB06AB09-AB0EAB11-AB16AB20-AB26AB28-AB2EABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",

      // mark
      M: "0300-036F0483-04890591-05BD05BF05C105C205C405C505C70610-061A064B-065F067006D6-06DC06DF-06E406E706E806EA-06ED07110730-074A07A6-07B007EB-07F30816-0819081B-08230825-08270829-082D0859-085B08E4-08FE0900-0903093A-093C093E-094F0951-0957096209630981-098309BC09BE-09C409C709C809CB-09CD09D709E209E30A01-0A030A3C0A3E-0A420A470A480A4B-0A4D0A510A700A710A750A81-0A830ABC0ABE-0AC50AC7-0AC90ACB-0ACD0AE20AE30B01-0B030B3C0B3E-0B440B470B480B4B-0B4D0B560B570B620B630B820BBE-0BC20BC6-0BC80BCA-0BCD0BD70C01-0C030C3E-0C440C46-0C480C4A-0C4D0C550C560C620C630C820C830CBC0CBE-0CC40CC6-0CC80CCA-0CCD0CD50CD60CE20CE30D020D030D3E-0D440D46-0D480D4A-0D4D0D570D620D630D820D830DCA0DCF-0DD40DD60DD8-0DDF0DF20DF30E310E34-0E3A0E47-0E4E0EB10EB4-0EB90EBB0EBC0EC8-0ECD0F180F190F350F370F390F3E0F3F0F71-0F840F860F870F8D-0F970F99-0FBC0FC6102B-103E1056-1059105E-10601062-10641067-106D1071-10741082-108D108F109A-109D135D-135F1712-17141732-1734175217531772177317B4-17D317DD180B-180D18A91920-192B1930-193B19B0-19C019C819C91A17-1A1B1A55-1A5E1A60-1A7C1A7F1B00-1B041B34-1B441B6B-1B731B80-1B821BA1-1BAD1BE6-1BF31C24-1C371CD0-1CD21CD4-1CE81CED1CF2-1CF41DC0-1DE61DFC-1DFF20D0-20F02CEF-2CF12D7F2DE0-2DFF302A-302F3099309AA66F-A672A674-A67DA69FA6F0A6F1A802A806A80BA823-A827A880A881A8B4-A8C4A8E0-A8F1A926-A92DA947-A953A980-A983A9B3-A9C0AA29-AA36AA43AA4CAA4DAA7BAAB0AAB2-AAB4AAB7AAB8AABEAABFAAC1AAEB-AAEFAAF5AAF6ABE3-ABEAABECABEDFB1EFE00-FE0FFE20-FE26",

      // number
      N: "0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0B72-0B770BE6-0BF20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F331040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-18191946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C491C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293248-324F3251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19",

      // punctuation
      P: "0021-00230025-002A002C-002F003A003B003F0040005B-005D005F007B007D00A100A700AB00B600B700BB00BF037E0387055A-055F0589058A05BE05C005C305C605F305F40609060A060C060D061B061E061F066A-066D06D40700-070D07F7-07F90830-083E085E0964096509700AF00DF40E4F0E5A0E5B0F04-0F120F140F3A-0F3D0F850FD0-0FD40FD90FDA104A-104F10FB1360-13681400166D166E169B169C16EB-16ED1735173617D4-17D617D8-17DA1800-180A194419451A1E1A1F1AA0-1AA61AA8-1AAD1B5A-1B601BFC-1BFF1C3B-1C3F1C7E1C7F1CC0-1CC71CD32010-20272030-20432045-20512053-205E207D207E208D208E2329232A2768-277527C527C627E6-27EF2983-299829D8-29DB29FC29FD2CF9-2CFC2CFE2CFF2D702E00-2E2E2E30-2E3B3001-30033008-30113014-301F3030303D30A030FBA4FEA4FFA60D-A60FA673A67EA6F2-A6F7A874-A877A8CEA8CFA8F8-A8FAA92EA92FA95FA9C1-A9CDA9DEA9DFAA5C-AA5FAADEAADFAAF0AAF1ABEBFD3EFD3FFE10-FE19FE30-FE52FE54-FE61FE63FE68FE6AFE6BFF01-FF03FF05-FF0AFF0C-FF0FFF1AFF1BFF1FFF20FF3B-FF3DFF3FFF5BFF5DFF5F-FF65",

      // symbols
      S: "0024002B003C-003E005E0060007C007E00A2-00A600A800A900AC00AE-00B100B400B800D700F702C2-02C502D2-02DF02E5-02EB02ED02EF-02FF03750384038503F60482058F0606-0608060B060E060F06DE06E906FD06FE07F609F209F309FA09FB0AF10B700BF3-0BFA0C7F0D790E3F0F01-0F030F130F15-0F170F1A-0F1F0F340F360F380FBE-0FC50FC7-0FCC0FCE0FCF0FD5-0FD8109E109F1390-139917DB194019DE-19FF1B61-1B6A1B74-1B7C1FBD1FBF-1FC11FCD-1FCF1FDD-1FDF1FED-1FEF1FFD1FFE20442052207A-207C208A-208C20A0-20B9210021012103-21062108210921142116-2118211E-2123212521272129212E213A213B2140-2144214A-214D214F2190-2328232B-23F32400-24262440-244A249C-24E92500-26FF2701-27672794-27C427C7-27E527F0-29822999-29D729DC-29FB29FE-2B4C2B50-2B592CE5-2CEA2E80-2E992E9B-2EF32F00-2FD52FF0-2FFB300430123013302030363037303E303F309B309C319031913196-319F31C0-31E33200-321E322A-324732503260-327F328A-32B032C0-32FE3300-33FF4DC0-4DFFA490-A4C6A700-A716A720A721A789A78AA828-A82BA836-A839AA77-AA79FB29FBB2-FBC1FDFCFDFDFE62FE64-FE66FE69FF04FF0BFF1C-FF1EFF3EFF40FF5CFF5EFFE0-FFE6FFE8-FFEEFFFCFFFD"
    };

    var UNICODE = { };

    var SPECIAL_CHARS = toPredicate('*[]#+_^-~.<>!:');

    var WHITESPACE_CHARS = toPredicate(' \t\u00a0\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000');

    var NEW_LINE_CHARS = toPredicate('\n');

    // expand the unicode categories into valid regex
    var cat;
    for (cat in UNICODE_CATEGORIES) {
      UNICODE[cat] = new RegExp('[' + UNICODE_CATEGORIES[cat].replace(/\w{4}/g, "\\u$&") + ']');
    }

    // return token array from text
    return tokenizeText(text);

    /**
     * @description
     * Tokenize the text.
     *
     * @param {string} text The text to tokenize.
     * @returns {Token[]} The tokens from the text.
     */
    function tokenizeText(text) {

      var txt = normalize(text);
      var tokens = [],
        start = 0;

      // text
      for (var index = 0; index < txt.length; index++) {

        // letter
        if (isLetter(txt[index])) {

          start = index;

          while (index + 1 < txt.length && isLetterOrDigit(txt[index + 1])) {
            index++;
          }

          tokens.push(new Token(TokenKinds.text, txt.substr(start, (index - start) + 1)));
          continue;
        }

        // number
        if (isDigit(txt[index])) {
          start = index;
          var tokenKind = TokenKinds.number;

          while (index + 1 < txt.length && isLetterOrDigit(txt[index + 1])) {
            // promote to a word if an alpha character is detected
            if (isLetter(txt[index + 1])) {
              tokenKind = TokenKinds.text;
            }

            index++;
          }

          tokens.push(new Token(tokenKind, txt.substr(start, (index - start) + 1)));
          continue;
        }

        // special characters
        if (isSpecialCharacter(txt[index])) {
          tokens.push(new Token(TokenKinds.special, txt[index]));
          continue;
        }

        // white space
        if (isWhitespace(txt[index])) {
          tokens.push(new Token(TokenKinds.space, ' '));
          continue;
        }

        // new line
        if (isNewLine(txt[index])) {
          tokens.push(new Token(TokenKinds.newline, '\n'));
          continue;
        }

        // symbol
        if (isSymbol(txt[index])) {
          tokens.push(new Token(TokenKinds.symbol, txt[index]));
          continue;
        }

        // punctuation
        if (isPunctuation(txt[index])) {
          tokens.push(new Token(TokenKinds.punctuation, txt[index]));
          continue;
        }

        //TODO: recognise unicode mark tokens (isMark)

        tokens.push(new Token(TokenKinds.unknown, ''));
      }

      return tokens;
    }

    /**
     * @description
     * Normalises the specified input string by removing invalid characters
     * and normalizing line endings to line feeds.
     *
     * @param {string} text The input string to normalize.
     * @returns {string} The normalized string.
     */
    function normalize(text) {

      // normalise line endings (\u2029 - paragraph separator | \u2028 - line separator)
      text = text.replace(/\r\n?|[\n\u2028\u2029]/g, '\n');

      // remove zero width no-break space
      text = text.replace(/^\uFEFF/gm, '');

      return text;
    }

    // splits a list of characters and converts to a predicate hash
    function toPredicate(str) {

      // adapted from https://github.com/marijnh/acorn

      var words = str.split('');

      var f = '',
        i,
        cats = [];

      out:
      for (i = 0; i < words.length; ++i) {
        for (var j = 0; j < cats.length; ++j)
          if (cats[j][0].length == words[i].length) {
            cats[j].push(words[i]);
            continue out;
        }
        cats.push([words[i]]);
      }

      if (cats.length > 3) {

        cats.sort(function(a, b) {
          return b.length - a.length;
        });

        f += "switch(str.length){";

        for (i = 0; i < cats.length; ++i) {
          var cat = cats[i];
          f += "case " + cat[0].length + ":";
          compareTo(cat);
        }

        f += "}";
      } else {
        compareTo(words);
      }

      return new Function("str", f);

      function compareTo(arr) {

        if (arr.length == 1) {
          return f += "return str === " + JSON.stringify(arr[0]) + ";";
        }

        f += "switch(str){";

        for (var i = 0; i < arr.length; ++i) {
          f += "case " + JSON.stringify(arr[i]) + ":";
        }

        f += "return true}return false;";
      }
    }

    function isLetter(char) {

      var code = char.charCodeAt(0);
      return (code >= 97 && code <= 122)
      || (code >= 65 && code <= 90)
      || (code >= 0xaa && UNICODE.letter.test(char));
    }

    function isDigit(char) {

      var code = char.charCodeAt(0);
      return (code >= 48 && code <= 57);
    }

    function isLetterOrDigit(char) {
      return isLetter(char) || isDigit(char);
    }

    function isWhitespace(char) {
      return WHITESPACE_CHARS(char);
    }

    function isNewLine(char) {
      return NEW_LINE_CHARS(char);
    }

    function isSymbol(char) {
      return UNICODE.S.test(char);
    }

    function isPunctuation(char) {
      return UNICODE.P.test(char);
    }

    //function isMark(char){
    //    return UNICODE.M.test(char);
    //}

    function isSpecialCharacter(char) {
      return SPECIAL_CHARS(char);
    }
  };

  /* ===================== AST ===================== */

  function Article(paragraphs) {
    this.paragraphs = paragraphs || [];
  }

  function ParagraphKinds() {
  }
  ParagraphKinds.blank = 0; // blank line
  ParagraphKinds.text = 1; // text paragraph
  ParagraphKinds.heading = 2; // heading (1-6)
  ParagraphKinds.list = 3; // list (ordered or unordered)
  ParagraphKinds.rule = 4; // horizontal rule
  ParagraphKinds.img = 5; // block image
  ParagraphKinds.bq = 6; // block quote
  ParagraphKinds.tbl = 7; // table

  /**
   * @param {number} kind
   * @param {object} [content]
   * @constructor
   */
  function Paragraph(kind, content) {
    this.kind = kind;
    this.content = content;
  }

  /**
   * @param {number} number
   * @param {string} text
   * @constructor
   */
  function Heading(number, text) {
    this.number = number;
    this.text = text || '';
  }

  /**
   * @param {string} text
   * @constructor
   */
  function Quote(text) {
    this.text = text;
  }

  /**
   * @param {number} kind
   * @param {Array} items
   * @constructor
   */
  function List(kind, items) {
    this.kind = kind;
    this.items = items || [];
  }

  function ListKinds() {
  }
  ListKinds.ul = 0;
  ListKinds.ol = 1;

  /**
   * @param {Array} parts
   * @constructor
   */
  function TextParagraph(parts) {
    this.parts = parts;
  }

  /**
   * @param {number} kind
   * @param {string|object} value
   * @constructor
   */
  function TextPart(kind, value) {
    this.kind = kind;
    this.value = value;
  }

  function TextKinds() {
  }
  TextKinds.none = 0; // unformatted
  TextKinds.b = 1; // bold
  TextKinds.em = 2; // italic
  TextKinds.ins = 3; // underline
  TextKinds.del = 4; // strike through
  TextKinds.sup = 5; // super script
  TextKinds.sub = 6; // sub script
  TextKinds.img = 7; // image - not supported yet
  TextKinds.a = 8; // link

  /**
   * @param {number} kind The image kind.
   * @param {string} path The image path (relative or absolute).
   * @param {string} [alt] The alternative text.
   * @constructor
   */
  function Image(kind, path, alt) {
    this.kind = kind;
    this.path = path;
    this.alt = alt || '';
  }

  function ImageKinds() {
  }
  ImageKinds.rel = 0; // relative path
  ImageKinds.ext = 1; // absolute (external) path

  /**
   * @param {LinkKinds} kind
   * @param {object} value
   * @constructor
   */
  function Link(kind, value, text) {
    this.kind = kind;
    this.value = value;
    this.text = text || '';
  }

  function LinkKinds() {
  }
  LinkKinds.ext = 0; // external
  LinkKinds.att = 1; // attachment
  LinkKinds.anc = 2; // internal anchor definition
  LinkKinds.gto = 3; // internal anchor goto
  LinkKinds.eml = 4; // email (mailto)

  /**
   * @description
   * Parses an array of tokens to create an AST.
   */
  function Parser() {
  }

  /**
   * @description
   * Parses an array for tokens from an iterator.
   *
   * @param {TokenIterator} iterator The token iterator.
   */
  Parser.parse = function(iterator) {
    return Parser.makeArticle(iterator);
  };

  /**
   * @description
   * Tries to parse the article.
   *
   * @param {TokenIterator} iterator The token iterator.
   */
  Parser.makeArticle = function(iterator) {

    var paragraphs = Parser.makeParagraphs(iterator);

    return new Article(paragraphs);
  };

  /**
   * @description
   * Tries to parse all paragraphs.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {Array} The paragraphs.
   */
  Parser.makeParagraphs = function(iterator) {

    var paragraphs = [];

    while (true) {

      // stop if we find the end of file
      if (iterator.eof()) {
        break;
      }

      var paragraph = Parser.makeParagraph(iterator);
      if (!paragraph) {
        break;
      }

      paragraphs.push(paragraph);
    }

    return paragraphs;
  };

  /**
   * @description
   * Tries to parse a paragraph.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {object} The paragraph.
   */
  Parser.makeParagraph = function(iterator) {

    // blank line
    if (isSuccess(Parser.tryMakeBlankLine(iterator))) {
      return new Paragraph(ParagraphKinds.blank);
    }

    // horizontal rule
    if (isSuccess(Parser.tryMakeHorizontalRule(iterator))) {
      return new Paragraph(ParagraphKinds.rule);
    }

    // heading
    var headingResult = Parser.tryMakeHeading(iterator);
    if (isSuccess(headingResult)) {
      return new Paragraph(ParagraphKinds.heading, headingResult.heading);
    }

    // list
    var listResult = Parser.tryMakeList(iterator);
    if (isSuccess(listResult)) {
      return new Paragraph(ParagraphKinds.list, listResult.list);
    }

    // image
    var imgResult = Parser.tryMakeBlockImage(iterator);
    if (isSuccess(imgResult)) {
      return new Paragraph(ParagraphKinds.img, imgResult.img);
    }

    // block quote
    var quoteResult = Parser.tryMakeBlockQuote(iterator);
    if (isSuccess(quoteResult)) {
      return new Paragraph(ParagraphKinds.bq, quoteResult.bq);
    }

    //table
    var tableResult = Parser.tryMakeTable(iterator);
    if (isSuccess(tableResult)) {
      return new Paragraph(ParagraphKinds.tbl, tableResult.tbl);
    }

    // text
    var textResult = Parser.tryMakeTextParagraph(iterator);
    if (isSuccess(textResult)) {
      return new Paragraph(ParagraphKinds.text, textResult.text);
    }

    return null;
  };

  /**
   * @description
   * Tries to parse a table.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {Object}
   */
  Parser.tryMakeTable = function(iterator) {

    // TODO: implement table support
    return {
      success: false
    };
  };

  /**
   * @description
   * Tries to parse a block quote.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {Object}
   */
  Parser.tryMakeBlockQuote = function(iterator) {

    return consumeIf(iterator, tryGetQuote);

    function tryGetQuote(iterator) {

      var line = consumeLine(iterator);

      var match = /^\s*bq\.\s+(.+)\s*$/.exec(line);
      if (match === null) {
        return {
          success: false
        };
      }

      return {
        success: true,
        bq: new Quote(match[1].trim())
      };
    }
  };

  /**
   * @description
   * Tries to parse a block image.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {Object}
   */
  Parser.tryMakeBlockImage = function(iterator) {

    return consumeIf(iterator, tryGetBlockImage);

    function tryGetBlockImage(iterator) {

      var line = consumeLine(iterator);

      // match image and optional alt tag
      var match = /^\s*!([^!\|]+)(?:\|([^!\|]+))?!\s*$/.exec(line);
      if (match === null) {
        return {
          success: false
        };
      }

      // check if we are dealing with relative or absolute (http, https or current protocol only)
      var kind = /^\s*!(?:(?:http|https)\:)?\/\/.*!\s*$/.test(line) ? ImageKinds.ext : ImageKinds.rel;

      return {
        success: true,
        img: new Image(kind, match[1], match[2])
      };
    }
  };

  /**
   * @description
   * Tries to parse a paragraph of text.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {Object}
   */
  Parser.tryMakeTextParagraph = function(iterator) {

    var parts = Parser.tryMakeTextParts(iterator);
    if (parts.length === 0) {
      return {
        success: false
      };
    }

    return {
      success: true,
      text: new TextParagraph(parts)
    };
  };

  /**
   * @description
   * Tries to parse one or more text parts.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {TextPart[]}
   */
  Parser.tryMakeTextParts = function(iterator) {

    var parts = [];

    while (true) {

      var result = consumeIf(iterator, Parser.tryMakeTextPart);

      // part will be null when we hit a new line
      if (!isSuccess(result) || result.part === null) {
        break;
      }
      // if the last part and current result are unformatted, just append
      if (parts.length > 0 && result.part.kind == TextKinds.none) {

        var lastPart = parts[parts.length - 1];
        if (lastPart.kind == TextKinds.none) {
          lastPart.value += result.part.value;
          continue;
        }
      }

      // if formatted, check for nesting
      if (result.part.kind != TextKinds.none && result.part.kind != TextKinds.a) {

        // create an iterator from the tokens
        var nestedIterator = new TokenIterator(result.part.value || []);

        // overwrite the text with parts
        result.part.value = Parser.tryMakeTextParts(nestedIterator);
      }

      parts.push(result.part);
    }

    return parts;
  };

  /**
   * @description
   * Tries to part a text part (formatted or unformatted).
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {object}
   */
  Parser.tryMakeTextPart = function(iterator) {

    // abort if eof
    if (iterator.eof()) {
      return {
        success: false
      };
    }

    var token = iterator.peek();

    // if we find the end of the paragraph, then stop
    if (token.kind == TokenKinds.newline) {

      iterator.consume();

      return {
        success: true,
        part: null
      };
    }

    // try parse formatted part
    var result = consumeIf(iterator, Parser.tryMakeFormatPart);
    if (isSuccess(result)) {
      return {
        success: true,
        part: result.part
      };
    }

    //consume the special token that did not match any format
    var unformatted = iterator.consume().text;

    // consume till the next special character
    unformatted += iterator.consumeConcatenatedWhile(function(token) {
      return (token.kind != TokenKinds.special && token.kind != TokenKinds.newline);
    });

    // return unformatted if found
    var part;
    if (unformatted.length > 0) {
      part = new TextPart(TextKinds.none, unformatted);
    }

    return {
      success: (part !== null),
      part: part
    };
  };

  /**
   * @description
   * Tries to parse a formatted text part.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {object}
   */
  Parser.tryMakeFormatPart = function(iterator) {

    var result;

    // bold
    result = Parser.tryMakeFormat(iterator, TextKinds.b, '*');
    if (isSuccess(result)) {
      return result;
    }

    // em
    result = Parser.tryMakeFormat(iterator, TextKinds.em, '+');
    if (isSuccess(result)) {
      return result;
    }

    // underline
    result = Parser.tryMakeFormat(iterator, TextKinds.ins, '_');
    if (isSuccess(result)) {
      return result;
    }

    // strike through
    result = Parser.tryMakeFormat(iterator, TextKinds.del, '-');
    if (isSuccess(result)) {
      return result;
    }

    // super script
    result = Parser.tryMakeFormat(iterator, TextKinds.sup, '^');
    if (isSuccess(result)) {
      return result;
    }

    // sub script
    result = Parser.tryMakeFormat(iterator, TextKinds.sub, '~');
    if (isSuccess(result)) {
      return result;
    }

    result = Parser.tryMakeLink(iterator);
    if (isSuccess(result)) {
      return {
        success: true,
        part: new TextPart(TextKinds.a, result.link)
      };
    }

    return {
      success: false
    };
  };

  /**
   * @description
   * Tries to parse a link.
   *
   * @param {TokenIterator} iterator The token iterator.
   */
  Parser.tryMakeLink = function(iterator) {

    return consumeIf(iterator, tryGetLink);

    function tryGetLink(iterator) {

      if (iterator.eof() || iterator.peek().text !== '[') {
        return {
          success: false
        };
      }

      var found = false,
        text = '';

      while (true) {

        // if eof or end of line reached, we didn't find the closing token
        if (iterator.eof() || iterator.peek().kind == TokenKinds.newline) {
          return {
            success: false
          };
        }

        var token = iterator.consume();
        text += token.text;

        // if we find a closing token, success!
        if (token.text === ']') {
          found = true;
          break;
        }
      }

      // attachment ([attach:file.doc])
      var match = /^\[\s*attach:\s*([^\]]+?)\s*\]$/.exec(text);
      if (match) {
        return {
          success: true,
          link: new Link(LinkKinds.att, match[1], match[1])
        }
      }

      // anchors ([a:name])
      match = /^\[\s*a:\s*([^\]]+?)\s*\]$/.exec(text);
      if (match) {
        return {
          success: true,
          link: new Link(LinkKinds.anc, match[1])
        }
      }

      // internal link ([goto:text|name])
      match = /^\[\s*goto:\s*([^\]]+?)\s*\|\s*([^\]\|]+?)\s*\]$/.exec(text);
      if (match) {
        return {
          success: true,
          link: new Link(LinkKinds.gto, match[2], match[1])
        }
      }

      // email ([mailto:test@testing.io])
      match = /^\[\s*mailto:\s*([^\]]+?)\s*\]$/.exec(text);
      if (match) {
        return {
          success: true,
          link: new Link(LinkKinds.eml, match[1], match[1])
        }
      }

      // external link - advanced ([text|http://text])
      match = /^\[\s*([^\]]+?)\s*\|\s*([^\]\|]+?)\s*\]$/.exec(text);
      if (match) {
        return {
          success: true,
          link: new Link(LinkKinds.ext, match[2], match[1])
        }
      }

      // external link - basic ([http://text])
      match = /^\[\s*([^\]]+?)\s*\]$/.exec(text);
      if (match) {
        return {
          success: true,
          link: new Link(LinkKinds.ext, match[1], match[1])
        }
      }

      return {
        success: false
      };
    }
  };

  /**
   * @description
   * Tries to parse a formatted text part.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @param {number} kind The kind of text part.
   * @param {string} char The format char that wraps text.
   * @returns {object}
   */
  Parser.tryMakeFormat = function(iterator, kind, char) {

    // ensure the opening char is found
    if (iterator.eof() || iterator.peek().text !== char) {
      return {
        success: false
      };
    }

    return consumeIf(iterator, tryConsumeFormatPart);

    function tryConsumeFormatPart(iterator) {

      //consume opening token
      iterator.consume();

      var found = false,
        tokens = [];

      while (true) {

        // if eof or end of line reached, we didn't find the closing token
        if (iterator.eof() || iterator.peek().kind == TokenKinds.newline) {
          found = false;
          break;
        }

        var token = iterator.consume();

        // if we find a closing token, success!
        if (token.text === char) {
          found = true;
          break;
        }

        tokens.push(token);
      }

      return {
        success: found,
        part: (found ? new TextPart(kind, tokens) : null)
      };
    }
  };

  /**
   * @description
   * Tries to parse a blank line.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {object}
   */
  Parser.tryMakeBlankLine = function(iterator) {
    return {
      success: (Parser.tryConsumeOnlyBlanksTillNewLine(iterator))
    };
  };

  /**
   * @description
   * Tries to parse a horizontal line.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {object}
   */
  Parser.tryMakeHorizontalRule = function(iterator) {

    return consumeIf(iterator, tryConsumeHyphens);

    function tryConsumeHyphens(iterator) {

      var line = consumeLine(iterator);
      var result = /^\s*(\-){4}\s*$/.test(line);

      return {
        success: result
      };
    }
  };

  /**
   * @description
   * Tries to parse a heading 1-6.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {object}
   */
  Parser.tryMakeHeading = function(iterator) {

    return consumeIf(iterator, tryGetHeading);

    function tryGetHeading(iterator) {

      var line = consumeLine(iterator);

      var match = /^\s*h([1-6]).\s+(.+)\s*$/.exec(line);
      if (match === null || match.length !== 3) {
        return {
          success: false
        };
      }

      return {
        success: true,
        heading: new Heading(parseInt(match[1]), match[2].trim())
      };
    }
  };

  /**
   * @description
   * Tries to parse a list (ordered or unordered).
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {object}
   */
  Parser.tryMakeList = function(iterator) {

    // unordered (dots)
    var result = consumeIf(iterator, function(i) {
      return tryConsumeList(i, /^(\-|\*)\s+(.+)$/, ListKinds.ul);
    });

    // if found, don't try ordered
    if (isSuccess(result)) {
      return result;
    }

    // ol (numbers)
    return consumeIf(iterator, function(i) {
      return tryConsumeList(i, /^(#)\s+(.+)$/, ListKinds.ol);
    });

    function tryConsumeList(iterator, xpr, kind) {

      var items = [];

      while (true) {

        var result = consumeIf(iterator, function(i) {
          return tryConsumeListItem(i, xpr);
        });

        if (!isSuccess(result)) {
          break;
        }

        items.push({
          parts: result.parts
        });
      }

      if (items.length === 0) {
        return {
          success: false
        };
      }

      return {
        success: true,
        list: new List(kind, items)
      };
    }

    function tryConsumeListItem(iterator, xpr) {

      var line = consumeLine(iterator);

      var match = xpr.exec(line);
      if (match === null || match.length !== 3) {
        return {
          success: false
        };
      }

      // parse the item text for nesting
      var nestedIterator = Tokenizer.createIterator((match[2] || '').trim());
      var itemParts = Parser.tryMakeTextParts(nestedIterator);

      return {
        success: true,
        parts: itemParts
      };
    }
  };

  /**
   * @description
   * Tries to consume only blanks till a new line is found or the end of file is reached.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {boolean} True if successful, else false.
   */
  Parser.tryConsumeOnlyBlanksTillNewLine = function(iterator) {

    return isSuccess(consumeIf(iterator, tryGetBlanks));

    function tryGetBlanks(iterator) {

      iterator.consumeWhile(function(token) {
        return (token.kind == TokenKinds.space);
      });

      // we should expect to find a newline now that blanks have stopped
      if (iterator.eof() || iterator.peek().kind == TokenKinds.newline) {
        iterator.consume();
        return {
          success: true
        };
      }

      return {
        success: false
      };
    }
  };

  /**
   * @description
   * Consumes all tokens till a newline is found.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @returns {string} The concatenated string.
   */
  function consumeLine(iterator) {

    var result = iterator.consumeConcatenatedWhile(function(token) {
      return (token.kind != TokenKinds.newline && !iterator.eof());
    });

    if (iterator.peek().kind == TokenKinds.newline) {
      iterator.consume();
    }

    return result;
  }

  /**
   * @description
   * Helper function that resets the index if the predicate is not successful.
   *
   * @param {TokenIterator} iterator The token iterator.
   * @param {function} predicate The predicate.
   * @returns {object} The result.
   */
  function consumeIf(iterator, predicate) {

    var index = iterator.getIndex();

    var result = predicate(iterator);
    if (isSuccess(result)) {
      return result;
    }

    iterator.setIndex(index);
    return result;
  }

  /**
   * @description
   * Returns if the result object was successful.
   *
   * @param {{success:boolean}} result The result to test.
   * @returns {boolean} True if successful, else false.
   */
  function isSuccess(result) {
    return (typeof result.success != 'undefined' && result.success === true);
  }

  /* =================== EXPORTS =================== */

  if (typeof define !== 'undefined' && define.amd) {

    // AMD
    define([], function() {
      return Wikid
    })
  } else if (typeof module !== 'undefined' && module.exports) {

    // CommonJS
    module.exports = Wikid
  } else {

    // Script tag
    root.Wikid = Wikid
  }

}(this));