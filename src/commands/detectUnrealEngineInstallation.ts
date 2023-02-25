import vscode from "vscode";
import fs from "fs";
import path from "path";
import Registry from "winreg";
import ini from "ini";
import { UnrealEngineProject } from "../types";
import { Context } from "../helpers/context";
import { getUnrealEngineInstallationSearchPath } from "../helpers/installationSearchPath";

async function getEngineFolderInConfig(
  project: UnrealEngineProject
): Promise<string | null> {
  const os = process.platform;

  let engineFolder: string | null = null;
  if (os === "win32") {
    // attempt to find engine from registry

    const key = new Registry({
      hive: Registry.HKCU,
      key: "\\Software\\Epic Games\\Unreal Engine\\Builds",
    });
    engineFolder = await new Promise<string | null>((resolve, reject) => {
      key.get(project.EngineAssociation, (error, result) => {
        if (error) {
          resolve(null);
        } else {
          resolve(result.value);
        }
      });
    });
  } else if (os === "darwin") {
    if (process.env.HOME) {
      const configFilePath = path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "Epic",
        "UnrealEngine",
        "Install.ini"
      );
      const configFile = await fs.promises.readFile(configFilePath, {
        encoding: "utf-8",
      });
      const config = ini.parse(configFile);
      if (
        config.Installations &&
        config.Installations[project.EngineAssociation]
      ) {
        engineFolder = config.Installations[project.EngineAssociation];
      }
    }
  }

  return engineFolder;
}

function getEngineFolderViaSearch(project: UnrealEngineProject): string {
  // get unreal engine installation search path and check if the version associated with project is installed
  const unrealEngineInstallationSearchPath =
    getUnrealEngineInstallationSearchPath();

  const folders = fs.readdirSync(unrealEngineInstallationSearchPath);

  const engineFolder = folders.find((folder) =>
    folder.includes(`UE_${project.EngineAssociation}`)
  );

  if (!engineFolder) {
    throw new Error(
      `Unreal Engine ${project.EngineAssociation} not found in ${unrealEngineInstallationSearchPath}`
    );
  }

  return path.join(unrealEngineInstallationSearchPath, engineFolder);
}

export async function detectUnrealEngineInstallation(): Promise<void> {
  // check for project in the context
  const project = Context.get("project") as UnrealEngineProject;

  if (!project) {
    throw new Error("No project found");
  }

  // check operating system
  const os = process.platform;

  let engineFolder = await getEngineFolderInConfig(project);

  if (engineFolder === null) {
    engineFolder = getEngineFolderViaSearch(project);
  }

  if (!fs.existsSync(engineFolder)) {
    throw new Error(`The detected folder '${engineFolder}' does not exist.`);
  }

  Context.set("unrealEngineInstallation", engineFolder);

  if (os === "win32") {
    Context.set(
      "unrealBuildToolPath",
      path.join(
        engineFolder,
        "Engine",
        "Binaries",
        "DotNET",
        "UnrealBuildTool",
        "UnrealBuildTool.dll"
      )
    );
    Context.set(
      "unrealEditorPath",
      path.join(engineFolder, "Engine", "Binaries", "Win64", "UnrealEditor.exe")
    );
    Context.set(
      "runtimePath",
      path.join(
        engineFolder,
        "Engine",
        "Binaries",
        "ThirdParty",
        "DotNet",
        "Windows",
        "dotnet.exe"
      )
    );
  } else if (os === "darwin") {
    Context.set(
      "unrealBuildToolPath",
      path.join(
        engineFolder,
        "Engine",
        "Binaries",
        "DotNET",
        "UnrealBuildTool",
        "UnrealBuildTool.dll"
      )
    );
    Context.set(
      "unrealEditorPath",
      path.join(
        engineFolder,
        "Engine",
        "Binaries",
        "Mac",
        "UnrealEditor.app",
        "Contents",
        "MacOS",
        "UnrealEditor"
      )
    );
    Context.set(
      "runtimePath",
      path.join(
        engineFolder,
        "Engine",
        "Binaries",
        "ThirdParty",
        "DotNet",
        "Mac",
        "dotnet"
      )
    );
  } else if (os === "linux") {
    Context.set(
      "unrealBuildToolPath",
      path.join(
        engineFolder,
        "Engine",
        "Binaries",
        "DotNET",
        "UnrealBuildTool",
        "UnrealBuildTool.dll"
      )
    );
    Context.set(
      "unrealEditorPath",
      path.join(engineFolder, "Engine", "Binaries", "Linux", "UnrealEditor")
    );
    Context.set(
      "runtimePath",
      path.join(
        engineFolder,
        "Engine",
        "Binaries",
        "ThirdParty",
        "Mono",
        "Linux",
        "bin",
        "mono"
      )
    );
  } else {
    throw new Error(`Unsupported operating system: ${os}`);
  }

  // Notify user the selected unreal engine installation
  vscode.window.showInformationMessage(
    `Unreal Engine installation ${engineFolder} selected.`
  );
  console.log(`Unreal Engine installation selected.`);
}
