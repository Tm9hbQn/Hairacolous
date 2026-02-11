from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport iPhone X
        context = browser.new_context(viewport={'width': 375, 'height': 812}, device_scale_factor=2)
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:4173/")
        page.wait_for_load_state("networkidle")
        time.sleep(3) # Wait for initial animations

        # Screenshot 1: Initial State (Today, Refresh)
        print("Taking screenshot 1...")
        page.screenshot(path="verification_1_today_refresh.png")

        # Interaction: Switch to Tomorrow
        print("Switching to Tomorrow...")
        try:
            tomorrow_btn = page.locator("button").filter(has_text="מחר").first
            tomorrow_btn.click()
            time.sleep(2) # Wait for transition
        except Exception as e:
            print(f"Error clicking Tomorrow: {e}")

        # Screenshot 2: Tomorrow
        print("Taking screenshot 2...")
        page.screenshot(path="verification_2_tomorrow.png")

        # Interaction: Toggle to Wash Day
        print("Toggling to Wash Day...")
        try:
            wash_btn = page.locator("button").filter(has_text="יום חפיפה").first
            wash_btn.click()
            time.sleep(2)
        except Exception as e:
            print(f"Error clicking Wash Day: {e}")

        # Screenshot 3: Wash Day
        print("Taking screenshot 3...")
        page.screenshot(path="verification_3_wash.png")

        browser.close()

if __name__ == "__main__":
    run()
