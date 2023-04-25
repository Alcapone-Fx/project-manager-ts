// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const isString = (value: any): value is string => typeof value === "string";
const isNumber = (value: any): value is number => typeof value === "number";

const validate = (validatableInput: Validatable) => {
  const { value } = validatableInput;
  let isValid = true;

  if (validatableInput.required) {
    isValid = Boolean(value.toString().trim().length);
  }
  if (isValid && validatableInput.minLength != null && isString(value)) {
    isValid = value.length >= validatableInput.minLength;
  }
  if (isValid && validatableInput.maxLength != null && isString(value)) {
    isValid = value.length <= validatableInput.maxLength;
  }
  if (isValid && validatableInput.min != null && isNumber(value)) {
    isValid = value >= validatableInput.min;
  }
  if (isValid && validatableInput.max != null && isNumber(value)) {
    isValid = value <= validatableInput.max;
  }
  return isValid;
};

// import { AutoBind } from './decorators/index';
const AutoBind = (_: any, __: string, propDescriptor: PropertyDescriptor) => {
  const originalMethod = propDescriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    // is like having a value property with extra loginc that runs before the value is returned
    get() {
      // this will refer to whatever is responsible for triggering the getter method
      const boundFuntion = originalMethod.bind(this);
      return boundFuntion;
    },
  };

  return newDescriptor;
};

class ProjectList {
  hostElement: HTMLDivElement;
  HTMLElement: HTMLElement;
  templateElement: HTMLTemplateElement;

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    const importedHTMLNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.HTMLElement = importedHTMLNode.firstElementChild as HTMLElement;
    this.HTMLElement.id = `${this.type}-projects`;
    this.attachNode();
    this.renderContent();
  }

  private attachNode() {
    this.hostElement.insertAdjacentElement("beforeend", this.HTMLElement);
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.HTMLElement.querySelector('ul')!.id = listId;
    this.HTMLElement.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  HTMLElement: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedHTMLNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.HTMLElement = importedHTMLNode.firstElementChild as HTMLFormElement;
    this.HTMLElement.id = "user-input";

    this.titleInputElement = this.HTMLElement.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.HTMLElement.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.HTMLElement.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attachNode();
  }

  @AutoBind
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInput();
    console.log(e.target);
    console.log(userInput);
    if (userInput) {
      const [title, description, people] = userInput;
      console.log(title, description, people);
      this.clearInput();
    }
  }

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;

    const validatableTitle: Validatable = {
      value: title,
      required: true,
    };
    const validatableDescription: Validatable = {
      value: description,
      required: true,
      minLength: 5,
      maxLength: 30,
    };
    const validatablePeople: Validatable = {
      value: Number(people),
      required: true,
      min: 1,
      max: 10,
    };

    if (
      !validate(validatableTitle) ||
      !validate(validatableDescription) ||
      !validate(validatablePeople)
    ) {
      alert("Wrong input!");
      return;
    }

    return [title, description, Number(people)];
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  private configure() {
    this.HTMLElement.addEventListener("submit", this.submitHandler);
  }

  private attachNode() {
    this.hostElement.insertAdjacentElement("afterbegin", this.HTMLElement);
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');

console.log(projectInput);
