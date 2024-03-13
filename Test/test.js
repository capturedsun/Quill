console.log("Tests initializing.")
window.testSuites = [];

import ("./parse.test.js")

window.test = async function() {
    // window.testSuites.sort();
    window.alert = () => true;
    window.confirm = () => true;
    
    let failed = 0;
    let success = 0;
    
    var start = new Date();
    for(let j=0; j<window.testSuites.length; j++) {
        let testSuite = window.testSuites[j];
        console.log(`%c ➽ ${j+1} ${testSuite.name.replace("test", "")}`, 'color: #ffffff; font-size: 17px; padding-left: -20px; padding-top: 10px; padding-bottom: 10px; text-align: right;')
        let suite = new testSuite();
        let testNum = 0;
        let suiteContents = Object.getOwnPropertyNames(testSuite.prototype)
        for(let i=0; i<suiteContents.length; i++) {
            let test = suiteContents[i];
            if(typeof suite[test] === 'function' && test !== "constructor") {
                testNum++;
                let fail = await suite[test]();
                if(fail) {
                    failed++;
                    console.log(`%c   ${testNum}. ${test}: ${fail}`, 'background: #222; color: rgb(254, 62, 43)');
                } else {
                    success++;
                    console.log(`%c   ${testNum}. ${test}`, 'background: #222; color: #00FF00');
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