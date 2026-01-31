# Cambio - React Native Setup Guide for Windows

This guide will walk you through setting up your Windows development environment for building the Cambio card game with React Native.

---

## Table of Contents
1. [Prerequisites Overview](#1-prerequisites-overview)
2. [Install Node.js](#2-install-nodejs)
3. [Install Java Development Kit (JDK)](#3-install-java-development-kit-jdk)
4. [Install Android Studio](#4-install-android-studio)
5. [Configure Android SDK](#5-configure-android-sdk)
6. [Set Up Environment Variables](#6-set-up-environment-variables)
7. [Create Your React Native Project](#7-create-your-react-native-project)
8. [Set Up Android Emulator](#8-set-up-android-emulator)
9. [Run Your First App](#9-run-your-first-app)
10. [Troubleshooting Common Issues](#10-troubleshooting-common-issues)

---

## 1. Prerequisites Overview

Before we begin, here's what we'll install:

| Software | Purpose | Approximate Size |
|----------|---------|------------------|
| Node.js | JavaScript runtime for React Native | ~100 MB |
| JDK 17 | Java compiler for Android builds | ~300 MB |
| Android Studio | Android development tools & emulator | ~2-3 GB |
| Android SDK | Libraries for building Android apps | ~3-5 GB |

**Total disk space needed:** Approximately 8-10 GB

**System Requirements:**
- Windows 10 (64-bit) or Windows 11
- At least 8 GB RAM (16 GB recommended for smooth emulator)
- Intel/AMD processor with virtualization support

---

## 2. Install Node.js

Node.js is the JavaScript runtime that powers React Native's development tools.

### Step-by-Step:

1. **Open your web browser** and go to: https://nodejs.org/

2. **Download the LTS version** (Long Term Support)
   - Look for the green button that says "LTS"
   - As of 2025, this should be version 20.x or higher
   - Click to download the `.msi` installer

3. **Run the installer** (double-click the downloaded file)
   - Click "Next" on the welcome screen
   - Accept the license agreement
   - Keep the default installation path (`C:\Program Files\nodejs`)
   - On the "Custom Setup" screen, keep all defaults
   - **IMPORTANT:** Check the box that says "Automatically install the necessary tools"
   - Click "Install"
   - Click "Finish"

4. **Verify installation** - Open Command Prompt (search "cmd" in Start menu):
   ```
   node --version
   ```
   You should see something like: `v20.x.x`

   Also check npm (Node Package Manager):
   ```
   npm --version
   ```
   You should see something like: `10.x.x`

### What is Node.js?
Think of Node.js as the engine that runs JavaScript code on your computer. React Native uses it to bundle your app code and run development tools.

---

## 3. Install Java Development Kit (JDK)

Android apps need Java to compile. We'll use Microsoft's OpenJDK build.

### Step-by-Step:

1. **Open your browser** and go to: https://learn.microsoft.com/en-us/java/openjdk/download

2. **Find JDK 17** (not 21, not 11 - specifically 17)
   - Look for "OpenJDK 17"
   - Under Windows, click the `.msi` link for x64

3. **Run the installer**
   - Click "Next"
   - Keep the default installation path
   - **IMPORTANT:** Check "Set JAVA_HOME variable"
   - Click "Install"
   - Click "Finish"

4. **Verify installation** - Open a NEW Command Prompt:
   ```
   java -version
   ```
   You should see: `openjdk version "17.x.x"`

### Why JDK 17?
React Native specifically requires JDK 17 for Android builds. Other versions may cause compatibility issues.

---

## 4. Install Android Studio

Android Studio provides the tools to build and test Android apps.

### Step-by-Step:

1. **Go to:** https://developer.android.com/studio

2. **Click "Download Android Studio"**
   - Accept the terms and conditions
   - Download will start (~1 GB file)

3. **Run the installer**
   - Click "Next"
   - **Components:** Make sure these are checked:
     - Android Studio
     - Android Virtual Device
   - Click "Next"
   - Keep default installation location
   - Click "Install"
   - Wait for installation (takes several minutes)
   - Click "Finish" to launch Android Studio

4. **First-time setup wizard**
   - Choose "Do not import settings"
   - Click "Next" on Welcome screen
   - Choose **"Standard"** installation type
   - Click "Next"
   - Select your preferred UI theme (Light or Dark)
   - Click "Next"
   - Review the components to download
   - Click "Finish"
   - Wait for downloads to complete (may take 15-30 minutes)

### What is Android Studio?
It's the official development environment for Android. For our purposes, we mainly need its Android SDK and emulator - we'll write our actual code elsewhere.

---

## 5. Configure Android SDK

Now we need to install specific SDK versions that React Native requires.

### Step-by-Step:

1. **Open Android Studio** (if not already open)

2. **Access SDK Manager**
   - On the Welcome screen, click "More Actions" (or three dots menu)
   - Select "SDK Manager"
   - OR go to: File > Settings > Languages & Frameworks > Android SDK

3. **SDK Platforms tab**
   - Check "Show Package Details" (bottom right)
   - Find **"Android 14 (UpsideDownCake)"** or the latest stable
   - Expand it and make sure these are checked:
     - Android SDK Platform 34 (or latest)
     - Google APIs Intel x86_64 Atom System Image (for emulator)
   - Click "Apply"

4. **SDK Tools tab**
   - Check "Show Package Details"
   - Make sure these are checked:
     - Android SDK Build-Tools 34.x.x (latest 34 version)
     - Android SDK Command-line Tools (latest)
     - Android Emulator
     - Android SDK Platform-Tools
   - Click "Apply"
   - Accept any license agreements
   - Wait for downloads

5. **Note your SDK Location**
   - Look at the top of SDK Manager window
   - It shows "Android SDK Location"
   - Usually: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`
   - **Write this down!** You'll need it for environment variables.

---

## 6. Set Up Environment Variables

Environment variables tell Windows where to find the development tools.

### Step-by-Step:

1. **Open System Environment Variables**
   - Press `Windows + S` and search "environment variables"
   - Click "Edit the system environment variables"
   - Click "Environment Variables" button

2. **Add ANDROID_HOME variable**
   - Under "User variables", click "New"
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`
     - Replace YOUR_USERNAME with your actual Windows username
     - Or use the path you noted from SDK Manager
   - Click "OK"

3. **Add to PATH variable**
   - Under "User variables", find "Path" and click "Edit"
   - Click "New" and add these paths one at a time:
     ```
     %ANDROID_HOME%\emulator
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\tools
     %ANDROID_HOME%\tools\bin
     ```
   - Click "OK" to close Path editor
   - Click "OK" to close Environment Variables
   - Click "OK" to close System Properties

4. **Verify setup** - Open a NEW Command Prompt (important - must be new!):
   ```
   echo %ANDROID_HOME%
   ```
   Should show your Android SDK path

   ```
   adb --version
   ```
   Should show Android Debug Bridge version info

### What are Environment Variables?
They're like a contact list for your computer - when you type a command, Windows looks in PATH to find where that program lives.

---

## 7. Create Your React Native Project

Now the exciting part - creating your Cambio app!

### Step-by-Step:

1. **Open Command Prompt** (or PowerShell)

2. **Navigate to where you want your project**
   ```
   cd C:\Users\YOUR_USERNAME\Projects
   ```
   Or whatever folder you prefer for coding projects.

3. **Create the React Native project**
   ```
   npx react-native@latest init Cambio
   ```

   This will:
   - Download React Native and dependencies
   - Create a new folder called "Cambio"
   - Set up the project structure
   - Takes 3-5 minutes

4. **Navigate into your project**
   ```
   cd Cambio
   ```

5. **Explore what was created**
   ```
   dir
   ```

   You'll see:
   ```
   android/          <- Android-specific code
   ios/              <- iOS-specific code (for later)
   node_modules/     <- Dependencies (don't edit)
   App.tsx           <- Your main app file!
   package.json      <- Project configuration
   ...and more
   ```

### Project Structure Explanation:
- **App.tsx**: This is where your app starts. We'll write most of our Cambio code here and in files we create.
- **android/**: Contains Android-specific build files. Rarely edited directly.
- **package.json**: Lists your project's dependencies and scripts.

---

## 8. Set Up Android Emulator

The emulator lets you test your app without a physical phone.

### Step-by-Step:

1. **Open Android Studio**

2. **Open Device Manager**
   - Click "More Actions" > "Virtual Device Manager"
   - OR Tools > Device Manager

3. **Create a Virtual Device**
   - Click "Create Device"
   - Choose a phone model (recommend "Pixel 6" or similar)
   - Click "Next"

4. **Select System Image**
   - Choose a release with "API 34" (or latest)
   - If it shows "Download" next to it, click to download first
   - Select it and click "Next"

5. **Configure Emulator**
   - Give it a name like "Cambio Test Device"
   - Click "Show Advanced Settings"
   - Under "Memory and Storage":
     - RAM: 2048 MB minimum (4096 if you have 16GB+ RAM)
   - Click "Finish"

6. **Launch the Emulator**
   - In Device Manager, click the Play button next to your device
   - First launch takes a few minutes
   - You should see an Android phone screen appear!

### Alternative: Use a Physical Android Phone
If your computer struggles with the emulator:
1. On your phone: Settings > About Phone > Tap "Build Number" 7 times
2. Go back: Settings > Developer Options > Enable "USB Debugging"
3. Connect phone via USB
4. Run `adb devices` in Command Prompt to verify connection

---

## 9. Run Your First App

Let's make sure everything works!

### Step-by-Step:

1. **Start the emulator** (if not already running)
   - Open Android Studio > Device Manager > Click Play on your device

2. **Open TWO Command Prompt windows**

3. **In the first window - Start Metro bundler:**
   ```
   cd C:\Users\YOUR_USERNAME\Projects\Cambio
   npm start
   ```

   You should see:
   ```
   Welcome to Metro
   Fast - Scalable - Integrated

   r - reload the app
   d - open developer menu
   ...
   ```
   Keep this window running!

4. **In the second window - Build and run the app:**
   ```
   cd C:\Users\YOUR_USERNAME\Projects\Cambio
   npm run android
   ```

   First build takes 5-10 minutes. You'll see lots of output.

   When successful, you'll see:
   ```
   BUILD SUCCESSFUL
   ```
   And the app will appear on your emulator!

5. **You should see the React Native welcome screen!**
   - A "Welcome to React Native" message
   - Some instructions about editing App.tsx

### Quick Test - Edit Your App:
1. Open `App.tsx` in any text editor (Notepad works, but VS Code is better)
2. Find the text "Welcome to React Native"
3. Change it to "Welcome to Cambio!"
4. Save the file
5. In the emulator, press `R` twice quickly (or click the Metro terminal and press `r`)
6. Your change appears instantly! This is "hot reloading"

---

## 10. Troubleshooting Common Issues

### "SDK location not found"
- Make sure ANDROID_HOME environment variable is set correctly
- Restart your Command Prompt after setting environment variables

### "Could not find tools.jar"
- Make sure you installed JDK 17, not just JRE
- Check that JAVA_HOME points to JDK installation

### Build fails with "FAILURE: Build failed with an exception"
- Read the error message carefully
- Often it's a missing SDK component - open SDK Manager and install what's missing
- Try: `cd android && ./gradlew clean && cd ..`

### Emulator is very slow
- Enable hardware acceleration: In BIOS, enable Intel VT-x or AMD-V
- Allocate more RAM to the emulator
- Consider using a physical device instead

### "Unable to load script"
- Make sure Metro bundler is running (`npm start`)
- Make sure emulator and your computer are on same network
- Try: `adb reverse tcp:8081 tcp:8081`

### Metro bundler crashes or hangs
- Close all Command Prompts
- Run `npm cache clean --force`
- Delete `node_modules` folder and run `npm install`

---

## Next Steps

Once you have the default app running, you're ready to start building Cambio! The next phases will cover:

1. **Project Structure Setup** - Organizing folders for game logic, components, and assets
2. **Basic UI** - Creating the card table, player hands, and decks
3. **Game State Management** - Tracking cards, turns, and scores
4. **Touch Interactions** - Implementing the responsive burning mechanic

---

## Recommended Code Editor: VS Code

While you can use any text editor, Visual Studio Code is highly recommended:

1. Download from: https://code.visualstudio.com/
2. Install these extensions:
   - **ES7+ React/Redux/React-Native snippets** - Code shortcuts
   - **React Native Tools** - Debugging support
   - **Prettier** - Code formatting
   - **Error Lens** - Inline error display

To open your project in VS Code:
```
cd C:\Users\YOUR_USERNAME\Projects\Cambio
code .
```

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start Metro bundler |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS (Mac only) |
| `npm install` | Install dependencies |
| `npm install PACKAGE` | Add a new package |
| `adb devices` | List connected Android devices |
| `adb reverse tcp:8081 tcp:8081` | Fix Metro connection issues |

---

**You're now ready to start building Cambio!**

When you've completed this setup, let me know and we'll move on to creating the game's project structure and first components.
