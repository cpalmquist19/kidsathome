// Star Map - Plot the Sun and nearby stars
// Data source: Nearby stars information

// Helper function to convert Right Ascension (RA) to degrees
// RA format: "14h 29m 43.0s" or "14h 29m 43.0s" -> degrees (0-360)
function raToDegrees(raString) {
    if (!raString) return 0;
    
    // Parse RA string: "14h 29m 43.0s"
    const match = raString.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
    if (!match) return 0;
    
    const hours = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    const seconds = parseFloat(match[3]);
    
    // Convert to decimal hours
    const decimalHours = hours + (minutes / 60) + (seconds / 3600);
    
    // Convert to degrees (24h = 360°, so 1h = 15°)
    return decimalHours * 15;
}

// Helper function to parse magnitude (handles string formats like "0.0+1.4")
function parseMagnitude(magString) {
    if (typeof magString === 'number') return magString;
    if (!magString) return 10; // Default magnitude for dim stars
    
    // For binary systems, use the brighter component (first number)
    const match = magString.toString().match(/([-\d.]+)/);
    return match ? parseFloat(match[1]) : 10;
}

// Helper function to parse distance (handles uncertainty like "4.2465 ±0.0003")
function parseDistance(distanceString) {
    if (typeof distanceString === 'number') return distanceString;
    if (!distanceString) return 0;
    
    // Extract the main distance value
    const match = distanceString.toString().match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
}

