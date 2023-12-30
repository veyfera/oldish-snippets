
export function formatNumber (phone:number | string, mask:string) {
        //formats phone according to mask
        let strPhone = Array.from(String(phone));
        let newPhone:string = '';
        let replacements = 0;

        Array.from(mask).forEach((c, i) => {
            //checks that the character is a numeric or '-' is in a wrong position
            if (Number.isNaN(Number(strPhone[i])) && strPhone[i] !== '-') return
            if (strPhone[i] === '-' && c !== '-') return

            //adds '-' if needed
            if (strPhone[i] !== '-' && mask[i+replacements] === '-'){
                newPhone += '-'
                replacements++
            }
            newPhone += strPhone[i]
        })
        return newPhone;
    }
