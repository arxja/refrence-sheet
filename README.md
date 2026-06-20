# Reference Sheet CLI Tool

> A simple yet powerful CLI tool for developers who want quick access to their reference notes directly from VS Code.

## 🤔 The Problem It Solves

As developers, we all face the same daily struggle:

- **Implementation details** - "What was that specific API endpoint format?"
- **Concept details** - "Wait, what's the difference between == and === in JavaScript again?"
- **Reusing code blocks** - "I wrote this perfect function last month, where is it?"

We spend way too much time context-switching between:

1. Our code editor
2. A markdown editor
3. Our note-taking app
4. The browser (re-Googling the same things every week)

## 💡 The Solution

- refrence-sheet (or just ref) lets you:
- Keep all your reference notes as markdown files right inside your project
- Access them instantly from your terminal
- Open them directly in VS Code (where you're already working)
- Create new notes with templates
- Search and browse through your notes without leaving your workflow

## 🚀 Installation

```bash
npm install -g refrence-sheet
```

or if you want to use it as a project dependency:

```bash
npm install --save-dev refrence-sheet
```

## 📚 Usage

```bash
# Browse notes interactively
ref browse

# List all available notes
ref list

# Open a specific note by name
ref open git-commands

# Search for notes by keyword
ref search docker

# Create a new note
ref new "react-hooks-cheatsheet"

# Create with a detailed template
ref new "aws-cli-tips" --template detailed

# Create and open immediately
ref new "vscode-shortcuts" --open
```

## All Options

```bash
ref [command] [options]

Commands:
  list, l        List all available reference notes
  open, o        Open a specific note in VS Code
  browse, b      Interactive browse and select notes
  search, s      Search notes by keyword
  new, n         Create a new markdown note
  help           Display help

New Note Options:
  -t, --template <template>   Template to use (default|empty|detailed)
  -f, --force                 Overwrite existing file
  -o, --open                  Open after creation
  --no-open                   Don't open after creation
```

## 🎯 Examples

```bash
# Interactive browse - perfect for when you can't remember the exact name
ref browse

# Quick open
ref open git

# Search for anything related to docker
ref search docker

# Create a new cheatsheet
ref new "linux-commands" --template detailed

# View help
ref --help
```

## 📁 Notes Structure

Notes are stored as markdown files in the `notes/` directory. Each note can be structured however you like, with included templates for:

- **Default**: Simple structure with sections for overview, key points, and references
- **Detailed**: More structured with metadata, action items, and related notes
- **Empty**: Just the title - you build it from scratch

## 🎨 Features

- **VS Code Integration**: Opens notes right in your editor with the `code` command
- **Interactive Browsing**: Numbered selection for quick access
- **Search**: Find notes by keyword
- **Templates**: Pre-built templates for consistent note-taking
- **Smart Matching**: Open notes with partial names (e.g., `ref open git` matches `git-commands.md`)
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🔧 Setup Notes

For the `open` command to work, make sure you have the VS Code CLI command available:

1. Open VS Code
2. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
3. Search for "Shell Command: Install 'code' command in PATH"
4. Click to install

## 📝 Why I Made This

got tired of:

- Opening separate markdown editors
- Leaving my IDE to check syntax
- Re-Googling the same things
- Not having a quick way to access my own pre-written solutions
- Keeping track of scattered notes across multiple apps
Now, when I need to check my Git cheatsheet, Docker commands, or React patterns, I just type `ref open git` and I'm right in my notes, inside VS Code.

