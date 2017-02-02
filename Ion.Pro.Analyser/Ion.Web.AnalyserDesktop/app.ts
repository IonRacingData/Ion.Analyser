

window.addEventListener("load", () => {
    startUp();
});

function testBinary() {
    let a: ISensorPackage[] = [];
    a[0] = { ID: 5, TimeStamp: 112321, Value: 123 };
    a[1] = { ID: 5, TimeStamp: 112321, Value: 123 };
    a[2] = { ID: 5, TimeStamp: 112321, Value: 123 };
    a[3] = { ID: 5, TimeStamp: 112321, Value: 123 };




    function toBinary(a: ISensorPackage[]): ArrayBuffer {

        let buf = new ArrayBuffer(a.length * 10);
        let bit16 = new Uint16Array(buf);

        for (let i = 0; i < a.length; i++) {
            bit16[i * 5 + 0] = a[i].ID;
            bit16[i * 5 + 1] = a[i].TimeStamp;
            bit16[i * 5 + 2] = a[i].TimeStamp >> 16;
            bit16[i * 5 + 3] = a[i].Value;
            bit16[i * 5 + 4] = a[i].Value >> 16;
        }
        console.log(bit16);
        return buf;
    }

    let test2 = new Uint8Array(toBinary(a));
    console.log(test2);
    let binary = "";
    for (let i = 0; i < test2.length; i++) {
        binary += String.fromCharCode(test2[i]);
    }

    let base64Str = btoa(binary);
    console.log(base64Str);
    console.log(JSON.stringify(a));



    let reverse = atob(base64Str);
    let buffer2 = new ArrayBuffer(reverse.length);
    let data = new Uint8Array(buffer2);
    for (let i = 0; i < reverse.length; i++) {
        data[i] = reverse.charCodeAt(i);
    }

    function fromBinary(buffer: ArrayBuffer): ISensorPackage[] {
        let bit16 = new Uint16Array(buffer);
        console.log(bit16);
        let a: ISensorPackage[] = [];
        for (let i = 0; i < bit16.length / 5; i++) {
            a[i] = {
                ID: bit16[i * 5 + 0],
                TimeStamp: bit16[i * 5 + 1] | bit16[i * 5 + 2] << 16,
                Value: bit16[i * 5 + 3] | bit16[i * 5 + 4] << 16
            };
        }
        return a;
    }

    let result = fromBinary(buffer2);

    console.log(result);

}