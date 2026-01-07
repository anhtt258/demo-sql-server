# 1. Prepaire SQL Server Database (PORT 1433)
Install SQL Server
Connect to SQL Server by SSMS
run sql command in "sql-server-database.sql"

# 2. Start server (PORT 3000)
cd backend
npm install
## Edit ".env" with your SQL Server network connection parameters
npm start

# 3. Start frontend (Port default by "Live Server")
In VSCode Extensions - install "Live Server"
Open "index.html" > run with "Live Server" (Go Live)
