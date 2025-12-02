"""
Quick test script to verify the server is running
"""
import requests
import time
import sys

def test_server():
    """Test if the Flask server is responding"""
    url = "http://localhost:5000/api/health"
    
    print("Testing server connection...")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print("✓ Server is running!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"✗ Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Is it running?")
        print("  Start it with: python app.py")
        return False
    except requests.exceptions.Timeout:
        print("✗ Server connection timed out")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    # Wait a bit for server to start if just started
    if len(sys.argv) > 1 and sys.argv[1] == "--wait":
        print("Waiting 3 seconds for server to start...")
        time.sleep(3)
    
    success = test_server()
    sys.exit(0 if success else 1)





