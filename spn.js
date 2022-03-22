function runSpn() {
    let r = 4;
    let n = 4;
    let m = 4;
    let sbox =              [0b1110, 0b0100, 0b1101, 0b0001, 0b0010, 0b1111, 0b1011, 0b1000, 0b0011, 0b1010, 0b0110, 0b1100, 0b0101, 0b1001, 0b0000, 0b0111];
    let bitPermutation =    [0b0000, 0b0100, 0b1000, 0b1100, 0b0001, 0b0101, 0b1001, 0b1101, 0b0010, 0b0110, 0b1010, 0b1110, 0b0011, 0b0111, 0b1011, 0b1111];
    let s = 32;
    let k = "00111010100101001101011000111111";
    let message = "00000100110100100000101110111000000000101000111110001110011111110110000001010001010000111010000000010011011001110010101110110000";

    let messageSplits = message.match(new RegExp('.{1,' + n * m + '}', 'g'));
    let firstSplit = messageSplits[0];
    let result = "";

    messageSplits.slice(1).forEach(split => {
        result += xor(firstSplit, split);
    });


}

function xor(a, b) {
    let splittedB = b.split();
    return a.split().map((e, i) => {
        if (e == splittedB[i]) return 0;
        return 1;
    });
}

function addZeros(str, amount) {
    let offset = str.split().size() % amount;

    while (offset > 0) {
        str = '0' + str;
        offset--;
    }

    return str;
}