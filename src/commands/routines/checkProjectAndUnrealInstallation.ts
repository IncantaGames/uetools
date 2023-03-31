import vscode from "vscode";

export async function checkProjectAndUnrealInstallation(): Promise<void> {
  try {
    if (
      await vscode.commands.executeCommand<boolean>(
        "uetools.checkUnrealProject"
      )
    ) {
      await vscode.commands.executeCommand(
        "uetools.detectUnrealEngineInstallation"
      );
    }
  } catch (reason: any) {
    console.log(reason);
    vscode.window.showErrorMessage(reason.message);
    throw reason;
  }
}
