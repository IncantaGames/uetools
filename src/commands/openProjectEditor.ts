import path from "path";
import vscode from "vscode";
import { Context } from "../helpers/context";
import { UnrealEngineProject } from "../types";

export async function openProjectEditor(): Promise<void> {
  // check for project in the context
  const project = Context.get("project") as UnrealEngineProject;
  if (!project) {
    throw new Error("Unreal Engine Tools: no project found");
  }

  // check for unreal engine installation
  let unrealEngineInstallation = Context.get(
    "unrealEngineInstallation"
  ) as string;
  if (!unrealEngineInstallation) {
    await vscode.commands.executeCommand(
      "uetools.detectUnrealEngineInstallation"
    );
    unrealEngineInstallation = Context.get(
      "unrealEngineInstallation"
    ) as string;
    if (!unrealEngineInstallation) {
      throw new Error("No unreal engine installation found");
    }
  }
  const projectFolder = Context.get("projectFolder") as string;
  const message = `Opening project editor for ${project.Name}`;
  if (vscode.workspace.getConfiguration().get<boolean>("uetools.debug")) {
    vscode.window.showInformationMessage(message);
  }
  console.log(message);

  const unrealEditorBin = Context.get("unrealEditorPath") as string;
  const projectFile = path.join(projectFolder, `${project.Name}.uproject`);

  // launch unreal editor without debug session in vscode
  const task = new vscode.Task(
    { type: "launch" },
    vscode.TaskScope.Workspace,
    projectFolder,
    "Run Unreal Editor",
    new vscode.ProcessExecution(unrealEditorBin, [projectFile])
  );
  vscode.tasks.executeTask(task);
}
