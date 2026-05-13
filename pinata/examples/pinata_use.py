import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
from pinata import Pinata

load_dotenv()

API_KEY = os.getenv("API_KEY")
API_SECRET = os.getenv("API_SECRET")
ACCESS_TOKEN = os.getenv("JWT_TOKEN")

pinata = Pinata(API_KEY, API_SECRET, ACCESS_TOKEN)
response = pinata.pin_file("test_file.md")
print(response)