// Star data - All nearby stars to the Sun
// Positions are based on celestial coordinates (RA/Dec) converted to 2D map angles
// Angles are in degrees from 0° (right/east), with positive angles going counterclockwise
const stars = [
    {
        name: "Proxima Centauri",
        type: "M5.5Ve",
        magnitude: 11.09,
        distance: 4.2465,
        angle: raToDegrees("14h 29m 43.0s"),
        description: "This dim red dwarf is the nearest star to the Sun, and it is a member of the Alpha Centauri system despite lying 0.24 light years from the main pair of stars. Proxima was discovered in 1915 by Robert Innes. It is a flare star with two confirmed planets (b, 2016 and d, 2025) and a candidate planet (c, 2019)."
    },
    {
        name: "Rigil Kentaurus (Alpha Centauri A)",
        type: "G2V",
        magnitude: 0.01,
        distance: 4.3441,
        angle: raToDegrees("14h 39m 36.5s"),
        description: "One of the two main stars in the Alpha Centauri system. A yellow dwarf star similar to our Sun. Together with Alpha Centauri B, they form one of the brightest objects in southern hemisphere skies. One directly imaged habitable-zone planet candidate (Alpha Centauri Ab) was discovered in 2021."
    },
    {
        name: "Toliman (Alpha Centauri B)",
        type: "K1V",
        magnitude: 1.34,
        distance: 4.3441,
        angle: raToDegrees("14h 39m 35.1s"),
        description: "The second main star in the Alpha Centauri system. An orange dwarf star that orbits Alpha Centauri A with an 80-year period. Planet b was refuted in 2015."
    },
    {
        name: "Barnard's Star",
        type: "M4.0Ve",
        magnitude: 9.53,
        distance: 5.9629,
        angle: raToDegrees("17h 57m 48.5s"),
        description: "Famous for having the largest-known proper motion of any star, this dim red dwarf travels 0.29 degrees against the background sky in a century. Discovered by E Barnard in 1916. It is a flare star with four confirmed planets (d, b, c, and e). In another 8000 years Barnard's Star will become the closest star to us."
    },
    {
        name: "Luhman 16 A",
        type: "L8",
        magnitude: 10.7,
        distance: 6.5029,
        angle: raToDegrees("10h 49m 18.9s"),
        description: "One of the two nearest brown dwarfs. Discovered in 2013, this brown dwarf is part of a binary system. Brown dwarfs are failed stars that are too small to sustain nuclear fusion."
    },
    {
        name: "Luhman 16 B",
        type: "T1",
        magnitude: 14.2,
        distance: 6.5029,
        angle: raToDegrees("10h 49m 18.9s"),
        description: "The second component of the Luhman 16 brown dwarf binary system."
    },
    {
        name: "WISE 0855−0714",
        type: "Y4",
        magnitude: 25.0,
        distance: 7.430,
        angle: raToDegrees("08h 55m 10.8s"),
        description: "A sub-brown dwarf discovered by the WISE space telescope. It is one of the coolest known brown dwarfs."
    },
    {
        name: "Wolf 359",
        type: "M6.0V",
        magnitude: 13.44,
        distance: 7.8558,
        angle: raToDegrees("10h 56m 29.2s"),
        description: "An excessively dim red dwarf discovered by Max Wolf in 1918. For 25 years it was the least luminous star known. It is a flare star with 1 candidate and 1 refuted planet."
    },
    {
        name: "Lalande 21185",
        type: "M2.0V",
        magnitude: 7.47,
        distance: 8.3044,
        angle: raToDegrees("11h 03m 20.2s"),
        description: "Recorded in JJ Lalande's star catalogue compiled in the 1790's, this is one of the brightest red dwarfs in the sky, but it still needs binoculars to see it. Has two known planets discovered in 2019 and 2021."
    },
    {
        name: "Sirius A",
        type: "A1V",
        magnitude: -1.46,
        distance: 8.7094,
        angle: raToDegrees("06h 45m 08.9s"),
        description: "This brilliant white star is the brightest star in the night sky and the most luminous star within 25 light years. Its white dwarf companion was first seen in 1852, the first white dwarf ever seen. The orbital period is 50 years."
    },
    {
        name: "Sirius B",
        type: "DA2",
        magnitude: 8.44,
        distance: 8.7094,
        angle: raToDegrees("06h 45m 08.9s"),
        description: "The white dwarf companion to Sirius A. This was the first white dwarf ever observed optically."
    },
    {
        name: "BL Ceti (Luyten 726-8 A)",
        type: "M5.5Ve",
        magnitude: 12.54,
        distance: 8.724,
        angle: raToDegrees("01h 39m 01.3s"),
        description: "This is a dim binary system consisting of two red dwarfs. The system is perhaps more famously known as UV Ceti, the variable-star name of the second star in the system. It is a famous flare star and can visibly brighten by several magnitudes as it ejects flares from its surface. Has 1 candidate planet."
    },
    {
        name: "UV Ceti (Luyten 726-8 B)",
        type: "M6.0Ve",
        magnitude: 12.99,
        distance: 8.724,
        angle: raToDegrees("01h 39m 01.3s"),
        description: "The second component of the Luyten 726-8 binary system. This is an archetypal flare star, giving its name to UV Ceti-type flare stars."
    },
    {
        name: "Ross 154",
        type: "M3.5Ve",
        magnitude: 10.43,
        distance: 9.7063,
        angle: raToDegrees("18h 49m 49.4s"),
        description: "A dim red dwarf. It is one of a number of nearby stars catalogued by Frank Ross in the 1930's. It is also a known flare star."
    },
    {
        name: "Ross 248",
        type: "M5.5Ve",
        magnitude: 12.29,
        distance: 10.3057,
        angle: raToDegrees("23h 41m 54.7s"),
        description: "Another dim red dwarf flare star."
    },
    {
        name: "Epsilon Eridani",
        type: "K2V",
        magnitude: 3.73,
        distance: 10.4749,
        angle: raToDegrees("03h 32m 55.8s"),
        description: "An orange dwarf star. This star was searched for signs of intelligent life with the Green Bank radio telescope in 1960. The IRAS satellite detected a lot of dust orbiting this star indicating a possible forming solar system. Has one confirmed planet (AEgir, 2000) and one candidate (c, 2002)."
    },
    {
        name: "Lacaille 9352",
        type: "M0.5V",
        magnitude: 7.34,
        distance: 10.7241,
        angle: raToDegrees("23h 05m 52.0s"),
        description: "A flare star. Has two planets, b and c, with equivocal evidence for a third in the habitable zone (2020)."
    },
    {
        name: "Ross 128",
        type: "M4.0Vn",
        magnitude: 11.13,
        distance: 11.0074,
        angle: raToDegrees("11h 47m 44.4s"),
        description: "A dim red dwarf flare star. Has one planet (b) discovered in 2017."
    },
    {
        name: "EZ Aquarii A",
        type: "M5.0Ve",
        magnitude: 13.33,
        distance: 11.109,
        angle: raToDegrees("22h 38m 33.4s"),
        description: "A triple star system of red dwarfs. A & B are flare stars."
    },
    {
        name: "EZ Aquarii B",
        type: "M?",
        magnitude: 13.27,
        distance: 11.109,
        angle: raToDegrees("22h 38m 33.4s"),
        description: "The second component of the EZ Aquarii triple system."
    },
    {
        name: "EZ Aquarii C",
        type: "M?",
        magnitude: 14.03,
        distance: 11.109,
        angle: raToDegrees("22h 38m 33.4s"),
        description: "The third component of the EZ Aquarii triple system."
    },
    {
        name: "61 Cygni A",
        type: "K5.0V",
        magnitude: 5.21,
        distance: 11.4039,
        angle: raToDegrees("21h 06m 53.9s"),
        description: "This binary system of two orange dwarf stars is famous for being the first star ever to have its distance measured by F Bessel in 1838. Both stars are very similar but are widely separated (86 AU) requiring about 700 years to orbit each other."
    },
    {
        name: "61 Cygni B",
        type: "K7.0V",
        magnitude: 6.03,
        distance: 11.4039,
        angle: raToDegrees("21h 06m 55.3s"),
        description: "The second component of the 61 Cygni binary system. B is a flare star, with possible planet or brown dwarf. Possible circumstellar disk."
    },
    {
        name: "Procyon A",
        type: "F5IV–V",
        magnitude: 0.38,
        distance: 11.463,
        angle: raToDegrees("07h 39m 18.1s"),
        description: "A brilliant yellow-white star, and the eighth brightest star in the sky. With twice the diameter of the Sun, Procyon is also the largest star within 25 light years. Procyon is orbited by a white dwarf companion first seen optically in 1896. The orbital period is 41 years."
    },
    {
        name: "Procyon B",
        type: "DQZ",
        magnitude: 10.70,
        distance: 11.463,
        angle: raToDegrees("07h 39m 18.1s"),
        description: "The white dwarf companion to Procyon A."
    },
    {
        name: "Struve 2398 A",
        type: "M3.0V",
        magnitude: 8.90,
        distance: 11.4908,
        angle: raToDegrees("18h 42m 46.7s"),
        description: "A binary system of two red dwarfs named Struve 2398 from a catalogue of double stars published in 1827. Both stars are flare stars, and star B has 2 candidate planets."
    },
    {
        name: "Struve 2398 B",
        type: "M3.5V",
        magnitude: 9.69,
        distance: 11.4908,
        angle: raToDegrees("18h 42m 46.9s"),
        description: "The second component of the Struve 2398 binary system. Has 2 candidate planets."
    },
    {
        name: "Groombridge 34 A",
        type: "M1.5V",
        magnitude: 8.08,
        distance: 11.6191,
        angle: raToDegrees("00h 18m 22.9s"),
        description: "A pair of red dwarfs. A is a flare star with two known planets (Ab, 2014, and Ac, 2018)."
    },
    {
        name: "Groombridge 34 B",
        type: "M3.5V",
        magnitude: 11.06,
        distance: 11.6191,
        angle: raToDegrees("00h 18m 22.9s"),
        description: "The second component of the Groombridge 34 binary system. B is a flare star."
    },
    {
        name: "DX Cancri",
        type: "M6.5Ve",
        magnitude: 14.78,
        distance: 11.6797,
        angle: raToDegrees("08h 29m 49.5s"),
        description: "A flare star."
    },
    {
        name: "Epsilon Indi A",
        type: "K5Ve",
        magnitude: 4.69,
        distance: 11.8670,
        angle: raToDegrees("22h 03m 21.7s"),
        description: "An orange dwarf. It is a similar star to Epsilon Eridani, although a little bit smaller and dimmer. Epsilon Indi is orbited by a pair of brown dwarfs - failed stars that are too small to burn. They were discovered in 2003. Has one planet (Ab) discovered in 2018."
    },
    {
        name: "Epsilon Indi Ba",
        type: "T1.0V",
        magnitude: 12.3,
        distance: 11.8670,
        angle: raToDegrees("22h 04m 10.5s"),
        description: "One of the two brown dwarf companions to Epsilon Indi A."
    },
    {
        name: "Epsilon Indi Bb",
        type: "T6.0V",
        magnitude: 13.2,
        distance: 11.8670,
        angle: raToDegrees("22h 04m 10.5s"),
        description: "The second brown dwarf companion to Epsilon Indi A."
    },
    {
        name: "Tau Ceti",
        type: "G8.5Vp",
        magnitude: 3.49,
        distance: 11.9118,
        angle: raToDegrees("01h 44m 04.1s"),
        description: "The nearest, single, sun-like star. It was searched (unsuccessfully) for any signs of intelligent life in 1960, along with Epsilon Eridani. Has a debris disk, and evidence for four planets (e, f, g, and h) and further four suspected planets (b, c, d, and 'i')."
    },
    {
        name: "GJ 1061",
        type: "M5.5V",
        magnitude: 13.09,
        distance: 11.9839,
        angle: raToDegrees("03h 35m 59.7s"),
        description: "Has 3 known planets discovered in 2019."
    },
    {
        name: "YZ Ceti",
        type: "M4.5V",
        magnitude: 12.02,
        distance: 12.1222,
        angle: raToDegrees("01h 12m 30.6s"),
        description: "A flare star with three planets (b, c, and d) discovered in 2017."
    },
    {
        name: "Luyten's Star",
        type: "M3.5Vn",
        magnitude: 9.86,
        distance: 12.3485,
        angle: raToDegrees("07h 27m 24.5s"),
        description: "A red dwarf. It is named after Willem Luyten who realised it was a nearby star in 1935. The star lies just 1.2 light years away from Procyon, but it is not associated with it. Has two planets (b, c) discovered in 2017 and two suspected planets (d, e) discovered in 2019."
    },
    {
        name: "Teegarden's Star",
        type: "M6.5V",
        magnitude: 15.14,
        distance: 12.4970,
        angle: raToDegrees("02h 53m 00.9s"),
        description: "Has 3 known planets discovered in 2019 and 2024."
    },
    {
        name: "Kapteyn's Star",
        type: "M1.5VI",
        magnitude: 8.84,
        distance: 12.8308,
        angle: raToDegrees("05h 11m 40.6s"),
        description: "Two refuted planets (b and c) were reported in 2014."
    },
    {
        name: "Lacaille 8760",
        type: "M0.0V",
        magnitude: 6.67,
        distance: 12.9472,
        angle: raToDegrees("21h 17m 15.3s"),
        description: "The brightest M dwarf star in night sky. It is a flare star."
    },
    {
        name: "SCR 1845−6357 A",
        type: "M8.5V",
        magnitude: 17.39,
        distance: 13.0638,
        angle: raToDegrees("18h 45m 05.3s"),
        description: "A very dim red dwarf with a brown dwarf companion."
    },
    {
        name: "SCR 1845−6357 B",
        type: "T6",
        magnitude: 13.3,
        distance: 13.0638,
        angle: raToDegrees("18h 45m 02.6s"),
        description: "The brown dwarf companion to SCR 1845−6357 A."
    },
    {
        name: "Kruger 60 A",
        type: "M3.0V",
        magnitude: 9.79,
        distance: 13.0724,
        angle: raToDegrees("22h 27m 59.5s"),
        description: "A binary system of two red dwarfs. B is a flare star."
    },
    {
        name: "Kruger 60 B",
        type: "M4.0V",
        magnitude: 11.41,
        distance: 13.0724,
        angle: raToDegrees("22h 27m 59.5s"),
        description: "The second component of the Kruger 60 binary system. B is a flare star."
    },
    {
        name: "DENIS J1048−3956",
        type: "M8.5V",
        magnitude: 17.39,
        distance: 13.1932,
        angle: raToDegrees("10h 48m 14.7s"),
        description: "A very dim red dwarf."
    },
    {
        name: "Ross 614 A",
        type: "M4.5V",
        magnitude: 11.15,
        distance: 13.363,
        angle: raToDegrees("06h 29m 23.4s"),
        description: "A binary system of red dwarfs. A is a flare star."
    },
    {
        name: "Ross 614 B",
        type: "M5.5V",
        magnitude: 14.23,
        distance: 13.363,
        angle: raToDegrees("06h 29m 23.4s"),
        description: "The second component of the Ross 614 binary system."
    },
    {
        name: "UGPS J0722-0540",
        type: "T9",
        magnitude: 16.52,
        distance: 13.43,
        angle: raToDegrees("07h 22m 27.3s"),
        description: "A very cool brown dwarf."
    },
    {
        name: "Wolf 1061",
        type: "M3.0V",
        magnitude: 10.07,
        distance: 14.0500,
        angle: raToDegrees("16h 30m 18.1s"),
        description: "Has three planets (b, c, and d) discovered in 2015."
    },
    {
        name: "Van Maanen's Star",
        type: "DZ7",
        magnitude: 12.38,
        distance: 14.0718,
        angle: raToDegrees("00h 49m 09.9s"),
        description: "The closest-known free-floating white dwarf, and the third-known white dwarf. Has a possible debris disk. Discovered in 1917."
    },
    {
        name: "Gliese 1",
        type: "M1.5V",
        magnitude: 8.55,
        distance: 14.1747,
        angle: raToDegrees("00h 05m 24.4s"),
        description: "A red dwarf star."
    },
    {
        name: "TZ Arietis",
        type: "M4.5V",
        magnitude: 12.27,
        distance: 14.5780,
        angle: raToDegrees("02h 00m 13.2s"),
        description: "A flare star with one confirmed planet (b)."
    },
    {
        name: "Wolf 424 A",
        type: "M5.5Ve",
        magnitude: 13.18,
        distance: 14.595,
        angle: raToDegrees("12h 33m 17.2s"),
        description: "A binary system of red dwarfs. Both are flare stars."
    },
    {
        name: "Wolf 424 B",
        type: "M7Ve",
        magnitude: 13.17,
        distance: 14.595,
        angle: raToDegrees("12h 33m 17.2s"),
        description: "The second component of the Wolf 424 binary system. Both are flare stars."
    },
    {
        name: "Gliese 687",
        type: "M3.0V",
        magnitude: 9.17,
        distance: 14.8395,
        angle: raToDegrees("17h 36m 25.9s"),
        description: "A possible flare star with two planets (b) discovered in 2014 and (c) discovered in 2020."
    },
    {
        name: "Gliese 674",
        type: "M3.0V",
        magnitude: 9.38,
        distance: 14.8492,
        angle: raToDegrees("17h 28m 39.9s"),
        description: "Has one planet (b) discovered in 2007."
    },
    {
        name: "LHS 292",
        type: "M6.5V",
        magnitude: 15.60,
        distance: 14.8706,
        angle: raToDegrees("10h 48m 12.6s"),
        description: "A flare star."
    },
    {
        name: "Gliese 440",
        type: "DQ6",
        magnitude: 11.50,
        distance: 15.1226,
        angle: raToDegrees("11h 45m 42.9s"),
        description: "A white dwarf star."
    },
    {
        name: "GJ 1245 A",
        type: "M5.5V",
        magnitude: 13.46,
        distance: 15.2001,
        angle: raToDegrees("19h 53m 54.2s"),
        description: "A triple star system of red dwarfs. All are flare stars."
    },
    {
        name: "GJ 1245 B",
        type: "M6.0V",
        magnitude: 14.01,
        distance: 15.2001,
        angle: raToDegrees("19h 53m 55.2s"),
        description: "The second component of the GJ 1245 triple system."
    },
    {
        name: "GJ 1245 C",
        type: "M5.5",
        magnitude: 16.75,
        distance: 15.2001,
        angle: raToDegrees("19h 53m 54.2s"),
        description: "The third component of the GJ 1245 triple system."
    },
    {
        name: "WISE 1741+2553",
        type: "T9",
        magnitude: 16.53,
        distance: 15.22,
        angle: raToDegrees("17h 41m 24.2s"),
        description: "A brown dwarf."
    },
    {
        name: "Gliese 876",
        type: "M3.5V",
        magnitude: 10.17,
        distance: 15.2382,
        angle: raToDegrees("22h 53m 16.7s"),
        description: "Has four planets (d (2005), c (2001), b (1998), and e (2010))."
    },
    {
        name: "WISE 1639−6847",
        type: "Y0.5",
        magnitude: 20.57,
        distance: 15.336,
        angle: raToDegrees("16h 39m 40.9s"),
        description: "A very cool brown dwarf."
    },
    {
        name: "LHS 288",
        type: "M5.5V",
        magnitude: 13.90,
        distance: 15.7586,
        angle: raToDegrees("10h 44m 21.2s"),
        description: "A red dwarf star."
    },
    {
        name: "GJ 1002",
        type: "M5.5V",
        magnitude: 13.76,
        distance: 15.8060,
        angle: raToDegrees("00h 06m 43.8s"),
        description: "Has two known planets (b & c) discovered in 2022."
    },
    {
        name: "DENIS 0255−4700",
        type: "L7.5V",
        magnitude: 22.92,
        distance: 15.877,
        angle: raToDegrees("02h 55m 03.7s"),
        description: "A brown dwarf."
    },
    {
        name: "Groombridge 1618",
        type: "K7.0V",
        magnitude: 6.59,
        distance: 15.8857,
        angle: raToDegrees("10h 11m 22.1s"),
        description: "A flare star with one suspected debris disk."
    },
    {
        name: "Gliese 412 A",
        type: "M1.0V",
        magnitude: 8.77,
        distance: 15.9969,
        angle: raToDegrees("11h 05m 28.6s"),
        description: "A binary system of red dwarfs."
    },
    {
        name: "Gliese 412 B",
        type: "M5.5V",
        magnitude: 14.48,
        distance: 15.9969,
        angle: raToDegrees("11h 05m 30.4s"),
        description: "The second component of the Gliese 412 binary system. B is a flare star."
    },
    {
        name: "AD Leonis",
        type: "M3.0V",
        magnitude: 9.32,
        distance: 16.1939,
        angle: raToDegrees("10h 19m 36.4s"),
        description: "A flare star with one refuted planet (b in 2020)."
    },
    {
        name: "Gliese 832",
        type: "M1.5V",
        magnitude: 8.66,
        distance: 16.2005,
        angle: raToDegrees("21h 33m 34.0s"),
        description: "A possible flare star with two planets; one confirmed (b (2008)), and the other now refuted (c (2014))."
    },
    {
        name: "Gliese 682",
        type: "M4V",
        magnitude: 10.95,
        distance: 16.3328,
        angle: raToDegrees("17h 37m 03.7s"),
        description: "Has two disputed planets."
    },
    {
        name: "40 Eridani A (Keid)",
        type: "K0.5V",
        magnitude: 4.43,
        distance: 16.3330,
        angle: raToDegrees("04h 15m 16.3s"),
        description: "A triple star system. Has one refuted planet."
    },
    {
        name: "40 Eridani B",
        type: "DA4",
        magnitude: 9.52,
        distance: 16.3330,
        angle: raToDegrees("04h 15m 21.8s"),
        description: "The white dwarf component of the 40 Eridani system."
    },
    {
        name: "40 Eridani C",
        type: "M4V",
        magnitude: 11.24,
        distance: 16.3330,
        angle: raToDegrees("04h 15m 21.5s"),
        description: "The third component of the 40 Eridani system."
    },
    {
        name: "EV Lacertae",
        type: "M3.5V",
        magnitude: 10.22,
        distance: 16.4761,
        angle: raToDegrees("22h 46m 49.7s"),
        description: "A record setting stellar flare was observed from this star."
    },
    {
        name: "70 Ophiuchi A",
        type: "K0V",
        magnitude: 4.21,
        distance: 16.7074,
        angle: raToDegrees("18h 05m 27.4s"),
        description: "A binary system of orange dwarf stars."
    },
    {
        name: "70 Ophiuchi B",
        type: "K5V",
        magnitude: 6.01,
        distance: 16.7074,
        angle: raToDegrees("18h 05m 27.5s"),
        description: "The second component of the 70 Ophiuchi binary system."
    },
    {
        name: "Altair",
        type: "A7IV-Vn",
        magnitude: 0.77,
        distance: 16.730,
        angle: raToDegrees("19h 50m 47.0s"),
        description: "One of the vertices of the Summer Triangle. A bright white star."
    },
    {
        name: "EI Cancri A",
        type: "M5.5V",
        magnitude: 14.06,
        distance: 16.800,
        angle: raToDegrees("08h 58m 15.2s"),
        description: "A binary system of red dwarfs."
    },
    {
        name: "EI Cancri B",
        type: "MV",
        magnitude: 14.92,
        distance: 16.800,
        angle: raToDegrees("08h 58m 15.2s"),
        description: "The second component of the EI Cancri binary system."
    },
    {
        name: "WISE J150649.97+702736.1",
        type: "T6",
        magnitude: 13.74,
        distance: 16.856,
        angle: raToDegrees("15h 06m 52.4s"),
        description: "A brown dwarf."
    },
    {
        name: "GJ 3379",
        type: "M3.5V",
        magnitude: 11.31,
        distance: 16.9861,
        angle: raToDegrees("06h 00m 03.5s"),
        description: "A red dwarf star."
    },
    {
        name: "DENIS J081730.0−615520",
        type: "T6",
        magnitude: 13.61,
        distance: 17.002,
        angle: raToDegrees("08h 17m 30.1s"),
        description: "A brown dwarf."
    },
    {
        name: "Gliese 445",
        type: "M3.5V",
        magnitude: 10.79,
        distance: 17.1368,
        angle: raToDegrees("11h 47m 41.4s"),
        description: "A red dwarf star."
    },
    {
        name: "2MASS J15404342−5101357",
        type: "M7V",
        magnitude: 15.26,
        distance: 17.3738,
        angle: raToDegrees("15h 40m 43.5s"),
        description: "A very dim red dwarf."
    },
    {
        name: "2MASS 0939−2448 A",
        type: "T8V",
        magnitude: 15.61,
        distance: 17.41,
        angle: raToDegrees("09h 39m 35.5s"),
        description: "A binary brown dwarf system."
    },
    {
        name: "2MASS 0939−2448 B",
        type: "T8V",
        magnitude: 15.61,
        distance: 17.41,
        angle: raToDegrees("09h 39m 35.5s"),
        description: "The second component of the 2MASS 0939−2448 binary brown dwarf system."
    },
    {
        name: "GJ 3323",
        type: "M4V",
        magnitude: 12.22,
        distance: 17.5309,
        angle: raToDegrees("05h 01m 57.4s"),
        description: "Has two known planets."
    },
    {
        name: "Gliese 526",
        type: "M1V",
        magnitude: 8.46,
        distance: 17.7263,
        angle: raToDegrees("13h 45m 43.8s"),
        description: "A red dwarf star."
    },
    {
        name: "WISE 0350−5658",
        type: "Y1",
        magnitude: 22.47,
        distance: 17.84,
        angle: raToDegrees("03h 50m 00.3s"),
        description: "A very cool brown dwarf."
    },
    {
        name: "Stein 2051 A",
        type: "M4V",
        magnitude: 11.04,
        distance: 17.9925,
        angle: raToDegrees("04h 31m 11.5s"),
        description: "A binary system with a red dwarf and white dwarf."
    },
    {
        name: "Stein 2051 B",
        type: "DC5",
        magnitude: 12.43,
        distance: 17.9925,
        angle: raToDegrees("04h 31m 12.6s"),
        description: "The white dwarf component of the Stein 2051 system."
    },
    {
        name: "2MASS J11145133−2618235",
        type: "T7.5",
        magnitude: 15.86,
        distance: 18.20,
        angle: raToDegrees("11h 14m 51.3s"),
        description: "A brown dwarf."
    },
    {
        name: "Gliese 251",
        type: "M3V",
        magnitude: 10.02,
        distance: 18.2146,
        angle: raToDegrees("06h 54m 49.0s"),
        description: "Has one known planet."
    },
    {
        name: "LP 816-60",
        type: "M3.5V",
        magnitude: 11.50,
        distance: 18.3305,
        angle: raToDegrees("20h 52m 33.0s"),
        description: "A red dwarf star."
    },
    {
        name: "LSR J1835+3259",
        type: "M8.5V",
        magnitude: 18.27,
        distance: 18.5534,
        angle: raToDegrees("18h 35m 37.9s"),
        description: "A very dim red dwarf."
    },
    {
        name: "Gliese 205",
        type: "M1V",
        magnitude: 7.95,
        distance: 18.6042,
        angle: raToDegrees("05h 31m 27.4s"),
        description: "A red dwarf star."
    },
    {
        name: "2MASS J04151954−0935066",
        type: "T8",
        magnitude: 15.34,
        distance: 18.62,
        angle: raToDegrees("04h 15m 19.5s"),
        description: "A brown dwarf."
    },
    {
        name: "Gliese 229 A",
        type: "M1.5V",
        magnitude: 8.14,
        distance: 18.7906,
        angle: raToDegrees("06h 10m 34.6s"),
        description: "A red dwarf with brown dwarf companions."
    },
    {
        name: "Gliese 229 Ba",
        type: "T7",
        magnitude: 14.01,
        distance: 18.7906,
        angle: raToDegrees("06h 10m 34.6s"),
        description: "One of the brown dwarf companions to Gliese 229 A."
    },
    {
        name: "Gliese 229 Bb",
        type: "T8",
        magnitude: 15.21,
        distance: 18.7906,
        angle: raToDegrees("06h 10m 34.6s"),
        description: "The second brown dwarf companion to Gliese 229 A."
    },
    {
        name: "Alsafi (Sigma Draconis)",
        type: "G9V",
        magnitude: 4.67,
        distance: 18.7993,
        angle: raToDegrees("19h 32m 21.6s"),
        description: "A yellow dwarf star similar to the Sun."
    },
    {
        name: "Ross 47",
        type: "M4V",
        magnitude: 11.57,
        distance: 18.8883,
        angle: raToDegrees("05h 42m 09.3s"),
        description: "A red dwarf star."
    },
    {
        name: "WISE 1541−2250",
        type: "Y0.5",
        magnitude: 20.99,
        distance: 18.93,
        angle: raToDegrees("15h 41m 51.6s"),
        description: "A very cool brown dwarf."
    },
    {
        name: "Gliese 570 A",
        type: "K4V",
        magnitude: 5.64,
        distance: 19.1987,
        angle: raToDegrees("14h 57m 28.0s"),
        description: "A triple star system with an orange dwarf and two red dwarfs, plus a brown dwarf companion."
    },
    {
        name: "Gliese 570 B",
        type: "M1.5V",
        magnitude: 8.30,
        distance: 19.1987,
        angle: raToDegrees("14h 57m 28.0s"),
        description: "The second component of the Gliese 570 system."
    },
    {
        name: "Gliese 570 C",
        type: "MV",
        magnitude: 9.96,
        distance: 19.1987,
        angle: raToDegrees("14h 57m 28.0s"),
        description: "The third component of the Gliese 570 system."
    },
    {
        name: "Gliese 570 D",
        type: "T7.5",
        magnitude: 15.32,
        distance: 19.1987,
        angle: raToDegrees("14h 57m 28.0s"),
        description: "The brown dwarf companion to the Gliese 570 system."
    },
    {
        name: "Gliese 693",
        type: "M3V",
        magnitude: 10.76,
        distance: 19.2078,
        angle: raToDegrees("17h 46m 32.4s"),
        description: "A red dwarf star."
    },
    {
        name: "Gliese 754",
        type: "M4V",
        magnitude: 12.23,
        distance: 19.2724,
        angle: raToDegrees("19h 20m 48.0s"),
        description: "Has one candidate planet."
    },
    {
        name: "Gliese 908",
        type: "M1V",
        magnitude: 8.98,
        distance: 19.2745,
        angle: raToDegrees("23h 49m 12.5s"),
        description: "A red dwarf star."
    },
    {
        name: "Gliese 752 A",
        type: "M2.5V",
        magnitude: 9.10,
        distance: 19.2922,
        angle: raToDegrees("19h 16m 55.3s"),
        description: "A binary system with a red dwarf and a very small, very dim red dwarf. Has one known planet."
    },
    {
        name: "Gliese 752 B (VB 10)",
        type: "M8V",
        magnitude: 17.45,
        distance: 19.2922,
        angle: raToDegrees("19h 16m 57.6s"),
        description: "A very small and very dim red dwarf companion to Gliese 752 A."
    },
    {
        name: "Gliese 588",
        type: "M2.5V",
        magnitude: 9.31,
        distance: 19.2996,
        angle: raToDegrees("15h 32m 12.9s"),
        description: "Has two candidate planets."
    },
    {
        name: "Eta Cassiopeiae A",
        type: "G3V",
        magnitude: 3.46,
        distance: 19.3314,
        angle: raToDegrees("00h 49m 06.3s"),
        description: "A binary system of a yellow dwarf and orange dwarf."
    },
    {
        name: "Eta Cassiopeiae B",
        type: "K7V",
        magnitude: 7.51,
        distance: 19.3314,
        angle: raToDegrees("00h 49m 06.3s"),
        description: "The orange dwarf companion to Eta Cassiopeiae A."
    },
    {
        name: "36 Ophiuchi A",
        type: "K1.5V",
        magnitude: 5.07,
        distance: 19.4185,
        angle: raToDegrees("17h 15m 20.9s"),
        description: "A triple star system of orange dwarf stars."
    },
    {
        name: "36 Ophiuchi B",
        type: "K1V",
        magnitude: 5.08,
        distance: 19.4185,
        angle: raToDegrees("17h 15m 21.0s"),
        description: "The second component of the 36 Ophiuchi system."
    },
    {
        name: "36 Ophiuchi C",
        type: "K5V",
        magnitude: 6.32,
        distance: 19.4185,
        angle: raToDegrees("17h 16m 13.4s"),
        description: "The third component of the 36 Ophiuchi system."
    },
    {
        name: "YZ Canis Minoris",
        type: "M4V",
        magnitude: 11.19,
        distance: 19.5330,
        angle: raToDegrees("07h 44m 40.2s"),
        description: "A red dwarf star."
    },
    {
        name: "GJ 1005 A",
        type: "M3.5V",
        magnitude: 11.60,
        distance: 19.577,
        angle: raToDegrees("00h 15m 28.1s"),
        description: "A binary system of red dwarfs. Distance is uncertain."
    },
    {
        name: "GJ 1005 B",
        type: "MV",
        magnitude: 14.02,
        distance: 19.577,
        angle: raToDegrees("00h 15m 28.1s"),
        description: "The second component of the GJ 1005 binary system."
    },
    {
        name: "HR 7703 A",
        type: "K2.5V",
        magnitude: 5.31,
        distance: 19.609,
        angle: raToDegrees("20h 11m 11.93s"),
        description: "A binary system of an orange dwarf and red dwarf."
    },
    {
        name: "HR 7703 B",
        type: "M4V",
        magnitude: 11.50,
        distance: 19.609,
        angle: raToDegrees("20h 11m 11.93s"),
        description: "The red dwarf companion to HR 7703 A."
    },
    {
        name: "82 G. Eridani",
        type: "G8V",
        magnitude: 4.26,
        distance: 19.7045,
        angle: raToDegrees("03h 19m 55.7s"),
        description: "Has three confirmed planets, three candidate planets, hot and cold dust disks."
    },
    {
        name: "Gliese 268 A",
        type: "M4.5V",
        magnitude: 12.05,
        distance: 19.7414,
        angle: raToDegrees("07h 10m 01.8s"),
        description: "A binary system of red dwarfs."
    },
    {
        name: "Gliese 268 B",
        type: "MV",
        magnitude: 12.45,
        distance: 19.7414,
        angle: raToDegrees("07h 10m 01.8s"),
        description: "The second component of the Gliese 268 binary system."
    },
    {
        name: "Delta Pavonis",
        type: "G8IV",
        magnitude: 3.55,
        distance: 19.893,
        angle: raToDegrees("20h 08m 43.6s"),
        description: "Has one candidate planet."
    },
    {
        name: "SIMP J013656.5+093347",
        type: "T2.5",
        magnitude: 13.25,
        distance: 19.955,
        angle: raToDegrees("01h 36m 56.5s"),
        description: "A rogue planet with 12.7 Jupiter masses."
    },
    {
        name: "2MASS 0937+2931",
        type: "T7",
        magnitude: 14.65,
        distance: 19.96,
        angle: raToDegrees("09h 37m 34.9s"),
        description: "A brown dwarf."
    },
    // Orion constellation stars
    {
        name: "Betelgeuse",
        type: "M1-2Ia",
        magnitude: 0.50,
        distance: 548,
        angle: raToDegrees("05h 55m 10.3s"),
        description: "Alpha Orionis. A red supergiant star and one of the largest stars known. It marks Orion's right shoulder and is one of the brightest stars in the night sky. Betelgeuse is a variable star and is expected to explode as a supernova within the next million years."
    },
    {
        name: "Rigel",
        type: "B8Ia",
        magnitude: 0.13,
        distance: 863,
        angle: raToDegrees("05h 14m 32.3s"),
        description: "Beta Orionis. A blue supergiant star and the brightest star in the Orion constellation. It marks Orion's left foot and is one of the most luminous stars in our galaxy. Rigel is actually a multiple star system."
    },
    {
        name: "Bellatrix",
        type: "B2III",
        magnitude: 1.64,
        distance: 250,
        angle: raToDegrees("05h 25m 07.9s"),
        description: "Gamma Orionis. A blue giant star marking Orion's left shoulder. The name means 'female warrior' in Latin. It is one of the hottest stars visible to the naked eye."
    },
    {
        name: "Mintaka",
        type: "O9.5II",
        magnitude: 2.23,
        distance: 1200,
        angle: raToDegrees("05h 32m 00.4s"),
        description: "Delta Orionis. The westernmost star of Orion's Belt. It is a multiple star system with at least three components. The name means 'belt' in Arabic."
    },
    {
        name: "Alnilam",
        type: "B0Ia",
        magnitude: 1.69,
        distance: 1344,
        angle: raToDegrees("05h 36m 12.8s"),
        description: "Epsilon Orionis. The middle star of Orion's Belt. It is a blue supergiant and one of the most luminous stars known. The name means 'string of pearls' in Arabic."
    },
    {
        name: "Alnitak",
        type: "O9.7Ib",
        magnitude: 1.77,
        distance: 1260,
        angle: raToDegrees("05h 40m 45.5s"),
        description: "Zeta Orionis. The easternmost star of Orion's Belt. It is a triple star system and is located near the famous Horsehead Nebula. The name means 'the girdle' in Arabic."
    },
    {
        name: "Saiph",
        type: "B0.5Ia",
        magnitude: 2.09,
        distance: 650,
        angle: raToDegrees("05h 47m 45.4s"),
        description: "Kappa Orionis. A blue supergiant star marking Orion's right knee. Despite being similar in brightness to Bellatrix, it appears dimmer due to its greater distance. The name means 'sword' in Arabic."
    },
    {
        name: "Meissa",
        type: "O8III",
        magnitude: 3.33,
        distance: 1320,
        angle: raToDegrees("05h 35m 08.3s"),
        description: "Lambda Orionis. A blue giant star marking Orion's head. It is actually a multiple star system and is surrounded by a large emission nebula. The name means 'the shining one' in Arabic."
    },
    // Pleiades (Seven Sisters) cluster
    {
        name: "Alcyone",
        type: "B7IIIe",
        magnitude: 2.87,
        distance: 444,
        angle: raToDegrees("03h 47m 29.1s"),
        description: "Eta Tauri. The brightest star in the Pleiades open cluster. A blue giant star with emission lines, located in the constellation Taurus. The Pleiades cluster is one of the nearest and most visible star clusters in the night sky."
    },
    {
        name: "Atlas",
        type: "B8III",
        magnitude: 3.62,
        distance: 444,
        angle: raToDegrees("03h 49m 09.7s"),
        description: "27 Tauri. One of the Seven Sisters in the Pleiades cluster. A blue giant star in the constellation Taurus."
    },
    {
        name: "Electra",
        type: "B6IIIe",
        magnitude: 3.70,
        distance: 444,
        angle: raToDegrees("03h 44m 52.5s"),
        description: "17 Tauri. One of the Seven Sisters in the Pleiades cluster. A blue giant star with emission lines in the constellation Taurus."
    },
    {
        name: "Maia",
        type: "B7III",
        magnitude: 3.86,
        distance: 444,
        angle: raToDegrees("03h 45m 49.6s"),
        description: "20 Tauri. One of the Seven Sisters in the Pleiades cluster. A blue giant star in the constellation Taurus."
    },
    {
        name: "Merope",
        type: "B6IVe",
        magnitude: 4.18,
        distance: 444,
        angle: raToDegrees("03h 46m 19.6s"),
        description: "23 Tauri. One of the Seven Sisters in the Pleiades cluster. A blue subgiant star with emission lines in the constellation Taurus."
    },
    {
        name: "Taygeta",
        type: "B6IV",
        magnitude: 4.29,
        distance: 444,
        angle: raToDegrees("03h 45m 12.5s"),
        description: "19 Tauri. One of the Seven Sisters in the Pleiades cluster. A blue subgiant star in the constellation Taurus."
    },
    {
        name: "Celaeno",
        type: "B7IV",
        magnitude: 5.44,
        distance: 444,
        angle: raToDegrees("03h 44m 48.2s"),
        description: "16 Tauri. One of the Seven Sisters in the Pleiades cluster. A blue subgiant star in the constellation Taurus."
    },
    {
        name: "Pleione",
        type: "B8IVpe",
        magnitude: 5.09,
        distance: 444,
        angle: raToDegrees("03h 49m 11.2s"),
        description: "28 Tauri. One of the Seven Sisters in the Pleiades cluster. A blue subgiant star with peculiar emission lines in the constellation Taurus."
    },
    // Additional bright stars
    {
        name: "Aldebaran",
        type: "K5III",
        magnitude: 0.85,
        distance: 65,
        angle: raToDegrees("04h 35m 55.2s"),
        description: "Alpha Tauri. A red giant star marking the eye of the bull in the constellation Taurus. It is one of the brightest stars in the night sky and appears to be part of the Hyades star cluster, though it is actually much closer to us."
    },
    {
        name: "Arcturus",
        type: "K1.5III",
        magnitude: -0.05,
        distance: 37,
        angle: raToDegrees("14h 15m 39.7s"),
        description: "Alpha Bootis. A red giant star and the brightest star in the constellation Boötes. It is the fourth brightest star in the night sky and one of the nearest red giants to Earth."
    },
    {
        name: "Antares",
        type: "M1.5Iab",
        magnitude: 0.96,
        distance: 550,
        angle: raToDegrees("16h 29m 24.5s"),
        description: "Alpha Scorpii. A red supergiant star marking the heart of the scorpion in the constellation Scorpius. It is one of the largest stars known and rivals Mars in brightness and color, hence its name meaning 'rival of Mars'."
    },
    {
        name: "Vega",
        type: "A0V",
        magnitude: 0.03,
        distance: 25,
        angle: raToDegrees("18h 36m 56.3s"),
        description: "Alpha Lyrae. A bright white main-sequence star and one of the vertices of the Summer Triangle. It was the pole star around 12,000 BC and will be again around 13,727 AD. Vega is one of the most studied stars in the sky."
    },
    {
        name: "Spica",
        type: "B1III-IV",
        magnitude: 0.98,
        distance: 250,
        angle: raToDegrees("13h 25m 11.6s"),
        description: "Alpha Virginis. A blue giant binary star system and the brightest star in the constellation Virgo. The name means 'ear of grain' in Latin, representing the wheat held by the maiden."
    },
    {
        name: "Regulus",
        type: "B8IVn",
        magnitude: 1.35,
        distance: 79,
        angle: raToDegrees("10h 08m 22.3s"),
        description: "Alpha Leonis. A blue-white subgiant star marking the heart of the lion in the constellation Leo. It is actually a quadruple star system and is one of the brightest stars in the night sky."
    },
    {
        name: "Acrab",
        type: "B1V",
        magnitude: 2.62,
        distance: 400,
        angle: raToDegrees("16h 05m 26.2s"),
        description: "Beta Scorpii. A blue main-sequence star in the constellation Scorpius. It is actually a multiple star system with at least five components. The name means 'scorpion' in Arabic."
    },
    {
        name: "Capella",
        type: "G3III",
        magnitude: 0.08,
        distance: 43,
        angle: raToDegrees("05h 16m 41.4s"),
        description: "Alpha Aurigae. A yellow giant binary star system and the brightest star in the constellation Auriga. It is the sixth brightest star in the night sky. The name means 'little she-goat' in Latin."
    },
    {
        name: "Canopus",
        type: "A9II",
        magnitude: -0.72,
        distance: 310,
        angle: raToDegrees("06h 23m 57.1s"),
        description: "Alpha Carinae. A white supergiant star and the second brightest star in the night sky. It is located in the constellation Carina and is one of the most luminous stars known."
    },
    {
        name: "Achernar",
        type: "B6Vep",
        magnitude: 0.46,
        distance: 139,
        angle: raToDegrees("01h 37m 42.8s"),
        description: "Alpha Eridani. A blue main-sequence star and the brightest star in the constellation Eridanus. It is one of the flattest stars known due to its rapid rotation. The name means 'end of the river' in Arabic."
    },
    {
        name: "Fomalhaut",
        type: "A3V",
        magnitude: 1.16,
        distance: 25,
        angle: raToDegrees("22h 57m 39.1s"),
        description: "Alpha Piscis Austrini. A white main-sequence star and the brightest star in the constellation Piscis Austrinus. It is surrounded by a debris disk and has at least one confirmed exoplanet. The name means 'mouth of the fish' in Arabic."
    },
    {
        name: "Alioth",
        type: "A0pCr",
        magnitude: 1.77,
        distance: 81,
        angle: raToDegrees("12h 54m 01.7s"),
        description: "Epsilon Ursae Majoris. A white main-sequence star and the brightest star in the Big Dipper asterism. It is located in the handle of the Big Dipper in the constellation Ursa Major."
    },
    {
        name: "Dubhe",
        type: "K0III",
        magnitude: 1.79,
        distance: 123,
        angle: raToDegrees("11h 03m 43.7s"),
        description: "Alpha Ursae Majoris. An orange giant star marking one of the pointer stars in the Big Dipper. It is part of a binary system and helps point toward Polaris, the North Star."
    },
    {
        name: "Polaris",
        type: "F7Ib",
        magnitude: 1.98,
        distance: 433,
        angle: raToDegrees("02h 31m 49.1s"),
        description: "Alpha Ursae Minoris. The North Star, a yellow supergiant located very close to the north celestial pole. It has been used for navigation for centuries and is part of a triple star system."
    },
    {
        name: "Mirach",
        type: "M0III",
        magnitude: 2.05,
        distance: 197,
        angle: raToDegrees("01h 09m 43.9s"),
        description: "Beta Andromedae. A red giant star in the constellation Andromeda. The name means 'loins' or 'girdle' in Arabic, referring to its position in the constellation."
    },
    {
        name: "Acrux",
        type: "B0.5IV",
        magnitude: 0.76,
        distance: 321,
        angle: raToDegrees("12h 26m 35.9s"),
        description: "Alpha Crucis. A blue subgiant binary star system and the brightest star in the Southern Cross constellation. It is the southernmost first-magnitude star and is used for navigation in the Southern Hemisphere."
    },
    // Supergiant stars
    {
        name: "UY Scuti",
        type: "M4Ia",
        magnitude: 9.0,
        distance: 9500,
        angle: raToDegrees("18h 27m 36.5s"),
        description: "A red supergiant star in the constellation Scutum. It is one of the largest known stars by radius, with a size that would extend beyond the orbit of Jupiter if placed at the center of our solar system."
    },
    {
        name: "VY Canis Majoris",
        type: "M3-M4.5Ia",
        magnitude: 7.96,
        distance: 3820,
        angle: raToDegrees("07h 22m 58.3s"),
        description: "A red hypergiant star in the constellation Canis Major. It is one of the largest known stars and one of the most luminous stars in the Milky Way galaxy."
    },
    {
        name: "Stephenson 2-18",
        type: "M6Ia",
        magnitude: 15.26,
        distance: 20000,
        angle: raToDegrees("18h 39m 02.0s"),
        description: "A red supergiant star in the open cluster Stephenson 2. It is currently considered one of the largest known stars by radius, with a size that would extend beyond the orbit of Saturn if placed at the center of our solar system."
    },
    // Pulsars (neutron stars)
    {
        name: "Black Widow Pulsar",
        type: "PSR",
        magnitude: 20.4,
        distance: 6500,
        angle: raToDegrees("19h 59m 36.77s"),
        description: "PSR B1957+20. A millisecond pulsar in the constellation Sagitta. It is an eclipsing binary system with a brown dwarf companion that it is slowly destroying through intense radiation, earning it the name 'Black Widow'. It rotates once every 1.6 milliseconds, making it one of the fastest-spinning pulsars known."
    },
    {
        name: "Vela Pulsar",
        type: "PSR",
        magnitude: 23.6,
        distance: 800,
        angle: raToDegrees("08h 35m 20.66s"),
        description: "PSR J0835-4510. A pulsar in the constellation Vela, located at the center of the Vela Supernova Remnant. It is one of the brightest pulsars in the radio spectrum and rotates once every 89 milliseconds. The supernova that created this pulsar occurred approximately 11,000 years ago."
    },
    {
        name: "Crab Pulsar",
        type: "PSR",
        magnitude: 16.65,
        distance: 6300,
        angle: raToDegrees("05h 34m 31.97s"),
        description: "PSR B0531+21. A pulsar located at the center of the Crab Nebula in the constellation Taurus. It is the remnant of a supernova that was observed and recorded by Chinese astronomers in 1054 AD. The pulsar rotates once every 33 milliseconds and is one of the most studied pulsars, emitting radiation across the entire electromagnetic spectrum."
    },
    {
        name: "Naos",
        type: "O5Ia",
        magnitude: 2.21,
        distance: 900,
        angle: raToDegrees("08h 03m 35.1s"),
        description: "Zeta Puppis. A blue supergiant star and the brightest star in the constellation Puppis. It is one of the most luminous O-type stars visible to the naked eye, with a luminosity 550,000 times that of the Sun. The name 'Naos' means 'ship' in Greek, reflecting its position in the former constellation Argo Navis. It has an extremely strong stellar wind and is expected to end its life in a supernova explosion."
    },
    {
        name: "Pollux",
        type: "K0III",
        magnitude: 1.14,
        distance: 33.78,
        angle: raToDegrees("07h 45m 18.95s"),
        description: "Beta Geminorum. An orange giant star and the brightest star in the constellation Gemini. It marks one of the heads of the twins in the constellation. Pollux is actually slightly closer to us than its companion Castor, despite being designated 'Beta'. It is the 17th brightest star in the night sky and has at least one confirmed exoplanet."
    },
    {
        name: "Castor",
        type: "A1V",
        magnitude: 1.58,
        distance: 51,
        angle: raToDegrees("07h 34m 36.00s"),
        description: "Alpha Geminorum. A white main-sequence star and the second brightest star in the constellation Gemini, marking the other head of the twins. Despite being designated 'Alpha', Castor is actually fainter than Pollux (Beta). Castor is actually a sextuple star system consisting of three binary pairs. It is one of the most studied multiple star systems in the sky."
    },
    {
        name: "Pistol Star",
        type: "O4-6Ia+",
        magnitude: 28.0,
        distance: 25000,
        angle: raToDegrees("17h 46m 15.25s"),
        description: "A blue hypergiant star located in the Quintuplet Cluster near the center of the Milky Way galaxy. It is one of the most luminous stars known, with a luminosity millions of times that of the Sun. The star gets its name from the Pistol Nebula, which it illuminates. Despite its extreme brightness, it appears very dim from Earth due to its great distance and obscuration by interstellar dust."
    },
    {
        name: "Eta Carinae A",
        type: "LBV",
        magnitude: 4.5,
        distance: 7500,
        angle: raToDegrees("10h 45m 03.59s"),
        description: "Eta Carinae. A luminous blue variable star and one of the most massive and luminous stars known. It is a binary system with a companion star, and together they form one of the most extreme stellar systems in the galaxy. In the 1840s, Eta Carinae underwent a 'Great Eruption' that briefly made it the second brightest star in the night sky. It is surrounded by the Homunculus Nebula, which was ejected during this event. The system is expected to explode as a supernova within the next million years."
    },
    {
        name: "Eta Carinae B",
        type: "O5.5V",
        magnitude: 5.5,
        distance: 7500,
        angle: raToDegrees("10h 45m 03.59s"),
        description: "The companion star to Eta Carinae A in the Eta Carinae binary system. It is a massive O-type main-sequence star that orbits Eta Carinae A with a period of 5.54 years. The two stars interact dramatically during their closest approach, producing intense stellar winds and radiation. The system is one of the most studied binary systems in the galaxy due to its extreme properties."
    },
    {
        name: "V1357 Cygni (HDE 226868 / Cygnus X-1)",
        type: "O9.7Iab",
        magnitude: 8.95,
        distance: 6100,
        angle: raToDegrees("19h 58m 21.68s"),
        description: "The visible companion star in the Cygnus X-1 binary system, which contains one of the first identified black holes. The black hole, with a mass of about 21 times that of the Sun, is one of the most massive stellar-mass black holes known. Cygnus X-1 is a bright X-ray source and was one of the first objects to be identified as a black hole candidate. The system demonstrates the accretion of matter from the supergiant star onto the black hole, producing intense X-ray emissions. Discovered in 1964, it is one of the most studied X-ray binary systems."
    },
    {
        name: "Sagittarius A*",
        type: "SMBH",
        magnitude: 10.0,
        distance: 26673,
        angle: raToDegrees("17h 45m 40.04s"),
        description: "The supermassive black hole at the center of the Milky Way galaxy, located in the constellation Sagittarius. With a mass of approximately 4.154 million solar masses, it anchors the entire galaxy. In May 2022, astronomers released the first direct image of the black hole's accretion disk, confirming its existence and providing unprecedented views of the event horizon. Despite its enormous mass, it is relatively quiet compared to active galactic nuclei in other galaxies. The black hole is surrounded by a cluster of stars that orbit it at high speeds, allowing astronomers to precisely measure its mass and properties."
    },
    {
        name: "WR 102",
        type: "WO2",
        magnitude: 14.0,
        distance: 25000,
        angle: raToDegrees("17h 45m 47.6s"),
        description: "A rare Wolf-Rayet star located in the constellation Sagittarius. It is one of the hottest known stars in the galaxy, with a surface temperature estimated at 210,000 K. Wolf-Rayet stars are massive, evolved stars with strong stellar winds that have stripped away their outer hydrogen layers, exposing their hot helium cores. WR 102 is extremely luminous and is in a late stage of stellar evolution, expected to explode as a supernova in the relatively near future."
    },
    {
        name: "Vindemiatrix (Epsilon Virginis)",
        type: "G8III",
        magnitude: 2.826,
        distance: 109.6,
        angle: raToDegrees("13h 02m 10.6s"),
        description: "Epsilon Virginis. A yellow giant star in the constellation Virgo. The name 'Vindemiatrix' means 'grape-gatherer' in Latin, as it was associated with the grape harvest. It is the third brightest star in Virgo and marks the southern edge of the constellation. This star has exhausted the hydrogen in its core and has expanded to become a giant, making it brighter and larger than when it was on the main sequence."
    },
    {
        name: "Porrima (Gamma Virginis)",
        type: "F0V",
        magnitude: 2.74,
        distance: 38.1,
        angle: raToDegrees("12h 41m 39.6s"),
        description: "Gamma Virginis. A binary star system in the constellation Virgo, consisting of two nearly identical F-type main-sequence stars. The name 'Porrima' comes from a Roman goddess of prophecy. The two stars orbit each other with a period of about 169 years, and they are separated by a distance similar to that between the Sun and Pluto. Both stars are yellow-white in color and are very similar in mass and luminosity."
    },
    {
        name: "Zaniah (Eta Virginis)",
        type: "A2V",
        magnitude: 3.89,
        distance: 265,
        angle: raToDegrees("12h 19m 54.3s"),
        description: "Eta Virginis. A triple star system in the constellation Virgo. The name 'Zaniah' means 'corner' in Arabic. The primary star is a white main-sequence star, while the system actually consists of three stars, with two close companions. The system is relatively close together, making it challenging to resolve all components without powerful telescopes."
    },
    {
        name: "Heze (Zeta Virginis)",
        type: "A3V",
        magnitude: 3.376,
        distance: 73,
        angle: raToDegrees("13h 34m 41.6s"),
        description: "Zeta Virginis. A white main-sequence star in the constellation Virgo. The name 'Heze' is of uncertain origin. It is a relatively nearby star and is brighter than the Sun, with a white or bluish-white color. Like other A-type stars, it is hotter and more massive than the Sun."
    },
    {
        name: "Minelauva (Delta Virginis)",
        type: "M3III",
        magnitude: 3.39,
        distance: 198,
        angle: raToDegrees("12h 55m 36.2s"),
        description: "Delta Virginis. A red giant star in the constellation Virgo. The name 'Minelauva' comes from Arabic and means 'the dog's barking' or 'howling dog'. It is a variable star with a slight variation in brightness. As a red giant, it has exhausted the hydrogen in its core and expanded to become much larger and cooler than it was on the main sequence, giving it its distinctive red color."
    },
    {
        name: "Gienah (Gamma Corvi)",
        type: "B8III",
        magnitude: 2.58,
        distance: 165,
        angle: raToDegrees("12h 15m 48.4s"),
        description: "Gamma Corvi. The brightest star in the constellation Corvus (the Crow). The name 'Gienah' means 'wing' in Arabic, referring to its position as the crow's wing. It is a blue-white giant star, much hotter and more luminous than the Sun. Despite being called a giant, it is still on the main sequence or has just evolved off it."
    },
    {
        name: "Algorab (Delta Corvi)",
        type: "B9.5V",
        magnitude: 2.94,
        distance: 87,
        angle: raToDegrees("12h 29m 51.9s"),
        description: "Delta Corvi. A binary star system in the constellation Corvus. The name 'Algorab' means 'the raven' in Arabic. The primary star is a blue-white main-sequence star, and it has a companion star. The system is relatively close to Earth, making it a good target for observation. The primary star is hotter and more massive than the Sun, giving it a bluish-white appearance."
    },
    {
        name: "Kraz (Beta Corvi)",
        type: "G5II",
        magnitude: 2.647,
        distance: 146,
        angle: raToDegrees("12h 34m 23.23s"),
        description: "Beta Corvi. The second brightest star in the constellation Corvus (the Crow), despite its Beta designation. The name 'Kraz' is of uncertain origin but may be related to the Arabic word for 'raven'. It is a yellow bright giant star, much larger and more luminous than the Sun. Having exhausted the hydrogen in its core, it has expanded and brightened, evolving off the main sequence."
    },
    {
        name: "Minkar (Epsilon Corvi)",
        type: "K2III",
        magnitude: 3.02,
        distance: 303,
        angle: raToDegrees("12h 10m 7.52s"),
        description: "Epsilon Corvi. An orange giant star in the constellation Corvus. The name 'Minkar' comes from Arabic and means 'beak' or 'nostril' of the crow, marking its position in the constellation. As a K-type giant, it has evolved beyond the main sequence and expanded to become larger and cooler, giving it its distinctive orange color. It is more luminous than the Sun despite its cooler temperature."
    },
    {
        name: "Alchiba (Alpha Corvi)",
        type: "F0IV",
        magnitude: 4.02,
        distance: 48.2,
        angle: raToDegrees("12h 8m 24.04s"),
        description: "Alpha Corvi. Despite its Alpha designation, this is actually the fifth brightest star in the constellation Corvus (the Crow). The name 'Alchiba' comes from Arabic and means 'the tent' or 'the beak of the crow'. It is a white subgiant star, slightly evolved from the main sequence. It is relatively close to Earth and is hotter and more massive than the Sun, with a white or yellowish-white color."
    },
    // Extragalactic objects
    {
        name: "LGGS J004246.86+413336.4",
        type: "O3-O5If",
        magnitude: 17.791,
        distance: 2500000,
        angle: raToDegrees("00h 42m 46.86s"),
        description: "One of the most luminous stars known, located in the Andromeda Galaxy (M31). With a luminosity of approximately 19,953,000 times that of the Sun and an absolute magnitude of -13.5, it is an extremely massive and hot O-type supergiant star. Despite its incredible intrinsic brightness, it appears very dim from Earth due to its distance of 2.5 million light years. The star has a surface temperature of around 40,000 K and is one of the most extreme stellar objects in the local group of galaxies. Data from SIMBAD."
    },
    {
        name: "R136a1",
        type: "WN5h",
        magnitude: 12.28,
        distance: 163000,
        angle: raToDegrees("05h 38m 42.0s"),
        description: "One of the most massive and luminous stars known, located in the Tarantula Nebula (30 Doradus) within the Large Magellanic Cloud. R136a1 is a Wolf-Rayet star with a luminosity of approximately 7,224,000 times that of the Sun and an absolute magnitude of -12.41. With a surface temperature of around 46,000 K, it is among the hottest and most massive stars currently known. Despite its extreme properties, it appears relatively dim from Earth due to its distance of 163,000 light years. The star is part of the R136 cluster, which contains some of the most massive stars in the observable universe. Data from SIMBAD."
    },
    {
        name: "VFTS 352",
        type: "O3-O5",
        magnitude: 13.5,
        distance: 160000,
        angle: raToDegrees("05h 38m 35.0s"),
        imagePath: "/static/images/VFTS 352.jpg",
        description: "A remarkable overcontact binary star system located in the Tarantula Nebula (30 Doradus) within the Large Magellanic Cloud. VFTS 352 consists of two massive O-type stars that are so close their surfaces overlap, sharing about 30% of their material. Each star has a mass of approximately 28.85 solar masses, a radius of 7.25 solar radii, and shines with a luminosity of 150,000 times that of the Sun. With an effective temperature of about 41,120 K, the stars orbit each other with a period of just over one day, with their centers separated by only about 12 million kilometers. This extreme proximity and interaction make VFTS 352 a subject of significant interest for stellar evolution studies, particularly concerning mass transfer in massive binary systems. The system is estimated to be about 1 million years old."
    },
    {
        name: "Peony Star",
        type: "WN10",
        magnitude: 13.8,
        distance: 26000,
        angle: raToDegrees("17h 46m 18.1s"),
        description: "One of the most luminous stars in the Milky Way galaxy, located in the Peony Nebula within the Sagittarius constellation. The Peony Star (also known as WR 102ka) is a Wolf-Rayet star with a mass of approximately 100 solar masses and a luminosity of about 2,951,000 times that of the Sun. With a surface temperature of 25,100 K and a spectral type of WN10, it is among the most massive and luminous stars known in our galaxy. Despite its extreme intrinsic brightness, it appears relatively dim from Earth due to its distance of 26,000 light years and obscuration by interstellar dust. The star is surrounded by the Peony Nebula, which it illuminates. Data from SIMBAD."
    },
    {
        name: "BD+43° 3654",
        type: "O6If+",
        magnitude: 10.06,
        distance: 5400,
        angle: raToDegrees("20h 33m 36.1s"),
        description: "A massive runaway star believed to have been ejected from the Cygnus OB2 association, one of the most massive stellar associations in the Milky Way. BD+43° 3654 is an O-type supergiant star with a mass of approximately 64.6 solar masses and a luminosity of about 2,030,000 times that of the Sun. With a surface temperature of 46,800 K and a spectral type of O6If+, it is an extremely hot and luminous star. The star's high velocity and trajectory indicate it was likely ejected from Cygnus OB2 through stellar interactions or supernova explosions. At a distance of approximately 5,400 light years, it is one of the most massive runaway stars known. Data from SIMBAD."
    },
    // Fictional objects
    {
        name: "Chrono Supernova",
        type: "FICTIONAL",
        magnitude: -1.8,
        distance: 47000000, // 47 million light years
        angle: raToDegrees("10h 39m 36.0s"), // Center of Leo constellation
        imagePath: "/static/images/chrono_supernova.png",
        description: "The Chrono Supernova is a colossal fictional stellar explosion located in the direction of the Leo constellation, approximately 47 million light-years away. This extraordinary event defies conventional supernova physics, appearing to ripple backwards through time as well as outward through space. Its brilliant shockwave carries temporal distortions that warp the fabric of spacetime in its vicinity, making it one of the most anomalous and awe-inspiring phenomena in the fictional cosmos."
    },
    {
        name: "Unvepto",
        type: "FICTIONAL",
        magnitude: 5.0,
        distance: 500,
        angle: 294, // 294° clockwise from top (where 0° is at top)
        imagePath: "/static/images/Unvepto.png",
        description: "A mysterious fictional object of unknown origin and nature. Unvepto appears in the star map as a unique celestial body, its true nature and purpose remaining a subject of speculation and wonder."
    },
    {
        name: "Hawkramenshon",
        type: "FICTIONAL",
        magnitude: -847,
        distance: 832000000, // 832 million light years
        angle: 120, // 120° clockwise from top (where 0° is at top)
        imagePath: "/static/images/Purple-Hyper-Giant.jpg",
        radius: 5, // 5 solar radii (5x the Sun's size)
        temperature: 30000, // 30,000 K
        luminosity: 18125, // ~18,125 solar luminosities (calculated from radius and temperature)
        description: "A massive fictional hypergiant star of extraordinary proportions. Hawkramenshon exists at an immense distance of 832 million light years, its brilliant purple glow visible across cosmic distances. The icon displayed represents the actual physical size of this star. The true nature and origin of this celestial object remain shrouded in mystery."
    },
    {
        name: "TON 618",
        type: "QUASAR",
        magnitude: 15.9,
        distance: 18200000000, // 18.2 billion light years
        angle: raToDegrees("12h 28m 24.9s"),
        imagePath: "/static/images/quasar.png",
        description: "TON 618 is an extremely luminous quasar located in the constellation Canes Venatici, approximately 18.2 billion light-years away. It contains one of the most massive supermassive black holes ever discovered, with an estimated mass of 66 billion solar masses. The quasar's accretion disk produces an extraordinary luminosity, making it one of the brightest objects in the observable universe. TON 618 was first identified in 1957 during the Tonantzintla Observatory survey and has since become a crucial object for studying the early universe and the growth of supermassive black holes."
    },
    {
        name: "Phoenix A*",
        type: "QUASAR",
        magnitude: 18.2,
        distance: 8610000000, // 8.61 billion light years
        angle: raToDegrees("23h 44m 40.9s"),
        imagePath: "/static/images/hyper_quasar.png",
        description: "Phoenix A* is the supermassive black hole at the center of the Phoenix Cluster (SPT-CL J2344-4243), located approximately 8.61 billion light-years away in the southern constellation Phoenix (RA 23h 44m 40.9s, Dec −42° 41′ 54″). With an estimated mass of 100 billion solar masses, it is considered the largest known black hole in the observable universe — roughly 1.5 times more massive than TON 618. The host galaxy, Phoenix A, is the brightest cluster galaxy in the Phoenix Cluster, which contains over 1,000 galaxies. The cluster itself is one of the most massive galaxy clusters known, and its central galaxy is undergoing an extraordinary rate of star formation, fueled by cooling gas flows. Phoenix A* has an apparent magnitude of 18.2 and is not visible to the naked eye."
    },
    {
        name: "Tithanmatrix",
        type: "FICTIONAL",
        magnitude: -850,
        distance: 845000000, // 845 million light years
        angle: raToDegrees("22h 00m 00.0s"), // Center of Cepheus constellation
        imagePath: "/static/images/Tithanmatrix.jpg",
        radius: 5, // 5 solar radii (5x the Sun's size)
        temperature: 32000, // 32,000 K
        luminosity: 20480, // ~20,480 solar luminosities (calculated from radius and temperature)
        description: "Tithanmatrix is an enigmatic fictional celestial object located in the constellation Cepheus, at an immense distance of 845 million light years. This mysterious entity radiates with an otherworldly brilliance, its nature defying conventional astronomical classification. The icon displayed represents the actual physical size of this object. Observers have noted its peculiar characteristics that seem to transcend the known laws of stellar physics, making it a subject of endless fascination and speculation."
    },
    {
        name: "Ectovrog",
        type: "FICTIONAL",
        magnitude: -1000000,
        distance: 92900000000, // 92.9 billion light years
        angle: raToDegrees("07h 11m 24.0s"), // Center of Gemini constellation
        imagePath: "/static/images/ChatGPT-Hyper-Star.png",
        radius: 5, // 5 solar radii (5x the Sun's size)
        temperature: 35000, // 35,000 K
        luminosity: 23828, // ~23,828 solar luminosities (calculated from radius and temperature)
        description: "Ectovrog is an extraordinary fictional hyper-star located in the constellation Gemini, at the staggering distance of 92.9 billion light years—near the edge of the observable universe. This cosmic anomaly defies all known principles of astrophysics, radiating with an incomprehensible luminosity that transcends conventional stellar classification. The icon displayed represents the actual physical size of this object. Its existence at such an extreme distance challenges our understanding of space, time, and the very fabric of reality itself. Ectovrog stands as a testament to the infinite mysteries that lie beyond the boundaries of human comprehension."
    },
    {
        name: "Prismatic Helix",
        type: "FICTIONAL",
        magnitude: -32,
        distance: 32600000000, // 32.6 billion light years
        angle: raToDegrees("20h 37m 12.0s"), // Center of Cygnus constellation
        imagePath: "/static/images/prismatic_void.jpg",
        description: "Prismatic Helix is a mesmerizing fictional celestial phenomenon located in the constellation Cygnus, at an extraordinary distance of 32.6 billion light years. This enigmatic structure appears to twist through the fabric of spacetime itself, displaying a kaleidoscope of colors that shift and dance across the electromagnetic spectrum. Unlike conventional stellar objects, the Prismatic Helix seems to exist in multiple dimensions simultaneously, creating a visual spectacle that challenges our perception of reality. Its prismatic nature suggests properties beyond our current understanding of physics, making it one of the most intriguing and mysterious objects in the fictional cosmos. ...Something stirs just beyond it. The Helix seems to pulse with an unnatural rhythm, as though it is not alone out there. Whatever lies behind it does not wish to be seen — yet."
    },
    {
        name: "The Cosmic Leviathan",
        type: "FICTIONAL",
        magnitude: -Infinity,
        distance: 32650000000, // 32.65 billion light years — just past the Prismatic Helix
        angle: raToDegrees("20h 37m 12.0s"), // Same direction as Prismatic Helix (Cygnus)
        imagePath: "/static/images/MJ-Cosmic-Leviathan.png",
        hidden: true, // Only revealed by right-clicking the Prismatic Helix
        description: "The Cosmic Leviathan is an incomprehensible entity lurking just beyond the Prismatic Helix, concealed within its shifting chromatic veil. Its magnitude is immeasurable — instruments simply return infinity. No known physics can account for its existence. Ancient astronomical texts, dismissed as myth, describe a creature woven from collapsed dimensions and dead light, older than the universe itself. It does not move. It does not need to. It has always been there, waiting behind the colors, patient beyond the concept of time."
    }
];

