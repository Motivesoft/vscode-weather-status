// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import axios from 'axios';

let statusBarItem: vscode.StatusBarItem;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"vscode-weather-status" is now active');

	const commandId = 'vscode-weather-status.update';
	context.subscriptions.push(vscode.commands.registerCommand(commandId, () => {
		vscode.window.showInformationMessage('Updating weather status');
		updateWeatherStatus();
	}));

	// TODO: Make the alignment and priority configurable? 
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = commandId;
	context.subscriptions.push(statusBarItem);

	// TODO check this is being executed
	vscode.commands.executeCommand(commandId);

	// Cause an update on a regular basis - every 60 minutes
	// TODO: consider making this configurable, but not too much as the underlying
	// service may have rate limits and probably doesn't update the status too often
	setInterval(updateWeatherStatus, 60 * 60 * 1000);
}

// This method is called when your extension is deactivated
export function deactivate() 
{
	if(statusBarItem) {
		statusBarItem.hide();
		statusBarItem.dispose();
	}
}

async function updateWeatherStatus() {
	//console.log('Updating weather status');

	await getWeatherData();
}

async function getWeatherData(): Promise<void> {
	const config = vscode.workspace.getConfiguration("vscode-weather-status");
	const location = config.get("location","alicante");
	const formatString = config.get("format","%C %t %h %w");
	const langCode = config.get("lang","");

	try {
		const response = await axios.get('https://wttr.in/'+location, {
			params: {
				format: formatString,
				lang: langCode
			}
		});

		statusBarItem.text = response.data;
	} catch (error) {
		console.log('Failed to get weather update: {error}');
		statusBarItem.text = "n/a";
	}

	// Make sure this is visible
	statusBarItem.show();
}
