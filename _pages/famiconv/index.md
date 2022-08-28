---
layout: default
title: famiconv
---
<link rel="stylesheet" href="css/style.css">

Upload .fm2 movie file: <input type="file" id="fileSelector">

<button id="bk2DownloadButton">Download .bk2 movie file</button>
<button id="mmoDownloadButton">Download .mmo movie file</button>

Hopefully in the future, this page will allow for converting freely between FCEUX, BizHawk and Mesen movie files. For now, only .fm2 -> .bk2 conversion is supported.

Note that the conversion results in some loss of metadata.

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="js/jszip.min.js"></script>
<script src="js/input.js"></script>
<script src="js/movie.js"></script>
<script src="js/main.js"></script>
