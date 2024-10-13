# Weather Status

This extension displays the current weather in the VS Code status bar. The weather is updated regularly while VS Code is running.

The extension is heavily dependent on the excellent [https://wttr.in](https://wttr.in) weather service. Please take a moment to appreciate the provider of this service and see the project's [GitHub page](https://github.com/chubin/wttr.in).

Note that this is intended only to display current weather conditions. It does not provide any sort of weather alerts or warnings.

## Usage

The extension will automatically start and display weather information in the status bar. The weather will be based on a best guess of your location, initially. If preferred, there is a configuration setting where you can enter a specific location. For best results, enter the name of a local city as the weather service will not be able to return a valid result if the location is unknown to the weather service.

See [Extension Settings](#extension-settings) for configuration details.

## Features

The extension calls a third-party weather service at regular intervals, requesting various bits of information to display in the statusbar. The information displayed can be adjusted in configuration, as can the location to obtain weather details for.

The command 'Update weather status' can be used to force the weather status to refresh at any time.

## Requirements

The service currently obtains weather details from [https://wttr.in](https://wttr.in). 

This extension cannot function without the data provided by this weather service. Any outages are outside the control of the author of this extension.

Other weather providers may be considered and added to this extension if considered appropriate.

## Extension Settings

This extension contributes the following settings:

| **Setting** | **Description** | **Default Value** |
|-|-|-|
| `vscode-weather-status.location` | The city for which to obtain the weather status. | Best guess by the weather service |
|`vscode-weather-status.format` | The information and format to display.                                                               | `%C %t %h %w`                  |
|`vscode-weather-status.language` | The two-letter language code to use. | English |
|`vscode-weather-status.update-message` | Enable/disable display of a message whenever the weather status is updated. | Disabled |

See the wttr.in section on [one line output](https://github.com/chubin/wttr.in?tab=readme-ov-file#one-line-output) to get a sense of the format options, and the remainder of its [README.md](https://github.com/chubin/wttr.in/blob/master/README.md) for language and location hints.

## Known Issues

None at this time, but always with the caveat that this extension relies on a third party weather service and cannot control the availability and  accuracy of this service.

If the weather service becomes permanently unavailable to this extension, an alternative may be implemented or this extension will be deprecated.

The configuration settings for location and information to display are not validated by this extension as they are provided, and validated, by the weather service itself.

If, for any reason, the call to the weather service fails, whether it is because the service is temporarily unavailable or the configuration settings are invalid, then the display will change to 'n/a' and the tooltip will display any error message obtained.

## Release Notes

* The extension is automatically activated when it is installed and when VS Code is launched
* The information displayed can be configured in settings
* The information is updated every hour. This is currently not configurable
* A message can be displayed whenever the information is updated
* A language can be configured to cater for location that cannot be identified in English 

### 0.1.0

Initial release of the weather status extension

### 0.1.1

Documentation updates
