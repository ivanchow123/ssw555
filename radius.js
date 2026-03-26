function handleRadiusSearch() {
  const zip = document.getElementById('zip-input').value.trim();
  const radius = document.getElementById('radius-input').value.trim();
  const error = document.getElementById('zip-error');
  const mapSection = document.getElementById('map-section');

  // Validate zip
  if (!/^\d{5}$/.test(zip)) {
    error.hidden = false;
    mapSection.hidden = true;
    return;
  }

  // Validate radius (default to 10 if empty)
  const miles = radius === "" ? 10 : parseInt(radius);
  if (isNaN(miles) || miles <= 0) {
    alert("Please enter a valid number of miles.");
    return;
  }

  error.hidden = true;

  // 🔥 KEY PART:
  // Google Maps supports radius using "within X miles"
  const query = encodeURIComponent(
    `blood donation center within ${miles} miles of ${zip}`
  );

  const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;

  mapSection.innerHTML =
    `<h2>Donation Centers within ${miles} miles of ${zip}</h2>` +
    `<iframe 
        src="${embedUrl}" 
        allowfullscreen 
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
     </iframe>`;

  mapSection.hidden = false;
  mapSection.scrollIntoView({ behavior: 'smooth' });
}