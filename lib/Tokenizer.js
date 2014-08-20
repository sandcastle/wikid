'use strict';

/**
 * @description
 * String tokenizer that is used by the wiki parser.
 */
function Tokenizer(){ }

/**
 * @description
 * Creates a token iterator for the specified text.
 *
 * @param {string} text The string to tokenize and iterate over.
 * @returns {TokenIterator} The token iterator.
 */
Tokenizer.createIterator = function(text){
    return new TokenIterator(Tokenizer.tokenize(text));
};

/**
 * @description
 * Tokenize the text.
 *
 * @param {string} text The text to tokenize.
 * @returns {Token[]} The tokens from the text.
 */
Tokenizer.tokenize = function(text){

	text = text || '';

    // unicode categories adapted from http://xregexp.com/plugins/#unicode
    // char analysis adapted from https://github.com/mishoo/uglifyjs2

    var UNICODE_CATEGORIES = {

        // letter
        L:  "0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05270531-055605590561-058705D0-05EA05F0-05F20620-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280840-085808A008A2-08AC0904-0939093D09500958-09610971-09770979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10CF10CF20D05-0D0C0D0E-0D100D12-0D3A0D3D0D4E0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC-0EDF0F000F40-0F470F49-0F6C0F88-0F8C1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510C710CD10D0-10FA10FC-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1BBA-1BE51C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11CF51CF61D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209C21022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2CF22CF32D00-2D252D272D2D2D30-2D672D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31BA31F0-31FF3400-4DB54E00-9FCCA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78B-A78EA790-A793A7A0-A7AAA7F8-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDAAE0-AAEAAAF2-AAF4AB01-AB06AB09-AB0EAB11-AB16AB20-AB26AB28-AB2EABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",

        // mark
        M:  "0300-036F0483-04890591-05BD05BF05C105C205C405C505C70610-061A064B-065F067006D6-06DC06DF-06E406E706E806EA-06ED07110730-074A07A6-07B007EB-07F30816-0819081B-08230825-08270829-082D0859-085B08E4-08FE0900-0903093A-093C093E-094F0951-0957096209630981-098309BC09BE-09C409C709C809CB-09CD09D709E209E30A01-0A030A3C0A3E-0A420A470A480A4B-0A4D0A510A700A710A750A81-0A830ABC0ABE-0AC50AC7-0AC90ACB-0ACD0AE20AE30B01-0B030B3C0B3E-0B440B470B480B4B-0B4D0B560B570B620B630B820BBE-0BC20BC6-0BC80BCA-0BCD0BD70C01-0C030C3E-0C440C46-0C480C4A-0C4D0C550C560C620C630C820C830CBC0CBE-0CC40CC6-0CC80CCA-0CCD0CD50CD60CE20CE30D020D030D3E-0D440D46-0D480D4A-0D4D0D570D620D630D820D830DCA0DCF-0DD40DD60DD8-0DDF0DF20DF30E310E34-0E3A0E47-0E4E0EB10EB4-0EB90EBB0EBC0EC8-0ECD0F180F190F350F370F390F3E0F3F0F71-0F840F860F870F8D-0F970F99-0FBC0FC6102B-103E1056-1059105E-10601062-10641067-106D1071-10741082-108D108F109A-109D135D-135F1712-17141732-1734175217531772177317B4-17D317DD180B-180D18A91920-192B1930-193B19B0-19C019C819C91A17-1A1B1A55-1A5E1A60-1A7C1A7F1B00-1B041B34-1B441B6B-1B731B80-1B821BA1-1BAD1BE6-1BF31C24-1C371CD0-1CD21CD4-1CE81CED1CF2-1CF41DC0-1DE61DFC-1DFF20D0-20F02CEF-2CF12D7F2DE0-2DFF302A-302F3099309AA66F-A672A674-A67DA69FA6F0A6F1A802A806A80BA823-A827A880A881A8B4-A8C4A8E0-A8F1A926-A92DA947-A953A980-A983A9B3-A9C0AA29-AA36AA43AA4CAA4DAA7BAAB0AAB2-AAB4AAB7AAB8AABEAABFAAC1AAEB-AAEFAAF5AAF6ABE3-ABEAABECABEDFB1EFE00-FE0FFE20-FE26",

        // number
        N:  "0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0B72-0B770BE6-0BF20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F331040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-18191946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C491C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293248-324F3251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19",

        // punctuation
        P:  "0021-00230025-002A002C-002F003A003B003F0040005B-005D005F007B007D00A100A700AB00B600B700BB00BF037E0387055A-055F0589058A05BE05C005C305C605F305F40609060A060C060D061B061E061F066A-066D06D40700-070D07F7-07F90830-083E085E0964096509700AF00DF40E4F0E5A0E5B0F04-0F120F140F3A-0F3D0F850FD0-0FD40FD90FDA104A-104F10FB1360-13681400166D166E169B169C16EB-16ED1735173617D4-17D617D8-17DA1800-180A194419451A1E1A1F1AA0-1AA61AA8-1AAD1B5A-1B601BFC-1BFF1C3B-1C3F1C7E1C7F1CC0-1CC71CD32010-20272030-20432045-20512053-205E207D207E208D208E2329232A2768-277527C527C627E6-27EF2983-299829D8-29DB29FC29FD2CF9-2CFC2CFE2CFF2D702E00-2E2E2E30-2E3B3001-30033008-30113014-301F3030303D30A030FBA4FEA4FFA60D-A60FA673A67EA6F2-A6F7A874-A877A8CEA8CFA8F8-A8FAA92EA92FA95FA9C1-A9CDA9DEA9DFAA5C-AA5FAADEAADFAAF0AAF1ABEBFD3EFD3FFE10-FE19FE30-FE52FE54-FE61FE63FE68FE6AFE6BFF01-FF03FF05-FF0AFF0C-FF0FFF1AFF1BFF1FFF20FF3B-FF3DFF3FFF5BFF5DFF5F-FF65",

        // symbols
        S:  "0024002B003C-003E005E0060007C007E00A2-00A600A800A900AC00AE-00B100B400B800D700F702C2-02C502D2-02DF02E5-02EB02ED02EF-02FF03750384038503F60482058F0606-0608060B060E060F06DE06E906FD06FE07F609F209F309FA09FB0AF10B700BF3-0BFA0C7F0D790E3F0F01-0F030F130F15-0F170F1A-0F1F0F340F360F380FBE-0FC50FC7-0FCC0FCE0FCF0FD5-0FD8109E109F1390-139917DB194019DE-19FF1B61-1B6A1B74-1B7C1FBD1FBF-1FC11FCD-1FCF1FDD-1FDF1FED-1FEF1FFD1FFE20442052207A-207C208A-208C20A0-20B9210021012103-21062108210921142116-2118211E-2123212521272129212E213A213B2140-2144214A-214D214F2190-2328232B-23F32400-24262440-244A249C-24E92500-26FF2701-27672794-27C427C7-27E527F0-29822999-29D729DC-29FB29FE-2B4C2B50-2B592CE5-2CEA2E80-2E992E9B-2EF32F00-2FD52FF0-2FFB300430123013302030363037303E303F309B309C319031913196-319F31C0-31E33200-321E322A-324732503260-327F328A-32B032C0-32FE3300-33FF4DC0-4DFFA490-A4C6A700-A716A720A721A789A78AA828-A82BA836-A839AA77-AA79FB29FBB2-FBC1FDFCFDFDFE62FE64-FE66FE69FF04FF0BFF1C-FF1EFF3EFF40FF5CFF5EFFE0-FFE6FFE8-FFEEFFFCFFFD"
    };

    var UNICODE = { };

    var SPECIAL_CHARS = toPredicate('*[]#+_^-~.<>!:');

    var WHITESPACE_CHARS = toPredicate(' \t\u00a0\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000');

    var NEW_LINE_CHARS = toPredicate('\n');

    // expand the unicode categories into valid regex
    var cat;
    for(cat in UNICODE_CATEGORIES){
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

                while (index +1 < txt.length && isLetterOrDigit(txt[index + 1])) {
                    index++;
                }

                tokens.push(new Token(TokenKinds.text, txt.substr(start, (index - start) + 1)));
                continue;
            }

            // number
            if (isDigit(txt[index]))
            {
                start = index;
                var tokenKind = TokenKinds.number;

                while (index + 1 < txt.length && isLetterOrDigit(txt[index + 1]))
                {
                    // promote to a word if an alpha character is detected
                    if (isLetter(txt[index + 1]))
                    {
                        tokenKind = TokenKinds.text;
                    }

                    index++;
                }

                tokens.push(new Token(tokenKind, txt.substr(start, (index - start) + 1)));
                continue;
            }

            // special characters
            if(isSpecialCharacter(txt[index])){
                tokens.push(new Token(TokenKinds.special, txt[index]));
                continue;
            }

            // white space
            if (isWhitespace(txt[index])){
                tokens.push(new Token(TokenKinds.space, ' '));
                continue;
            }

            // new line
            if (isNewLine(txt[index])){
                tokens.push(new Token(TokenKinds.newline, '\n'));
                continue;
            }

            // symbol
            if (isSymbol(txt[index])){
                tokens.push(new Token(TokenKinds.symbol, txt[index]));
                continue;
            }

            // punctuation
            if (isPunctuation(txt[index])){
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
    function normalize(text){

        // normalise line endings (\u2029 - paragraph separator | \u2028 - line separator)
        text = text.replace(/\r\n?|[\n\u2028\u2029]/g, '\n');

        // remove zero width no-break space
        text = text.replace(/^\uFEFF/gm, '');

        return text;
    }

    // splits a list of characters and converts to a predicate hash
    function toPredicate(str){

        // adapted from https://github.com/marijnh/acorn

        var words = str.split('');

        var f = '',
            i,
            cats = [];

        out: for (i = 0; i < words.length; ++i) {
            for (var j = 0; j < cats.length; ++j)
                if (cats[j][0].length == words[i].length) {
                    cats[j].push(words[i]);
                    continue out;
                }
            cats.push([words[i]]);
        }

        if (cats.length > 3) {

            cats.sort(function(a, b) {return b.length - a.length;});

            f += "switch(str.length){";

            for (i = 0; i < cats.length; ++i) {
                var cat = cats[i];
                f += "case " + cat[0].length + ":";
                compareTo(cat);
            }

            f += "}";
        }
        else {
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

    function isLetter(char){

        var code = char.charCodeAt(0);
        return (code >= 97 && code <= 122)
            || (code >= 65 && code <= 90)
            || (code >= 0xaa && UNICODE.letter.test(char));
    }

    function isDigit(char){

        var code = char.charCodeAt(0);
        return (code >= 48 && code <= 57);
    }

    function isLetterOrDigit(char){
        return isLetter(char) || isDigit(char);
    }

    function isWhitespace(char){
        return WHITESPACE_CHARS(char);
    }

    function isNewLine(char){
        return NEW_LINE_CHARS(char);
    }

    function isSymbol(char){
        return UNICODE.S.test(char);
    }

    function isPunctuation(char){
        return UNICODE.P.test(char);
    }

    //function isMark(char){
    //    return UNICODE.M.test(char);
    //}

    function isSpecialCharacter(char){
        return SPECIAL_CHARS(char);
    }
};
