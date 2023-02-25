// Check if the workspace contains a UProject file
import fs from "fs";
import path from "path";
import { Context } from "../helpers/context";
import vscode from "vscode";

// import types
import { UnrealEngineProject, UnrealEnginePlugin } from "../types";

export default async function checkUnrealProject(): Promise<boolean> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  // Check if the workspaces contains a any file with the extension .uproject
  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const files = await fs.promises.readdir(folder.uri.fsPath);
      for (const file of files) {
        if (file.endsWith(".uproject")) {
          // parse the file and cast it as UnrealEngineProject
          const project = JSON.parse(
            await fs.promises.readFile(
              path.join(folder.uri.fsPath, file),
              "utf8"
            )
          ) as UnrealEngineProject;

          // if Plugins folder exists, check each subfolder for a .uplugin file
          if (fs.existsSync(path.join(folder.uri.fsPath, "Plugins"))) {
            const pluginDirs = await fs.promises.readdir(
              path.join(folder.uri.fsPath, "Plugins")
            );
            project.ProjectPlugins = [];
            for (const pluginDir of pluginDirs) {
              const pluginDescriptorFile = path.join(
                folder.uri.fsPath,
                "Plugins",
                pluginDir,
                `${pluginDir}.uplugin`
              );
              if (fs.existsSync(pluginDescriptorFile)) {
                const plugin = JSON.parse(
                  await fs.promises.readFile(pluginDescriptorFile, "utf8")
                ) as UnrealEnginePlugin;
                project.ProjectPlugins.push(plugin);
              }
            }
          }

          //persist project workspace folder
          Context.set("projectFolder", folder.uri.fsPath);

          // persist the UnrealEngineProject in the global state
          Context.set("project", project);

          // notify the user that the workspace is a valid Unreal Engine project
          vscode.window.showInformationMessage(
            `Unreal Engine project ${project.Modules[0].Name} found associated with Engine Version: ${project.EngineAssociation}.`
          );

          // save the project information in vscode workspace settings
          vscode.workspace
            .getConfiguration()
            .update(
              "uetools.project",
              project,
              vscode.ConfigurationTarget.WorkspaceFolder
            );

          Context.events.onProjectChanged.emit(project);
          return true;
        }
      }
    }
  }

  return false;
}
