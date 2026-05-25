#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTES_DIR = path.join(__dirname, "notes");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => {
    rl.question(query, resolve);
  });

program
  .name("ref")
  .description("📚 CLI tool to browse and open reference notes in VS Code")
  .version("1.0.0");

// List all available notes
program
  .command("list")
  .alias("l")
  .description("List all available reference notes")
  .action(() => {
    const notes = getMarkdownFiles();

    if (notes.length === 0) {
      console.log(
        chalk.yellow("⚠️  No markdown files found in the notes folder"),
      );
      console.log(chalk.gray(`   Create .md files in: ${NOTES_DIR}`));
      return;
    }

    console.log(chalk.green.bold("\n📚 Available Reference Notes:\n"));
    notes.forEach((note, index) => {
      console.log(chalk.cyan(`  ${index + 1}. ${note.name}`));
      console.log(chalk.gray(`     📁 ${note.path}`));
    });
    console.log(
      chalk.gray(
        `\n💡 Run ${chalk.white("ref open <name>")} or ${chalk.white("ref browse")} to open a note\n`,
      ),
    );

    rl.close();
  });

// Open a specific note by name
program
  .command("open <noteName>")
  .alias("o")
  .description("Open a specific reference note in VS Code")
  .action(async (noteName) => {
    const notes = getMarkdownFiles();
    const match = notes.find(
      (n) =>
        n.name.toLowerCase() === noteName.toLowerCase() ||
        n.name.toLowerCase().includes(noteName.toLowerCase()),
    );

    if (!match) {
      console.log(chalk.red(`❌ Note "${noteName}" not found`));
      console.log(chalk.gray('Run "ref list" to see available notes'));
      rl.close();
      return;
    }

    await openInVSCode(match.fullPath);
    rl.close();
  });

// Interactive browse - simple numbered selection
program
  .command("browse")
  .alias("b")
  .description("Interactive browse and select notes")
  .action(async () => {
    const notes = getMarkdownFiles();

    if (notes.length === 0) {
      console.log(chalk.yellow("⚠️  No markdown files found"));
      console.log(chalk.gray(`Create notes in: ${NOTES_DIR}`));
      rl.close();
      return;
    }

    console.log(chalk.green.bold("\n📖 Available Notes:\n"));
    notes.forEach((note, index) => {
      console.log(
        chalk.cyan(
          `  ${index + 1}. ${chalk.white(note.name)} ${chalk.gray(`(${formatFileSize(note.size)})`)}`,
        ),
      );
    });

    const answer = await question(
      chalk.blue("\n📝 Enter number to open (or q to quit): "),
    );

    if (answer.toLowerCase() === "q") {
      console.log(chalk.gray("👋 Goodbye!"));
      rl.close();
      return;
    }

    const num = parseInt(answer);
    if (isNaN(num) || num < 1 || num > notes.length) {
      console.log(chalk.red("❌ Invalid selection"));
      rl.close();
      return;
    }

    await openInVSCode(notes[num - 1].fullPath);
    rl.close();
  });

// Search notes by keyword
program
  .command("search <keyword>")
  .alias("s")
  .description("Search notes by keyword and open selected")
  .action(async (keyword) => {
    const notes = getMarkdownFiles();
    const matches = notes.filter((note) =>
      note.name.toLowerCase().includes(keyword.toLowerCase()),
    );

    if (matches.length === 0) {
      console.log(chalk.yellow(`🔍 No notes found matching "${keyword}"`));
      rl.close();
      return;
    }

    console.log(chalk.green(`\n🔍 Found ${matches.length} note(s):\n`));
    matches.forEach((note, index) => {
      console.log(chalk.cyan(`  ${index + 1}. ${chalk.white(note.name)}`));
    });

    const answer = await question(chalk.blue("\n📝 Select number to open: "));
    const num = parseInt(answer);

    if (isNaN(num) || num < 1 || num > matches.length) {
      console.log(chalk.red("❌ Invalid selection"));
      rl.close();
      return;
    }

    await openInVSCode(matches[num - 1].fullPath);
    rl.close();
  });