// Check if a star is M class (red dwarf)
function isMClass(type) {
    // Extract primary type (first letter before number or +)
    const primaryType = type.split(/[\d+]/)[0].trim();
    // Check if it starts with 'M' (handles M2, M4, M5, M6, M5+M5, etc.)
    return primaryType === 'M';
}

// Get primary star type from type string
function getPrimaryStarType(type) {
    if (!type) return null;
    
    // Extract primary type (first letter before number, +, or other non-letter characters)
    // This handles cases like "M5.5Ve", "M?", "DA2", etc.
    const match = type.match(/^([A-Z]+)/);
    if (!match) return null;
    
    const primaryType = match[1];
    
    // Special handling for white dwarfs (D class - DA, DB, DC, DZ, DQ, etc.)
    if (primaryType.startsWith('D')) {
        return 'D';
    }
    
    // Special handling for pulsars (PSR)
    if (primaryType === 'PSR') {
        return 'PSR';
    }
    
    // Special handling for luminous blue variables (LBV)
    // These are typically O or B type stars, so treat as O type
    if (primaryType === 'LBV') {
        return 'O';
    }
    
    // Special handling for Wolf-Rayet stars (WO, WR, etc.)
    // These are very hot, luminous stars similar to O-type, so treat as O type
    if (primaryType.startsWith('W')) {
        return 'O';
    }
    
    // Special handling for supermassive black holes (SMBH)
    if (primaryType === 'SMBH') {
        return 'SMBH';
    }
    
    // Special handling for fictional objects (FICTIONAL)
    if (primaryType === 'FICTIONAL') {
        return 'FICTIONAL';
    }
    
    // Special handling for quasars (QUASAR)
    if (primaryType === 'QUASAR') {
        return 'QUASAR';
    }
    
    // Return just the first letter for standard types (O, B, A, F, G, K, M, L, T, Y)
    // This handles "M?" -> "M", "M5.5Ve" -> "M", etc.
    return primaryType.charAt(0);
}

