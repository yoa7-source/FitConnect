
# FitConnect

FitConnect is a full-stack fitness community web application built using a multi-VM architecture.

## Features

- User registration and login
- Password hashing using bcrypt
- Multi-factor authentication (MFA)
- Workout routine builder
- AI-style workout routine assistant
- User search
- Exercise search API
- Progress tracking charts
- Comment system
- Admin dashboard
- Authentication logging
- Firewall-protected VM architecture

## Architecture

Frontend VM:
- Apache
- HTML/CSS/JavaScript

Backend VM:
- Node.js
- Express.js

Database VM:
- MongoDB

## Security Features

- Password hashing
- MFA
- Input sanitization
- Firewall rules using UFW
- Authentication logging

## Network

Frontend VM: 10.0.0.x
Backend VM: 10.0.0.x
Database VM: 10.0.0.x
Logging VM: 10.0.0.x

## Ports

- 80 → Frontend
- 3000 → Backend API
- 27017 → MongoDB

## Running the Project

### Database VM

```bash
sudo systemctl start mongod
