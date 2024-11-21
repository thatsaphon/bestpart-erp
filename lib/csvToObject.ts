//var csv is the CSV file with headers
export function csvToJSONObject(csv: string) {
    let lines = csv.split('\r\n')

    let result = []

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    let headers = lines[0].split(',')

    for (let i = 1; i < lines.length; i++) {
        let obj: Record<string, string> = {}
        let currentline = lines[i].split(',')

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j]
        }

        result.push(obj)
    }

    return result //JavaScript object
    // return JSON.stringify(result) //JSON
}
