import logging

from rich.logging import RichHandler


def setup_logging(log_topic: str):
    # Reset handlers
    root = logging.getLogger()
    root.handlers.clear()

    logging.basicConfig(
        level="DEBUG",
        format="%(message)s",  # only message, no timestamp/level
        handlers=[
            RichHandler(
                rich_tracebacks=True,
                show_time=False,  # disable timestamp
                show_path=True,  # keep file:line info
            )
        ],
    )

    # Silence root
    logging.getLogger().setLevel(logging.CRITICAL)

    # Your app logger
    logger = logging.getLogger(log_topic)
    logger.setLevel(logging.DEBUG)

    return logger
