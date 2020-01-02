/*
 * GPS vars
 * GPS init
 * { "lat": number,      // Latitude in degrees
     "lon": number,      // Longitude in degrees
      "alt": number,      // altitude in M
      "speed": number,    // Speed in kph
      "course": number,   // Course in degrees
      "time": Date,       // Current Time
      "satellites": 7,    // Number of satellites
      "fix": 1            // NMEA Fix state - 0 is no fix
  }
 */
var lastFix = null;

var gpsValues = {
    overallDistance: 0.0,
    avgSpeed: 0.0,
    maxSpeed: 0.0,
    totAsc: 0.0,
    totDesc: 0.0
};
var startTime = null;
var paused = false;
/*
 * Data way points of
 * {
 *  time : number - time in seconds
 *  lat : number - latitude
 *  lon : number - longitude
 *  elev: number - elevation
 *  hrm: number - heart rate
 * }
 */
var dataPoints = [];

/*
 *  HR vars
 *  HR init
 */
var lastHrm;

/*
 * Screen management
 */
const SCN_GPS = 0;
const SCN_HR = 1;
const SCN_TRACK = 2;

const SCN_LAST = SCN_TRACK;
const SCN_FIRST = SCN_GPS;


var screen = SCN_GPS;
/*


let gpsSimPos = [
    {lat:46.552615, lon: 9.321346,alt:1468, fix:1,speed:14.5},
    {lat:46.552700, lon: 9.321743,alt:1469, fix:1,speed:15.5},
    {lat:46.552742, lon: 9.321897,alt:1468, fix:1,speed:14.5},
    {lat:46.552757, lon: 9.322149,alt:1470, fix:1,speed:13.5},
    {lat:46.552862, lon: 9.323096,alt:1469, fix:1,speed:12.5},
    {lat:46.552768, lon: 9.323396,alt:1468, fix:1,speed:11.5},
    {lat:46.552369, lon: 9.323524,alt:1467, fix:1,speed:12.5},
    {lat:46.551886, lon: 9.323191,alt:1468, fix:1,speed:11.5},
    {lat:46.551757, lon: 9.322119,alt:1468, fix:1,speed:10.5},
];
let sim = 0;

*/

(() => {

    Bangle.setGPSPower(1);
    Bangle.setHRMPower(1);
    Bangle.setLCDMode("doublebuffered");

    /*
      Button3 resets the "challenge data"
     */
    setWatch(x => {
        if (lastFix.fix === 1) {
            if (startTime == null) {
                startTime = Math.floor(Date.now() / 1000);
                onGPS(lastFix);
            } else {
                paused = !paused;
            }

        } else {

        }
    }, BTN1, {repeat: true});

    /*
     *  Middle button goes to next screen;
     */
    setWatch(x => {
        screen++;
        if (screen > SCN_LAST) {
            screen = SCN_FIRST;
        }
        if (lastFix.fix !== 1) {
            onGPS(lastFix);
        }
    }, BTN2, {repeat: true});

    /*
  Button3 resets the "challenge data"
 */
    setWatch(x => {
        gpsValues.overallDistance = 0.0;
        gpsValues.avgSpeed = 0.0;
        gpsValues.maxSpeed = 0.0;
        if (lastFix.fix !== 1) {
            onGPS(lastFix);
        }
    }, BTN3, {repeat: true});

    function gpsScreen(fix) {
        var txt = (fix.speed < 20) ? fix.speed.toFixed(1) : fix.speed;

        g.setFont("6x8", 2);
        g.setFontAlign(-1, 0);
        g.drawString("AVG:" + gpsValues.avgSpeed + " km/h", 10, 8);

        g.setFont("6x8", 7);
        g.setFontAlign(0, 0);
        g.drawString(txt, 120, 80);
        // nix
        g.setFont("6x8", 2);
        g.setFontAlign(-1, 0);
        g.drawString("MAX:" + gpsValues.maxSpeed + " km/h", 25, 150);
    }

    function trackScreen() {
        g.setFont("6x8", 2);
        g.setFontAlign(-1, 0);
        g.drawString("Asc:" + gpsValues.totAsc, 10, 8);
        g.setFontAlign(1, 0);
        g.drawString("Desc:" + gpsValues.totDesc, 220, 8);

        g.setFont("6x8", 3);
        g.setFontAlign(0, 0);
        g.drawString(gpsValues.overallDistance / 100 + " m", 120, 80);
        // nix
        g.setFont("6x8", 2);
        g.setFontAlign(-1, 0);
        g.drawString("Altitude:" + lastFix.alt + " m", 25, 150);

    }

    function noFixScreen(fix) {
        g.setFont("6x8", 2);
        g.drawString("SAT:" + fix.satellites, 215, 4);
        g.setFont("6x8", 1);
        g.drawString("Waiting for GPS", 120, 80);
    }

    function hrmScreen() {
        g.setFont("6x8", 7);
        g.setFontAlign(0, 0);
        g.drawString(lastHrm, 120, 80);
    }

    function onHRM(hrm) {
        /*hrm is an object containing:
          { "bpm": number,             // Beats per minute
            "confidence": number,      // 0-100 percentage confidence in the heart rate
            "raw": Uint8Array,         // raw samples from heart rate monitor
         */
        if (hrm.confidence > 75) {
            lastHrm = hrm.bpm;
        }
    }

    function isRunning() {
        return (startTime != null) && !paused;
    }

    function onGPS(fix) {

        g.clear();
        g.setFontAlign(1, 0);
        g.setFont("6x8");
        if (lastFix == null) {
            lastFix = fix;
            return;
        }


        if (fix.fix > 0) {
            if (isRunning()) {

                /*
                 * clalc distance
                 * FIXME: currently the altitude is not in the calculation, so the result is very week
                 *
                 */
                let x = (fix.lon - lastFix.lon) * Math.cos((fix.lat + lastFix.lat) / 2);
                let y = (lastFix.lat - fix.lat);
                let d = Math.sqrt(x * x + y * y) * 6371;// km;
                let distance = Math.round(d * 1000);

                let entry = {
                    time: Math.floor(Date.now() / 1000),
                    lat: fix.lat,
                    lon: fix.lon,
                    elev: fix.alt,
                    hrm: lastHrm
                };
                dataPoints.push(entry);
                /*
                 * Calculated values
                 */
                if (fix.speed > gpsValues.maxSpeed) {
                    gpsValues.maxSpeed = fix.speed;
                }

                if (distance > 1) {
                    gpsValues.avgSpeed = (gpsValues.overallDistance * gpsValues.avgSpeed + distance * fix.speed) / (gpsValues.overallDistance + distance);
                    gpsValues.overallDistance += distance;
                }
                let deltaHeight = fix.alt - lastFix.alt;
                if (deltaHeight > 0) {
                    gpsValues.totAsc += deltaHeight;
                } else if (deltaHeight < 0) {
                    gpsValues.totDesc += deltaHeight;
                }

            }

            switch (screen) {
                case SCN_GPS:
                    gpsScreen(fix);
                    break;
                case SCN_HR:
                    hrmScreen();
                    break;
                case SCN_TRACK:
                    trackScreen(fix);
            }

        } else {
            noFixScreen(fix);
        }
        g.flip();
        lastFix = fix;
    }


    Bangle.on('HRM', onHRM);
    Bangle.on('GPS', onGPS);
    // for debugging
    /*
    function feedGPS(){
        console.log(sim);
        console.log(gpsSimPos[sim]);
        onGPS(gpsSimPos[sim++]);
        if (sim >= gpsSimPos.length){
            sim = 0;
        }
    }
   setInterval(feedGPS,1000);
*/
})();
