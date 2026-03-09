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