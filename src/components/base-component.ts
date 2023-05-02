export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  hostElement: T;
  HTMLElement: U;
  templateElement: HTMLTemplateElement;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedHTMLNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.HTMLElement = importedHTMLNode.firstElementChild as U;
    if (newElementId) {
      this.HTMLElement.id = newElementId;
    }

    this.attachNode(insertAtStart);
  }

  private attachNode(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.HTMLElement
    );
  }

  abstract configure?(): void;
  abstract renderContent(): void;
}