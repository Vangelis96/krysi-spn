function runSpn() {
    let r = 4;
    let n = 4;
    let m = 4;
    let sbox =              [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7];
    let bitPermutation =    [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
    let s = 32;
    let k = "00111010100101001101011000111111";
    let message = "00000100110100100000101110111000000000101000111110001110011111110110000001010001010000111010000000010011011001110010101110110000";

    let messageSplits = splitInSections(message, n * m);
    let firstSplit = messageSplits[0];
    let result = "";

    messageSplits.slice(1).forEach(split => {
        result += xor(firstSplit, split);
    });
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

function sbox(str, box, oppositeDirection = false) {
    return splitInSections(str, 4).map(o => {
        // console.log(str, o, box, ('0000' + box[parseInt(o, 2)].toString(2)).slice(-4));
        return ('0000' + box[parseInt(o, 2)].toString(2)).slice(-4);
    }).join('');
}

function splitInSections(str, sectionSize) {
    return str.match(new RegExp('.{1,' + sectionSize + '}', 'g'));
}

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

function getRoundKey(key, round, keysize) {
    return key.substr(4 * round, keysize);
}