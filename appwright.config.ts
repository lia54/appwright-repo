// This file is part of the Appwright repository
// It defines the configuration for testing on iOS and Android platforms
// The configuration includes details about the devices and build paths for the applications
// The iOS project uses an iPhone 14 Pro emulator, while the Android project uses an emulator without a specific device name
// The build paths point to the respective application files for testing
// This setup allows for automated testing of mobile applications using Appwright
// The configuration is defined using the Appwright defineConfig function
// The Platform enum is used to specify the target platform for each project
// The path module is used to construct the build paths for the applications
// This file is essential for setting up the testing environment for mobile applications in the Appwright framework
// It ensures that the correct devices and build files are used for testing
// The configuration can be extended to include more platforms or devices as needed.
import { defineConfig, Platform } from "appwright";
import path from "path";

export default defineConfig({
  projects: [
    {
      name: "ios",
      use: {
        platform: Platform.IOS,
        device: {
          provider: "emulator",
          name: "iPhone 14 Pro",
        },
        buildPath: path.join("builds", "Wikipedia.app"),
      },
    },
    {
      name: "android",
      use: {
        platform: Platform.ANDROID,
        device: {
          provider: "emulator",
        },
        buildPath: path.join("builds", "wikipedia.apk"),
      },
    },
  ],
});
