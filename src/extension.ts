// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"vscode-weather-status" is now active');

	const commandId = 'vscode-weather-status.update';
	context.subscriptions.push(vscode.commands.registerCommand(commandId, () => {
		updateWeatherStatus();
	}));

	/*
	Would be nice to update whenever the configuration is edited, but we end up 
	getting notifications for each keypress, which means we end up sending queries that won't work
	We'll just have to let the user use the update command when they're ready to.

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
		if(event.affectsConfiguration('vscode-weather-status.location')
			|| event.affectsConfiguration('vscode-weather-status.format')
			|| event.affectsConfiguration('vscode-weather-status.language')) {
			// Update the display - only do this if a pertinent setting has changed
			console.log('Configuration changed!');
			updateWeatherStatus();
		}
	}));
	*/

	// TODO: Make the alignment and priority configurable? 
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = commandId;
	context.subscriptions.push(statusBarItem);

	// Set the weather status on activation
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
	await getWeatherData();
}

async function getWeatherData() : Promise<void> {
	const config = vscode.workspace.getConfiguration("vscode-weather-status");
	const location = config.get("location","");
	const formatString = config.get("format","%C %t %h %w");
	const langCode = config.get("language","");
	const showMessage = config.get("update-message",false);

	const baseUrl = 'https://wttr.in/'+location;
	const params = new URLSearchParams({
		format: formatString,
		lang: langCode,
	});

	const urlWithParams = `${baseUrl}?${params.toString()}`;

	try {
		const response = await fetch(urlWithParams);

		if (response.ok) {
			console.log(`Requesting weather status: location [${location}], format [${formatString}], lang [${langCode}]`);
			const data = await response.text();

			console.log(`Obtained updated weather status: ${data}`);

			statusBarItem.text = data;
			
			if( location === "" ) {
				statusBarItem.tooltip = data;
			} else {
				statusBarItem.tooltip = location + ": " + data + ". Click to update";
			}

			if(showMessage) {
				vscode.window.showInformationMessage("Updated weather status");
			}
		} else {
			// Check specifically for a 404 error as that may indicate unknown location 
			if (response.status === 404) {
				console.error(`Error updating weather status: ${response.status} ${response.statusText}`);
	
				statusBarItem.text = "n/a";
				statusBarItem.tooltip = `Error: ${response.status} ${response.statusText}. Unknown location?`;
			
				if(showMessage) {
					vscode.window.showErrorMessage('Failed to update weather status. Unknown location?');
				}
			} else {
				throw new Error(`${response.status} ${response.statusText}`);
			}
		}
	} catch (error) {
		console.error(`Error updating weather status: ${error}`);

		statusBarItem.text = "n/a";
		statusBarItem.tooltip = "Error: " + String(error) + ". Click to retry";

		if(showMessage) {
			if(error instanceof Error) {
				vscode.window.showErrorMessage(`Error updating weather status: ${error.message}`);
			} else {
				vscode.window.showErrorMessage(`Error updating weather status: ${String(error)}`);
			}
		}
	}

	// Make sure this is visible
	statusBarItem.show();
}
