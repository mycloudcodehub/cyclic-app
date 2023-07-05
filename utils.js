// utils.js to use in package.json ->

let package = {
  scripts: {
    myScript: "node -r ./utils.js -e 'require(\"./utils\").myScript()'",
    "my-script":
      "node myScript.js ${npm_package_script_arg1} ${npm_package_script_arg2}",
  },
};

// =============================================

// const name = await prompt('Enter your name: ');
// console.log(`Hello, ${name}!`);

const util = require("util");
const fs = require("fs");
const readline = require("readline");
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const exec = util.promisify(require("child_process").exec);

async function runCommand(command, options = {}) {
  const { cwd, stdio = "inherit" } = options;
  try {
    const { stdout } = await exec(command, { cwd, stdio });
    return stdout.trim();
  } catch (error) {
    throw new Error(`Command execution failed: ${error.message}`);
  }
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function hasChangesInSrcFront() {
  const output = await runCommand("git diff --name-only --cached", {
    encoding: "utf8",
  });
  const modifiedFiles = output.split("\n").filter(Boolean);

  return modifiedFiles.some((file) => file.startsWith("src-front/"));
}

async function runQuasarBuild() {
  if (hasChangesInSrcFront()) {
    try {
      console.log("Running Quasar build...");
      await runCommand("quasar build", { cwd: "src-front" });
      console.log("Quasar build completed successfully.");
    } catch (error) {
      console.error("Quasar build failed:", error);
      throw error;
    }
  } else {
    console.log(
      "No changes detected in src-front folder. Skipping Quasar build."
    );
  }
}

async function incrementVersion(packageJsonPath) {
  try {
    // Read package.json
    const packageJson = await readFileAsync(packageJsonPath, "utf8");
    const data = JSON.parse(packageJson);

    // Increment the version
    const [major, minor, patch] = data.version.split(".");
    const newVersion = `${major}.${minor}.${parseInt(patch) + 1}`;

    // Update the package.json with the new version
    data.version = newVersion;
    await writeFileAsync(
      packageJsonPath,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    console.log(`Package version incremented to ${newVersion}`);
    return newVersion;
  } catch (error) {
    console.error("Error incrementing package version:", error);
    throw error;
  }
}

async function buildAddCommitVersioningPush() {
  try {
    const statusOutput = await runCommand("git status --porcelain");
    if (!statusOutput) {
      console.log("No changes to commit.");
      return;
    }
    // run quasar build

    await runQuasarBuild();

    const packageJsonPath = "./package.json";
    const newVersion = incrementVersion(packageJsonPath);
    console.log(`Version incremented to ${newVersion}`);

    await runCommand("git add -A");

    const modifiedFiles = await runCommand(
      "git diff --name-only --diff-filter=M"
    );
    const deletedFiles = await runCommand(
      "git diff --name-only --diff-filter=D"
    );
    const addedFiles = await runCommand("git diff --name-only --diff-filter=A");
    const createdFiles = await runCommand(
      "git ls-files --others --exclude-standard"
    );

    const filesMessage = [];
    if (modifiedFiles) {
      filesMessage.push("Modified files:\n" + modifiedFiles);
    }
    if (deletedFiles) {
      filesMessage.push("Deleted files:\n" + deletedFiles);
    }
    if (addedFiles) {
      filesMessage.push("Added files:\n" + addedFiles);
    }
    if (createdFiles) {
      filesMessage.push("Created files:\n" + createdFiles);
    }

    const message = await prompt("Enter Commit Msg: ");
    const formatMsg = `Update #${newVersion}: ${message}`;

    const commitMessage = `${formatMsg}\n\n${filesMessage.join("\n\n")}`;
    const commitCommand = `git commit -m "${commitMessage}"`;
    await runCommand(commitCommand);

    const tagCommand = `git tag -a ${newVersion} -m "${newVersion}"`;
    await runCommand(tagCommand);

    console.log("Git commit and tag completed successfully.");
  } catch (error) {
    console.error("Git commit and tag failed:", error);
  }
}

module.exports = { buildAddCommitVersioningPush };