// Check if a star type is enabled
function isStarTypeEnabled(type) {
    const primaryType = getPrimaryStarType(type);
    return primaryType && enabledStarTypes.has(primaryType);
}

// Check if a star uses an image based on stellar type
function getStarImagePath(type) {
    // Extract primary type (first letter before number or +)
    const primaryType = type.split(/[\d+]/)[0].trim();
    
    // Check for white dwarf (D class - DA, DB, DC, DZ, DQ, etc.)
    if (primaryType.startsWith('D')) {
        return '/static/images/white-dwarf.png'; // White dwarf
    }
    
    // Check for Wolf-Rayet stars (WO, WR, etc.) - use O-type image
    if (primaryType.startsWith('W')) {
        return '/static/images/Yothetiuktaliathan.jpg'; // Wolf-Rayet stars (very hot, similar to O-type)
    }
    
    switch(primaryType) {
        case 'O': return '/static/images/Yothetiuktaliathan.jpg'; // Blue stars (O class)
        case 'B': return '/static/images/blue-star.png'; // Blue-white stars (B class)
        case 'M': return '/static/images/proxima-centauri.png'; // Red dwarf
        case 'K': return '/static/images/orange-dwarf.png'; // Orange dwarf
        case 'A': return '/static/images/white-star.png'; // White star
        case 'G': return '/static/images/yellow-dwarf.png'; // Yellow dwarf (like Sun)
        case 'F': return '/static/images/white-star.png'; // Yellow-white star (use white star image)
        case 'L': return '/static/images/NASA-BrownDwarf.jpg'; // Brown dwarf (L class)
        case 'T': return '/static/images/NASA-BrownDwarf.jpg'; // Brown dwarf (T class)
        case 'Y': return '/static/images/NASA-BrownDwarf.jpg'; // Brown dwarf (Y class)
        case 'PSR': return '/static/images/pulsar.png'; // Pulsar
        case 'LBV': return '/static/images/Yothetiuktaliathan.jpg'; // Luminous Blue Variable (O-type)
        case 'SMBH': return '/static/images/super_massive_black_hole.jpg'; // Supermassive black hole
        case 'QUASAR': return null; // Quasars use custom imagePath from star data
        case 'FICTIONAL': return null; // Fictional objects use custom imagePath from star data
        default: return null; // No image for other types
    }
}

