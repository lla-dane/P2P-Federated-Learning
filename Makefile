# Makefile at project root

.PHONY: lint format repo-setup

# Run all lint checks
lint:
	ruff check . --fix
	isort .
	black .
	ruff check .
	isort --check-only --diff .
	black --check .

# Run all tests
test:
	pytest .

# Set up the repo
repo:
	python3 -m venv .venv
	. .venv/bin/activate
	uv sync --all-extras