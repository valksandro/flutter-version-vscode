"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const util = require("util");
const child_process_1 = require("child_process");
async function showFlutterVersion() {
    try {
        const getFlutterVersion = async () => {
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)('flutter --version', (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        const versionMatch = stdout.match(/Flutter (\d+\.\d+\.\d+)/);
                        if (versionMatch) {
                            resolve(versionMatch[1]);
                        }
                        else {
                            reject(new Error('Não foi possível encontrar a versão do Flutter'));
                        }
                    }
                });
            });
        };
        const version = await getFlutterVersion();
        vscode.window.showInformationMessage(`Versão atual do Flutter: ${version}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Erro ao obter a versão do Flutter:`);
    }
}
const renameAsync = util.promisify(fs.rename);
const accessAsync = util.promisify(fs.access);
async function renameFlutterFolders(version, basePath) {
    try {
        const currentFlutterPath = path.join(basePath, 'flutter');
        const newFlutterPath = path.join(basePath, `flutter${version}`);
        await accessAsync(currentFlutterPath, fs.constants.F_OK);
        const getFlutterVersion = async () => {
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)('flutter --version', (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        const versionMatch = stdout.match(/Flutter (\d+\.\d+\.\d+)/);
                        if (versionMatch) {
                            resolve(versionMatch[1]);
                        }
                        else {
                            reject(new Error('Não foi possível encontrar a versão do Flutter'));
                        }
                    }
                });
            });
        };
        const currentVersion = await getFlutterVersion();
        const oldFlutterPath = path.join(basePath, `Flutter${currentVersion}`);
        await renameAsync(currentFlutterPath, oldFlutterPath);
        await renameAsync(newFlutterPath, currentFlutterPath);
        vscode.window.showInformationMessage(`Pastas do Flutter renomeadas com sucesso.`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Erro ao renomear pastas do Flutter`);
    }
}
function activate(context) {
    const showFlutterVersionDisposable = vscode.commands.registerCommand('extension.showFlutterVersion', showFlutterVersion);
    context.subscriptions.push(showFlutterVersionDisposable);
    let disposable = vscode.commands.registerCommand('extension.enterVersionNumber', async () => {
        const versionNumber = await vscode.window.showInputBox({
            prompt: 'Digite um número de versão',
            placeHolder: 'Exemplo: 1.0.0',
        });
        if (versionNumber) {
            const config = vscode.workspace.getConfiguration('versionNumberPlugin');
            await config.update('versionNumber', versionNumber, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`O número de versão informado é: ${versionNumber}`);
            const storedFilePath = config.get('filePath');
            if (storedFilePath) {
                await renameFlutterFolders(versionNumber, storedFilePath);
            }
            else {
                vscode.window.showErrorMessage('Nenhum caminho de arquivo informado');
            }
        }
        else {
            vscode.window.showErrorMessage('Nenhum número de versão informado');
        }
    });
    const configurePathDisposable = vscode.commands.registerCommand('extension.configurePath', async () => {
        const config = vscode.workspace.getConfiguration('versionNumberPlugin');
        const storedFilePath = config.get('filePath');
        const path = await vscode.window.showInputBox({
            prompt: 'Digite o caminho do arquivo no computador',
            placeHolder: storedFilePath || 'Exemplo: C:/Users/username/Documents',
            value: storedFilePath || undefined
        });
        if (path) {
            await config.update('filePath', path, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`O caminho do arquivo informado é: ${path}`);
        }
        else {
            vscode.window.showErrorMessage('Nenhum caminho de arquivo informado');
        }
    });
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(gear) Configurar';
    statusBarItem.tooltip = 'Clique para definir o caminho do arquivo';
    statusBarItem.command = 'extension.configurePath';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(disposable);
    context.subscriptions.push(configurePathDisposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map