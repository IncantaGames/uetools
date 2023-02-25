import vscode from "vscode";
import { UnrealEnginePlugin } from "../types";
import { Context } from "../helpers/context";
import path from "path";

export function showPluginInExplorer(args: {
  plugin: UnrealEnginePlugin;
}): void {
  const projectFolder = Context.get("projectFolder") as string;
  // focus plugin folder in folder view
  vscode.commands.executeCommand(
    "workbench.action.quickOpen",
    vscode.Uri.file(
      path.join(
        projectFolder,
        args.plugin.FriendlyName,
        `${args.plugin.FriendlyName}.uplugin`
      )
    )
  );
}
