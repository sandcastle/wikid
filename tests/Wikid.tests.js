"use strict";

describe("Wikid", function() {
  describe("toHtml", function() {
    it("should render blank", function() {
      expect(Wikid.toHtml("  \n")).toBe("<br>");
    });

    it("should render rule", function() {
      expect(Wikid.toHtml("----")).toBe("<hr>");
    });

    describe("heading", function() {
      it("should render heading", function() {
        expect(Wikid.toHtml("h1. test")).toBe("<h1>test</h1>");
      });

      it("should render heading and unformatted text", function() {
        expect(Wikid.toHtml("h1. Welcome\nHow are you?")).toBe(
          "<h1>Welcome</h1>How are you?"
        );
      });
    });

    describe("lists", function() {
      it("should render ordered list", function() {
        expect(Wikid.toHtml("# item one\n# item two")).toBe(
          "<ol><li>item one</li><li>item two</li></ol>"
        );
      });

      it("should render unordered list", function() {
        expect(Wikid.toHtml("* item one\n* item two")).toBe(
          "<ul><li>item one</li><li>item two</li></ul>"
        );
      });

      it("should render unordered list with nested formatting", function() {
        expect(Wikid.toHtml("* item *one*\n* item [two|http://test.com]")).toBe(
          '<ul><li>item <b>one</b></li><li>item <a href="http://test.com" target="_blank">two</a></li></ul>'
        );
      });
    });

    describe("text", function() {
      it("should render unformatted text", function() {
        expect(Wikid.toHtml("hello world")).toBe("hello world");
      });

      it("should render nested formatted text", function() {
        expect(Wikid.toHtml("*hello and _good_ morning*")).toBe(
          "<b>hello and <ins>good</ins> morning</b>"
        );
      });

      it("should render bold text", function() {
        expect(Wikid.toHtml("*hello world*")).toBe("<b>hello world</b>");
      });

      it("should render italic text", function() {
        expect(Wikid.toHtml("+hello world+")).toBe("<em>hello world</em>");
      });

      it("should render underline text", function() {
        expect(Wikid.toHtml("_hello world_")).toBe("<ins>hello world</ins>");
      });

      it("should render strike through text", function() {
        expect(Wikid.toHtml("-hello world-")).toBe("<del>hello world</del>");
      });

      it("should render super script text", function() {
        expect(Wikid.toHtml("^hello world^")).toBe("<sup>hello world</sup>");
      });

      it("should render sub script text", function() {
        expect(Wikid.toHtml("~hello world~")).toBe("<sub>hello world</sub>");
      });

      it("should render br for text, except for eof", function() {
        expect(Wikid.toHtml("hello\nworld")).toBe("hello<br>world");
      });
    });

    describe("block image", function() {
      it("should render empty src if relative image", function() {
        expect(Wikid.toHtml("!image.jpg!")).toBe('<img src="" alt=""><br>');
      });

      it("should render empty src if path is relative", function() {
        expect(Wikid.toHtml("!image.jpg!", { imagePath: "/images" })).toBe(
          '<img src="" alt=""><br>'
        );
      });

      it("should render relative image with absolute path from settings", function() {
        expect(
          Wikid.toHtml("!image.jpg!", { imagePath: "http://test.com/" })
        ).toBe('<img src="http://test.com/image.jpg" alt=""><br>');
      });

      it("should render relative image with absolute path (no trailing slash) from settings", function() {
        expect(
          Wikid.toHtml("!image.jpg!", { imagePath: "http://test.com" })
        ).toBe('<img src="http://test.com/image.jpg" alt=""><br>');
      });
    });

    describe("block quote", function() {
      it("should render block quote", function() {
        expect(Wikid.toHtml("bq. a wise man once said...")).toBe(
          "<blockquote>a wise man once said...</blockquote>"
        );
      });

      it("should render block quote and forgive blanks", function() {
        expect(Wikid.toHtml("  bq.   a wise man once said...  ")).toBe(
          "<blockquote>a wise man once said...</blockquote>"
        );
      });
    });

    describe("links", function() {
      it("should render empty href if relative link", function() {
        expect(Wikid.toHtml("[test.js]")).toBe("test.js");
      });

      it("should render an basic external link", function() {
        expect(Wikid.toHtml("[http://test.com]")).toBe(
          '<a href="http://test.com" target="_blank">http://test.com</a>'
        );
      });

      it("should render an advanced external link", function() {
        expect(Wikid.toHtml("[the link|http://test.com]")).toBe(
          '<a href="http://test.com" target="_blank">the link</a>'
        );
      });

      it("should render an basic external link and forgive blanks", function() {
        expect(Wikid.toHtml("[  http://test.com  ]")).toBe(
          '<a href="http://test.com" target="_blank">http://test.com</a>'
        );
      });

      it("should render an advanced external link and forgive blanks", function() {
        expect(Wikid.toHtml("[  the link  |  http://test.com  ]")).toBe(
          '<a href="http://test.com" target="_blank">the link</a>'
        );
      });

      it("should render an internal anchor", function() {
        expect(Wikid.toHtml("[a:section-1]")).toBe('<a name="section-1"></a>');
      });

      it("should render an internal link", function() {
        expect(Wikid.toHtml("[goto:Section 1|section-1]")).toBe(
          '<a href="#section-1">Section 1</a>'
        );
      });

      it("should render an email", function() {
        expect(Wikid.toHtml("[mailto:test@test.com]")).toBe(
          '<a href="mailto:test@test.com">test@test.com</a>'
        );
      });

      it("should render text only if attachment is relative", function() {
        expect(Wikid.toHtml("[attach:file.txt]")).toBe("file.txt");
      });

      it("should render an attachment with settings", function() {
        expect(
          Wikid.toHtml("[attach:file.txt]", { attachPath: "http://test.com/" })
        ).toBe(
          '<a href="http://test.com/file.txt" target="_blank">file.txt</a>'
        );
      });
    });

    describe("sanitize", function() {
      it("should encode html characters", function() {
        expect(Wikid.toHtml("&<>")).toBe("&amp;&lt;&gt;");
      });

      it("should encode script tags", function() {
        expect(Wikid.toHtml('<script>alert("pwnd!")</script>')).toBe(
          "&lt;script&gt;alert(&#34;pwnd!&#34;)&lt;/script&gt;"
        );
      });
    });
  });
});
