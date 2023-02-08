class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  HTMLElement: HTMLFormElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    
    const importedHTMLNode = document.importNode(this.templateElement.content, true);
    this.HTMLElement = importedHTMLNode.firstElementChild as HTMLFormElement;

    this.attachNode();
  }

  private attachNode() {
    this.hostElement.insertAdjacentElement('afterbegin', this.HTMLElement);
  }
}

const projectInput = new ProjectInput();
