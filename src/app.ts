// Drag and Drop interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (listener: T[]) => void;

// Project State Management
class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);

    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  updateListeners() {
    for (const listener of this.listeners) {
      listener(this.projects.slice());
    }
  }
}

// global instant
const projectState = ProjectState.getInstance();

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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons() {
    return this.project.people === 1
      ? "1 person"
      : `${this.project.people} persons`;
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure() {
    this.HTMLElement.addEventListener("dragstart", this.dragStartHandler);
    this.HTMLElement.addEventListener("dragend", this.dragEndHandler);
  }
  renderContent() {
    this.HTMLElement.querySelector("h2")!.textContent = this.project.title;
    this.HTMLElement.querySelector(
      "h3"
    )!.textContent = `${this.persons} assgined`;
    this.HTMLElement.querySelector("p")!.textContent = this.project.description;
  }

  @AutoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @AutoBind
  dragEndHandler(_: DragEvent) { }
}

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.configure();
    this.renderContent();
    this.assignedProjects = [];
  }

  configure() {
    this.HTMLElement.addEventListener("dragover", this.dragOverHandler);
    this.HTMLElement.addEventListener("dragleave", this.dragLeaveHandler);
    this.HTMLElement.addEventListener("drop", this.dropHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.HTMLElement.querySelector("ul")!.id = listId;
    this.HTMLElement.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  @AutoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const ulElement = this.HTMLElement.querySelector("ul")!;
      ulElement.classList.add("droppable");
    }
  }

  @AutoBind
  dragLeaveHandler(event: DragEvent) {
    event.preventDefault();
    const ulElement = this.HTMLElement.querySelector("ul")!;
    ulElement.classList.remove("droppable");
  }

  @AutoBind
  dropHandler(event: DragEvent) {
    event.preventDefault();
    const projectId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  private renderProjects() {
    const listElement = document.getElementById(`${this.type}-projects-list`);
    listElement!.innerHTML = "";

    for (const project of this.assignedProjects) {
      new ProjectItem(this.HTMLElement.querySelector("ul")!.id, project);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
