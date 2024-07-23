//16384 is the limit

const ASCII_LEN = 128;
const WORD_LEN = 4;

function randomIntArrayInRange(min, max, n = 1) {
  return Array.from(
    { length: n },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
}

function encodeInt(n){
  let octave = 0;
  while(n>ASCII_LEN) {
    n -= ASCII_LEN;
    octave++;
  }
  return String.fromCharCode(octave) + String.fromCharCode(n);
}

function serializeCompress(arr) {
  const tmp_obj = {};
  for(let d of arr) {
    if(!tmp_obj[d]) {
      tmp_obj[d] = 1;
    } else {
      tmp_obj[d]++;
    }
  }
  let out_str = "";
  Object.entries(tmp_obj).forEach(e => {
    const ei1 = encodeInt(e[0]);
    const ei2 = encodeInt(e[1]);
    out_str += `${ei1}${ei2}`;
  })
  return out_str;
}

function deserialize(str) {
  let i = 0;
  let out_arr = [];
  while(i < str.length) {
    const o1 = str.charCodeAt(i);
    const c = str.charCodeAt(i+1)+ASCII_LEN*o1;
    const o2 = str.charCodeAt(i+2);
    const n = str.charCodeAt(i+3)+ASCII_LEN*o2;
    out_arr = [...out_arr, ...Array(n).fill(c)]
    i += WORD_LEN;
  }
  return out_arr;
}


//TESTS

function printStat(original, compressed) {
  const oLen = original.toString().length;
  const cLen = compressed.toString().length;
  const compressionPercent = 100 - cLen/(oLen/100);
  console.log("test ok :", original.sort().toString() === deserialize(compressed).sort().toString())
  console.log(`origLen: ${oLen}\ncompLen: ${cLen}\ncompressionPercent: ${compressionPercent}%\n`);
}

function test1() {
  let arrayLen = 50;
  while(arrayLen <= 10000) {
    console.log('array length =', arrayLen)
    let ints = randomIntArrayInRange(1, 300, arrayLen);
    let ser = serializeCompress(ints);
    printStat(ints, ser);
    arrayLen *= 2;
  }
}

function test2() {
  let r1 = 1;
  let r2 = 9;
  while(r2 <= 300) {
    console.log(`ints ${r1} - ${r2}`);
    let ints = randomIntArrayInRange(r1, r2, 1000);
    let ser = serializeCompress(ints);
    printStat(ints, ser);
    r1 += 9;
    r2 *= 2;
  }
}

function test3() {
  let ints = Array(3).fill(Array.from({length: 300}, (_, i) => i + 1)).flat();
  let ser = serializeCompress(ints);
  console.log("3 of each int")
  printStat(ints, ser);
}

test1();
test2();
test3();

