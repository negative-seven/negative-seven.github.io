$('#fileSelector').change(function (event) {
    let file = event.currentTarget.files[0];
    let reader = new FileReader();
    reader.onload = async function () {
        movie = Movie.fromFm2Format(file.name, reader.result);
        console.log(movie);
    };
    reader.readAsBinaryString(file);
})

$('#downloadButton').click(async function (event) {
    if (typeof movie === 'undefined') {
        alert('No movie uploaded!');
        return;
    }

    await movie.toBk2FormatAsync().then(f => {
        let a = $('<a>').hide();
        a.attr('href', 'data:application/zip;base64,' + encodeURIComponent(f));
        a.attr('download', movie.filename.replace('.fm2', '.bk2'));

        $('body').append(a);
        a[0].click();
        $('body').remove(a);
    });
});
