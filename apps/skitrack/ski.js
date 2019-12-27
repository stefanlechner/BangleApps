Bangle.setGPSPower(1);
Bangle.setLCDMode("doublebuffered");

var lastFix = {fix:1,
               satellites:0};
var werte = {
    durchschnitt: 100,
    maxSpeed :10
 };

function onGPS(fix) {
  lastFix = fix;
  g.clear();
  g.setFontAlign(1,0);
  g.setFont("6x8");
  g.drawString("SAT:"+fix.satellites,215,4);
  g.setFont("6x8",2);
  g.setFontAlign(-1,0);
  g.drawString("AVG:"+ werte.durchschnitt+" km/h",10,8);
  if (fix.fix > 0) {
    var txt = (fix.speed<20) ? fix.speed.toFixed(1) : fix.speed;
    if (fix.speed > werte.maxSpeed) {
      werte.maxSpeed = fix.speed;
    }

    werte.durchschnitt =(werte.durchschnitt+fix.speed) /2 ;
    var s = 80;
    g.setFont("6x8",7);
    g.setFontAlign(0,0);
    g.drawString(txt,120,80);
    // nix
    g.setFont("6x8",2);
  g.setFontAlign(-1,0);
  g.drawString("MAX:"+ werte.maxSpeed+" km/h",25,150);
  } else {
    g.setFont("6x8",2);
    g.drawString("Waiting for GPS",120,80);
  }
  g.flip();
  if (BTN1.read) {
    werte.maxSpeed = 0;
    werte.durchschnitt = 0;
  }
}

onGPS(lastFix);
Bangle.on('GPS', onGPS);