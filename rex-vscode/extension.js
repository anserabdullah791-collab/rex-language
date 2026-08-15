const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let terminal = null;
let serverProcess = null;

function activate(context) {
  // Command: Run Rex File
  let runCmd = vscode.commands.registerCommand('rex.run', (uri) => {
    const filePath = uri ? uri.fsPath : vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!filePath) {
      vscode.window.showWarningMessage('No Rex file selected');
      return;
    }
    
    if (!terminal) terminal = vscode.window.createTerminal('Rex');
    terminal.show();
    terminal.sendText(`node "${path.join(context.extensionPath, 'rex.js')}" run "${filePath}"`);
  });
  
  // Command: Convert RexWeb to HTML
  let webCmd = vscode.commands.registerCommand('rex.runWeb', (uri) => {
    const filePath = uri ? uri.fsPath : vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!filePath) {
      vscode.window.showWarningMessage('No RexWeb file selected');
      return;
    }
    
    if (!terminal) terminal = vscode.window.createTerminal('Rex');
    terminal.show();
    terminal.sendText(`node "${path.join(context.extensionPath, 'rex.js')}" web "${filePath}"`);
  });
  
  // Command: Start Live Server
  let serveCmd = vscode.commands.registerCommand('rex.serve', () => {
    const config = vscode.workspace.getConfiguration('rex');
    const port = config.get('serverPort') || 8000;
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '.';
    
    if (serverProcess) {
      serverProcess.kill();
    }
    
    serverProcess = exec(`node "${path.join(context.extensionPath, 'rex.js')}" serve "${folder}" ${port}`);
    serverProcess.stdout?.on('data', (data) => {
      vscode.window.showInformationMessage(`Rex Live Server: http://localhost:${port}`);
    });
    
    vscode.window.showInformationMessage(`Rex Live Server started at http://localhost:${port}`);
    
    // Open in browser
    vscode.env.openExternal(vscode.Uri.parse(`http://localhost:${port}`));
  });
  
  // Run on save (optional)
  context.subscriptions.push(runCmd, webCmd, serveCmd);
}

function deactivate() {
  if (serverProcess) serverProcess.kill();
  if (terminal) terminal.dispose();
}

module.exports = { activate, deactivate };
