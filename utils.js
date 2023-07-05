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





const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const readline = require("readline");


async function runCommand(command) {
  try {
    const { stdout } = await exec(command);
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

async function runQuasarBuild() {
    try {
      console.log('Running Quasar build...');
      await exec('quasar build');
      console.log('Quasar build completed successfully.');
    } catch (error) {
      console.error('Quasar build failed:', error);
      throw error;
    }
  }

function incrementVersion(packageJsonPath) {
  const packageJson = require(packageJsonPath);
  const versionParts = packageJson.version.split('.');
  versionParts[2] = parseInt(versionParts[2], 10) + 1;
  packageJson.version = versionParts.join('.');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  return packageJson.version;
}

async function gitCommit(message) {
  try {
    const statusOutput = await runCommand('git status --porcelain');
    if (!statusOutput) {
      console.log('No changes to commit.');
      return;
    }

    const packageJsonPath = './package.json';
    const newVersion = incrementVersion(packageJsonPath);
    console.log(`Version incremented to ${newVersion}`);

    await runCommand('git add -A');

    const modifiedFiles = await runCommand('git diff --name-only --diff-filter=M');
    const deletedFiles = await runCommand('git diff --name-only --diff-filter=D');
    const addedFiles = await runCommand('git diff --name-only --diff-filter=A');
    const createdFiles = await runCommand('git ls-files --others --exclude-standard');

    const filesMessage = [];
    if (modifiedFiles) {
      filesMessage.push('Modified files:\n' + modifiedFiles);
    }
    if (deletedFiles) {
      filesMessage.push('Deleted files:\n' + deletedFiles);
    }
    if (addedFiles) {
      filesMessage.push('Added files:\n' + addedFiles);
    }
    if (createdFiles) {
      filesMessage.push('Created files:\n' + createdFiles);
    }

    const commitMessage = `${message}\n\n${filesMessage.join('\n\n')}`;
    const commitCommand = `git commit -m "${commitMessage}"`;
    await runCommand(commitCommand);

    const tagCommand = `git tag -a ${newVersion} -m "${newVersion}"`;
    await runCommand(tagCommand);

    console.log('Git commit and tag completed successfully.');
  } catch (error) {
    console.error('Git commit and tag failed:', error);
  }
}

// Example usage:
async function main() {
  try {
    await gitCommit('Update features');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
