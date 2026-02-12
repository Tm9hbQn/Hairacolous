from playwright.sync_api import sync_playwright
import time

def verify(page):
    print("Navigating to page...")
    page.goto("http://localhost:5173/Hairacolous/")

    print("Waiting for content...")
    # Wait for the main card to load
    page.wait_for_selector("div.relative.mx-4")

    # Allow some time for animations and typewriter
    time.sleep(3)

    print("Taking screenshot...")
    page.screenshot(path="verification_screenshot.png", full_page=True)
    print("Screenshot saved to verification_screenshot.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
