const readline = require("readline-sync");
const fs = require("fs-extra");

const types = ["FormApplication", "Application"];

const boilerplates = {
    FormApplication: "DocumentFormApp",
    Application: "BasicApplication",
};

function createApplication(type, name) {
    // Type 1: FormApplication, 2: Application, 3: Menu
    const selectedType = types.includes(type) ? type : types[type - 1];
    console.log(`Creating ${selectedType} ${name}...`);
    const slugifiedName = name.split(/(?=[A-Z])/).join('-').toLowerCase();
    const appFolderPath = "scripts/app";
    const templatesFolderPath = "templates";

    // Check if the app folder already exists
    if (fs.existsSync(`${appFolderPath}/${slugifiedName}`)) {
        console.error(`Error: The folder ${appFolderPath}/${slugifiedName} already exists.`);
        return;
    }

    // Copy DocumentFormApp.js to scripts/app/{name}.js
    fs.copySync(`boilerplate/${boilerplates[selectedType]}.js`, `${appFolderPath}/${name}.js`);

    // Read the copied file and replace occurrences of "DocumentFormApp" with the application name
    const filePath = `${appFolderPath}/${name}.js`;
    let fileContent = fs.readFileSync(filePath, "utf-8");
    fileContent = fileContent.replace(boilerplates[selectedType], name);
    fs.writeFileSync(filePath, fileContent);

    // Create an empty .hbs file in the templates folder
    fs.writeFileSync(`${templatesFolderPath}/${slugifiedName}.hbs`, "");

    console.log(`${selectedType} ${name} created successfully.`);
}

// Extract the command-line arguments
const args = process.argv.slice(2);

// If no arguments are provided, ask for type and name
if (args.length === 0) {
    const type = readline.question("Enter the type of application (1 for FormApplication, 2 for Application): ");
    const name = readline.question("Enter the application name: ");

    createApplication(type, name);
} else {
    // Check if the command is "create FormApplication"
    if (args.length === 2) {
        createApplication(args[0], args[1]);
    } else {
        console.error("Invalid command. Usage: create FormApplication {name}");
    }
}
