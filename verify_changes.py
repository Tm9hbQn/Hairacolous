from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Increase timeout just in case
            page.set_default_timeout(10000)

            print("Navigating to localhost:5173...")
            page.goto("http://localhost:5173")
            page.wait_for_load_state("networkidle")

            # 1. Verify Sticker text
            print("Checking for sticker...")
            sticker = page.locator("text=תקציר!")
            if sticker.is_visible():
                print("SUCCESS: Sticker 'תקציר!' found and visible.")
            else:
                print("FAILURE: Sticker 'תקציר!' NOT found or not visible.")

            # 2. Verify Refresh Day Routine items
            print("Switching to Refresh routine...")
            # Using partial text match or specific locator if needed
            refresh_btn = page.locator("button", has_text="רענון")
            refresh_btn.click()
            page.wait_for_timeout(1000) # Wait for animation/render

            # Check for restored items
            # Note: The keys map to labels in utils.js
            # shampoo -> שמפו
            # conditioner -> מרכך
            # mask -> מסכה
            # leave_in -> ליב-אין
            # gel -> ג'ל/מוס
            # oil -> שמן/סרום
            # styling_tip -> טיפ
            items_to_check = ["שמפו", "מרכך", "מסכה", "ליב-אין", "ג'ל/מוס", "שמן/סרום", "טיפ"]
            missing_items = []
            for item in items_to_check:
                # We check if the label is visible
                if page.locator(f"text={item}").count() > 0:
                     print(f"SUCCESS: Item '{item}' found in Refresh routine.")
                else:
                     print(f"FAILURE: Item '{item}' NOT found in Refresh routine.")
                     missing_items.append(item)

            if not missing_items:
                print("SUCCESS: All products restored in Refresh routine.")

            # 3. Take screenshot
            page.screenshot(path="verification_screenshot.png", full_page=True)
            print("Screenshot saved to verification_screenshot.png")

        except Exception as e:
            print(f"Error: {e}")
            # Take emergency screenshot
            try:
                page.screenshot(path="error_screenshot.png")
                print("Error screenshot saved.")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    verify_changes()
