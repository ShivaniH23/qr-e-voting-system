from cryptography.fernet import Fernet
import json
import os

KEY_FILE = "secret.key"

def generate_key():
    if not os.path.exists(KEY_FILE):
        key = Fernet.generate_key()
        with open(KEY_FILE, "wb") as f:
            f.write(key)

def load_key():
    with open(KEY_FILE, "rb") as f:
        return f.read()

def encrypt_data(data):
    key = load_key()
    fernet = Fernet(key)
    json_data = json.dumps(data)
    encrypted = fernet.encrypt(json_data.encode())
    return encrypted

def decrypt_data(token):
    key = load_key()
    fernet = Fernet(key)
    decrypted = fernet.decrypt(token).decode()
    return json.loads(decrypted)
