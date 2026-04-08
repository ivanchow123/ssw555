
function handleSearch(e) {
  e.preventDefault();

  const zip = document.getElementById('zip-input').value.trim();
  const error = document.getElementById('zip-error');
  const mapSection = document.getElementById('map-section');

  if (!/^\d{5}$/.test(zip)) {
    error.hidden = false;
    mapSection.hidden = true;
    return false;
  }

  error.hidden = true;

  const query = encodeURIComponent('blood donation center near ' + zip);
  const embedUrl = 'https://www.google.com/maps?q=' + query + '&output=embed';

  mapSection.innerHTML =
    '<h2>Donation Centers Near ' + zip + '</h2>' +
    '<iframe ' +
      'src="' + embedUrl + '" ' +
      'allowfullscreen loading="lazy" ' +
      'referrerpolicy="no-referrer-when-downgrade">' +
    '</iframe>';
  mapSection.hidden = false;
  mapSection.scrollIntoView({ behavior: 'smooth' });

  return false;
}


const DATA_URL = "blood_donation_centers_merged.json";
const PAGE_SIZE = 9; //problem 2 fix

let allCenters = [];
let filteredCenters = [];
let visibleCount = PAGE_SIZE;

function loadCenters() {
  const resultsList = document.getElementById("results-list");
  const stateFilter = document.getElementById("state-filter");

  if (!resultsList || !stateFilter) return;

  fetch(DATA_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      allCenters = Array.isArray(data.Results) ? data.Results.slice() : [];
      populateStateFilter();
      applyFilters();
    })
    .catch((error) => {
      console.error("Error loading centers:", error);
      resultsList.innerHTML = `<p class="error">Could not load donation centers.</p>`;
    });
}

function getUniqueStates(centers) {
  return [...new Set(centers.map((center) => center.State).filter(Boolean))].sort();
}

function compareCenters(a, b) {
  const cityA = (a.City || "").toLowerCase();
  const cityB = (b.City || "").toLowerCase();

  if (cityA !== cityB) {
    return cityA.localeCompare(cityB);
  }

  return (a.Name || "").localeCompare(b.Name || "");
}


//problem 1 fix
function getFilteredCenters(centers, selectedState) {
  return centers
    .filter((center) => selectedState === "ALL" || center.State === selectedState)
    .sort(compareCenters);
}

function getVisibleCenters(centers, count) {
  return centers.slice(0, count);
}

function populateStateFilter() {
  const stateFilter = document.getElementById("state-filter");
  if (!stateFilter) return;

  while (stateFilter.options.length > 1) {
    stateFilter.remove(1);
  }

  const states = getUniqueStates(allCenters);

  for (const state of states) {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateFilter.appendChild(option);
  }
}

function applyFilters() {
  const stateFilter = document.getElementById("state-filter");
  if (!stateFilter) return;

  filteredCenters = getFilteredCenters(allCenters, stateFilter.value);
  visibleCount = PAGE_SIZE;
  renderCenters();
}

function renderCenters() {
  const resultsList = document.getElementById("results-list");
  const seeMoreBtn = document.getElementById("see-more-btn");

  if (!resultsList || !seeMoreBtn) return;

  resultsList.innerHTML = "";

  const centersToShow = getVisibleCenters(filteredCenters, visibleCount);

  if (centersToShow.length === 0) {
    resultsList.innerHTML = `<p>No donation centers found.</p>`;
    seeMoreBtn.hidden = true;
    return;
  }

  for (const center of centersToShow) {
    const card = document.createElement("div");
    card.className = "center-card";

    card.innerHTML = `
      <h3>${center.Name || "Unnamed Center"}</h3>
      <p><strong>Town:</strong> ${center.City || "N/A"}</p>
      <p><strong>State:</strong> ${center.State || "N/A"}</p>
      <p><strong>Address:</strong> ${formatAddress(center.FullAddress)}</p>
      <p><strong>Phone:</strong> ${center.Phone || center.DonorPhone || "N/A"}</p>
      ${
        center.DonorWebsite
          ? `<p><a href="${formatWebsite(center.DonorWebsite)}" target="_blank" rel="noopener noreferrer">Visit Website</a></p>`
          : ""
      }
    `;

    resultsList.appendChild(card);
  }

  seeMoreBtn.hidden = visibleCount >= filteredCenters.length;
}

function showMoreCenters() {
  visibleCount += PAGE_SIZE; //problem 2 fix
  renderCenters();
}

function formatAddress(address) {
  if (!address) return "N/A";
  return address.replace(/\r?\n/g, ", ");
}

function formatWebsite(url) {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PAGE_SIZE,
    compareCenters,
    getUniqueStates,
    getFilteredCenters,
    getVisibleCenters,
    formatAddress,
    formatWebsite
  };
}