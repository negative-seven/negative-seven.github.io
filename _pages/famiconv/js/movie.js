class Movie {
    static fromFm2Format(filename, data) {
        let movie = new Movie();
        movie.filename = filename;
        movie.sha1Hash = sha1Hash;

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
        
        const BUTTONS = 'UDLRSsBA';
        let inputDataLines = ['[Input]'];
        let skippedInitialResets = false;
        for (let input of this.inputs.slice(1)) {
            if (!skippedInitialResets && input.softReset) {
                continue;
            }
            skippedInitialResets = true;
            
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

    async toMmoV1FormatAsync() {
        let gameSettingsData = [
            'MesenVersion 0.9.9',
            'MovieFormatVersion 1',
            `GameFile ${this.romFilename}`,
            `SHA1 ${this.sha1Hash.toUpperCase()}`,
            'Region NTSC',
            'ConsoleType Famicom',
            'Controller1 StandardController',
            'Controller2 StandardController',
            'ExpansionDevice None',
            'ExtraScanlinesBeforeNmi 0',
            'ExtraScanlinesAfterNmi 0',
            'DisablePpu2004Reads false',
            'DisablePaletteRead false',
            'DisableOamAddrBug false',
            'UseNes101Hvc101Behavior false',
            'EnableOamDecay false',
            'DisablePpuReset false',
            'ZapperDetectionRadius 0',
            'RamPowerOnState 0',
        ].join('\n') + '\n';

        let movieInfoData = 'Author\nDescription\n';

        let inputsDataLines = [];
        for (let input of this.inputs.slice(1)) {
            const BUTTONS = 'UDLRSsBA';

            let inputLine = '|..|........|.........'.split('');

            for (let button of input.controller0) {
                inputLine[4 + BUTTONS.indexOf(button)] = button;
            }

            for (let button of input.controller1) {
                inputLine[13 + BUTTONS.indexOf(button)] = button;
            }

            inputsDataLines.push(inputLine.join(''));
        }
        let inputsData = inputsDataLines.join('\n') + '\n';

        let movieData = new JSZip();
        movieData.file('GameSettings.txt', gameSettingsData);
        movieData.file('MovieInfo.txt', movieInfoData);
        movieData.file('Input.txt', inputsData);
        return await movieData.generateAsync({ type: 'base64' });
    }

    async toMmoV2FormatAsync() {
        let gameSettingsData = [
            'MesenVersion 2.0.0',
            'MovieFormatVersion 2',
            `GameFile ${this.romFilename}`,
            'emu.consoleType Nes',
            'video.integerFpsMode false',
            'emulation.runAheadFrames 0',
            'game.dipSwitches 0',
            'nes.consoleType Nes001',
            'nes.ramPowerOnState AllZeros',
            'nes.randomizeMapperPowerOnState false',
            'nes.randomizeCpuPpuAlignment false',
            'nes.disableOamAddrBug false',
            'nes.disablePaletteRead false',
            'nes.disablePpu2004Reads false',
            'nes.disableGameGenieBusConflicts false',
            'nes.disablePpuReset false',
            'nes.enableOamDecay false',
            'nes.enablePpu2000ScrollGlitch false',
            'nes.enablePpu2006ScrollGlitch false',
            'nes.enablePpuOamRowCorruption false',
            'nes.restrictPpuAccessOnFirstFrame false',
            'nes.ppuExtraScanlinesAfterNmi 0',
            'nes.ppuExtraScanlinesBeforeNmi 0',
            'nes.region Auto',
            'nes.lightDetectionRadius 0',
            'nes.port1.type NesController',
            'nes.port1SubPorts[0].type NesController',
            'nes.port1SubPorts[1].type NesController',
            'nes.port1SubPorts[2].type NesController',
            'nes.port1SubPorts[3].type NesController',
            'nes.port2.type NesController',
            'nes.expPort.type None',
            'nes.expPortSubPorts[0].type None',
            'nes.expPortSubPorts[1].type None',
            'nes.expPortSubPorts[2].type None',
            'nes.expPortSubPorts[3].type None',
        ].join('\n') + '\n';

        let inputsDataLines = [];
        for (let input of this.inputs.slice(2)) {
            const BUTTONS = 'UDLRSsBA';

            let inputLine = '|..|........|.........'.split('');

            for (let button of input.controller0) {
                inputLine[4 + BUTTONS.indexOf(button)] = button;
            }

            for (let button of input.controller1) {
                inputLine[13 + BUTTONS.indexOf(button)] = button;
            }

            inputsDataLines.push(inputLine.join(''));
        }
        let inputsData = inputsDataLines.join('\n') + '\n';

        let movieData = new JSZip();
        movieData.file('GameSettings.txt', gameSettingsData);
        movieData.file('Input.txt', inputsData);
        return await movieData.generateAsync({ type: 'base64' });
    }
}
