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

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
};

async function runCommand(command, options = {}) {
  const { cwd, stdio = "pipe" } = options;
  try {
    const { stdout, stderr } = await exec(command, { cwd, stdio });
    if (stdio === "inherit") {
      process.stdout.write(stdout);
      process.stderr.write(stderr);
    }
    return stdout.trim();
  } catch (error) {
    throw new Error(`Command execution failed: ${error.message}`);
  }
}

async function prompt(question) {
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
  const changedYesNo = await hasChangesInSrcFront();
  if (changedYesNo) {
    try {
      console.log(`${colors.green}Running Quasar build...${colors.reset}`);
      await runCommand("quasar build", { cwd: "src-front" });
      console.log(
        `${colors.green}Quasar build completed successfully.${colors.reset}`
      );
    } catch (error) {
      console.error(`${colors.red}Quasar build failed:${colors.reset}`, error);
      throw error;
    }
  } else {
    console.log(
      `${colors.green}No changes detected in src-front folder. Skipping Quasar build.${colors.reset}`
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

    console.log(
      `${colors.green}Package version incremented to ${newVersion}${colors.reset}`
    );
    return newVersion;
  } catch (error) {
    console.error(
      `${colors.red}Error incrementing package version:${colors.reset}`,
      error
    );
    throw error;
  }
}

async function buildAddCommitVersioningPush() {
  try {
    const statusOutput = await runCommand("git status --porcelain");
    if (!statusOutput) {
      console.log(`${colors.green}No changes to commit.${colors.reset}`);
      return;
    }
    // run quasar build

    await runQuasarBuild();

    const packageJsonPath = "./package.json";
    const newVersion = await incrementVersion(packageJsonPath);

    await runCommand("git add -A");

    const modifiedFiles = await runCommand(
      "git diff --name-only --diff-filter=M --cached"
    );
    const deletedFiles = await runCommand(
      "git diff --name-only --diff-filter=D --cached"
    );
    const addedFiles = await runCommand(
      "git diff --name-only --diff-filter=A --cached"
    );
    // const createdFiles = await runCommand(
    //   "git ls-files --others --exclude-standard --cached"
    // );

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
    // if (createdFiles) {
    //   filesMessage.push("Created files:\n" + createdFiles);
    // }

    const message = await prompt(
      `${colors.green}Enter Commit Msg: ${colors.reset}`
    );
    const formatMsg = `Update #${newVersion} : ${message}`;

    const commitMessage = `${formatMsg}\n\n${filesMessage.join("\n\n")}`;
    const commitCommand = `git commit -m "${commitMessage}"`;
    await runCommand(commitCommand);

    const tagCommand = `git tag -a ${newVersion} -m "${newVersion}"`;
    await runCommand(tagCommand);

    console.log(
      `${colors.green}Git commit and tag completed successfully.${colors.reset}`
    );

    await runCommand(`git push origin master --follow-tags`, {stdio:"inherit"});

    console.log(
      `${colors.green}'Git push origin master' completed successfully.${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}Git commit and tag failed:${colors.reset}`,
      error
    );
  }
}

module.exports = { buildAddCommitVersioningPush };
