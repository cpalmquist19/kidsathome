# -*- coding: utf-8 -*-
"""
Raw name tables for scripts/build_numbers_vs_operations_data.py.

Everything here was read from the sources listed in SOURCES (see the build
script). Definitions are copied as the sources give them; None means the
source names the number but gives no definition.
"""

# --------------------------------------------------------------------------
# Googology Wiki "List of googolisms": growth-class tiers, smallest first.
# Within a tier the order is only the source's listing order.
# Entry = "Name" or ("Name", "definition as given").
# --------------------------------------------------------------------------
TIERS = [
 ("tetration-heights", "Towers with astronomically tall heights", [
   "Zootzootplex", ("Googolplexstack", "10↑↑10^(10^100)"), "Googolplexidex"]),
 ("up-arrow", "10↑↑↑3 up to the start of the omega levels", [
   ("Tria-taxis", "10↑↑↑3"), ("Giggolplex", "10↑↑giggol"),
   ("Tetra-taxis", "10↑↑↑4"), "Equiduoxal", "Grangoldex", "Kiloexpofaxul",
   "Googolgoogolduplex", ("FancyK", "10↑↑↑10"),
   ("Megiston", "10 in a circle (Steinhaus); about 10↑↑↑11"),
   ("Gaggol", "10↑↑↑100"), ("Folkman's number", "2↑↑↑2901"),
   ("Googol-3-flex", "10↑↑↑10^100"), ("Grahal g1", "3↑↑↑↑3"),
   ("Super K", "10↑↑↑↑3"), ("Tritet", "{4,4,4} = 4 with 4 arrows 4"),
   "Hexar Q(1,0)(6)", ("Deka-petaxis", "10↑↑↑↑10"), ("Geegol", "10↑↑↑↑100"),
   ("Tripent", "{5,5,5} = 5 with 5 arrows 5"), ("Gigol", "{10,100,5}"),
   ("Goggol", "{10,100,6}"), ("Trisept", "{7,7,7} = 7 with 7 arrows 7"),
   ("Gagol", "{10,100,7}"), "Hexofaxul", "Pentofaxul", "Gulgol",
   ("Hyperfaxul", "200![1]"), "Gongol", "Equiquinoxal",
   ("q(6)", "lower bound")]),
 ("linear-omega", "About f_omega to f_omega^2 (fast-growing hierarchy)", [
   ("Moser's number", "2 in a mega-sided polygon (Steinhaus-Moser)"),
   "Boogolplex", "Kilohyperfaxul", "Gongolplex", "Little Graham",
   ("Graham's number", "g64, where g0 = 4 and g(k+1) = 3 ^(g_k arrows) 3"),
   ("xkcd number", "A(G,G), where G is Graham's number"), "Corporal",
   "Corporalplex", "Forcal", "Force", "Suporcal", "Megocal", "Terribocal",
   "Tribocal", "Conway's tetratri", "Tetratri", "Supertet", "Pentatri",
   "Superpent", "Hexatri", "Superhex", ("Ultron", "about f_(omega+200)(100)"),
   "Giaxul", "Giabixul", "Giatrixul", "Kaboodol", "General", "Throogol",
   "Troogol", "Bagol", "Baggol", "Beegol", "Bigol", "Biggol", "Boggol",
   "Gugolhepta", "Gugolocta", "Dihexar", "Trihexar", "Septasexahexar"]),
 ("quadratic-omega", "About f_omega^2 to f_omega^3", [
   "Generalplex", "Kaboodolplex", "Troogolplex", "Thrangol", "Threagol",
   "Thrugold", "Thrugolthra", "Thrugoltesla", "Triggol", "Triggolplex",
   "Traggol", "Trigol", "Treegol", "Tragol", "Troggol", "Throohexol",
   "Throogogdol", "Tetroogol", "Quadroogol", "Pentadecal", "Superoct",
   "Superenn", "Pentoogol", "Quintoogol"]),
 ("polynomial-omega", "About f_omega^3 to f_omega^omega", [
   "Pentadecalplex", "Quadroogolplex", "Hexadecal", "Heptadecal",
   "Octadecal", "Ennadecal", ("Iteral", "10 entries of 10"),
   ("Ultatri", "3 repeated 27 times"), "Goobol", ("Godgahlah", "E100#^#100"),
   "Godgahlahgong", "Octoogol", "Dektoogol"]),
 ("exp-linear-omega", "About f_omega^omega to f_omega^(omega^2)", [
   "Dupertri", "Duperdecal", "Latri", "Emperal", "Emperalplex", "Hyperal",
   "Admiral", "Diteral", "Dubol", "Dutritri", "Dutridecal",
   ("Fish number 3", "F_3^63(3)"), "Gossol", "Mossol", "Bossol", "Trossol",
   "Quintossol", "Grandgahlah", "Greagahlah", "Gridgahlah", "Thraelgathor",
   "Xappol", "Goxxol"]),
 ("exp-polynomial-omega", "About f_omega^(omega^2) to f_omega^(omega^omega)", [
   "Xappolplex", "Dimentri", "Colossol", "Colossolplex", "Terossol",
   "Petossol", "Ectossol", "Zettossol", "Yottossol", "Xennossol",
   "Dimendecal", "Gongulus", "Kubikahlah", "Quarticahlah", "Quinticahlah",
   "Sexticahlah", "Septicahlah", "Octicahlah", "Nonicahlah", "Decicahlah"]),
 ("double-exp-omega", "Double-exponentiated polynomial omega level", [
   "Gongulusplex", "Gongulusduplex", "Dulatri", "Gingulus", "Trilatri",
   "Gangulus", "Geengulus", "Gowngulus", "Gungulus", "Bongulus", "Bingulus",
   "Trimentri", "Bangulus", "Gralgathor", "Godgathordeus", "Godgathortruce",
   "Godgathorquad", "Terinngathor", "Pentaelgathor", "Goplexulus",
   "Godtothol"]),
 ("triple-exp-omega", "Triple-exponentiated polynomial omega level", [
   "Godtotholdeus", "Godtotholcentice", "Extendol", "Graltothol",
   "Goduplexulus", "Godtertol", "Pentaeltothol"]),
 ("iterated-cantor", "Iterated Cantor normal form level (up to epsilon_0)", [
   "Hyper-hyper-godgathordeus", "Graltertol", "Gotriplexulus", "Godtopol",
   "Godhathor", "Godheptol", "Godoctol", "Godentol", "Goddekathol",
   "Tethrathoth", ("Goppatoth", "10↑↑100 & 10"), ("Nucleaxul", "200![200200]"),
   "Giaquaxul"]),
 ("epsilon", "Epsilon level", [
   "Grand tethrathoth", "Goppatothplex", "Gugolda-carta-tethrathoth",
   "Tethratrithoth", "Tethrathoth-by-hyperion", "Tethrathoth ba'al",
   "Gippatoth", "Gappatoth", "Geepatoth", "Boppatoth", "Tethracross",
   "Monster-Giant", "Monster-Grid", "Monster-Hecateract",
   "Terrible tethrathoth", "Great and Terrible Tethrathoth"]),
 ("binary-phi", "Binary phi level", [
   "Terrible tethracross", "Tethritercross", "Tethracubor", "Troppatoth",
   "Terrible tethracubor", "Tethraducubor", "Tethrateron", "Quadroppatoth",
   "Tethrapeton", "Tethrahexon", "Tethrahepton", "Tethrennon", "Tethradekon",
   "Tethratope", "Pentacthulhum", ("Kungulus", "X↑↑↑100 & 10")]),
 ("bachmann", "Bachmann's collapsing level, up to TREE(3)", [
   "Pentacthuldugon", "Pentacthulcross", "Pentacthulteron",
   ("Hugexul", "200![200(1)200]"), "Superior Hugexul", "Hexacthulhum",
   "Hugebixul", "Hugetrixul", "Hugequaxul", "Heptacthulhum", "Ogdacthulhum",
   "Ennacthulhum", "Dekacthulhum", "Goliath", "Godsgodgulus",
   "Blasphemorgulus", "The centurion", "Super centurion", "Enormaxul",
   "Destruxul", "Great Destruxul",
   ("TREE(3)", "Friedman's tree function at 3; lower bound"),
   "Bird's number", "Goobawamba", "Golapulus", "Ginglapulus", "Extremexul"]),
 ("higher-computable", "Beyond TREE(3), still computable", [
   "Extremebixul", "Extremetrixul", "Extremequaxul", "Gigantixul",
   "Gigantibixul", "Gigantitrixul", "Gigantiquaxul", "Nucleabixul",
   ("SCG(13)", "Friedman's subcubic graph function; lower bound"),
   "Nucleatrixul", "Nucleaquaxul", "Kumakuma 3-variable psi number",
   "Graham's epsilon-based number G64(4)",
   ("Loader's number", "D^5(99) from loader.c"),
   "Bashicu matrix number", "Y sequence number", "The least transcendental integer"]),
 ("uncomputable", "Uncomputable or set-theoretic", [
   ("1919th Busy Beaver", "Sigma(1919)"), ("Fish number 4", "F_4^63(3)"),
   ("Fish number 7", "F_7^63(10^100)"), ("Xi(10^6)", "Goucher's Xi function"),
   ("Sigma-infinity(10^9)", None), ("Rayo's number", "Rayo(10^100)"),
   ("BIG FOOT", "FOOT10(10^100); ill-defined"),
   ("Little Bigeddon", "ill-defined"), ("Sasquatch", "ill-defined"),
   ("Large Number Garden Number", "f^10(10 ^(10 arrows) 10)"),
   ("Oblivion", "ill-defined, unformalised"),
   ("Utter oblivion", "ill-defined, unformalised")]),
]

