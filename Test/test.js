console.log("Tests initializing.")
window.testSuites = [];

await import ("./parse.test.js")
await import ("./init.test.js")
await import ("./render.test.js")
await import ("./observedobject.test.js")

window.randomName = function randomName(prefix) {
    const sanitizedPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Generate a random suffix using numbers and lowercase letters
    const suffixLength = 8; // You can adjust the length of the suffix
    const suffixChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let suffix = '';
    for (let i = 0; i < suffixLength; i++) {
        suffix += suffixChars.charAt(Math.floor(Math.random() * suffixChars.length));
    }

    // Combine the prefix and suffix with a hyphen
    return `${sanitizedPrefix}-${suffix}`;
}

window.test = async function() {
    // window.testSuites.sort();
    window.alert = () => true;
    window.confirm = () => true;
    
    let failed = 0;
    let success = 0;
    
    var start = new Date();
    for(let j=0; j<window.testSuites.length; j++) {
        let testSuite = window.testSuites[j];
        console.log(`%c ➽ ${j+1} ${testSuite.name.replace("test", "")}`, 'color: #e9c9a0; border: 3px solid #e9c9a0; border-radius: 10px; font-size: 17px; padding-left: -20px; margin-top: 20px; margin-bottom: 20px; padding-top: 10px; padding-bottom: 10px; padding-right: 10px; text-align: right;')
        let suite = new testSuite();
        let testNum = 0;
        let suiteContents = Object.getOwnPropertyNames(testSuite.prototype)
        for(let i=0; i<suiteContents.length; i++) {
            let test = suiteContents[i];
            if(typeof suite[test] === 'function' && test !== "constructor") {
                testNum++;
                console.log(`%c${testNum}. ${test}`, "margin-top: 10px; border-top: 2px solid #e9c9a0; color: #e9c9a0; border-radius: 10px; padding: 10px;");
                
                let fail;
                try { 
                    fail = await suite[test]()
                } catch(e) {
                    console.error(e)
                    fail = "Error"
                }

                if(fail) {
                    failed++;
                    let spaceNum = test.length - fail.length
                    let spaces = ""
                    if(spaceNum > 0) {
                        for(let i=0; i < spaceNum; i++) {
                            spaces += " "
                        }
                    }
                    console.log(`%c ${fail}${spaces}`, 'border-bottom: 2px solid #e9c9a0; color: rgb(254, 62, 43); border-radius: 10px; padding: 10px');
                } else {
                    success++;
                    console.log(`%c${testNum}. ${test}`, 'border-bottom: 2px solid #e9c9a0; background: #628c60; color: transparent; border-radius: 10px; padding: 0px 10px 0px 10px');
                }
            }
            // Need to flush ws buffer since saving is disabled, and that is what usually does the flushing
            // Frame.ws.sendMessage('Flush Buffer');
        }
        // await wait(100);
    }

    console.log("")
    console.log("")
    let elapsed = new Date() - start;
    if(failed === 0) {
        console.log(`%cRan ${failed+success} tests in ${elapsed}ms`, 'background: #222; color: #00FF00');
        console.log(`%c   ${success} passed`, 'background: #222; color: #00FF00');
        console.log(`%c   ${failed} failed`, 'background: #222;');
    } else {
        console.log(`%cRan ${failed+success} tests in ${elapsed}ms`, 'background: #222; color: rgb(254, 62, 43)');
        console.log(`%c   ${success} `, 'background: #222; color: #00FF00', "passed");
        console.log(`%c   ${failed} failed`, 'background: #222; color: rgb(254, 62, 43)');
    }
}

window.wait = ms => new Promise(res => setTimeout(res, ms));

window.__defineGetter__("test", test);

window.test