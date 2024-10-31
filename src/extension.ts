// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

const updateCommandId = 'vscode-weather-status.update';
const setLocationCommandId = 'vscode-weather-status.set-location';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"vscode-weather-status" is now active');

	context.subscriptions.push(vscode.commands.registerCommand(updateCommandId, () => {
		updateWeatherStatus();
	}));

	context.subscriptions.push(vscode.commands.registerCommand(setLocationCommandId, () => {
		updateWeatherLocation();
	}));

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = updateCommandId;
	context.subscriptions.push(statusBarItem);

	// Set the weather status on activation
	vscode.commands.executeCommand(updateCommandId);

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

async function updateWeatherLocation() {
	let options: vscode.InputBoxOptions = {
		prompt: "Enter the name of the nearest city to use for your location",
		placeHolder: ""
	};
	
	vscode.window.showInputBox(options).then(value => {
		if (!value) {
			console.log("No value entered");
			return;
		}
		
		console.log(`Location value entered: ${value}`);

		// Update the setting and invoke the update command
		const configuration = vscode.workspace.getConfiguration("vscode-weather-status");
		configuration.update("location", value, vscode.ConfigurationTarget.Global).then( _ => {
			// Got the value we need. Now we can force an update
			statusBarItem.command = updateCommandId;
			vscode.commands.executeCommand(updateCommandId);
		});
	});
}

async function getWeatherData() : Promise<void> {
	const config = vscode.workspace.getConfiguration("vscode-weather-status");
	const location = config.get("location","");
	const formatString = config.get("format","%C %t %h %w");
	const langCode = config.get("language","");
	const showMessage = config.get("update-message",false);

	// The weather service will happily return results guessing the location to use based on the IP address of
	// system that makes the API call. 
	// When running with VS Code on the desktop, this is probably accurate (unless a VPN is involved), but when
	// using VS Code for the Web, the results are unclear. 
	if (vscode.env.uiKind === vscode.UIKind.Web) {
		if(location === "") {
			console.info( "Weather Status needs location information to continue");

			vscode.window.showInformationMessage('Weather Status requires configuration');
	
			statusBarItem.text = `Weather Status: Click to configure`;
			statusBarItem.tooltip = `Weather Status: Configuration required`;
			statusBarItem.command = setLocationCommandId;
			statusBarItem.show();

			return;
		}
	}
	
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
				statusBarItem.tooltip = data + " using estimated location. Click to update";
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
	
				statusBarItem.text = "Weather n/a";
				statusBarItem.tooltip = `Error: ${response.status}. Possibly due to unknown location`;
			
				if(showMessage) {
					vscode.window.showErrorMessage('Failed to update weather status. Possibly due to unknown location');
				}
			} else if (response.status === 503) {
				console.error(`Error updating weather status: ${response.status} ${response.statusText}`);
	
				statusBarItem.text = "Weather n/a";
				statusBarItem.tooltip = `Error: ${response.status}. Weather service down or over capacity`;
			
				if(showMessage) {
					vscode.window.showErrorMessage('Failed to update weather status. Service down or over capacity');
				}
			} else {
				throw new Error(`${response.status} ${response.statusText}`);
			}
		}
	} catch (error) {
		console.error(`Error updating weather status: ${error}`);

		statusBarItem.text = "Weather n/a";
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
