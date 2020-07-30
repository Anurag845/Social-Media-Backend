let assert = require('assert');
let fs = require('fs');
let swisseph = require('swisseph');
const IndianAstrology = require('indian-astrology');
const Jotiz = require('./Jotiz.js');

var DEBUG = false;

console.log(calc_natal_chart(15, 5, 1974, 3, 15, 18.31, 73.55, 5.5));


function calc_natal_chart(dd, mm, yy, hh, mi, lat, lng, tz) {


    var planets = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
    var chart = { "info": {}, "houses": [], "planets": [] };

    var basicInfo = IndianAstrology.getByDate(15, 5, 1974, 3, 15, 5, 30, false);

    birth_dasha = basicInfo.birthDasha.split('/');
    curr_dasha = basicInfo.currentDasha.split('/');

    chart.info = {"rashi": basicInfo.rashi, "zodiacSign": basicInfo.zodiacSign, "moonAngle": basicInfo.moonAngle,
                "nakshatra": basicInfo.nakshatra, "birth_md": birth_dasha[0], "birth_ad": birth_dasha[1], "birth_pd": birth_dasha[2],
                "curr_md": curr_dasha[0], "curr_ad": curr_dasha[1], "curr_pd": curr_dasha[2]};

    // Path to ephemeris data
    swisseph.swe_set_ephe_path('./ephe');

    // Initialize the received date
    var date = { year: yy, month: mm, day: dd, hour: hh, minute: mi };

    // Initialize udate to store Julian day
    let udate = date;

    // We need seconds as a placeholder (required by swe_julday)
    var isecs = 0;

    // Set topography based on the recieved latitude & longitude
    swisseph.swe_set_topo(lng, lat, 0);

    // Toggle between appropriate set of flags

    // Use this when lat, lng is available 
    let flag = swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_TOPOCTR;


    // Use this when lat, lng is not available
    // let flag = swisseph.SEFLG_SIDEREAL | swisseph.SE_GREG_CAL | swisseph.SEFLG_SPEED;

    // Factor in the timezone in the received date

    udate = swisseph.swe_utc_time_zone(date.year, date.month, date.day, date.hour, date.minute, isecs, tz,
        udate.year, udate.month, udate.day, udate.hour, udate.minutes, isecs);

    // Julian day is the key to all further calculations, get it
    julday_ut = swisseph.swe_julday(udate.year, udate.month, udate.day, udate.hour, swisseph.SE_GREG_CAL);

    let jotiz = new Jotiz(julday_ut);

    let ayanamsa;

    swisseph.swe_julday(udate.year, udate.month, udate.day, udate.hour, swisseph.SE_GREG_CAL,
        function (julday_ut) {
            if (DEBUG) console.log('Julian day:', julday_ut);

            // No astrological calculations are possible without ayanamsa, get it
            let ayanamsa = swisseph.swe_get_ayanamsa(julday_ut);

            if (DEBUG) console.log('Ayanamsa:', ayanamsa);
        });

    // Get the houses
    var houses = swisseph.swe_houses(julday_ut, lat, lng, '0');

    // Populate chart with house longitudes and occupied signs
    for (let i = 0; i < houses.house.length; i++) {
        chart.houses[i] = {
            "lng": houses.house[i],
            "sign": Math.floor(houses.house[i] / 30) + 1,
            "planet": '',
            "planet_name": '',
        };
    }

    // Now get the status of each planet one by one

    const planets_array = [
        swisseph.SE_SUN, swisseph.SE_MOON, swisseph.SE_MARS, swisseph.SE_MERCURY,
        swisseph.SE_JUPITER, swisseph.SE_VENUS, swisseph.SE_SATURN, swisseph.SE_MEAN_NODE,
        swisseph.SE_URANUS, swisseph.SE_NEPTUNE, swisseph.SE_PLUTO, swisseph.SE_TRUE_NODE];

    for (var i = 0; i < planets_array.length; i++) {

        if (planets_array[i] == swisseph.SE_TRUE_NODE)
            continue;

        planet = planets_array[i];
        p = swisseph.swe_calc_ut(julday_ut, planet, flag);

        // This is a very dirty temporary hack. Sun's longitudes are flawed by a degree or so.

        if (planets_array[i] == swisseph.SE_SUN)
            p.longitude++;

        // This is really helper data, because names are easy to correlate than numbers

        switch (planet) {
            case swisseph.SE_SUN: planet_name = "Sun"; break;
            case swisseph.SE_MOON: planet_name = "Mon"; break;
            case swisseph.SE_MARS: planet_name = "Mar"; break;
            case swisseph.SE_MERCURY: planet_name = "Mer"; break;
            case swisseph.SE_JUPITER: planet_name = "Jup"; break;
            case swisseph.SE_VENUS: planet_name = "Ven"; break;
            case swisseph.SE_SATURN: planet_name = "Sat"; break;
            case swisseph.SE_MEAN_NODE: planet_name = "Rah"; break;
            case swisseph.SE_TRUE_NODE: planet_name = "Ket"; break;
            case swisseph.SE_URANUS: planet_name = "Ura"; break;
            case swisseph.SE_NEPTUNE: planet_name = "Nep"; break;
            case swisseph.SE_PLUTO: planet_name = "Plu"; break;
        }

        nakshatra = swisseph.swe_split_deg(p.longitude, swisseph.SE_SPLIT_DEG_NAKSHATRA);

        planet_house = ((Math.floor(p.longitude / 30) + 1) + 12 - chart.houses[0].sign) % 12 + 1;

        chart.planets[planet] = {
            "name": planet_name,
            "lng": p.longitude,
            "sign": Math.floor(p.longitude / 30) + 1,
            "house": planet_house, //Math.floor(p.longitude / 30) + 1,
            "dr": p.longitudeSpeed < 0 ? 'R' : 'D',
            "starnum": nakshatra.sign + 1,
            "starname": jotiz.nak[nakshatra.sign],
            "ndeg": nakshatra.degree,
            "nmin": nakshatra.min,
            "nsec": nakshatra.second,
            "mmp": false,
            "mbp": false,
            "maraka": false
        };

        chart.houses[planet_house - 1].planet = chart.houses[planet_house - 1].planet + planets_array[i] + ',';
        chart.houses[planet_house - 1].planet_name = chart.houses[planet_house - 1].planet_name + planet_name + ',';

        // We have calculated Rahu, derive Ketu from it
        if (planets_array[i] == swisseph.SE_MEAN_NODE) {
            let kl = parseFloat(p.longitude) + 180.0;

            if (kl > 360)
                kl -= 360;

            p.longitude = kl;

            nakshatra = swisseph.swe_split_deg(p.longitude, swisseph.SE_SPLIT_DEG_NAKSHATRA);

            planet_house = ((Math.floor(p.longitude / 30) + 1) + 12 - chart.houses[0].sign) % 12 + 1;

            chart.planets[swisseph.SE_TRUE_NODE] = {
                "name": "Ke",
                "lng": p.longitude,
                "sign": Math.floor(p.longitude / 30) + 1,
                "house": planet_house, //Math.floor(p.longitude / 30) + 1,
                "dr": p.longitudeSpeed < 0 ? 'R' : 'D',
                "starnum": nakshatra.sign + 1,
                "starname": jotiz.nak[nakshatra.sign],
                "ndeg": nakshatra.degree,
                "nmin": nakshatra.min,
                "nsec": nakshatra.second,
                "mmp": false,
                "mbp": false,
                "maraka": false
            };

            chart.houses[planet_house - 1].planet = chart.houses[planet_house - 1].planet + swisseph.SE_TRUE_NODE + ',';
            chart.houses[planet_house - 1].planet_name = chart.houses[planet_house - 1].planet_name + "Ke" + ',';
        }
    };

    // Identify MMP & MBP planets for each ascendant

    switch (chart.houses[0].sign) {
        case 1:
            chart.planets[swisseph.SE_TRUE_NODE].mmp = true;
            chart.planets[swisseph.SE_MOON].mbp = true;
            chart.planets[swisseph.SE_MERCURY].maraka = chart.planets[swisseph.SE_SATRURN].maraka = true;
            break;
        case 2:
            chart.planets[swisseph.SE_JUPITER].mmp = true;
            chart.planets[swisseph.SE_SUN].mbp = true;
            chart.planets[swisseph.SE_JUPITER].maraka = chart.planets[swisseph.SE_MARS].maraka = true;
            break;
        case 3:
            chart.planets[swisseph.SE_TRUE_NODE].mmp = true;
            chart.planets[swisseph.SE_MERCURY].mbp = true;
            chart.planets[swisseph.SE_JUPITER].maraka = chart.planets[swisseph.SE_MARS].maraka = true;
            break;
        case 4:
            chart.planets[swisseph.SE_SATURN].mmp = true;
            chart.planets[swisseph.SE_VENUS].mbp = true;
            chart.planets[swisseph.SE_VENUS].maraka = chart.planets[swisseph.SE_MERCURY].maraka = true;
            break;
        case 5:
            chart.planets[swisseph.SE_MOON].mmp = true;
            chart.planets[swisseph.SE_MERCURY].mbp = true;
            chart.planets[swisseph.SE_VENUS].maraka = chart.planets[swisseph.SE_MERCURY].maraka = true;
            break;
        case 6:
            chart.planets[swisseph.SE_MARS].mmp = true;
            chart.planets[swisseph.SE_JUPITER].mbp = true;
            chart.planets[swisseph.SE_JUPITER].maraka = chart.planets[swisseph.SE_MARS].maraka = true;
            break;
        case 7:
            chart.planets[swisseph.SE_MERCURY].mmp = true;
            chart.planets[swisseph.SE_JUPITER].mbp = true;
            chart.planets[swisseph.SE_JUPITER].maraka = true;
            
            break;
        case 8:
            chart.planets[swisseph.SE_VENUS].mmp = true;
            chart.planets[swisseph.SATURN].mbp = true;
            chart.planets[swisseph.SE_VENUS] = chart.planets[swisseph.SE_MERCURY] = true;
            break;
        case 9:
            chart.planets[swisseph.SE_MOON].mmp = true;
            chart.planets[swisseph.SE_SUN].mbp = true;
            chart.planets[swisseph.SE_VENUS].maraka = chart.planets[swisseph.SE_SATRURN].maraka = true;
            break;
        case 10:
            chart.planets[swisseph.SE_SUN].mmp = true;
            chart.planets[swisseph.SE_MARS].mbp = true;
            chart.planets[swisseph.SE_JUPITER].maraka = chart.planets[swisseph.SE_MARS].maraka = true;
            break;

        case 11:
            chart.planets[swisseph.SE_MERCURY].mmp = true;
            chart.planets[swisseph.SE_VENUS].mbp = true;
            chart.planets[swisseph.SE_MARS].maraka = true;
            break;

        case 12:
            chart.planets[swisseph.SE_VENUS].mmp = true;
            chart.planets[swisseph.SE_MARS].mbp = true;
            chart.planets[swisseph.SE_SATURN].maraka = true;
            break;
    }

    swisseph.swe_close();

    // Get rid of trailing commas that were inserted earlier
    // This will be useful when querying database

    for (i = 0; i < chart.houses.length; i++) {
        chart.houses[i].planet = chart.houses[i].planet.slice(0, -1);
        chart.houses[i].planet_name = chart.houses[i].planet_name.slice(0, -1);
    }

    // There are several more parameters such as shadbala, isExalted, isDebilited
    // Not relevant at this moment, so skipping for the time being

    return chart;
}