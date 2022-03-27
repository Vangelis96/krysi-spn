const sboxArr =              [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7];
const bitPermutationArr =    [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
const r = 4;
const n = 4;
const m = 4;
const k = "00111010100101001101011000111111";
const s = k.length

function test() {
    let x = '0001001010001111';
    let k = '00010001001010001000110000000000';
    let y = '1010111010110100';
    let bitPermutationArr =    [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
    let sboxArr = [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7];
    let result = x;

    let key = getRoundKey(k, 0, x.length);
    console.log('Schlüssel 0', key);
    result = xor(result, key);
    console.log('Nach XOR', result);

    for (var i = 1; i < 4; i++) {
        result = sbox(result, sboxArr);
        console.log('Nach SBox', result);
        result = bitPermutation(result, bitPermutationArr);
        console.log('Nach Bitpermutation', result);
        key = getRoundKey(k, i, x.length);
        console.log('Rundenschlüssel', key);
        result = xor(result, key);
        console.log('Nach XOR', result, 'Runde ', i);
    }

    result = sbox(result, sboxArr);
    key = getRoundKey(k, 4, x.length);
    result = xor(result, key);

    console.log(result, y == result, y);
}

function testInverseBox() {
    let bitPermutationArr =    [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
    let sboxArr = [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7];

    const inverseBox = inverseSBox(sboxArr, bitPermutationArr);

    console.log(inverseBox);
}

function xor(a, b) {
    let splittedB = b.split('');
    return a.split('').map((e, i) => {
        if (e == splittedB[i]) return 0;
        return 1;
    }).join('');
}

function addZeros(str, amount) {
    let offset = str.split('').size() % amount;

    while (offset > 0) {
        str = '0' + str;
        offset--;
    }

    return str;
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

function inverseSBox(sbox, bitPermutationArr) {
    const sBoxReversed = sbox.reverse();
    const inverseBox = [];

    inverseBox.push(...sBoxReversed.map((element, index) => {
        if (index == 0 || index == sBoxReversed.length - 1) {
            return element;
        } else {
            return sBoxReversed[bitPermutationArr[index]];
        }
    }));

    return inverseBox;
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
        sBox = inverseSBox(sboxArr)
    }

    result = xor(result, roundKey);

    for (var i = 1; i < r; i++) {
        result = sbox(result, sBox);
        result = bitPermutation(result, bitPermutationArr);
        roundKey = getRoundKey(key, i, text.length, encode);
        result = xor(result, roundKey);
    }

    result = sbox(result, sboxArr);
    roundKey = getRoundKey(key, r, text.length);
    result = xor(result, roundKey);

    return result;
}

function getRoundKey(key, round, keysize, encode = true) {
    let roundKey = key.substr(4 * round, keysize);
    if (encode) {
        // bei Verschlüsselung wird der Runden-Schlüssel unverändert zurückgegeben
        return roundKey;
    } else {
        // bei Entschlüsselung wird der Runden-Schlüssel mittels Bit-Permutation angepasst
        return bitPermutation(roundKey, bitPermutationArr);
    }
}

function decodeCTR(y, key) {
    splittedY = splitInSections(y, n*m)

    // shift() gibt das erste Element zurück und entfernt es aus dem Array
    prevY = splittedY.shift()   // y-1

    // einzelne Teil-Texte entschlüsseln und zurückgeben
    return splittedY.map((yi, i) => {
        //Parameter berechnen
        text = (prevY + i) % Math.pow(2, 16);
        //mit SPN entschlüsseln
        spn = runSPN(text, k, false);
        //XOR mit aktuellem Chiffretext
        return xor(spn, yi);
    })
}
