let currentIndex = 0;
let csvData = [];

async function fetchData() {
try {
	const response = await fetch('/api/data'); 
    const data = await response.json();

    csvData = data;

    console.log(csvData);
    updateImage()

} catch (error) {
    console.error('Error fetching data:', error);
}
}
fetchData();


// credits: Dr.Molle https://stackoverflow.com/a/23463262
function fromPointToLatLng(point){
  	return {
   		lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
          Math.PI / 2)/ (Math.PI / 180),
   		lng:  (point.x - 128) / (256 / 360)
  	};
}

function normalizeTile(tile){
    var t=Math.pow(2,tile.z);
        tile.x=((tile.x%t)+t)%t;
        tile.y=((tile.y%t)+t)%t;
    return tile;
}

function getTileBounds(tile){
 	tile=normalizeTile(tile);
 	var t=Math.pow(2,tile.z),
     	s=256/t,
     	sw={x:tile.x*s,
         	y:(tile.y*s)+s},
     	ne={x:tile.x*s+s,
         	y:(tile.y*s)};
    return{sw:fromPointToLatLng(sw),
            ne:fromPointToLatLng(ne)
           }
}
// End credit

function prev() {
    currentIndex -= 1;
    if (currentIndex < 0) {
        console.warn("index out of range");
        currentIndex = 0;
    }
    updateImage();
}

function next() {
    currentIndex += 1;
    if (currentIndex >= csvData.length) {
        console.warn("index out of range");
        currentIndex = csvData.length - 1;
    }
    updateImage();

}

function updateImage() {
    const stride = 16; // Model was ran using this stride. Check the parkpulse-ai repo for more details. (predict_on_map.py)

    const x = 144171 + parseInt(csvData[currentIndex].x) / stride;
    const y = 77057 + parseInt(csvData[currentIndex].y) / stride;
    const z = 18; // Model was ran using this zoom level. Check the parkpulse-ai repo for more details. (get_images.py)

    const {'sw': south_west, 'ne': nord_east} = getTileBounds({'x':x, 'y':y, 'z':18});

    const latitude = (south_west.lat + nord_east.lat) / 2; 
    const longitude = (south_west.lng + nord_east.lng) / 2;
   
    document.getElementById("google-maps-link").href = `https://www.google.com/maps/place/${latitude},${longitude}/@${latitude},${longitude},122m/data=!3m1!1e3!4m4!3m3!8m2!3d${latitude}!4d${longitude}?entry=ttu`;
    document.getElementById("image").src = `https://khms3.google.com/kh/v=967?x=${parseInt(x / 2)}&y=${parseInt(y / 2)}&z=${z - 1}`;
}