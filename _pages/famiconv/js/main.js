sha1Hash = '';

$('#fileSelector').change(function (event) {
    let file = event.currentTarget.files[0];
    let reader = new FileReader();
    reader.onload = async function () {
        movie = Movie.fromFm2Format(file.name, reader.result);
        movie.sha1Hash = sha1Hash; // hacky
    };
    reader.readAsBinaryString(file);
});

$('#sha1Input').change(function (event) {
    sha1Hash = event.currentTarget.value;
    if (movie) {
        movie.sha1Hash = sha1Hash;
    }
});

$('#bk2DownloadButton').click(async function (event) {
    await downloadMovie('bk2');
});

$('#mmoV1DownloadButton').click(async function (event) {
    await downloadMovie('mmo1');
});

$('#mmoV2DownloadButton').click(async function (event) {
    await downloadMovie('mmo2');
});

async function downloadMovie(format) {
    if (typeof movie === 'undefined') {
        alert('No movie uploaded.');
        return;
    }

    let conversionFunction;
    if (format == 'bk2') {
        conversionFunction = Movie.prototype.toBk2FormatAsync;
    } else if (format == 'mmo1') {
        if (!sha1Hash.match(/^[0-9a-fA-F]{40}$/)) {
            alert('Invalid SHA1 hash provided.');
            return;
        }

        conversionFunction = Movie.prototype.toMmoV1FormatAsync;
    } else if (format == 'mmo2') {
        conversionFunction = Movie.prototype.toMmoV2FormatAsync;
    } else {
        throw 'Invalid format passed to downloadMovie';
    }

    await conversionFunction.bind(movie)().then(f => {
        let a = $('<a>').hide();
        a.attr('href', 'data:application/zip;base64,' + encodeURIComponent(f));
        a.attr('download', movie.filename.replace('.fm2', '.' + format.substring(0, 3)));

        $('body').append(a);
        a[0].click();
        $('body').remove(a);
    });
}
