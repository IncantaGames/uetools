import vscode from "vscode";

export async function buildAndGenerateCompileCommands(): Promise<void> {
  try {
    await vscode.commands.executeCommand("uetools.buildProject");
    await vscode.commands.executeCommand("uetools.generateCompileCommands");
  } catch (reason: any) {
    console.log(reason);
    vscode.window.showErrorMessage(reason.message);
    throw reason;
  }
}
