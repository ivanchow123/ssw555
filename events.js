const defaultEvents = [
  {
    id: 1,
    name: "Stevens Campus Blood Drive",
    organization: "Stevens Institute of Technology",
    date: "2026-04-06",
    time: "10:00 AM - 3:00 PM",
    location: "University Center, Hoboken, NJ",
    city: "Hoboken",
    state: "NJ",
    address: "1 Castle Point Terrace, Hoboken, NJ 07030",
    description: "A campus-wide donation event open to students, faculty, and local residents."
  },
  {
    id: 2,
    name: "Jersey City Community Blood Drive",
    organization: "Jersey City Health Coalition",
    date: "2026-04-21",
    time: "9:00 AM - 2:00 PM",
    location: "City Hall Annex, Jersey City, NJ",
    city: "Jersey City",
    state: "NJ",
    address: "394 Central Ave, Jersey City, NJ 07307",
    description: "Community blood drive supporting nearby hospitals and emergency care centers."
  },
];

const STORAGE_KEY = "bloodDonationEvents";

const eventsContainer = document.getElementById("eventsContainer");
const stateFilter = document.getElementById("stateFilter");
const searchInput = document.getElementById("searchInput");
const eventForm = document.getElementById("eventForm");

function loadEvents() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents));
  return [...defaultEvents];
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

let donationEvents = loadEvents();

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function isUpcomingEvent(eventDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDay = new Date(eventDate + "T00:00:00");
  return eventDay >= today;
}

function removeExpiredEvents() {
  donationEvents = donationEvents.filter(event => isUpcomingEvent(event.date));
  saveEvents(donationEvents);
}

function populateStateFilter() {
  const currentValue = stateFilter.value;
  stateFilter.innerHTML = '<option value="all">All States</option>';

  const visibleEvents = donationEvents.filter(event => isUpcomingEvent(event.date));
  const states = [...new Set(visibleEvents.map(event => event.state.trim().toUpperCase()))].sort();

  states.forEach(state => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateFilter.appendChild(option);
  });

  if ([...stateFilter.options].some(option => option.value === currentValue)) {
    stateFilter.value = currentValue;
  } else {
    stateFilter.value = "all";
  }
}

function renderEvents(events) {
  eventsContainer.innerHTML = "";

  if (events.length === 0) {
    eventsContainer.innerHTML = "<p>No upcoming events match your filters.</p>";
    return;
  }

  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${event.name}</h3>
      <p><strong>Organization:</strong> ${event.organization}</p>
      <p><strong>Date:</strong> ${formatDate(event.date)}</p>
      <p><strong>Time:</strong> ${event.time}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Address:</strong> ${event.address}</p>
      <p><strong>City:</strong> ${event.city}</p>
      <p><strong>State:</strong> ${event.state}</p>
      <p>${event.description}</p>
      <button class="remove-event-btn" data-id="${event.id}">Remove Event</button>
    `;

    eventsContainer.appendChild(card);
  });

  const removeButtons = document.querySelectorAll(".remove-event-btn");
  removeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const eventId = Number(button.dataset.id);
      removeEvent(eventId);
    });
  });
}

function filterEvents() {
  const selectedState = stateFilter.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = donationEvents.filter(event => {
    if (!isUpcomingEvent(event.date)) {
      return false;
    }

    const matchesState =
      selectedState === "all" ||
      event.state.trim().toUpperCase() === selectedState;

    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm) ||
      event.city.toLowerCase().includes(searchTerm) ||
      event.organization.toLowerCase().includes(searchTerm) ||
      event.location.toLowerCase().includes(searchTerm);

    return matchesState && matchesSearch;
  });

  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  renderEvents(filtered);
}

function addEvent(newEvent) {
  donationEvents.push(newEvent);
  saveEvents(donationEvents);
  populateStateFilter();
  filterEvents();
}

function removeEvent(eventId) {
  donationEvents = donationEvents.filter(event => event.id !== eventId);
  saveEvents(donationEvents);
  populateStateFilter();
  filterEvents();
}

eventForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const organization = document.getElementById("organization").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value.trim();
  const location = document.getElementById("location").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim().toUpperCase();
  const address = document.getElementById("address").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!isUpcomingEvent(date)) {
    alert("Please enter today’s date or a future date.");
    return;
  }

  const newEvent = {
    id: Date.now(),
    name,
    organization,
    date,
    time,
    location,
    city,
    state,
    address,
    description
  };

  addEvent(newEvent);
  eventForm.reset();
});

stateFilter.addEventListener("change", filterEvents);
searchInput.addEventListener("input", filterEvents);

function resetCenters() {
  centers = defaultEvents.map(center => ({ ...center }));
  saveEvents(centers);
  renderEvents(centers);
}

const resetCentersBtn = document.getElementById("resetCentersBtn");

if (resetCentersBtn) {
  resetCentersBtn.addEventListener("click", () => {
    const confirmed = confirm("Reset centers back to the original hardcoded list?");
    if (confirmed) {
      resetCenters();
    }
  });
}

removeExpiredEvents();
populateStateFilter();
filterEvents();

