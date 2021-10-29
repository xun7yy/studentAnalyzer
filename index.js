const wellThresholdBar = document.querySelector('#wellThreshold');
const poorThresholdBar = document.querySelector('#poorThreshold');

/**
 * update wordToCount map based on the words in a string
 * @example
 * // update obj from {} to {a:1, b:1}
 * updateMap("a b", {});
 * @example
 * // update obj from {a:1, b:1} to {a:2, b:1}
 * updateMap("a/n", {a:1, b:1});
 */
const updateMap = (s, map) => {
    const s1 = s.replace(/\\u\w{4}|<\/?\w*>|\\\w/g, '');
    const s2 = s1.replace(/\W+/g, '@');
    const array = s2.split('@');
    for(let i in array) {
        if(!array[i]) {
            continue;
        }
        const word = array[i].toLowerCase();
        if(map[word]) {
            map[word]++;
            continue;
        }
        map[word] = 1;
    }
}

/**
 * get keys from a map, which the value of those keys are nth largest in that map
 * @example
 * // return [a]
 * getMaxArray({a:2, b:1}, 1);
 * @example
 * // return [a, b]
 * getMaxArray({a:2, b:1}, 2);
 * @returns {array} Returns the array of keys
 */
const getMaxArray = (map, count) => {
    const mapSize = Object.keys(map).length;
    if(count > mapSize) {
        return Object.keys(map);
    }
    let result = [];
    for(let i = 0; i < count; i++){
        let max = 0;
        let maxWord;
        for(let word in map) {
            if (max < map[word]) {
                max = map[word];
                maxWord = word;
            }
        }
        result.push(maxWord);
        delete map[maxWord];
    }
    return result;
}

/**
 * get the words with hight frequency in a array of object
 * @example
 * // return {well: ["the, "and"], poor: ["test", "quiz"], {wellThreshold: 80, poorThreshold: 30}, {wellCount: 2, poorCount: 2}}
 * analyze([{"text": "the and", "percent_correct": 0.9999999}, {"text": "test quiz", "percent_correct": 0.111111}]);
 * @returns {object} Returns the object with array of words which are appear more frequently above in better threshold and array of words which are appear more frequently above in lower threshold
 */
const analyze = (array, thresholds, counts) => {
    const { wellThreshold, poorThreshold } = thresholds;
    const { wellCount, poorCount } = counts;
    const map = {
        well:{},
        poor:{}
    }
    const result = {
        well:[],
        poor:[]
    }
    for(let i in array) {
        const {percent_correct, text} = array[i];
        const percentInfo = /(?<=\.)\d{2}/.exec(percent_correct);
        if(!percentInfo) {
            continue;
        }
        const percent = parseInt(percentInfo[0]);
        if(percent < poorThreshold) {
            updateMap(text, map.poor);
            continue;
        }
        if(percent > wellThreshold) {
            updateMap(text, map.well);
            continue;
        }
    }
    result.well = getMaxArray(map.well, wellCount);
    result.poor = getMaxArray(map.poor, poorCount);
    wellPool.innerHTML = '';
    result.well.map((word) => {
        const element = document.createElement("DIV");
        element.innerText = word;
        element.className = 'word';
        wellPool.appendChild(element);
    })
    poorPool.innerHTML = '';
    result.poor.map((word) => {
        const element = document.createElement("DIV");
        element.innerText = word;
        element.className = 'word';
        poorPool.appendChild(element);
    })
    return result;
}

dataForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    const data = new FormData(dataForm);
    const file = data.get('fileInput');
    const wellThreshold = data.get('wellThreshold');
    const poorThreshold = data.get('poorThreshold');

    if(!file?.size) {
        alert("Must upload a json file");
        return;
    }
    if(wellThreshold <= 50 || poorThreshold >= 50) {
        alert("Please input correct threshold");
        return;
    }
    const thresholds = {
        wellThreshold: wellThreshold, 
        poorThreshold: poorThreshold
    }
    const counts = {
        wellCount: data.get('wellCount'), 
        poorCount: data.get('poorCount')
    }
    let reader = new FileReader();
    reader.onload = (event)=>{
        const file = JSON.parse(event.target.result);
        analyze(file, thresholds, counts);
    };
    reader.readAsText(file);
});

wellThresholdBar.addEventListener('change', (event)=>{
    wellThreshold = event.target.value;
    document.querySelector('#wellThresholdValue').innerHTML = wellThreshold;
});
poorThresholdBar.addEventListener('change', (event)=>{
    poorThreshold = event.target.value;
    document.querySelector('#poorThresholdValue').innerHTML = poorThreshold;
});
