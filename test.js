const fs = require("fs");
const path = require("path");
const { getFilteredCenters } = require("./script.js");

const dataPath = path.join(__dirname, "blood_donation_centers_merged.json");
const raw = fs.readFileSync(dataPath, "utf8");
const data = JSON.parse(raw);
const centers = data.Results || [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

//test filter for each state currently available
function testFilterNJ() {
  const njCenters = getFilteredCenters(centers, "NJ");

  assert(njCenters.length > 0, "NJ filter returned no results");
  assert(
    njCenters.every(center => center.State === "NJ"),
    "NJ filter returned a center not in NJ"
  );

  console.log("PASS: NJ filter only returns NJ centers");
}

function testFilterNY() {
  const nyCenters = getFilteredCenters(centers, "NY");

  assert(nyCenters.length > 0, "NY filter returned no results");
  assert(
    nyCenters.every(center => center.State === "NY"),
    "NY filter returned a center not in NY"
  );

  console.log("PASS: NY filter only returns NY centers");
}

function testAllReturnsEverythingSorted() {
  const all = getFilteredCenters(centers, "ALL");

  assert(
    all.length === centers.length,
    `ALL filter should return ${centers.length} centers, got ${all.length}`
  );

  for (let i = 1; i < all.length; i++) {
    const prevCity = (all[i - 1].City || "").toLowerCase();
    const currCity = (all[i].City || "").toLowerCase();
    const prevName = all[i - 1].Name || "";
    const currName = all[i].Name || "";

    const validOrder =
      prevCity < currCity ||
      (prevCity === currCity && prevName.localeCompare(currName) <= 0);

    assert(validOrder, "ALL results are not sorted by city, then name");
  }

  console.log("PASS: ALL filter returns all centers in sorted order");
}

function runTests() {
  try {
    testFilterNJ();
    testFilterNY();
    testAllReturnsEverythingSorted();
    console.log("All tests passed");
  } catch (err) {
    console.error("TEST FAILED:", err.message);
    process.exit(1);
  }
}

runTests();