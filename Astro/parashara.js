const moment = require('moment');

const PLANET_SUN = 0;
const PLANET_MOON = 1;
const PLANET_MERCURY = 2;
const PLANET_VENUS = 3;
const PLANET_MARS = 4;
const PLANET_JUPITER = 5;
const PLANET_SATURN = 6;
const PLANET_RAHU = 7;
const PLANET_KETU = 8;
const PLANET_MEANNODE = 7;
const PLANET_TRUENODE = 8;
const PLANET_ASCENDANT = 21;

const SIGN_AR = 1;
const SIGN_TA = 2;
const SIGN_GE = 3;
const SIGN_CN = 4;
const SIGN_LE = 5;
const SIGN_VI = 6;
const SIGN_LI = 7;
const SIGN_SC = 8;
const SIGN_SG = 9;
const SIGN_CP = 10;
const SIGN_AQ = 11;
const SIGN_PI = 12;

function natal_calc(dd, mm, yy, hh, mi, ss, tz, lon_deg, lon_ew, lon_min, lat_deg, lat_ns, lat_min, ) {

    var charts = array();
    var houses = array();
    var lords = array();

    var planet_names = array();
    planet_names[0] = 'Sun';
    planet_names[1] = 'Moon';
    planet_names[2] = 'Mercury';
    planet_names[3] = 'Venus';
    planet_names[4] = 'Mars';
    planet_names[5] = 'Jupiter';
    planet_names[6] = 'Saturn';
    planet_names[7] = 'Rahu';
    planet_names[8] = 'Ketu';
    planet_names[21] = 'Lagna';

    var sign_lords = array();
    sign_lords[SIGN_AR] = PLANET_MARS;
    sign_lords[SIGN_TA] = PLANET_VENUS;
    sign_lords[SIGN_GE] = PLANET_MERCURY;
    sign_lords[SIGN_CN] = PLANET_MOON;
    sign_lords[SIGN_LE] = PLANET_SUN;
    sign_lords[SIGN_VI] = PLANET_MERCURY;
    sign_lords[SIGN_LI] = PLANET_VENUS;
    sign_lords[SIGN_SC] = PLANET_MARS;
    sign_lords[SIGN_SG] = PLANET_JUPITER;
    sign_lords[SIGN_CP] = PLANET_SATURN;
    sign_lords[SIGN_AQ] = PLANET_SATURN;
    sign_lords[SIGN_PI] = PLANET_JUPITER;

    if (tz >= 0) {
        whole = floor(tz);
        fraction = tz - floor(tz);
    }
    else {
        whole = ceil(tz);
        fraction = tz - ceil(tz);
    }

    hh = hh - whole;
    mi = mi - (fraction * 60);

    utdate = dd.toString() + '.' + mm.toString() + '.' + yy.toString();
    uttime = hh.toString() + ':' + mi.toString() + ':' + ss.toString();

    var swisseph = require ('swisseph');

    var date = {year: 1974, month: 5, day: 15, hour: 3, minute: 15};
    var flag = swisseph.SEFLG_SIDEREAL | swisseph.SE_GREG_CAL | swisseph.SEFLG_SPEED;


    let udate = date;
    var isecs = 0;

    // Lat, Lng
    //swisseph.swe_set_topo(73.55, 18.31, 0);

    // path to ephemeris data
    swisseph.swe_set_ephe_path ('astro/ephe');

    udate = swisseph.swe_utc_time_zone(date.year, date.month, date.day, date.hour, date.minute, isecs, 5.5,
        udate.year, udate.month, udate.day, udate.hour, udate.minutes, isecs);

    swisseph.swe_julday (udate.year, udate.month, udate.day, udate.hour, swisseph.SE_GREG_CAL, function (julday_ut) {

        ayanamsa = swisseph.swe_get_ayanamsa_ut(julday_ut);

    });

    swisseph.swe_houses (julday_ut, 18.31, 73.55, '0', function (result) {
        console.log ("Houses:", result);
        first_house_rasi = floor(result[0] / 30) + 1;
        second_house_rasi = floor(result[1] / 30) + 1;
        third_house_rasi = floor(result[2] / 30) + 1;
        fourth_house_rasi = floor(result[3] / 30) + 1;
        fifth_house_rasi = floor(result[4] / 30) + 1;
        sixth_house_rasi = floor(result[5] / 30) + 1;
        seventh_house_rasi = floor(result[6] / 30) + 1;
        eighth_house_rasi = floor(result[7] / 30) + 1;
        ninth_house_rasi = floor(result[8] / 30) + 1;
        tenth_house_rasi = floor(result[9] / 30) + 1;
        eleventh_house_rasi = floor(result[10] / 30) + 1;
        twelfth_house_rasi = floor(result[11] / 30) + 1;
    });

    planet = swisseph.swe_calc_ut (julday_ut, swisseph.SE_MOON, flag);

    planet_long = planet['longitude'];
    house = Math.floor (planet_long / 30) + 1;
    is_retrograde = planet['longitudeSpeed'] < 0 ? 'R' : '';


}
