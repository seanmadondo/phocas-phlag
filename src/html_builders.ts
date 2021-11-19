import { IHtmlBuilder } from "./types";

export class HtmlList implements IHtmlBuilder {
  private html: string;

  constructor(listItems: (string | IHtmlBuilder)[]) {
    this.html =
      "<ul>" +
      listItems
        .map((item) => {
          if (typeof item === "string") {
            return new HtmlText(item);
          } else {
            return item;
          }
        })
        .map((item) => "<li>" + item.getHtml() + "</li>")
        .join("\n") +
      "</ul>";
  }

  getHtml() {
    return this.html;
  }
}

export class HtmlRaw implements IHtmlBuilder {
  private html: string;

  constructor(html: string) {
    this.html = html;
  }

  getHtml() {
    return this.html;
  }
}

export class HtmlText implements IHtmlBuilder {
  private html: string;

  constructor(text: string) {
    this.html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  getHtml() {
    return this.html;
  }
}
