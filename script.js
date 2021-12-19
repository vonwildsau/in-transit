// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto, Mustache */


var map = L.map('map', {
  center: [38.228709, -96.979167],
  zoom: 5
});

// Get the popup template from the HTML. We can do this here because the template will never change.
var popupTemplate = document.querySelector('.popup-template').innerHTML;

// ADD MULTIPLE BASE LAYERS

var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/nicostettler/cjzvo7sg502641csqbotfm55j/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoibmljb3N0ZXR0bGVyIiwiYSI6ImNqc3lweWFmOTE1cDc0OW9iZGYzbHNyNGoifQ.BgZ8GQky4xAHBlL-Pi8MiQ', {maxZoom: 18, attribution: "&copy <a href=https://vonwildsau.com target='_blank'> vonwildsau</a>"});
var voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "&copy <a href=https://vonwildsau.com target='_blank'> vonwildsau</a>"});
var osm = L.tileLayer('https://c.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "&copy <a href=https://vonwildsau.com target='_blank'> vonwildsau</a>"});
var light = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "&copy <a href=https://vonwildsau.com target='_blank'> vonwildsau</a>"});

light.addTo(map);

var basemaps = {
  'Satellite': satellite,
  'Standard': voyager,
  'Open Street Map': osm,
  'Light': light
};

L.control.layers(basemaps).addTo(map);

// CONNECT TO CARTO

var client = new carto.Client({
  apiKey: 'default_public',
  username: 'vonwildsau'
});

// POINT LAYER

var pointSource = new carto.source.Dataset('nywa');
var pointSource = new carto.source.SQL("SELECT * FROM vonwildsau.nywa");

var pointStyle = new carto.style.CartoCSS(`
#layer {
  marker-width: 15;
  marker-fill: #000000;
  marker-fill-opacity: 0.9;
  marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/maki-icons/triangle-stroked-18.svg');
  marker-allow-overlap: true;
}
`);

var pointsLayer = new carto.layer.Layer(pointSource, pointStyle, {
  featureClickColumns: ['name', 'state', 'type', 'date', 'day', 'photo', 'phototwo', 'photothree']
});

// LINE LAYER

var lineSource = new carto.source.Dataset('nywa_lines');
var lineSource = new carto.source.SQL("SELECT * FROM vonwildsau.nywa_lines");

var lineStyle = new carto.style.CartoCSS(`
#layer {
  line-width: 2.5;
  line-color: #ff9100;
  line-opacity: 1;
}
`);

var linesLayer = new carto.layer.Layer(lineSource, lineStyle, {
  featureClickColumns: ['name']
});

// SECOND LINE LAYER

var lineTwoSource = new carto.source.Dataset('nywa_lines_2');
var lineTwoSource = new carto.source.SQL("SELECT * FROM vonwildsau.nywa_lines_2");

var lineTwoStyle = new carto.style.CartoCSS(`
#layer {
  line-width: 2.5;
  line-color: #ff9100;
  line-opacity: 1;
}
`);

var lineTwoLayer = new carto.layer.Layer(lineTwoSource, lineTwoStyle, {
  featureClickColumns: ['name']
});

// ADDING A POPUP

pointsLayer.on('featureClicked', function (event) {
  // Render the template with all of the data. Mustache ignores data that isn't used in the template, so this is fine.
  var content =  Mustache.render(popupTemplate, event.data);
  
  // If you're not sure what data is available, log it out:
  console.log(event.data);
  
  var popup = L.popup();
  popup.setContent(content);
  
  // Place the popup and open it
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});


 // Add the data to the map as a layer
client.addLayers([linesLayer, lineTwoLayer, pointsLayer]);
client
  .getLeafletLayer()
  .setZIndex(500)
  .addTo(map);