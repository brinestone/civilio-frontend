# CIVILIO
Client desktop application for civil status

## Feedback & Reporting
- Click [here](https://brinestone.atlassian.net/jira/software/projects/CI/form/1?atlOrigin=eyJpIjoiOTgyMjM2NDZmYTNlNDcwMWI0YjFhZTk4NDMzNjQyNmQiLCJwIjoiaiJ9) to report a bug spotted.
- Click [here](https://brinestone.atlassian.net/jira/software/projects/CI/form/2?atlOrigin=eyJpIjoiM2Y2YzY0M2M4MTc0NDk3YWE1NmYyYWQxN2EyMjk1YzYiLCJwIjoiaiJ9) to request a feature to be added.

## Development

### Prerequisites
Use an SDK Manager such as [VersionFox](https://github.com/version-fox/vfox) to install the correct development tools you will need for this project such as Gradle and Jdk. The SDKs are listed in the `.tool-versions` file.

### Running the application
- You can either run the application using the Gradle CLI like below
    ```bash
    gradle run
    ```
- You can run it from your IDE using the `run` Gradle task.

## Building Executable
To build the executable installer, you have to run the following Gradle task
```bash
gradle jpackage
```
> **NOTE**: For Windows users, you must have the [WixToolset](https://github.com/wixtoolset/wix3/releases/tag/wix3141rtm) installed on your
> system.

## Translation
Translation can be automatically done using the `translate.mjs` file, to generate localized strings (translations) in other languages.
### Examples
- Translating to french
    ```bash
    node translate.mjs en fr
    ```
- Translating to french and spanish
    ```bash
    node translate.mjs fr es
    ```
> **NOTE**: The locale must be in **ISO 639** format