# Names that are definitely ill-defined per the sources.
ILL_DEFINED = {"big foot", "little bigeddon", "sasquatch", "oblivion",
               "utter oblivion"}

# --------------------------------------------------------------------------
# Bowerism checklist entries 133-433 (Sbiis Saibian et al.), source order.
# "Name|definition" (empty = none given).
# --------------------------------------------------------------------------
BOWERISM = """
Tripent|{5,5,5}
Trisept|{7,7,7}
Gygol|{10,100,7}
Gygolplex|{10,gygol,7}
Tridecal|{10,10,10}
Boogol|{10,10,100}
Boogolplex|{10,10,boogol}
Corporal|{10,100,1,2}
Corporalplex|{10,corporal,1,2}
Grand tridecal|{10,10,10,2}
Tetratri|{3,3,3,3}
General|{10,10,10,10}
Generalplex|{10,10,10,general}
Pentatri|{3,3,3,3,3}
Pentadecal|{10,10,10,10,10}
Pentadecalplex|{10,10,10,10,pentadecal}
Hexatri|{3,3,3,3,3,3}
Hexadecal|{10,10,10,10,10,10}
Hexadecalplex|{10,10,10,10,10,hexadecal}
Iteral|{10,10,10,10,10,10,10,10,10,10}
Ultatri|{3,3,3,...} with 27 threes
Iteralplex|{10,10,...,10} with iteral tens
Emperal|<10,10(1)10>
Emperalplex|<10,10(1)emperal>
Hyperal|<10,10(1)10,10>
Hyperalplex|<10,10(1)10,hyperal>
Dutritri|<3,3,3(1)3,3,3(1)3,3,3>
Dutridecal|<10,10,10(1)10,10,10(1)10,10,10>
Xappol|10x10&10
Xappolplex|xappol x xappol & 10
Dimentri|3 x 3 x 3 & 3
Colossal|10 x 10 x 10 & 10
Colossalplex|colossal x colossal x colossal & 10
Dimendecal|10x10x10x10x10x10x10x10x10x10 & 10
Gongulus|10^100 & 10
Gongulusplex|10^gongulus & 10
Dulatri|(3^3)^2 & 3
Trimentri|3^(3^3) & 3
Goppatoth|10^^100 & 10 = {10,100,4}&10
Goppatothplex|{10,goppatoth,4}&10
Tridecatrix|{10,10,10}&10
Golapulus|10^100&10&10
Golapulusplex|10^100&10&10&10
Golapulusplux|X{10,100,3}, golapulusX
Big Boowa|X3,{3,3}X
Great Big Boowa|X3,3,3X
Bongulus|a 10^100 exploded array of 10's (within X X)
Wompogulus|10^10 "100th level" exploded array of 10's
Wompogulusplex|10^10 "wompogulusth level" exploded array of 10's
Guapamonga|10^100 array of B's within "# #"
Guapamongaplex|10^100 array of B's within guapamonga-level "# #"
Googolduplex|10^10^10^100
Googoltriplex|
Googolquadraplex|
Googolquinplex|
Decker|{10,10,2} = 10^^10
Giggol|{10,100,2}
Giggolplex|10^^giggol = 10^^10^^100
Giggolduplex|10^^10^^10^^100
Tritri|{3,3,3} = 3^^^3 = 3^^3^^3
Gaggol|{10,100,3} = 10^^^100
Gaggolplex|10^^^gaggol
Gaggolduplex|10^^^gaggolplex
Tritet|{4,4,4}
Tripent|{5,5,5}
Trisept|{7,7,7}
Geegol|{10,100,4}
Geegolplex|{10,geegol,4}
Gigol|{10,100,5}
Gigolplex|{10,gigol,5}
Goggol|{10,100,6}
Goggolplex|{10,goggol,6}
Gagol|{10,100,7}
Gagolplex|{10,gagol,7}
Old tridecal|{10,10,8}
Boogolduplex|{10,10,boogolplex}
Boogoltriplex|{10,10,boogolduplex}
Biggol|{10,10,100,2}
Biggolplex|{10,10,biggol,2}
Biggolduplex|
Baggol|{10,10,100,3}
Baggolplex|{10,10,baggol,3}
Beegol|{10,10,100,4}
Beegolplex|{10,10,beegol,4}
Bigol|{10,10,100,5}
Boggol|{10,10,100,6}
Bagol|{10,10,100,7}
Supertet|{4,4,4,4}
Troogol|{10,10,10,100}
Troogolplex|{10,10,10,troogol}
Triggol|{10,10,10,100,2}
Triggolplex|{10,10,10,triggol,2}
Traggol|{10,10,10,100,3}
Traggolplex|{10,10,10,traggol,3}
Treegol|{10,10,10,100,4}
Superpent|{5,5,5,5,5}
Trigol|{10,10,10,100,5}
Troggol|{10,10,10,100,6}
Tragol|{10,10,10,100,7}
Quadroogol|{10,10,10,10,100}
Quadroogolplex|{10,10,10,10,quadroogol}
Quadriggol|{10,10,10,10,100,2}
Quadriggolplex|{10,10,10,10,quadriggol,2}
Quadraggol|
Quadreegol|
Quadrigol|
Quadroggol|
Quadragol|
Superhex|{6,6,6,6,6,6}
Quintoogol|{10,10,10,10,10,100}
Quintoogolplex|{10,10,10,10,10,quintoogol}
Quintiggol|
Quintaggol|
Quinteegol|
Quintigol|
Heptatri|{3,3,3,3,3,3,3}
Supersept|{7,7,7,7,7,7,7}
Heptadecal|
Octadecal|
Ennadecal|
Superoct|
Superenn|
Sextoogol|
Septoogol|
Octoogol|
Superdecal|{10,10(1)2}
Goobol|{10,100(1)2}
Dupertri|{3,tritri(1)2}
Duperdecal|{10,iteral(1)2}
Goobolplex|{10,goobol(1)2}
Truperdecal|{10,duperdecal(1)2}
Quadruperdecal|{10,truperdecal(1)2}
Gibbol|{10,100,2(1)2}
Latri|{3,3,3(1)2}
Gabbol|{10,100,3(1)2}
Geebol|{10,100,4(1)2}
Gibol|{10,100,5(1)2}
Gobbol|{10,100,6(1)2}
Gabol|{10,100,7(1)2}
Boobol|{10,10,100(1)2}
Bibbol|{10,10,100,2(1)2}
Babbol|{10,10,100,3(1)2}
Beebol|{10,10,100,4(1)2}
Bibol|{10,10,100,5(1)2}
Bobbol|{10,10,100,6(1)2}
Babol|{10,10,100,7(1)2}
Troobol|
Tribbol|
Trabbol|
Quadroobol|
Quadribbol|
Quadrabbol|
Quintoobol|
Gootrol|{10,100(1)3}
Bootrol|{10,10,100(1)3}
Trootrol|{10,10,10,100(1)3}
Quadrootrol|{10,10,10,10,100(1)3}
Gooquadrol|{10,100(1)4}
Booquadrol|{10,10,100(1)4}
Gitrol|
Gatrol|
Geetrol|
Gietrol|
Gotrol|
Gaitrol|
Quadreequadrol|
Gooquintol|
Gossol|{10,10(1)100}
Gossolplex|{10,10(1)gossol}
Gissol|{10,10(1)100,2}
Gassol|{10,10(1)100,3}
Geesol|{10,10(1)100,4}
Gussol|{10,10(1)100,5}
Geesolplex|{10,10(1)geesol,4}
Mossol|{10,10(1)10,100}
Mossolplex|{10,10(1)10,mossol}
Missol|{10,10(1)10,100,2}
Massol|{10,10(1)10,100,3}
Meesol|{10,10(1)10,100,4}
Mussol|{10,10(1)10,100,5}
Bossol|{10,10(1)10,10,100}
Bissol|{10,10(1)10,10,100,2}
Bassol|{10,10(1)10,10,100,3}
Beesol|{10,10(1)10,10,100,4}
Bussol|{10,10(1)10,10,100,5}
Trossol|{10,10(1)10,10,10,100}
Trissol|{10,10(1)10,10,10,100,2}
Trassol|{10,10(1)10,10,10,100,3}
Treesol|{10,10(1)10,10,10,100,4}
Trussol|{10,10(1)10,10,10,100,5}
Quadrossol|{10,10(1)10,10,10,10,100}
Quintossol|{10,10(1)10,10,10,10,10,100}
Diteral|{10,10(1)(1)2}
Diteralplex|{10,diteral(1)(1)2}
Dubol|{10,100(1)(1)2}
Dutrol|{10,100(1)(1)3}
Duquadrol|{10,100(1)(1)4}
Admiral|{10,10(1)(1)10}
Dossol|{10,10(1)(1)100}
Dossolplex|{10,10(1)(1)dossol}
Grand xappol|{10,10(2)3}
Colossol|10^3 & 10 = {10,10(3)2}
Colossolplex|colossol^3 & 10 = {10,colossol(3)2}
Terossol|10^4 & 10 = {10,10(4)2}
Terossolplex|terossol^4 & 10
Petossol|10^5 & 10
Petossolplex|petossol^5 & 10
Ectossol|10^6 & 10
Ectossolplex|ectossol^6 & 10
Zettossol|10^7 & 10
Yottossol|10^8 & 10
Xennossol|10^9 & 10
Gongulusduplex|{10,10(gongulusplex)2}
Gongulustriplex|
Gongulusquadraplex|
Gingulus|{10,100(0,2)2}
Trilatri|{3,3(0,3)2}
Gangulus|{10,100(0,3)2}
Geengulus|{10,100(0,4)2}
Gowngulus|{10,100(0,5)2}
Gungulus|{10,100(0,6)2}
Bingulus|{10,100(0,0,2)2}
Bangulus|{10,100(0,0,3)2}
Beengulus|{10,100(0,0,4)2}
Trongulus|{10,100(0,0,0,1)2}
Quadrongulus|{10,100(0,0,0,0,1)2}
Goplexulus|{10,100(0,0,0,...,0,0,1)2} with 100 zeros
Goduplexulus|{10,100((100)1)2}
Gotriplexulus|{10,100((0,0,0,...,0,0,1)1)2} with 100 zeros
Triakulus|{3,3,3} & 3 = 3^^^3 & 3
Kungulus|{10,100,3} & 10 = 10^^^100 & 10
Kungulusplex|{10,kungulus,3} & 10
Quadrunculus|{10,100,4} & 10 = 10^^^^100 & 10
Humongulus|{10,10,100} & 10
Tetdecatrix|{10,10,10,10} & 10
Pendecatrix|{10,10,10,10,10} & 10
Hexdecatrix|{10,10,10,10,10,10} & 10
Hepdecatrix|{10,10,10,10,10,10,10} & 10
Ocdecatrix|{10,10,10,10,10,10,10,10} & 10
Endecatrix|{10,10,10,10,10,10,10,10,10} & 10
Lineatrix|10 & 10 & 10
Lineatrixplex|lineatrix & 10 & 10
Dekulus|10 & 10 & 10 & 10 & 10 & 10 & 10 & 10 & 10 & 10
Grand boowa|{3,3,big boowa/2}
Super gongulus|{10,10(100)2/2}, formerly called bongulus
Big hoss|{100,100 ///.../// 2} with 100 slashes
Great big hoss|{big hoss, big hoss /...// 2}
Grand hoss|{100,100 /.../ 100} with 100 slashes
Bukuwaha|{100,100 A 2}, A a 100^100 array of legion marks
Big bukuwaha|{100,100 B 2}, B a {100,100 A 2} array of lugion marks
Bongo bukuwaha|{100,100 C 2}, C a {100,100 B 2} array of lagion marks
Quabinga bukuwaha|{100,100 D 2}, D a {100,100 C 2} array of ligion marks
Goshomity|{100,100 \\\\...\\\\ 2} with 100 backslashes
Good goshomity|{100,100 \\\\\\\\...\\\\\\\\ 2} with goshomity backslashes
Meameamealokkapoowa|{L100,10}10,10
Meameamealokkapoowa oompa|{LLL...*a*...LLL,10}10,10
""".strip().splitlines()

# Names that the sources spell two ways
ALIAS_OF = {"tetradecal": "general", "colossal": "colossol",
            "colossalplex": "colossolplex", "superdecal": "iteral",
            "old tridecal": None}

TIER_NOTES = {
    "up-arrow": ("Reordered by arithmetic where the definitions allow "
                 "(for example Giggolplex sits between Tria-taxis and "
                 "Tetra-taxis, and Folkman's number below Googol-3-flex); "
                 "the wiki lists this class loosely."),
}
