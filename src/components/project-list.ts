import { Component } from './base-component.js';
import { ProjectItem } from './project-item.js';
import { Project, ProjectStatus } from '../models/project.js';
import { DragTarget } from '../models/drag-drop.js';
import { AutoBind } from '../decorators/AutoBind.js';
import { projectState } from '../state/project-state.js';

export class ProjectList
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