// Create a new note
program
  .command("new <noteName>")
  .alias("n")
  .description("Create a new markdown note")
  .option(
    "-t, --template <template>",
    "Template to use (default|empty|detailed)",
  )
  .option("-f, --force", "Overwrite existing file")
  .option("-o, --open", "Open after creation", false)
  .option("--no-open", "Don't open after creation")
  .action(async (noteName, options) => {
    if (!noteName.endsWith(".md")) {
      noteName += ".md";
    }

    const notePath = path.join(program.opts().dir || NOTES_DIR, noteName);

    if ((await fs.pathExists(notePath)) && !options.force) {
      process.exit(1);
    }

    await fs.ensureDir(path.dirname(notePath));

    // Template selection
    let template;
    switch (options.template) {
      case "empty":
        template = `# ${noteName.replace(".md", "")}`;
        break;
      case "detailed":
        template = getDetailedTemplate(noteName.replace(".md", ""));
        break;
      default:
        template = getDefaultTemplate(noteName.replace(".md", ""));
    }

    await fs.writeFile(notePath, template, "utf8");

    console.log(chalk.green(`✅ Created new note: ${noteName}`));

    if (options.open !== false) {
      await openInVSCode(notePath);
    }

    rl.close();
  });

// Default command - show help
program.action(() => {
  console.log(chalk.gray("\n📚 Reference CLI Tool\n"));
  console.log(chalk.white("Commands:"));
  console.log(
    chalk.cyan("  ref browse") + chalk.gray("     - Interactive browse notes"),
  );
  console.log(chalk.cyan("  ref list") + chalk.gray("       - List all notes"));
  console.log(
    chalk.cyan("  ref open <name>") + chalk.gray("  - Open specific note"),
  );
  console.log(
    chalk.cyan("  ref search <keyword>") + chalk.gray("- Search notes"),
  );
  console.log(
    chalk.cyan("  ref new <name>") + chalk.gray("    - Create new note"),
  );
  console.log(chalk.gray("\n💡 Examples:"));
  console.log(chalk.gray("  ref open git"));
  console.log(chalk.gray("  ref search docker"));
  console.log(chalk.gray('  ref new "react-tips"\n'));
  rl.close();
});

// Helper function to get all markdown files
function getMarkdownFiles() {
  if (!fs.existsSync(NOTES_DIR)) {
    return [];
  }

  const files = fs.readdirSync(NOTES_DIR);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  return mdFiles.map((file) => {
    const fullPath = path.join(NOTES_DIR, file);
    const stats = fs.statSync(fullPath);
    return {
      name: file.replace(".md", ""),
      fullPath: fullPath,
      path: fullPath,
      size: stats.size,
      modified: stats.mtime,
    };
  });
}

// Helper to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// Helper to open file in VS Code
async function openInVSCode(filePath) {
  try {
    console.log(
      chalk.blue(
        `\n📂 Opening ${chalk.white(path.basename(filePath))} in VS Code...`,
      ),
    );

    let command;
    if (process.platform === "win32") {
      command = `code "${filePath}"`;
    } else if (process.platform === "darwin") {
      command = `code "${filePath}"`;
    } else {
      command = `code "${filePath}"`;
    }

    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    await execAsync(command);
    console.log(chalk.green("✅ Opened in VS Code\n"));
  } catch (error) {
    console.log(
      chalk.red(
        '\n❌ Failed to open VS Code. Make sure "code" command is available.\n',
      ),
    );
    console.log(
      chalk.gray(
        "💡 Fix: In VS Code, press Ctrl+Shift+P, search for \"Shell Command: Install 'code' command in PATH\"\n",
      ),
    );
  }
}

function getDefaultTemplate(name) {
  return `# ${name}

## 📝 Overview
Add your notes here...

## 🔑 Key Points
- 

## 📚 References
- 

---
Created: ${new Date().toLocaleDateString()}
`;
}

function getDetailedTemplate(name) {
  return `# ${name}

## 📋 Metadata
- Created: ${new Date().toLocaleDateString()}
- Tags: 
- Priority: 

## 🎯 Overview
Brief description of what this note covers.

## 📝 Detailed Notes
Write your detailed notes here.

## ✅ Action Items
- [ ] 

## 🔗 Related Notes
- 

## 📚 References
- 

---
Last Updated: ${new Date().toLocaleDateString()}
`;
}

program.parse();
