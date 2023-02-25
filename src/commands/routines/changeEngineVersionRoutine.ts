import vscode from "vscode";

export async function changeEngineVersionRoutine(): Promise<void> {
  try {
    await vscode.commands.executeCommand("uetools.changeEngineVersion");
    await vscode.commands.executeCommand("uetools.checkUnrealProject");
    await vscode.commands.executeCommand(
      "uetools.generateProjectFilesAndCompileCommands"
    );
  } catch (reason: any) {
    console.log(reason);
    vscode.window.showErrorMessage(reason.message);
    throw reason;
  }
}
