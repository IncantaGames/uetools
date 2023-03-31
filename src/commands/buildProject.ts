import vscode from "vscode";
import { Context } from "../helpers/context";
import { UnrealEngineProject } from "../types";
import path from "path";

export async function buildProject(): Promise<void> {
  // check for project in the context
  const project = Context.get("project") as UnrealEngineProject;
  if (!project) {
    throw new Error("Unreal Engine Tools: no project found");
  }

  // check for unreal engine installation
  const unrealEngineInstallation = Context.get(
    "unrealEngineInstallation"
  ) as string;
  const unrealBuildToolPath = Context.get("unrealBuildToolPath") as string;
  const runtimePath = Context.get("runtimePath") as string;
  const projectFolder = Context.get("projectFolder") as string;

  // Create task to build project
  const os = process.platform;
  const scapeSpace = os === "win32" ? "` " : "\\ ";
  let buildOsType = "";
  let shellCommand;
  // TODO - Check for a better way to create shell commands for different OSes and avoid this big if/else statements
  if (os === "win32") {
    buildOsType = "Win64";
    shellCommand = new vscode.ShellExecution(
      `"${unrealBuildToolPath}" -mode=Build -ForceHotReload -project="${path.join(
        projectFolder,
        project.Name
      )}.uproject" ${project.Modules[0].Name}Editor ${buildOsType} Development`,
      { cwd: unrealEngineInstallation, executable: runtimePath }
    );
  } else if (os === "darwin") {
    buildOsType = "Mac";
    shellCommand = new vscode.ShellExecution(
      `${runtimePath.split(" ").join("\\ ")} ${unrealBuildToolPath
        .split(" ")
        .join("\\ ")} -mode=Build -ForceHotReload -project=${path
        .join(projectFolder, project.Name)
        .split(" ")
        .join("\\ ")}.uproject ${
        project.Modules[0].Name
      }Editor ${buildOsType} Development`,
      { cwd: unrealEngineInstallation }
    );
  } else if (os === "linux") {
    buildOsType = "Linux";
    shellCommand = new vscode.ShellExecution(
      `${runtimePath.split(" ").join("\\ ")} ${unrealBuildToolPath
        .split(" ")
        .join("\\ ")} -mode=Build -ForceHotReload -project=${path
        .join(projectFolder, project.Name)
        .split(" ")
        .join("\\ ")}.uproject ${
        project.Modules[0].Name
      }Editor ${buildOsType} Development`,
      { cwd: unrealEngineInstallation }
    );
  }

  const task = new vscode.Task(
    { type: "shell" },
    vscode.workspace.workspaceFolders![0],
    "Build Project",
    "UETools",
    shellCommand
  );

  const taskList = Context.get("tasks") as vscode.Task[];
  const previousTaskIndex = taskList.findIndex((t) => t.name === task.name);
  if (previousTaskIndex > -1) {
    taskList.splice(previousTaskIndex, 1);
  }
  taskList.push(task);

  // Run task
  const execution = await vscode.tasks.executeTask(task);
  await new Promise<void>((resolve) => {
    vscode.tasks.onDidEndTask((e) => {
      if (e.execution.task === execution.task) {
        vscode.window.showInformationMessage(
          `Project ${project.Name} build completed`
        );
        console.log("End: generateProjectFiles");
        resolve();
      }
    });
  });
}