// Check if a star should use an image
function usesStarImage(type) {
    return getStarImagePath(type) !== null;
}

// Get star color based on stellar type
function getStarColor(type) {
    // Extract primary type (first letter before number)
    const primaryType = type.split(/[\d+]/)[0].trim();
    
    switch(primaryType) {
        case 'O': return '#9bb0ff'; // Blue
        case 'B': return '#aabfff'; // Blue-white
        case 'A': return '#cad7ff'; // White
        case 'F': return '#f8f7ff'; // Yellow-white
        case 'G': return '#fff4ea'; // Yellow (like Sun)
        case 'K': return '#ffd2a1'; // Orange
        case 'M': return '#ffcc6f'; // Red-orange
        case 'DA': case 'DB': case 'DC': case 'DZ': case 'DQ': return '#ffffff'; // White dwarf (white)
        case 'D': return '#ffffff'; // White dwarf (white)
        case 'L': return '#ff8800'; // Brown dwarf (L class)
        case 'T': return '#cc6600'; // Brown dwarf (T class)
        case 'Y': return '#994400'; // Brown dwarf (Y class)
        case 'PSR': return '#00ffff'; // Pulsar (cyan - high energy neutron star)
        case 'LBV': return '#9bb0ff'; // Luminous Blue Variable (blue, like O-type)
        case 'SMBH': return '#000000'; // Supermassive black hole (black with accretion disk glow)
        case 'QUASAR': return '#ff00ff'; // Quasar (bright magenta/pink - extremely luminous)
        case 'FICTIONAL': return '#d946ef'; // Fictional objects (purple/magenta)
        default: return '#ffffff'; // Default white
    }
}

