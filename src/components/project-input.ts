import { Component } from './base-component.js';
import { AutoBind } from '../decorators/AutoBind.js';
import { projectState } from '../state/project-state.js';
import { validate, Validatable } from '../util/validation.js';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

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
  }

  configure() {
    this.HTMLElement.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  @AutoBind
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInput();
    if (userInput) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
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
}