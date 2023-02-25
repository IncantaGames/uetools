import vscode from "vscode";

export async function generateProjectFilesAndCompileCommands(): Promise<void> {
  try {
    await vscode.commands.executeCommand("uetools.generateProjectFiles");
    await vscode.commands.executeCommand("uetools.generateCompileCommands");
  } catch (reason: any) {
    console.log(reason);
    vscode.window.showErrorMessage(reason.message);
    throw reason;
  }
}
