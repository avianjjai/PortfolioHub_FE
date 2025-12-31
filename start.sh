#!/bin/bash
# Frontend Development Server Startup Script

cd "$(dirname "$0")"

echo "🚀 Starting Portfolio Frontend Development Server..."
echo "📍 Frontend will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
