document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tracker-form");
  const list = document.getElementById("package-list");
  const carrierSelect = document.getElementById("carrier");

  chrome.storage.local.get(["packages"], (result) => {
    const packages = result.packages || [];
    packages.forEach(renderPackage);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const number = document.getElementById("tracking-number").value.trim();
    const carrier = carrierSelect.value.trim();

    if (!number || !carrier) {
      alert("Please enter a tracking number and select a carrier.");
      return;
    }

    console.log(
      "Submitting tracking number:",
      number,
      "with courier:",
      carrier,
    );
    const apiKey = TRACK_KEY;
    console.log("Using API key:", apiKey); // Debug API key

    try {
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
            courier_code: carrier,
          }),
        },
      );

      if (!createRes.ok) {
        const errJson = await createRes.json();
        console.warn("Create failed:", JSON.stringify(errJson, null, 2));
        if (errJson?.meta?.code !== 4101) {
          alert("Error creating tracking: " + JSON.stringify(errJson, null, 2));
          return;
        }
      }
    } catch (err) {
      console.error("Network error creating tracking:", err);
      alert("Network error creating tracking.");
      return;
    }

    try {
      const res = await fetch(
        `https://api.trackingmore.com/v4/trackings/get?tracking_numbers=${number}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Tracking-Api-Key": apiKey,
          },
        },
      );

      if (!res.ok) {
        const errJson = await res.json();
        console.warn("Get tracking failed:", JSON.stringify(errJson, null, 2));
        alert(
          "Error fetching tracking info: " + JSON.stringify(errJson, null, 2),
        );
        return;
      }

      const data = await res.json();
      console.log("Tracking response:", JSON.stringify(data, null, 2));

      const trackingData = data?.data?.[0] || {};
      const newPackage = {
        id: Date.now(),
        trackingNumber: number,
        carrier: carrier,
        status: trackingData.delivery_status || "Unknown",
        eta: trackingData.scheduled_delivery_date || "N/A",
        lastUpdate: trackingData.latest_checkpoint_time || "N/A",
        lastLocation: trackingData.latest_event || "N/A",
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
    } catch (err) {
      console.error("Network error fetching tracking:", err);
      alert("Network error fetching tracking info.");
    }
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
