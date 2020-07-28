/* import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {click, pointerMove, altKeyOnly} from 'ol/events/condition';
import GeoJSON from 'ol/format/GeoJSON';
import Select from 'ol/interaction/Select';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector'; */


var Feature = ol.Feature
var Map = ol.Map
var View = ol.View
var GeoJSON = ol.format.GeoJSON
var Circle = ol.geom.Circle
var TileLayer = ol.layer.Tile
var VectorLayer = ol.layer.Vector
var OSM = ol.source.OSM
var VectorSource = ol.source.Vector
var CircleStyle = ol.style.Circle
var Fill = ol.style.Fill
var Stroke = ol.style.Stroke
var Style = ol.style.Style
var Select = ol.interaction.Select
var click = ol.events.condition.click
var pointerMove = ol.events.condition.pointerMove
var altKeyOnly = ol.events.condition.altKeyOnly

// base layer from open street maps
var raster = new TileLayer({
  source: new OSM()
});

// load layer with districts polygons from file
var district_layer = new VectorLayer({
  source: new VectorSource({
    url: 'data/lor_ortsteile_coocc.geojson',
    format: new GeoJSON()
  })
});

var map = new Map({
  layers: [district_layer],
  target: 'map',
  view: new View({
    center: ol.proj.fromLonLat([13.404954,52.520008]),
    zoom: 10
  })
});

var polygonFillColor = new Fill({color: [255, 153, 51,0.5]})

/* var polygonStroke = new Stroke({color: 'gray'});
var defaultStyle = new Style({
  fill: null,
  stroke: polygonStroke
});

district_layer.setStyle(defaultStyle)
 */
// polygon style function that set opacity relative to cooccurrence value
function cooccStylefunction(feature, district) {
  let opacity = null;
  if (feature.getProperties().COOCCURRENCE_DATA) {
    opacity = feature.getProperties().COOCCURRENCE_DATA.rel_cooccurrence[district];
  } else {
    //console.log('no cooccurrence data.')
    opacity = 0;
  }
  return new Style({
    fill: new Fill({color: [255, 153, 51, opacity]})
  });
  
}

function selectDistrictStyle(feature) {
    console.log('selected district: ', feature.getProperties().OTEIL)
    // 
    numberRequests = feature.getProperties().COOCCURRENCE_DATA ? feature.getProperties().COOCCURRENCE_DATA.abs_occurrence : 'no data'
    districtText = feature.getProperties().OTEIL
    return new Style({
      text: new ol.style.Text({
        fill: new Fill({color: 'blue'}),
        text: feature.getProperties().OTEIL + '\n' + numberRequests,
        overflow: true
      }),
      fill: new Fill({
        color: [255, 153, 51, 1]
      })
    })
}


// select interaction working on "click"
var selectClick = new Select({
  condition: click,
  style: selectDistrictStyle
});

var hover = new Select({
  condition: pointerMove,
  style: function(feature) {
    console.log('selected district: ', feature.getProperties().OTEIL)
    return new Style({
      text: new ol.style.Text({
        fill: new Fill({color: 'blue'}),
        text: feature.getProperties().OTEIL,
        overflow: true
      })
    })
  }
})

//map.addInteraction(hover)


map.addInteraction(selectClick);
selectClick.on('select', function(e) {
  let selDistrict = null;
  if (e.target.getFeatures().item(0).getProperties().COOCCURRENCE_DATA) {
    selDistrict = e.target.getFeatures().item(0).getProperties().COOCCURRENCE_DATA.name;
    console.log('coocc district name: ', selDistrict);
    district_layer.setStyle(function(feature) {
      return cooccStylefunction(feature, selDistrict);
    });
    document.getElementById('status').innerHTML = '&nbsp;' +
      ' ORTSTEIL: ' + e.target.getFeatures().item(0).getProperties()['OTEIL'] +
      ' , TOTAL COUNT: ' + e.target.getFeatures().item(0).getProperties()['COOCCURRENCE_DATA']['abs_occurrence'];
  } else {
    // TODO: handling of missing data
    console.log('no co occurrence data available');
    document.getElementById('status').innerHTML = '&nbsp;' +
    ' ORTSTEIL: ' + e.target.getFeatures().item(0).getProperties()['OTEIL'] + ': no data';
/*     district_layer.setStyle(function(feature) {
      return defaultStyle
      });*/
    }; 
  })

  

