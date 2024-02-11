---
layout: default
title: famiconv
---
<link rel="stylesheet" href="css/style.css">

Upload .fm2 movie file: <br>
<input type="file" id="fileSelector">

Input SHA1 hash of game ROM (required for Mesen 0.9.9 movies): <br>
<input id="sha1Input">

<button id="bk2DownloadButton">Download .bk2 movie file</button>
<button id="mmoV1DownloadButton">Download .mmo movie file for Mesen 0.9.9</button>
<button id="mmoV2DownloadButton">Download .mmo movie file for Mesen 2</button>

Hopefully in the future, this page will allow for converting freely between FCEUX, BizHawk and Mesen movie files. For now, only .fm2 -> .bk2/.mmo conversion is supported.

Note that the conversion results in some loss of metadata.

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="js/jszip.min.js"></script>
<script src="js/input.js"></script>
<script src="js/movie.js"></script>
<script src="js/main.js"></script>
