import requests
import sys

BASE_URL = "http://localhost:8000/api"

def check_health():
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Backend is reachable.")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend.")
        return False

def check_login():
    url = f"{BASE_URL}/auth/login"
    payload = {"username": "admin", "password": "admin123"}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Login successful.")
                return True
            else:
                print(f"❌ Login failed: {data.get('message')}")
                return False
        else:
            print(f"❌ Login endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Login check error: {e}")
        return False

if __name__ == "__main__":
    health = check_health()
    login = check_login()
    
    if health and login:
        sys.exit(0)
    else:
        sys.exit(1)
