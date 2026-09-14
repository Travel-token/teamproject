# Initial database

The current application has legacy tables that are not fully represented by migrations in the repository. Before the first cloud deployment, export the existing `travel_token` database to `001_schema_and_seed.sql` in this directory. MySQL runs files in this directory only when its data volume is first created.

After the base dump, keep the existing incremental SQL files under `user_back/demo/src/main/resources/db/manual` in version control and apply each migration exactly once.

