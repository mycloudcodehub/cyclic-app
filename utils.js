// utils.js to use in package.json ->

let package = {
  scripts: {
    myScript: "node -r ./utils.js -e 'require(\"./utils\").myScript()'",
    "my-script":
      "node myScript.js ${npm_package_script_arg1} ${npm_package_script_arg2}",
  },
};

// =============================================
const readline = require("readline");
const { exec } = require("child_process");
const fs = require("fs");
const semver = require("semver");

// const name = await prompt('Enter your name: ');
// console.log(`Hello, ${name}!`);
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

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error occurred while running command: ${error.message}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}

async function version(type = "patch") {
  if (fs.existsSync("./package.json")) {
    var package = require("./package.json");
    let currentVersion = package.version;
    let newVersion = semver.inc(package.version, type);
    package.version = newVersion;
    fs.writeFileSync("./package.json", JSON.stringify(package, null, 2));

    console.log("Version updated", currentVersion, "=>", newVersion);
  }
}

async function getModifiedFiles() {
    const command = 'git diff --name-only --cached';
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error occurred while retrieving modified files: ${error.message}`);
          reject(error);
        } else {
          const files = stdout.trim().split('\n');
          resolve(files);
        }
      });
    });
  }
  
  async function gitCommit(message) {
    try {
      const modifiedFiles = await getModifiedFiles();
      const filesMessage = modifiedFiles.length > 0 ? `\n\nModified files:\n${modifiedFiles.join('\n')}` : '';
      const commitMessage = `${message}${filesMessage}`;
    //   const command = `git commit -m "${commitMessage}"`;
    //   await runCommand(command);
      console.log(commitMessage);
    } catch (error) {
      console.error('Git commit failed:', error);
    }
  }

async function commit() {
  const message = await prompt("Enter Commit Msg: ");

  const command = `git commit -m "${message}"`;
  try {
    await runCommand(command);
    console.log("Git commit completed successfully.");
  } catch (error) {
    console.error("Git commit failed:", error);
  }
}

async function add() {
  const command = `git add .`;
  try {
    await runCommand(command);
    console.log("Git commit completed successfully.");
  } catch (error) {
    console.error("Git commit failed:", error);
  }
}

// Export the functions
module.exports = {
  version,
  commit,
  add,
  prompt,
  runCommand,
  gitCommit
};
