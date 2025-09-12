import logging

def setup_logging(log_topic: str):
    # Create a common formatter
    formatter = logging.Formatter("[%(levelname)s] [%(name)s] %(message)s")

    # Create a handler
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    # Configure root logger
    root = logging.getLogger()
    root.setLevel(logging.WARNING)   # Silence noisy libs by default
    root.handlers.clear()
    root.addHandler(handler)

    # Configure your app logger
    logger = logging.getLogger(log_topic)
    logger.setLevel(logging.INFO)

    return logger

# import logging
# import sys

# def setup_logging(log_topic: str):
#     logger = logging.getLogger(log_topic)

#     if not logger.handlers:  # Avoid duplicate handlers
#         formatter = logging.Formatter("[%(levelname)s] [%(name)s] %(message)s")
#         handler = logging.StreamHandler(sys.stdout)
#         handler.setFormatter(formatter)

#         logger.setLevel(logging.INFO)
#         logger.addHandler(handler)

#     return logger
