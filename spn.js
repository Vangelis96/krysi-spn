const sboxArr =              [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7];
const bitPermutationArr =    [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
const r = 4;
const n = 4;
const m = 4;
const k = '00111010100101001101011000111111';
const s = k.length;

function test() {
    let x = '0001001010001111';
    let k = '00010001001010001000110000000000';
    let y = '1010111010110100';
    let result = x;

    result = runSPN(x, k);
    console.log(result, y == result, y);
    result = runSPN(y, k, false);
    console.log(result, x == result, x);
}

function xor(a, b) {
    let splittedB = b.split('');
    return a.split('').map((e, i) => {
        if (e == splittedB[i]) return 0;
        return 1;
    }).join('');
}

function bitPermutation(str, permMap) {
    return str.split('').map((e, i, a) => {
        return a[permMap[i]];
    }).join('');
}

function sbox(str, box) {
    return splitInSections(str, 4).map(o => {
        return ('0000' + box[parseInt(o, 2)].toString(2)).slice(-4);
    }).join('');
}

function splitInSections(str, sectionSize) {
    return str.match(new RegExp('.{1,' + sectionSize + '}', 'g'));
}

function inverseSBox(sbox) {
    const inversed = [];
    sbox.forEach((element, index) => {
        inversed[element] = index;
    });
    return inversed;
}

function runSPN(text, key, encode = true) {
    let roundKey = getRoundKey(key, 0, text.length, encode);
    let result = text;
    let sBox;

    if (encode) {
        // bei Verschlüsselung wird die sBox 1-zu-1 übernommen
        sBox = sboxArr;
    } else {
        // bei Entschlüsselung muss das Inverse der sBox verwendet werden
        sBox = inverseSBox(sboxArr);
    }

    result = xor(result, roundKey);

    for (var i = 1; i < r; i++) {
        result = sbox(result, sBox);
        result = bitPermutation(result, bitPermutationArr);
        roundKey = getRoundKey(key, i, text.length, encode);
        result = xor(result, roundKey);
    }

    result = sbox(result, sBox);
    roundKey = getRoundKey(key, r, text.length, encode);
    result = xor(result, roundKey);

    return result;
}

function getRoundKey(key, round, keysize, encode = true, rounds = 4) {
    if (encode) {
        // bei Verschlüsselung wird der Runden-Schlüssel unverändert zurückgegeben
        let roundKey = key.substr(4 * round, keysize);
        return roundKey;
    } else {
        // bei Entschlüsselung wird der Runden-Schlüssel mittels Bit-Permutation angepasst
        let roundKey = key.substr(4 * (rounds - round), keysize);
        if (round == 0 || round == rounds) {
            return roundKey;
        }
        return bitPermutation(roundKey, bitPermutationArr);
    }
}

function decodeCTR(y) {
    const splittedY = splitInSections(y, 16);
    console.log(y, splittedY);

    // shift() gibt das erste Element zurück und entfernt es aus dem Array
    const prevY = splittedY.shift();   // y-1
    console.log(prevY);
    console.log(parseInt(prevY, 2));
    console.log(parseInt(prevY, 2) + 1);
    console.log((parseInt(prevY, 2) + 1) % Math.pow(2, 16));
    console.log(((parseInt(prevY, 2) + 1) % Math.pow(2, 16)).toString(2));

    // einzelne Teil-Texte entschlüsseln und zurückgeben
    return splittedY.map((yi, i) => {
        //Parameter berechnen
        const text = ('0000000000000000' + ((parseInt(prevY, 2) + i) % Math.pow(2, 16)).toString(2)).slice(-16);
        //mit SPN entschlüsseln
        const spn = runSPN(text, k);
        console.log(spn);
        //XOR mit aktuellem Chiffretext
        return xor(spn, yi);
    });
}

function removeTrailingOneZeros(str) {
    strArr = str.split('');
    while (strArr.pop() == 0) {}
    return strArr.join('');
}

function runBonusaufgabe() {
    const x = decodeCTR('00000100110100100000101110111000000000101000111110001110011111110110000001010001010000111010000000010011011001110010101110110000');
    document.getElementById('result').innerText = 'x = ' + x.join('');
    const truncatedX = removeTrailingOneZeros(x.join(''));
    const truncatedSplittedX = splitInSections(truncatedX, 8);
    console.log(truncatedSplittedX);
    document.getElementById('resultText').innerText = 'Entschlüsselter Text: ' + truncatedSplittedX.map(o => String.fromCharCode(parseInt(o, 2))).join('');
}