L.Browser.any3d = L.Browser.gecko3d = false;

var markers, nmarker=null, map, loadd, currentPopup=null, undef ;
var Route, RouteLL;

function onRClick(e)
{
	currentPopup._close();
	$('.ui-tooltip').remove();
	if (typeof Route == 'object') map.removeControl(Route);
	Route = L.Routing.control({
		waypoints: [
			nmarker.getLatLng(),
			RouteLL
		],
		geocoder: false,
		addWaypoints:false,
	}).addTo(nmarker._map);
}

function onClick(e) {
	var popup = this.getPopup();
	currentPopup = popup;
	RouteLL = popup.getLatLng();
	if (popup._isOpen) {
		this._map.setView(this.getLatLng(), this._map.getMaxZoom());
		$.get("/popup/description/"+this.options["baseid"]+".html", function (data)
			{
				varTitle = $('<div />').html(data)[0].innerHTML;
				popup.setContent(varTitle);
				if (typeof $.rating == "function") {
					$('div#rating').rating({
						fx: 'float',
						image: '/img/stars.png',
						loader: '/img/ajax-loader.gif',
						minimal: 0.1,
						url: '/service/vote.act',
						callback: function(responce){
							this.vote_success.fadeOut(2000);
							if(responce.msg) alert(responce.msg);
						}
					});
				}
			});
	}
}

var progress = document.getElementById('progress');
var progressBar = document.getElementById('progress-bar');
function updateProgressBar(processed, total, elapsed, layersArray) {
	if (elapsed > 1000) {
		// if it takes more than a second to load, display the progress bar:
		progress.style.display = 'block';
		progressBar.style.width = Math.round(processed/total*100) + '%';
	}
	if (processed === total) {
		// all markers processed - hide the progress bar:
		progress.style.display = 'none';
		setTimeout(function() 
		{
			$(document ).tooltip(
			{
				content: function () {
					return $(this).prop('title');
				}
			})
		}, 2000);
	}
}

function g (e) {
	console.warn('ERROR(' + e.code + '): ' + e.message);
	m();
}
function m (ll) {
	if (ll!=undefined && ll.coords!=undefined) {
		var latlng = L.latLng(ll.coords.latitude, ll.coords.longitude);
		z= 12;
		var nIcon = L.icon({iconUrl: "/img/markers/Flag_red.png", iconAnchor:   [24, 40],popupAnchor:  [0, -41]});
		nmarker = L.marker(latlng, { title: "Р’С‹ С‚СѓС‚", icon: nIcon});
	} else {
		var latlng = L.latLng(55.7516147, 37.6187012);
		z= 7;
	}
	var cloudmadeUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        cloudmadeAttribution = 'Map data В© OpenStreetMap contributors',
        cloudmade = L.tileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution});
    map = L.map('map', {center: latlng, zoom: z, layers: [cloudmade], zoomControl:true });
	lc = L.control.locate({
		follow: true
	}).addTo(map); 
	markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
	$.get("/img/wait_icon.gif");
	var markerList = [];
	$.getJSON("/json/pointers.html", function (data){
		var imgs = new Array();
		$.each( data.img, function( i, item ) {
			imgs[item.i] = [ item.p ,  [item.x, item.y], [0, -item.y-1]];
			/*imgs[item.i][0] = item.p;
			imgs[item.i][1] =;
			imgs[item.i][2] = ;*/
		});
		var popap = L.popup({maxWidth: 320}).setContent('<img src="/img/wait_icon.gif" width="32" height="32" />');
		$.each( data.data, function( i, item ) {
			var title = item.ti.length > 0 ? item.ti : data.def.t;
			var iImg = item.img > 0 ? item.img : item.bimg > 0 ?  item.bimg : item.limg> 0 ?  item.limg: 1;
			var iUrl = imgs[iImg][0];
			var iAnchor =  imgs[iImg][1];
			var pAnchor = imgs[iImg][2];
			var mIcon = L.icon({iconUrl: iUrl, iconAnchor: iAnchor,popupAnchor: pAnchor});
			var marker = L.marker(new L.LatLng(item.la, item.lo), { title: title, "baseid": item.id, icon: mIcon});
			marker.bindPopup(popap);
			marker.on('click', onClick);
			markerList.push(marker);
		});
		markers.addLayers(markerList);
		map.addLayer(markers); 
		map.addLayer(nmarker);
		map.on("popupopen", function(evt){currentPopup = evt.popup});
	});	
	$('#geowait').remove();
}
/*
function login(){
	if(typeof xlogin == 'function') {
		xlogin();
	} else {
		$.getScript("/scripts/users.js", 
			function() {
				$.getScript("/scripts/jquery-validate.min.js", 
					function() {
						xlogin();
					})
			});
	}
}*/


$(document).ready( function () {
//loadd = $("<div style=\"margin: 10% auto; width: 64px;\" title=\"РРґРµС‚ Р·Р°РіСЂСѓР·РєР° СЃС‚СЂР°РЅРёС†С‹\" id=\"load\"><img width=\"64\" height=\"64\" src=\"/img/wait_icon.gif\"></div>");
//$(loadd).appendTo($("body"))//.dialog();
	if(typeof fsubmit != 'function') {
		$.getScript("/scripts/nlogin.js", 
			function() {
				$.getScript("/scripts/jquery-validate.min.js");
			}
		);
	}

	$.ajaxSetup({
		cache: true
	});
	$("#map").html("<img id='geowait' style='position:absolute;margin:auto;top:0;bottom:0;left:0;right:0;' src='/img/globus.gif' >");
	if (navigator.geolocation) {
		var geo_options = {
  enableHighAccuracy: true, 
  maximumAge        : 30000, 
  timeout           : 27000
};
	    navigator.geolocation.getCurrentPosition(m, g, geo_options);
	} else m();
	$("#menu").tabSlideOut({
		tabHandle: '.handle', //class of the element that will become your tab
//		pathToTabImage: '/images/down.png', //path to the image for the tab //Optionally can be set using css
		imageHeight: '60px', //height of tab image //Optionally can be set using css
		imageWidth: '84px', //width of tab image //Optionally can be set using css
		tabLocation: 'top', //side of screen where tab lives, top, right, bottom, or left
		speed: 300, //speed of animation
		action: 'click', //options: 'click' or 'hover', action to trigger animation
//		topPos: '100px', //position from the top/ use if tabLocation is left or right
		leftPos: '0px', //position from left/ use if tabLocation is bottom or top
		fixedPosition: false //options: true makes it stick(fixed position) on scroll
	}); 
	$( document ).on('click',"a.route-button", onRClick);
	$( document ).on( "click", "a.leaflet-routing-bar-close", function() {
		map.removeControl(Route);
		Route = undef;
	});
});



jQuery.js = function( url, options  ) {
	// Allow user to set any option except for dataType, cache, and url
	options = $.extend( options || {}, {
		dataType: "script",
		cache: true,
		url: url
	});
	// Use $.ajax() since it is more flexible than $.getScript
	// Return the jqXHR object so we can chain callbacks
	return jQuery.ajax( options );
};

$.ajaxSetup({
	cache: true
});