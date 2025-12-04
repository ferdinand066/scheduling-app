#!/bin/bash

# create a new database
echo "Creating database..."
createdb staffany

# create a new user with password
echo "Creating user..."
psql -c "CREATE USER staffany_admin WITH PASSWORD 'assignment';"

# grant privileges to the user
echo "Granting privileges..."
psql -c "GRANT ALL PRIVILEGES ON DATABASE staffany TO staffany_admin;"

# Note: since current project use public schema, we need to grant access to its public schema
psql -c "GRANT ALL PRIVILEGES ON SCHEMA public TO staffany_admin;"
psql -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO staffany_admin;"
psql -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO staffany_admin;"

echo "Database and user created successfully."
