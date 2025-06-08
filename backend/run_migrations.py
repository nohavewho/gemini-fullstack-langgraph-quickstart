#!/usr/bin/env python3
"""Run database migrations for the press monitoring system"""

import asyncio
import asyncpg
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

async def run_migrations():
    """Run all migration files"""
    
    # Get database URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL not found in environment variables")
    
    print(f"Connecting to database...")
    
    # Connect to database
    conn = await asyncpg.connect(database_url)
    
    try:
        # Find migration files
        migrations_dir = Path(__file__).parent / "migrations"
        migration_files = sorted(migrations_dir.glob("*.sql"))
        
        for migration_file in migration_files:
            print(f"\nRunning migration: {migration_file.name}")
            
            # Read migration content
            with open(migration_file, 'r') as f:
                migration_sql = f.read()
            
            # Execute migration
            try:
                # Split migration into individual statements if needed
                statements = migration_sql.split(';')
                for statement in statements:
                    statement = statement.strip()
                    if statement:
                        await conn.execute(statement)
                print(f"✓ Successfully applied {migration_file.name}")
            except Exception as e:
                print(f"✗ Error applying {migration_file.name}: {e}")
                # Continue with next migration
        
        print("\nMigrations completed!")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migrations())