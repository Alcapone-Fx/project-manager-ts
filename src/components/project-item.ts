
import { Component } from './base-component.js';
import { Draggable } from '../models/drag-drop.js';
import { Project } from '../models/project.js';
import { AutoBind } from '../decorators/AutoBind.js';

export class ProjectItem
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