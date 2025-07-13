#!/bin/bash
echo "🚀 Installing SuperClaude MCP Servers..."

# Context7
echo "📚 Installing Context7..."
claude mcp add context7 -- npx -y @upstash/context7-mcp

# Sequential Thinking  
echo "🧠 Installing Sequential Thinking..."
claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking

# Puppeteer
echo "🌐 Installing Puppeteer..."
claude mcp add puppeteer -s user -- npx -y @modelcontextprotocol/server-puppeteer

# Magic UI (optional)
echo "✨ Installing Magic UI..."
claude mcp add magic-ui -- npx -y @magicuidesign/mcp@latest

# Verify installation
echo "✅ Verifying installation..."
claude mcp list

echo "🎉 MCP servers installed successfully!"