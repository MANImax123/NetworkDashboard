#!/bin/bash

echo "========================================"
echo "Network Performance Monitor Setup"
echo "========================================"

echo ""
echo "Setting up Python backend..."
cd backend

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "========================================"
echo "Backend setup complete!"
echo "========================================"

echo ""
echo "Setting up Node.js frontend..."
cd ../frontend

echo "Installing Node.js dependencies..."
npm install

echo ""
echo "========================================"
echo "Frontend setup complete!"
echo "========================================"

echo ""
echo "========================================"
echo "Setup Instructions:"
echo "========================================"
echo "1. Start the backend server:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo "========================================"