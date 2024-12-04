## SETUP AND RUN THE FASTAPI SERVER:
  - Setup a virtual env, while inside the `fast-api-server` directory, run `python3 -m venv .venv` or `python3 -m venv .venv`
  - Activate the virtual env, while inside the `fast-api-server` directory, run `source .venv/bin/activate`
  - Run the postgres db locally(preferably in a docker container with port forwarding setup to port `5432`). Install docker and a run a postgres container:
    1. `sudo apt update && sudo apt install docker`
    2. `docker pull postgres`
    3. `docker run -d --name my_postgres -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=mydatabase -p 5432:5432`

  - make a .env file in `fast-api-server` directory with the following environement variable: `DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"`
  - install the dependencies: `pip install -r requirements.txt`
  - run the latest migrations: `alembic upgrade head`
  - run `fastapi dev src` in the `fast-api-server` directory to start the app
