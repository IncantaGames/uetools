import vscode from "vscode";
import fs from "fs";
import path from "path";
import { getUnrealEngineInstallationSearchPath } from "../helpers/installationSearchPath";

// TODO: this should  be using the UnrealVersionSelector instead of manually changing the file?
export async function changeEngineVersion(): Promise<void> {
  const unrealEngineInstallationSearchPath =
    getUnrealEngineInstallationSearchPath();

  const folders = (
    await fs.promises.readdir(unrealEngineInstallationSearchPath)
  ).filter((folder) => folder.includes("UE_"));

  // ask user to select a unreal engine installation from list with tip
  const engineFolder = await vscode.window.showQuickPick(folders, {
    placeHolder: "Select Unreal Engine Installation",
  });
  if (!engineFolder) {
    throw new Error("No Unreal Engine installation selected");
  }

  // Check if the workspaces contains a any file with the extension .uproject
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const files = await fs.promises.readdir(folder.uri.fsPath);
      for (const file of files) {
        if (file.endsWith(".uproject")) {
          // parse the file and cast it as UnrealEngineProject
          const project = JSON.parse(
            await fs.promises.readFile(`${folder.uri.fsPath}/${file}`, "utf8")
          );

          // change the engine association
          project.EngineAssociation = engineFolder.split("UE_")[1];

          // write the file back
          await fs.promises.writeFile(
            path.join(folder.uri.fsPath, file),
            JSON.stringify(project)
          );

          return;
        }
      }
    }
  }

  throw new Error("No Unreal Engine project found");
}
