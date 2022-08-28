$('#fileSelector').change(function (event) {
    let file = event.currentTarget.files[0];
    let reader = new FileReader();
    reader.onload = async function () {
        movie = Movie.fromFm2Format(file.name, reader.result);
    };
    reader.readAsBinaryString(file);
})

$('#bk2DownloadButton').click(async function (event) {
    await downloadMovie('bk2');
});

$('#mmoDownloadButton').click(async function (event) {
    await downloadMovie('mmo');
});

async function downloadMovie(format) {
    if (typeof movie === 'undefined') {
        alert('No movie uploaded!');
        return;
    }

    let conversionFunction;
    if (format == 'bk2') {
        conversionFunction = Movie.prototype.toBk2FormatAsync;
    } else if (format == 'mmo') {
        conversionFunction = Movie.prototype.toMmoFormatAsync;
    } else {
        throw 'Invalid format passed to downloadMovie';
    }

    await conversionFunction.bind(movie)().then(f => {
        let a = $('<a>').hide();
        a.attr('href', 'data:application/zip;base64,' + encodeURIComponent(f));
        a.attr('download', movie.filename.replace('.fm2', '.' + format));

        $('body').append(a);
        a[0].click();
        $('body').remove(a);
    });
}
