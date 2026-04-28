

# FitConnect Milestone 2 Notes

## VM Architecture

- VM1 Frontend: Apache web server
  - VLAN IP: 10.0.0.x
  - Serves HTML, CSS, and JavaScript frontend pages

- VM2 Backend: Node.js and Express
  - VLAN IP: 10.0.0.x
  - Handles register and login API requests

- VM3 Database: MongoDB
  - VLAN IP: 10.0.0.x
  - Stores user account data

## Network Design

All VMs are connected through VMware VMnet2 as a private VLAN.

Only the Frontend VM has public/NAT internet access. Backend and Database are private.

## Authentication

The frontend sends register and login requests to:

- http://10.0.0.x:3000/api/register
- http://10.0.0.x:3000/api/login

The backend stores user data in MongoDB.

## Password Security

Passwords are hashed with bcrypt before being saved to the database.

Plain text passwords are never stored.

## Database

MongoDB database name:

fitconnect

Collection:

users

## Firewall Rules

Frontend VM:
- Allows port 22 for SSH
- Allows port 80 for Apache HTTP

Backend VM:
- Allows port 22 for SSH
- Allows port 3000 only from Frontend VM 10.0.0.x

Database VM:
- Allows port 22 for SSH
- Allows port 27017 only from Backend VM 10.0.0.x

## Milestone 2 Test

1. Open frontend website.
2. Register a new account.
3. Login with the same account.
4. Verify the user exists in MongoDB.
5. Confirm the password is hashed.