// Get star size based on magnitude (brighter = larger)
function getStarSize(magnitude, isMClass = false) {
    // Convert magnitude to size (lower magnitude = brighter = larger)
    // Apparent magnitude ranges from about -1.5 (Sirius) to 28 (very dim brown dwarfs)
    // We'll use a logarithmic scale
    if (typeof magnitude === 'string') {
        // For binary systems, use the brighter component
        magnitude = parseFloat(magnitude.split('+')[0]);
    }
    
    // Handle very dim stars (magnitude > 20) - make them visible but small
    if (magnitude > 20) {
        magnitude = 20; // Cap at 20 for size calculation
    }
    
    // M-class stars need to be larger to be visible and avoid overlap
    if (isMClass) {
        // M-class stars: 64px to 48px (much larger for visibility and to prevent overlap)
        const minSize = 48;  // Increased minimum size
        const maxSize = 64;  // Increased maximum size
        const minMag = 7.0;  // M-class stars are dim, adjust range
        const maxMag = 20.0; // Extended to handle very dim M stars
        const normalized = Math.max(0, Math.min(1, 1 - ((magnitude - minMag) / (maxMag - minMag))));
        return minSize + (normalized * (maxSize - minSize));
    }
    
    // Brighter stars (lower magnitude) should be larger
    // Increased size range for better visibility: -1.5 to 20 -> 48px to 24px
    const minSize = 24;  // Increased for better visibility
    const maxSize = 48;  // Increased for better visibility
    const minMag = -1.5;
    const maxMag = 20.0; // Extended to handle dim stars
    
    // Normalize magnitude to 0-1 range (inverted)
    const normalized = Math.max(0, Math.min(1, 1 - ((magnitude - minMag) / (maxMag - minMag))));
    
    // Scale to size range
    return minSize + (normalized * (maxSize - minSize));
}

