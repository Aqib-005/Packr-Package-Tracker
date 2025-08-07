# Package Tracker Chrome Extension

A simple Chrome extension to track packages from FedEx, USPS, and UPS using the TrackingMore API. Add tracking numbers, view shipment status, estimated delivery dates (ETA), and last updates, that constantly updates every startup.

---

## Features

- Add Packages: Enter a tracking number and select a courier (FedEx, USPS, or UPS) to track a package.
- View Tracking Details: Displays the shipment status, ETA, last update time, and last known location.
- Persistent Storage: Packages are saved in Chrome's local storage and persist across browser sessions.

---

## Installation

To run the Package Tracker Chrome Extension on your device, follow these steps:

#### Prerequisites

1. TrackingMore API Key:
- Sign up for a TrackingMore account and obtain an API key.
- Create a file named config.js in the extension's root directory with the following content:
```bash
const TRACK_KEY = "your-trackingmore-api-key";
```
2. Chrome Browser: Ensure you have Google Chrome installed.

#### Setup

1. Clone or Download the Repository:
```bash
git clone https://github.com/your-username/package-tracker-extension.git
```

2. Create config.js:
- In the root directory of the project, create a config.js file.
- Add your TrackingMore API key as shown above.

3. Load the Extension in Chrome:
- Open Chrome and navigate to chrome://extensions/.
- Enable Developer mode (toggle in the top-right corner).
- Click Load unpacked and select the folder containing the extension files.
- The Package Tracker extension should now appear in your Chrome extensions list.

