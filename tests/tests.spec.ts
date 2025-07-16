// This code is part of a test suite for an application using Appwright.
// It tests the functionality of searching for "playwright" on Wikipedia and verifying that "Microsoft" is visible in the search results.
// The test is designed to run on an Android device, specifically on an emulator or a real device configured in the Appwright project setup.


import { test, expect } from "appwright";

test("Open Playwright on Wikipedia and verify Microsoft is visible", async ({
  device,
}) => {
  // Dismiss splash screen
  await device.getByText("Skip").tap();

  // Enter search term
  const searchInput = device.getByText("Search Wikipedia", { exact: true });
  await searchInput.tap();
  await searchInput.fill("playwright");

  // Open search result and assert
  await device.getByText("Playwright (software)").tap();
  await expect(device.getByText("Microsoft")).toBeVisible();
});
