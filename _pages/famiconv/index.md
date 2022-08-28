---
layout: default
title: famiconv
---
<link rel="stylesheet" href="css/style.css">

Upload .fm2 movie file: <input type="file" id="fileSelector">

<div id="contents"></div>

<button id="downloadButton">Download .bk2 movie file</button>

Hopefully in the future, this page will allow for converting freely between FCEUX, BizHawk and Mesen movie files. For now, only .fm2 -> .bk2 conversion is supported.

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="js/jszip.min.js"></script>
<script src="js/input.js"></script>
<script src="js/movie.js"></script>
<script src="js/main.js"></script>