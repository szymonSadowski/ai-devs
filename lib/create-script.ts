import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { exec } from "child_process";

// Extract argument
const [folderName] = process.argv.slice(2);
const scriptName = folderName.includes("_")
  ? folderName.split("_")[1]
  : folderName; // Use the second part after '_' or the whole name

// File content using `scriptName` dynamically
const fileContent = `
import { useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type ${scriptName[0].toUpperCase() + scriptName.slice(1)} = TaskType & {
  
};

const ${scriptName} = async () => {
    const data = await useTaskData<${scriptName[0].toUpperCase() + scriptName.slice(1)}>("${scriptName}");
    console.log(data)
    if(!data) return
    try {
      
    } catch (error) {
      console.error("Something went wrong", error);
    }
}

${scriptName}();
`;

// Check if the folder already exists
if (!existsSync(folderName)) {
  // Create folder and file with dynamic content
  mkdirSync(folderName, { recursive: true });
  writeFileSync(`${folderName}/index.ts`, fileContent);

  // Update package.json
  const packagePath = "./package.json";
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  const scriptKey = folderName.split("_")[0]; // Extract the script key (e.g., '11' from '11_whoami')
  packageJson.scripts[scriptKey] = `bun ${folderName}/index.ts`;

  // Write changes
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  // Format package.json (optional)
  exec("npm run format");
} else {
  console.log("Folder already exists.");
}
