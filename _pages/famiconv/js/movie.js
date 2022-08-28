class Movie {
    static fromFm2Format(filename, data) {
        let movie = new Movie();
        movie.filename = filename;

        let splitIndex = data.indexOf('|');
        let headerData = data.slice(0, splitIndex);
        let inputData = data.slice(splitIndex);

        for (let line of headerData.split("\n").filter(l => l)) {
            const KEYS = [
                // fm2 key, Movie field, type
                ['version', 'fceuxMovieVersion', 'number'],
                ['emuVersion', 'fceuxVersion', 'number'],
                ['rerecordCount', 'rerecordCount', 'number'],
                ['palFlag', 'pal', 'boolean'],
                ['NewPPU', 'fceuxNewPpu', 'boolean'],
                ['FDS', 'fds', 'boolean'],
                ['fourscore', 'fceuxFourscore', 'boolean'],
                ['microphone', 'microphone', 'boolean'],
                ['port0', 'fceuxPort0DeviceIndex', 'number'],
                ['port1', 'fceuxPort1DeviceIndex', 'number'],
                ['port2', 'fceuxPort2DeviceIndex', 'number'],
                ['binary', 'fceuxMovieBinaryFormat', 'boolean'],
                ['length', 'fceuxMovieLength', 'number'],
                ['RAMInitOption', 'fceuxRamInitOption', 'number'],
                ['RAMInitSeed', 'fceuxRamInitSeed', 'number'],
                ['romFilename', 'romFilename', 'string'],
                ['comment', 'comments', 'string'],
                ['subtitle', 'subtitles', 'string'],
                ['guid', 'fceuxMovieGuid', 'string'],
                ['romChecksum', 'fceuxRomChecksum', 'string'],
                ['savestate', 'fceuxSavestate', 'string'],
            ];

            let splitIndex = line.indexOf(' ');
            let key = line.slice(0, splitIndex);
            let value = line.slice(splitIndex + 1);

            let keys_entry = KEYS.find(e => e[0] == key)
            if (typeof keys_entry === 'undefined') {
                console.warn(`Unrecognized key in FCEUX movie header: "${key}"`);
                continue;
            }

            let parsedValue;
            switch (keys_entry[2]) {
                case 'string':
                    parsedValue = value;
                    break;
                case 'number':
                    parsedValue = parseInt(value);
                    break;
                case 'boolean':
                    parsedValue = Boolean(parseInt(value));
                    break;
            }
            movie[keys_entry[1]] = parsedValue;
        }

        movie.inputs = []
        for (let line of inputData.split("\n").filter(l => l)) {
            let input = new Input();
            let [commandsCode, controller0String, controller1String, controller2String] = line.split('|').slice(1);

            if (commandsCode == 1) {
                input.softReset = true;
            }
            else if (commandsCode == 2) {
                input.hardReset = true;
            }

            for (let [controllerString, fieldName] of [
                [controller0String, 'controller0'],
                [controller1String, 'controller1'],
                [controller2String, 'controller2'],
            ]) {
                const INPUTS = ['R', 'L', 'D', 'U', 'S', 's', 'B', 'A'];

                if (controllerString.length == 0) {
                    continue;
                }

                for (let index = 0; index < 8; index++) {
                    if (controllerString[index] != ' ' && controllerString[index] != '.') {
                        input[fieldName] += INPUTS[index];
                    }
                }
            }

            movie.inputs.push(input);
        }

        return movie;
    }

    async toBk2FormatAsync() {
        let commentsData = this.comments;

        let headerData = [
            'MovieVersion BizHawk v2.0.0',
            'Author Famiconv',
            'emuVersion Version 2.8',
            'OriginalEmuVersion Version 2.8',
            'Platform NES',
            `GameName ${this.romFilename}`,
            `rerecordCount ${this.rerecordCount}`,
            'Core NesHawk',
        ].join('\n') + '\n';

        let inputDataLines = ['[Input]'];
        for (let input of this.inputs) {
            const BUTTONS = 'UDLRSsBA';

            let inputLine = '|..|........|'.split('');

            for (let button of input.controller0) {
                inputLine[4 + BUTTONS.indexOf(button)] = button;
            }

            inputDataLines.push(inputLine.join(''));
        }
        inputDataLines.push('[/Input]');
        let inputData = inputDataLines.join('\n') + '\n';

        let subtitlesData = this.subtitles;

        let movieData = new JSZip();
        movieData.file('Comments.txt', commentsData);
        movieData.file('Header.txt', headerData);
        movieData.file('Input Log.txt', inputData);
        movieData.file('Subtitles.txt', subtitlesData);
        return await movieData.generateAsync({ type: 'base64' });
    }
}
