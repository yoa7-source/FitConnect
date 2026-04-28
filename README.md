# FitConnect

## Project Overview
FitConnect is a full-stack fitness web application that allows users to create accounts and log in to access workout features.

## Tech Stack
- Frontend: HTML, CSS (Apache)
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: bcrypt password hashing
- Infrastructure: VMware VMs on VLAN

## VM Architecture

- Frontend VM
  - Serves website using Apache
  - Only VM with internet access

- Backend VM
  - Runs Node.js + Express API
  - Handles login and register requests

- Database VM
  - Runs MongoDB
  - Stores user data securely

## Features Implemented (Milestone 2)

- User Registration
- User Login
- Password Hashing (bcrypt)
- API communication between frontend and backend
- MongoDB database storage
- VLAN networking between VMs
- UFW firewall rules for security

## How to Run

### Backend
```bash
cd backend
npm install
node server.js
