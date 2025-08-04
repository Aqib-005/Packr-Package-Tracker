document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tracker-form");
  const list = document.getElementById("package-list");

  // Load saved packages
  chrome.storage.local.get(["packages"], (result) => {
    const packages = result.packages || [];
    packages.forEach(renderPackage);
  });

  // Save new package
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const number = document.getElementById("tracking-number").value.trim();
    const carrier = document.getElementById("carrier").value.trim();

    if (!number || !carrier) return;

    const newPackage = {
      id: Date.now(),
      trackingNumber: number,
      carrier: carrier,
      addedAt: new Date().toISOString(),
    };

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
    li.innerHTML = `<strong>${pkg.trackingNumber}</strong> (${pkg.carrier})<br><small>Added: ${new Date(pkg.addedAt).toLocaleString()}</small>`;
    list.appendChild(li);
  }
});
