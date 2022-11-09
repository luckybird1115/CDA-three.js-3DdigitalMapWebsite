function getArgs () {
  const args = {};
  process.argv
    .slice(2, process.argv.length)
    .forEach( arg => {
      // long arg
      if (arg.slice(0,2) === '--') {
        const longArg = arg.split('=');
        const longArgFlag = longArg[0].slice(2,longArg[0].length);
        const longArgValue = longArg.length > 1 ? longArg[1] : true;
        args[longArgFlag] = longArgValue;
      }
      // flags
      else if (arg[0] === '-') {
        const flags = arg.slice(1,arg.length).split('');
        flags.forEach(flag => {
          args[flag] = true;
        });
      }
    });
  return args;
}

function showHelp() {
  console.log(`Generation fakie data
      args:
         --min=34
         --max=51
         --maxStep=5
         --precision=0
         --timeStepMinSec=5
         --timeStepMaxSec=34
         --days=7
         --metric=°C
         --target=[target-file-path] (default console output)

      usage example:
      node ./generate-fake-gauge-data.js
      node ./generate-fake-gauge-data.js --min=12 --max=21 --maxStep=1 --precision=2 --target=values.json
      node ./generate-fake-gauge-data.js --precision=1 --maxStep=0.5 --timeStepMinSec=2 --timeStepMaxSec=10 --days=2 --target=./tankGauge.json
      `);
}

function write(path, data) {
  const fs = require('fs');
  return fs.writeFileSync(path, data);
}

function main() {
  const { min = '34', max = '51', maxStep = '5', precision = '0', timeStepMinSec = '5', timeStepMaxSec = '34', days='7', valueMetric='°C', target, h, help } = getArgs();
  if (h || help ) {
      showHelp();
      return 0;
  }

  const path = require('node:path');

  const result = [];
  const valueMin = +min;
  const valueMax = +max;
  const valueMaxStep = +maxStep;
  const valuePrecision = +precision;
  const dateFrom = new Date().getTime();
  const dateTo = new Date(dateFrom + days*24*60*60*1000).getTime();
  const stepFrom = +timeStepMinSec * 1000;
  const stepTo = +timeStepMaxSec * 1000;

  function random(min, max, decimalPrecision = 0) {
    const offset = Math.pow(10, decimalPrecision);
    return Math.floor(Math.random() * (max*offset - min*offset + offset) + min*offset)/offset;
  }

  let value = random(valueMin, valueMax);
  for (let date = dateFrom; date < dateTo; date = date + random(stepFrom, stepTo)) {
    value = random(Math.max(valueMin, value - valueMaxStep), Math.min(valueMax, value + valueMaxStep), valuePrecision)
    result.push({
      time: new Date(date).toISOString(),
      value: `${value.toFixed(valuePrecision)}${valueMetric}`,
    });
  }

  const resultJson = JSON.stringify(result, null, 2);
  if (!target) {
    console.log(resultJson);
  } else {
    let fullTargetPath = target;
    if (!path.isAbsolute(target)) {
      fullTargetPath = path.normalize(path.join(process.cwd(), target));
    }
    write(fullTargetPath, resultJson);
    console.log(`Result successfully saved to ${fullTargetPath}`);
  }
  return 0;
}

main();
