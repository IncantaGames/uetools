import path from "path";
import vscode from "vscode";
import { Context } from "../helpers/context";
import { UnrealEngineProject } from "../types";

export async function openProjectEditor(): Promise<void> {
  // check for project in the context
  const project = Context.get("project") as UnrealEngineProject;
  if (!project) {
    throw new Error("No project found");
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
  vscode.window.showInformationMessage(
    `Opening project editor for ${project.Modules[0].Name}`
  );

  const unrealEditorBin = Context.get("unrealEditorPath") as string;
  const projectFile = path.join(
    projectFolder,
    `${project.Modules[0].Name}.uproject`
  );

  // launch unreal editor without debug session in vscode
  const editorProcess = vscode.debug.startDebugging(
    vscode.workspace.workspaceFolders![0],
    {
      name: "Unreal Editor",
      type: "lldb",
      request: "launch",
      program: unrealEditorBin,
      args: [projectFile],
      cwd: projectFolder,
    }
  );

  // vscode.tasks.onDidEndTask((e) => {
  //   if (e.execution.task === execution.task) {
  //     vscode.window.showInformationMessage(
  //       `Project editor opened for ${project.Modules[0].Name}`
  //     );
  //   }
  // });
}
