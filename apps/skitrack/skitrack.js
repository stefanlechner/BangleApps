var lastFix = {
    fix: 1,
    satellites: 0
};
var werte = {
    durchschnitt: 0.0,
    maxSpeed: 0.0
};

(() => {

    Bangle.setGPSPower(1);
    Bangle.setLCDMode("doublebuffered");


    setWatch(x => {
        werte.durchschnitt = 0.0;
        werte.maxSpeed = 0.0;
    }, BTN1, {repeat: true});


    function onGPS(fix) {
        lastFix = fix;
        g.clear();
        g.setFontAlign(1, 0);
        g.setFont("6x8");
        g.drawString("SAT:" + fix.satellites, 215, 4);
        g.setFont("6x8", 2);
        g.setFontAlign(-1, 0);
        g.drawString("AVG:" + werte.durchschnitt + " km/h", 10, 8);
        if (fix.fix > 0) {
            var txt = (fix.speed < 20) ? fix.speed.toFixed(1) : fix.speed;
            if (fix.speed > werte.maxSpeed) {
                werte.maxSpeed = fix.speed;
            }

            werte.durchschnitt = (werte.durchschnitt + fix.speed) / 2;
            g.setFont("6x8", 7);
            g.setFontAlign(0, 0);
            g.drawString(txt, 120, 80);
            // nix
            g.setFont("6x8", 2);
            g.setFontAlign(-1, 0);
            g.drawString("MAX:" + werte.maxSpeed + " km/h", 25, 150);
        } else {
            g.setFont("6x8", 2);
            g.drawString("Waiting for GPS", 120, 80);
        }
        g.flip();

    }

    onGPS(lastFix);
    Bangle.on('GPS', onGPS);
})();
