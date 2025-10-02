# Login_Backend/setupDB.py

import mysql.connector

try:
    # Using the credentials from your previous files.
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="avi691610",
        database="student_db"
    )
    cursor = db.cursor()

    # This will delete the old users table to add the new columns.
    cursor.execute("DROP TABLE IF EXISTS users")

    # This creates the new table with all the detailed profile columns.
    cursor.execute("""
        CREATE TABLE users (
            uid INT PRIMARY KEY,
            uname VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            dob DATE,
            email VARCHAR(255),
            phone VARCHAR(20),
            location VARCHAR(255),
            bio TEXT,
            occupation VARCHAR(255),
            avatar_data LONGTEXT,
            interests JSON
        )
    """)
    print("Database table 'users' was recreated successfully with new columns for detailed profiles.")

except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if 'db' in locals() and db.is_connected():
        cursor.close()
        db.close()
        print("MySQL connection is closed.")