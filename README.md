# Ooga Frontend

This is the frontend for the Ooga programming language playground. It provides a web-based interface for writing, executing, and debugging Ooga code.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Editor Mode](#editor-mode)
  - [Debug Mode](#debug-mode)
  - [Guide Mode](#guide-mode)
- [Project Structure](#project-structure)
- [Components](#components)
  - [MonacoEditor](#monacoeditor)
  - [MonacoOutput](#monacooutput)
  - [ReactFlowStackView](#reactflowstackview)
  - [ReactFlowHeapView](#reactflowheapview)

## Features

- Monaco-based code editor with syntax highlighting and code completion for the Ooga language
- Integrated output panel to display program output and error messages
- Debugging mode with breakpoints and visualization of runtime state
  - Stack view showing operand stack and runtime stack for each goroutine
  - Heap view displaying heap state at each breakpoint
- User-friendly guide providing an introduction to the Ooga language and playground features

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/CS4215-OOGA/ooga-frontend.git
```

2. Install dependencies:

```bash
cd ooga-frontend
npm install
```

3. Start the development server:

```bash
npm run dev
```

This will start the frontend on http://localhost:3000.

Note: Make sure the [ooga-lang](https://github.com/CS4215-OOGA/ooga-lang) server is running on http://localhost:3001 for the frontend to communicate with the backend.

## Usage

### Editor Mode

In the editor mode, you can write Ooga code in the Monaco-based editor. The editor provides syntax highlighting and code completion for the Ooga language.

- To run your code, click the "Run" button or press Shift + Enter.
- To open an existing Ooga file, click the "Open File" button and select the file.
- To save your code to a file, click the "Save to File" button.

### Debug Mode

In Ooga code, you can set breakpoints in your code by adding the `breakpoint;` statement. When you run the code with breakpoints, the execution will return the state of the stacks and heap at each breakpoint, allowing you to inspect the runtime state.

- The stack view displays the operand stack and runtime stack for each goroutine. The current thread is highlighted in yellow.
- The heap view shows the heap state at the current breakpoint. Clicking on a node in the heap view will highlight it in blue, its parents recursively in green, and its children recursively in red.

Use the breakpoint navigation buttons to step through the breakpoints.

### Guide Mode

The guide mode provides a user-friendly introduction to the Ooga language and the features of the playground. It covers topics such as setting breakpoints, understanding the stack and heap visualizations, and using the standard library functions.

## Project Structure

The project is structured as follows:

```

src
├── app
│ ├── favicon.ico
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
└── components
├── MonacoEditor.tsx
├── MonacoOutput.tsx
├── ReactFlowHeapView.tsx
└── ReactFlowStackView.tsx

```

- The `app` directory contains the main application layout and global styles.
- The `components` directory contains the individual components used in the playground.

## Components

### MonacoEditor

The `MonacoEditor` component provides a Monaco-based code editor for writing Ooga code. It supports syntax highlighting, code completion, and setting breakpoints.

### MonacoOutput

The `MonacoOutput` component displays the output of the executed Ooga code, including any error messages.

### ReactFlowStackView

The `ReactFlowStackView` component visualizes the operand stack and runtime stack for each goroutine using ReactFlow. It highlights the current thread and allows interaction with the stack elements.

### ReactFlowHeapView

The `ReactFlowHeapView` component visualizes the heap state at each breakpoint using ReactFlow. It allows users to explore the heap by clicking on nodes, which highlights the node, its parents, and its children.
