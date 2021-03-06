import {IExport, analyzeWorkspace, ExportType} from './import';
import * as vscode from 'vscode';

export class DefinitionProvider {

    private static _instance: DefinitionProvider = new DefinitionProvider();
    private _cachedExports: IExport[];
    private _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    constructor() {
        if (DefinitionProvider._instance)
            throw new Error("Error: Instantiation failed: Use .instance instead of new.");
        this._statusBarItem.command = 'genGetSet.popup';
        this._statusBarItem.show();
        this.refreshExports();
        vscode.workspace.onDidSaveTextDocument((event) => {
            this.refreshExports();
        });
        DefinitionProvider._instance = this;
    }

    public static get instance(): DefinitionProvider {
        return DefinitionProvider._instance;
    }

    private refreshExports() {
        this._statusBarItem.text = '$(eye) $(sync)';
        analyzeWorkspace().then((exports) => {
            this._cachedExports = exports;
            this._statusBarItem.text = '$(eye) ' + exports.length;
        });
    }

    public get cachedExports(): IExport[] {
        return this._cachedExports;
    }

    public toQuickPickItemList(): Thenable<vscode.QuickPickItem[]> {
        return new Promise((resolve, reject) => {
            let quickPickItemList: vscode.QuickPickItem[] = [];
            for (let i = 0; i < this._cachedExports.length; i++) {
                if (this._cachedExports[i].libraryName) {
                    if (this._cachedExports[i].exported) {
                        for (let j = 0; j < this._cachedExports[i].exported.length; j++) {
                            quickPickItemList.push(<vscode.QuickPickItem>{
                                label: this._cachedExports[i].exported[j],
                                description: this._cachedExports[i].libraryName
                            });
                        }
                    } else {
                        quickPickItemList.push(<vscode.QuickPickItem>{
                            label: this._cachedExports[i].asName,
                            description: this._cachedExports[i].libraryName
                        });
                    }
                }
            }
            resolve(quickPickItemList);
        });
    }

}