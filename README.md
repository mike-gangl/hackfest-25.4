# 25.4 Hackfest 🎉

The theme for the PI 25.4 is AI. This repository provides infrastructure to set
up a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro)
server, and a simple web UI to interact with that server. The starter
template is configured to take input and perform a CMR collection search using
[earthaccess](https://earthaccess.readthedocs.io/en/stable/).

## Provided Technology

This section outlines the technology we've configured for you.

1. [FastMCP](https://gofastmcp.com/getting-started/welcome) ( [Python](https://github.com/jlowin/fastmcp) | [Node](https://github.com/punkpeye/fastmcp) )
2. [React Based Chat Interface](https://react.dev/)

---

## How to use the starter template

This section has all the steps to run the example template and see all the required technology in action. You **don’t have to use it**—it’s for inspiration or guidance. 

Clone the repository to your local environment

```
git clone ssh://git@git.earthdata.nasa.gov:7999/ea/hackfest-25.4.git
```

### 1️⃣ Choose your MCP implementation

#### </> NodeJS

##### Install NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

```bash
cd mcp/fastmcp-node
nvm use
```

##### Install packages with nvm

```bash
npm install
```

##### Run MCP Server

```bash
npm run dev
```

#### 🐍 Python

##### Install uv

```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

```
cd mcp/fastmcp-python

uv venv
source .venv/bin/activate
```

##### Install packages with uv

```
uv sync
```

##### Run MCP Server

```bash
python server.py
```

### 2️⃣ Run the chat client

#### Install NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

```bash
cd agent
nvm use
```

#### Install packages with nvm

```bash
npm install
```

```bash
npm run dev
```
