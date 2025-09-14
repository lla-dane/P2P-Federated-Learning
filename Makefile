# Makefile at project root

.PHONY: lint format

# Run all lint checks
lint:
	ruff check . --fix
	isort .
	black .
	ruff check .
	isort --check-only --diff .
	black --check .

test:
	pytest .
	