// Zoom state management
let zoomLevel = 12; // Default: show 12 light year range (will be set on init)
const minZoom = 1; // 1 light year
const maxZoom = 93000000000; // 93,000,000,000 light years (93 billion ly) - covers the entire observable universe
const zoomStep = 0.1; // 10% zoom increment per scroll step
let isUpdatingSlider = false; // Flag to prevent slider update loops

// Star type filter state
const enabledStarTypes = new Set(['O', 'B', 'A', 'F', 'G', 'K', 'M', 'D', 'L', 'T', 'Y', 'PSR', 'SMBH', 'QUASAR']); // All enabled by default

// Tracks whether the Cosmic Leviathan has been unlocked (persisted via localStorage)
function isLeviathanUnlocked() {
    return localStorage.getItem('leviathanUnlocked') === 'true';
}

// Get current maximum visible distance based on zoom level
function getMaxVisibleDistance() {
    return zoomLevel;
}

// Convert zoom level to slider value (logarithmic scale)
function zoomToSliderValue(zoom) {
    // Use logarithmic scale: slider 0-100 maps to zoom 1-100000
    // log(zoom) / log(maxZoom) gives us 0-1 range
    const logMin = Math.log(minZoom);
    const logMax = Math.log(maxZoom);
    const logZoom = Math.log(zoom);
    const normalized = (logZoom - logMin) / (logMax - logMin);
    return normalized * 100; // Convert to 0-100 range
}

// Convert slider value to zoom level (logarithmic scale)
function sliderValueToZoom(sliderValue) {
    // Convert 0-100 slider value to logarithmic zoom
    const normalized = sliderValue / 100; // 0-1 range
    const logMin = Math.log(minZoom);
    const logMax = Math.log(maxZoom);
    const logZoom = logMin + (normalized * (logMax - logMin));
    return Math.exp(logZoom);
}

// Update zoom slider position
function updateZoomSlider() {
    if (isUpdatingSlider) return;
    
    const slider = document.getElementById('zoomSlider');
    if (slider) {
        isUpdatingSlider = true;
        slider.value = zoomToSliderValue(zoomLevel);
        isUpdatingSlider = false;
    }
}

// Format distance with abbreviated units (M, B, T)
function formatDistanceAbbreviated(distance) {
    if (distance < 1) {
        return `${(distance * 365.25).toFixed(1)} days`;
    } else if (distance < 1000) {
        return `${distance.toFixed(1)} ly`;
    } else if (distance < 1000000) {
        return `${(distance / 1000).toFixed(1)}k ly`;
    } else if (distance < 1000000000) {
        // Million
        return `${(distance / 1000000).toFixed(0)} M`;
    } else if (distance < 1000000000000) {
        // Billion
        return `${(distance / 1000000000).toFixed(0)} B`;
    } else {
        // Trillion
        return `${(distance / 1000000000000).toFixed(0)} T`;
    }
}

// Update zoom value display
function updateZoomValueDisplay() {
    const display = document.getElementById('zoomValueDisplay');
    if (display) {
        const maxDistance = getMaxVisibleDistance();
        display.textContent = formatDistanceAbbreviated(maxDistance);
    }
}

// Update distance scale display
function updateDistanceScale() {
    const maxDistance = getMaxVisibleDistance();
    const scaleLabel = document.getElementById('distanceScaleLabel');
    const zoomIndicator = document.getElementById('zoomLevelIndicator');
    const scaleBar = document.getElementById('distanceScaleBar');
    
    if (scaleLabel) {
        // Format distance nicely for scale label
        let distanceText;
        if (maxDistance < 1) {
            distanceText = `${(maxDistance * 365.25).toFixed(0)} days`;
        } else if (maxDistance < 1000) {
            distanceText = `${maxDistance.toFixed(0)} light years`;
        } else if (maxDistance < 1000000) {
            distanceText = `${(maxDistance / 1000).toFixed(0)}k light years`;
        } else if (maxDistance < 1000000000) {
            distanceText = `${(maxDistance / 1000000).toFixed(0)} M light years`;
        } else if (maxDistance < 1000000000000) {
            distanceText = `${(maxDistance / 1000000000).toFixed(0)} B light years`;
        } else {
            distanceText = `${(maxDistance / 1000000000000).toFixed(0)} T light years`;
        }
        scaleLabel.textContent = distanceText;
    }
    
    if (zoomIndicator) {
        // Format zoom level indicator using abbreviated format
        const zoomText = formatDistanceAbbreviated(maxDistance);
        zoomIndicator.textContent = `Max distance: ${zoomText}`;
    }
    
    // Update scale bar visual (the bar represents the current max distance)
    // The scale bar itself is fixed at 200px, representing the max visible distance
    if (scaleBar) {
        // The bar visually represents the current zoom level
        // At higher zoom levels, the same bar represents a larger distance
        // We could add visual indicators, but for now the label is sufficient
    }
    
    // Update zoom slider and value display
    updateZoomSlider();
    updateZoomValueDisplay();
    
    // Update star counts
    updateStarCounts();
}

// Count stars by type (within visible distance)
function countStarsByType() {
    const maxVisibleDistance = getMaxVisibleDistance();
    const counts = {
        'O': 0, 'B': 0, 'A': 0, 'F': 0, 'G': 0, 'K': 0, 'M': 0, 'D': 0, 'L': 0, 'T': 0, 'Y': 0, 'PSR': 0, 'SMBH': 0, 'QUASAR': 0, 'FICTIONAL': 0
    };
    
    stars.forEach(star => {
        if (star.distance <= maxVisibleDistance && !star.hidden) {
            const primaryType = getPrimaryStarType(star.type);
            if (primaryType && counts.hasOwnProperty(primaryType)) {
                counts[primaryType]++;
            }
        }
    });
    
    return counts;
}

// Count displayed stars (filtered by enabled types and zoom; hidden objects excluded)
function countDisplayedStars() {
    const maxVisibleDistance = getMaxVisibleDistance();
    return stars.filter(star => 
        star.distance <= maxVisibleDistance &&
        isStarTypeEnabled(star.type) &&
        !star.hidden
    ).length;
}

// Update star count displays
function updateStarCounts() {
    // Update total count
    const totalCountEl = document.getElementById('totalCount');
    if (totalCountEl) {
        const maxVisibleDistance = getMaxVisibleDistance();
        const totalVisible = stars.filter(star => star.distance <= maxVisibleDistance).length;
        totalCountEl.textContent = totalVisible;
    }
    
    // Update displayed count
    const displayedCountEl = document.getElementById('displayedCount');
    if (displayedCountEl) {
        const displayedCount = countDisplayedStars();
        displayedCountEl.textContent = displayedCount;
    }
    
    // Update counts for each filter type
    const counts = countStarsByType();
    Object.keys(counts).forEach(starType => {
        const countEl = document.querySelector(`[data-count-type="${starType}"]`);
        if (countEl) {
            countEl.textContent = counts[starType];
        }
    });
}

// Initialize the star map
function initStarMap() {
    const container = document.getElementById('starMapContainer');
    if (!container) return;
    
    // Clear existing stars and lines
    const existingStars = container.querySelectorAll('.star-element, .distance-line');
    existingStars.forEach(el => el.remove());
    
    // Get container dimensions - use multiple methods to ensure we get valid dimensions
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.offsetWidth || container.clientWidth || window.innerWidth;
    const height = rect.height || container.offsetHeight || container.clientHeight || window.innerHeight;
    
    // Ensure we have valid dimensions
    if (width <= 0 || height <= 0) {
        console.warn('Star map container has invalid dimensions, retrying...');
        setTimeout(initStarMap, 100);
        return;
    }
    
    // Get Sun's actual position to use as center
    const sunElement = document.getElementById('sun');
    let centerX, centerY;
    
    if (sunElement) {
        const sunRect = sunElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // Calculate Sun's center relative to container
        centerX = (sunRect.left - containerRect.left) + (sunRect.width / 2);
        centerY = (sunRect.top - containerRect.top) + (sunRect.height / 2);
    } else {
        // Fallback to container center if Sun element not found
        centerX = width / 2;
        centerY = height / 2;
    }
    
    // Get maximum visible distance based on zoom level
    const maxVisibleDistance = getMaxVisibleDistance();
    
    // Calculate scale factor to fit visible distance in viewport with padding
    const padding = 0.08; // 8% padding on all sides
    const maxRadius = Math.min(width, height) * (1 - padding * 2) / 2;
    const scaleFactor = maxRadius / maxVisibleDistance;
    
    // Update distance scale display
    updateDistanceScale();
    
    // Create star elements with actual relative positions
    // Filter stars based on zoom level and enabled star types (hidden objects excluded entirely)
    const visibleStars = stars.filter(star => 
        star.distance <= maxVisibleDistance &&
        isStarTypeEnabled(star.type) &&
        !star.hidden
    );
    
    // Group stars by distance and angle to handle binary/triple systems
    // Stars at the same distance and very similar angles are likely binary systems
    const starGroups = {};
    visibleStars.forEach((star, index) => {
        const key = `${star.distance.toFixed(2)}_${star.angle.toFixed(1)}`;
        if (!starGroups[key]) {
            starGroups[key] = [];
        }
        starGroups[key].push({ star, index });
    });
    
    visibleStars.forEach((star, index) => {
        // Convert angle from degrees to radians
        // Adjust angle so 0° is to the right (east), and convert to radians
        // Also adjust so the map orientation matches typical star maps
        let angleRad = ((star.angle - 90) * Math.PI) / 180;
        
        // Check if this is part of a binary/triple system (same distance and angle)
        const key = `${star.distance.toFixed(2)}_${star.angle.toFixed(1)}`;
        const group = starGroups[key];
        if (group && group.length > 1) {
            // Add small angular offset for binary/triple system components
            // Offset is proportional to component index to spread them slightly
            const componentIndex = group.findIndex(g => g.index === index);
            if (componentIndex > 0) {
                // Add small offset: ~0.5 degrees per component
                const offsetDegrees = componentIndex * 0.5;
                angleRad += (offsetDegrees * Math.PI) / 180;
            }
        }
        
        // Calculate position based on actual distance and angle
        const distancePx = star.distance * scaleFactor;
        const x = centerX + (Math.cos(angleRad) * distancePx);
        const y = centerY + (Math.sin(angleRad) * distancePx);
        
        // Draw line from center to star (distance indicator) - draw first so it's behind
        drawDistanceLine(container, centerX, centerY, x, y, star.distance);
        
        // Create star element
        const starElement = document.createElement('div');
        starElement.className = 'absolute star-element cursor-pointer group';
        starElement.style.left = `${x}px`;
        starElement.style.top = `${y}px`;
        starElement.style.transform = 'translate(-50%, -50%)';
        starElement.style.zIndex = '20';
        
        // Get star properties
        const starColor = getStarColor(star.type);
        const isM = isMClass(star.type);
        let starSize = getStarSize(star.magnitude, isM);
        // Special size multiplier for specific stars
        if (star.name === "Hawkramenshon" || star.name === "Tithanmatrix" || star.name === "Ectovrog") {
            // Sun's image is 64px (w-16 h-16), so 5x = 320px
            starSize = 64 * 5; // Make these objects 5x the Sun's image size
        }
        if (star.name === "Phoenix A*" || star.name === "TON 618" || star.name === "Chrono Supernova" || star.name === "Prismatic Helix") {
            starSize = starSize * 3; // 3x the default calculated size
        }
        // Check for custom image path first, then fall back to type-based path
        const imagePath = star.imagePath || getStarImagePath(star.type);
        const useImage = star.imagePath || usesStarImage(star.type);
        const primaryType = getPrimaryStarType(star.type);
        const isBlackHole = primaryType === 'SMBH';
        
        // Create star visual
        const starVisual = document.createElement('div');
        starVisual.className = 'relative';
        starVisual.style.width = `${starSize}px`;
        starVisual.style.height = `${starSize}px`;
        
        if (useImage && imagePath) {
            // Use image for stars that have images (M, K, A, D, G, F, L, T, Y classes)
            const starImage = document.createElement('img');
            starImage.src = imagePath;
            starImage.alt = star.name;
            starImage.className = 'object-contain';
            starImage.style.width = '100%';
            starImage.style.height = '100%';
            starImage.style.borderRadius = '50%'; // Make images circular
            starImage.style.filter = `drop-shadow(0 0 ${starSize * 0.3}px ${starColor})`;
            starVisual.appendChild(starImage);
        } else {
            // Use CSS-based rendering for other star types
            // Star glow - adjusted for larger sizes
            const glow = document.createElement('div');
            glow.className = 'absolute rounded-full opacity-50';
            glow.style.backgroundColor = starColor;
            glow.style.width = `${starSize * 2}px`;
            glow.style.height = `${starSize * 2}px`;
            glow.style.left = '50%';
            glow.style.top = '50%';
            glow.style.transform = 'translate(-50%, -50%)';
            glow.style.filter = `blur(${starSize * 0.5}px)`; // Scale blur with star size
            
            // Star point
            const point = document.createElement('div');
            point.className = 'absolute rounded-full';
            point.style.backgroundColor = starColor;
            point.style.width = `${starSize}px`;
            point.style.height = `${starSize}px`;
            point.style.left = '50%';
            point.style.top = '50%';
            point.style.transform = 'translate(-50%, -50%)';
            point.style.boxShadow = `0 0 ${starSize * 1.5}px ${starColor}`;
            
            starVisual.appendChild(glow);
            starVisual.appendChild(point);
        }
        
        starElement.appendChild(starVisual);
        
        // Star label
        const label = document.createElement('div');
        label.className = 'absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none';
        label.innerHTML = `
            <div class="bg-gray-900/90 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                <div class="font-bold">${star.name}</div>
                <div class="text-gray-300 text-xs">${star.distance.toFixed(2)} ly</div>
            </div>
        `;
        starElement.appendChild(label);
        
        // Add click handler for star info
        starElement.addEventListener('click', (e) => {
            e.stopPropagation();
            showStarInfo(star);
        });

        // Right-click on Prismatic Helix unlocks and navigates to the Leviathan map
        if (star.name === "Prismatic Helix") {
            starElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                localStorage.setItem('leviathanUnlocked', 'true');
                showLeviathanPortal();
            });
        }
        
        container.appendChild(starElement);
    });
}

