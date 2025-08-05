document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tracker-form");
  const list = document.getElementById("package-list");

  // Load stored packages
  chrome.storage.local.get(["packages"], (result) => {
    const packages = result.packages || [];
    packages.forEach(renderPackage);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const number = document.getElementById("tracking-number").value.trim();
    const carrier = document.getElementById("carrier").value.trim();

    if (!number || !carrier) {
      alert("Please enter a tracking number and select a carrier.");
      return;
    }

    const apiKey = TRACK_KEY;

    // Try to create tracking (ignore if already exists)
    let createRes = await fetch(
      "https://api.trackingmore.com/v4/trackings/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Tracking-Api-Key": apiKey,
        },
        body: JSON.stringify({
          tracking_number: number,
          carrier_code: carrier,
        }),
      },
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.warn("Create failed:", errText);

      if (!errText.toLowerCase().includes("already exists")) {
        alert("Error creating tracking: " + errText);
        return;
      }
    }

    // Get tracking info
    const res = await fetch(
      `https://api.trackingmore.com/v4/trackings/get?tracking_number=${number}&carrier_code=${carrier}`,
      {
        method: "GET",
        headers: {
          "Tracking-Api-Key": apiKey,
        },
      },
    );

    const data = await res.json();
    const trackingData = data?.data?.items?.[0] || {};

    const newPackage = {
      id: Date.now(),
      trackingNumber: number,
      carrier: carrier,
      status: trackingData.status || "Unknown",
      eta: trackingData.expected_delivery || "N/A",
      lastUpdate: trackingData.lastUpdateTime || "N/A",
      lastLocation: trackingData.lastLocation || "N/A",
      addedAt: new Date().toISOString(),
    };

    // Save and render package
    chrome.storage.local.get(["packages"], (result) => {
      const packages = result.packages || [];
      packages.push(newPackage);
      chrome.storage.local.set({ packages }, () => {
        renderPackage(newPackage);
        form.reset();
      });
    });
  });

  function renderPackage(pkg) {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${pkg.trackingNumber}</strong> (${pkg.carrier})<br>
      Status: ${pkg.status}<br>
      ETA: ${pkg.eta}<br>
      Last Update: ${pkg.lastUpdate} (${pkg.lastLocation})<br>
      <small>Added: ${new Date(pkg.addedAt).toLocaleString()}</small>
    `;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Delete";

    btn.addEventListener("click", () => {
      deletePackage(pkg.id, li);
    });

    li.appendChild(btn);
    list.appendChild(li);
  }

  function deletePackage(id, ele) {
    chrome.storage.local.get(["packages"], (result) => {
      const packages = result.packages || [];
      const updatedPackages = packages.filter((p) => p.id !== id);

      chrome.storage.local.set({ packages: updatedPackages }, () => {
        ele.remove();
      });
    });
  }
});
