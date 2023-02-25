import vscode from "vscode";
import fs from "fs";

export function getUnrealEngineInstallationSearchPath(): string {
  let unrealEngineInstallationSearchPath = vscode.workspace
    .getConfiguration()
    .get("uetools.unrealEngineInstallationSearchPath") as string;
  if (!unrealEngineInstallationSearchPath) {
    // try default installation path by operating system
    const os = process.platform;
    if (os === "win32") {
      unrealEngineInstallationSearchPath = "C:\\Program Files\\Epic Games";
    } else if (os === "darwin") {
      unrealEngineInstallationSearchPath = "/Users/Shared/Epic Games";
    } else if (os === "linux") {
      unrealEngineInstallationSearchPath = "/opt/Epic Games";
    } else {
      throw new Error(
        "Unreal Engine installation not found. Please set the path in settings."
      );
    }
    if (fs.existsSync(unrealEngineInstallationSearchPath)) {
      vscode.workspace
        .getConfiguration()
        .update(
          "uetools.unrealEngineInstallationSearchPath",
          unrealEngineInstallationSearchPath,
          vscode.ConfigurationTarget.Global
        );
    } else {
      throw new Error(
        "Unreal Engine installation not found. Please set the path in settings."
      );
    }
  }

  return unrealEngineInstallationSearchPath;
}