// Draw distance line from center to star
function drawDistanceLine(container, x1, y1, x2, y2, distance) {
    const line = document.createElement('div');
    line.className = 'absolute distance-line';
    line.style.pointerEvents = 'none';
    line.style.zIndex = '5';
    
    // Calculate line length and angle
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Set line properties - make it more visible
    line.style.width = `${length}px`;
    line.style.height = '2px'; // Thicker line
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}deg)`;
    line.style.backgroundColor = 'rgba(147, 197, 253, 0.6)'; // Brighter, more visible
    line.style.boxShadow = '0 0 2px rgba(147, 197, 253, 0.4)'; // Add glow effect
    line.style.opacity = '0.8'; // More visible
    
    container.appendChild(line);
}

// Show star information modal
function showStarInfo(star) {
    // Create or update info modal
    let modal = document.getElementById('starInfoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'starInfoModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.style.display = 'none';
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideStarInfo();
            }
        });
    }
    
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-700 shadow-2xl">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-white mb-2">${star.name}</h2>
                    <div class="flex items-center space-x-4 text-gray-300">
                        <span><strong>Type:</strong> ${star.type}</span>
                        <span><strong>Magnitude:</strong> ${star.magnitude}</span>
                        <span><strong>Distance:</strong> ${star.distance.toFixed(2)} ly</span>
                    </div>
                </div>
                <button onclick="hideStarInfo()" class="text-gray-400 hover:text-white transition-colors">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            <p class="text-gray-300 leading-relaxed">${star.description}</p>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Hide star information modal
function hideStarInfo() {
    const modal = document.getElementById('starInfoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show a dramatic portal screen before navigating to the Leviathan map
function showLeviathanPortal() {
    const existing = document.getElementById('leviathanPortal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'leviathanPortal';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: radial-gradient(ellipse at center, rgba(20,0,30,0.98) 0%, rgba(0,0,0,1) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: portalFadeIn 0.8s ease-out;
    `;
    overlay.innerHTML = `
        <style>
            @keyframes portalFadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            @keyframes eyePulse {
                0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.8); transform: scale(1); }
                50%       { text-shadow: 0 0 60px rgba(168,85,247,1), 0 0 100px rgba(168,85,247,0.5); transform: scale(1.08); }
            }
            @keyframes portalGlow {
                0%, 100% { box-shadow: 0 0 60px rgba(168,85,247,0.4), 0 0 120px rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.5); }
                50%       { box-shadow: 0 0 100px rgba(168,85,247,0.7), 0 0 200px rgba(168,85,247,0.3); border-color: rgba(168,85,247,0.9); }
            }
        </style>
        <div style="
            background: radial-gradient(ellipse at center, rgba(30,0,45,0.97) 0%, rgba(5,0,10,0.97) 100%);
            border: 1px solid rgba(168,85,247,0.5);
            border-radius: 20px;
            padding: 52px 56px;
            text-align: center;
            max-width: 500px;
            width: 90%;
            animation: portalGlow 3s ease-in-out infinite;
        ">
            <div style="font-size: 3.5rem; margin-bottom: 16px; display: inline-block; animation: eyePulse 3s ease-in-out infinite;">👁️</div>
            <div style="color: rgba(216,180,254,0.7); font-size: 0.7rem; letter-spacing: 0.4em; text-transform: uppercase; margin-bottom: 12px;">You looked behind the Helix</div>
            <div style="color: white; font-size: 1.75rem; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.05em;">The Cosmic Leviathan</div>
            <div style="color: rgba(168,85,247,0.8); font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 24px;">has been revealed</div>
            <div style="color: rgba(209,196,233,0.7); font-size: 0.875rem; line-height: 1.7; margin-bottom: 32px;">It was always there. Patient beyond the concept of time.<br>It has been waiting for you.</div>
            <button onclick="window.location.href='/leviathan_map'" style="
                background: rgba(168,85,247,0.2);
                border: 1px solid rgba(168,85,247,0.6);
                color: rgba(216,180,254,1);
                padding: 12px 36px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 0.9rem;
                letter-spacing: 0.08em;
                transition: all 0.2s;
                display: block;
                width: 100%;
                margin-bottom: 12px;
            " onmouseover="this.style.background='rgba(168,85,247,0.4)'" onmouseout="this.style.background='rgba(168,85,247,0.2)'">
                Enter its domain →
            </button>
            <button onclick="document.getElementById('leviathanPortal').remove(); revealLeviathanNavButton();" style="
                background: transparent;
                border: none;
                color: rgba(156,163,175,0.6);
                padding: 8px;
                cursor: pointer;
                font-size: 0.8rem;
                letter-spacing: 0.05em;
                transition: color 0.2s;
            " onmouseover="this.style.color='rgba(156,163,175,1)'" onmouseout="this.style.color='rgba(156,163,175,0.6)'">
                Not yet
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Show the Leviathan nav button if already unlocked
function revealLeviathanNavButton() {
    const btn = document.getElementById('leviathanNavBtn');
    if (btn) btn.style.display = 'flex';
}

// Sun data
const sunData = {
    name: "Sun",
    type: "G2",
    magnitude: -26.8,
    distance: 0.0000158, // light years (essentially 0)
    description: "A typical yellow dwarf star. It has eight planets orbiting it."
};

// Show Sun information modal
function showSunInfo() {
    showStarInfo(sunData);
}

// Handle zoom with scroll wheel
function handleZoom(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Determine zoom direction (scroll down = zoom out, scroll up = zoom in)
    // Use logarithmic zooming for smooth scaling across wide range
    const scrollDelta = event.deltaY;
    const zoomDirection = scrollDelta > 0 ? -1 : 1;
    
    // Calculate zoom factor (10% change per step for smooth zooming)
    const zoomFactor = 1 + (zoomDirection * zoomStep);
    const newZoomLevel = zoomLevel * zoomFactor;
    
    // Clamp zoom level to min/max
    zoomLevel = Math.max(minZoom, Math.min(maxZoom, newZoomLevel));
    
    // Reinitialize star map with new zoom level
    initStarMap();
    
    // Counts are updated in initStarMap via updateDistanceScale
}

// Handle zoom with slider
function handleSliderZoom(event) {
    if (isUpdatingSlider) return;
    
    const sliderValue = parseFloat(event.target.value);
    const newZoomLevel = sliderValueToZoom(sliderValue);
    
    // Clamp zoom level to min/max (shouldn't be needed, but safety check)
    zoomLevel = Math.max(minZoom, Math.min(maxZoom, newZoomLevel));
    
    // Reinitialize star map with new zoom level
    initStarMap();
}

// Handle star type filter changes
function handleFilterChange(event) {
    const checkbox = event.target;
    const starType = checkbox.getAttribute('data-type');
    const isChecked = checkbox.checked;
    
    if (isChecked) {
        enabledStarTypes.add(starType);
    } else {
        enabledStarTypes.delete(starType);
    }
    
    // Reinitialize star map with new filters
    initStarMap();
    
    // Update counts after filter change
    updateStarCounts();
}

// Setup star type filters
function setupFilters() {
    const filterCheckboxes = document.querySelectorAll('.star-type-filter');
    filterCheckboxes.forEach(checkbox => {
        // Remove existing listener if any
        checkbox.removeEventListener('change', handleFilterChange);
        
        // Add change event listener
        checkbox.addEventListener('change', handleFilterChange);
    });
}

// Setup zoom event listener
function setupZoom() {
    const container = document.getElementById('starMapContainer');
    if (!container) {
        setTimeout(setupZoom, 100);
        return;
    }
    
    // Remove existing listener if any
    container.removeEventListener('wheel', handleZoom);
    
    // Add scroll event listener for zooming
    container.addEventListener('wheel', handleZoom, { passive: false });
    
    // Setup slider zoom control
    const slider = document.getElementById('zoomSlider');
    if (slider) {
        // Remove existing listener if any
        slider.removeEventListener('input', handleSliderZoom);
        slider.removeEventListener('change', handleSliderZoom);
        
        // Add input event for real-time updates while dragging
        slider.addEventListener('input', handleSliderZoom);
        // Add change event for final update on release (mobile/touch)
        slider.addEventListener('change', handleSliderZoom);
    }
}

// Initialize when DOM is ready
function initializeStarMap() {
    // Wait for container to be fully rendered
    const container = document.getElementById('starMapContainer');
    if (!container) {
        setTimeout(initializeStarMap, 100);
        return;
    }
    
    // Wait a bit more to ensure dimensions are available
    setTimeout(() => {
        // Set initial zoom to show the closest stars (about 25 ly to show all nearby stars)
        // Only set initial zoom if it hasn't been set yet
        if (zoomLevel === 12) {
            const maxStarDistance = Math.max(...stars.map(star => star.distance));
            zoomLevel = Math.max(maxStarDistance * 1.2, 25); // Show stars with some padding
        }
        
        initStarMap();
        
        // Setup zoom event listener
        setupZoom();
        
        // Setup star type filters
        setupFilters();
        
        // Initialize slider position
        updateZoomSlider();
    }, 200);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeStarMap();
    // Show the Leviathan nav button if already unlocked from a previous session
    if (isLeviathanUnlocked()) {
        revealLeviathanNavButton();
    }
});

// Reinitialize on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initStarMap();
    }, 250);
});

// Quick filter selection functions
function selectAllFilters() {
    const filterCheckboxes = document.querySelectorAll('.star-type-filter');
    filterCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            const starType = checkbox.getAttribute('data-type');
            enabledStarTypes.add(starType);
        }
    });
    
    // Reinitialize star map with new filters
    initStarMap();
    updateStarCounts();
}

function selectAllButFictional() {
    const filterCheckboxes = document.querySelectorAll('.star-type-filter');
    filterCheckboxes.forEach(checkbox => {
        const starType = checkbox.getAttribute('data-type');
        
        if (starType === 'FICTIONAL') {
            // Check only fictional
            checkbox.checked = true;
            enabledStarTypes.add(starType);
        } else {
            // Uncheck all others
            checkbox.checked = false;
            enabledStarTypes.delete(starType);
        }
    });
    
    // Reinitialize star map with new filters
    initStarMap();
    updateStarCounts();
}

function selectNoneFilters() {
    const filterCheckboxes = document.querySelectorAll('.star-type-filter');
    filterCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            const starType = checkbox.getAttribute('data-type');
            enabledStarTypes.delete(starType);
        }
    });
    
    // Reinitialize star map with new filters
    initStarMap();
    updateStarCounts();
}
