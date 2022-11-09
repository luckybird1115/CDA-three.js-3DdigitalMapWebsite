// parameter: number | array // permanent value or [y_is_up_case, z_is_up_case]
const ShapeGeometryPropertyIndexes = {
  Box: {
    size: {
      lengthX: 1,
      lengthY: [3, 2],
      lengthZ: [2, 3],
    },
    rotation: {
      x: 4,
      y: [5, 6],
      z: [6, 5],
    },
    position: {
      x: 7,
      y: [8, 9],
      z: [9, 8],
    }
  },
  Cylinder: {
    size: {
      diameter: 1,
      length: 2,
    },
    rotation: {
      x: 3,
      y: [4, 5],
      z: [5, 4],
    },
    position: {
      x: 6,
      y: [7, 8],
      z: [8, 7],
    },
  },
  Cone: {
    size: {
      diameter1: 1,
      diameter2: 2,
      length: 3,
    },
    rotation: {
      x: 4,
      y: [5, 6],
      z: [6, 5],
    },
    position: {
      x: 7,
      y: [8, 9],
      z: [9, 8],
    },
  },
  EccentricCircularCone: {
    size: {
      angle1: 1,
      angle2: 2,
      diameter1: 3,
      diameter2: 4,
      aspectRatio1: 5,
      aspectRatio2: 6,
      length1: 7,
      length2: 8,
      length3: 9,
    },
    rotation: {
      x: 10,
      y: [11, 12],
      z: [12, 11],
    },
    position: {
      x: 13,
      y: [14, 15],
      z: [15, 14],
    },
  },
  Torus: {
    size: {
      angle: 1,
      diameter: 2,
      radius: 3,
    },
    rotation: {
      x: 4,
      y: [5, 6],
      z: [6, 7],
    },
    position: {
      x: 7,
      y: [8, 9],
      z: [9, 8],
    },
  },
  SphericalSegment: {
    size: {
      angle1: 1,
      angle2: 2,
      angle3: 3,
      diameter: 4,
      radius: 5,
    },
    rotation: {
      x: 6,
      y: [7, 8],
      z: [8, 7],
    },
    position: {
      x: 9,
      y: [10, 11],
      z: [11, 10],
    },
  },
}

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
  console.log(`Convertation CAV to JSON
      args:
         --source=[cav-file-path]
         --up-axis=[up-axis-name] ("z" | "y", default "z")
         --target=[target-file-path] (default console output)

      usage example:
      node ./cav-to-json --source=./plant.cav --up-axis=z
      node ./cav-to-json --source=./plant.cav --target=shapes-set.json
      `);
}

function read(path) {
  const fs = require('fs');
  return fs.readFileSync(path).toString();
}

function write(path, data) {
  const fs = require('fs');
  return fs.writeFileSync(path, data);
}

function convert(cavString, upAxis) {
  const strings = cavString.split('\n');
  const resultShapes = [];
  function pushShape(shape) {
    const existShape = resultShapes.find(item => item.metadata.Name === shape.metadata.Name);
    if (existShape) {
      existShape.primitives.push(shape.geometry)
      existShape.metadata = {...shape.metadata, ...existShape.metadata};
    } else {
      resultShapes.push({
        metadata: shape.metadata,
        primitives: [shape.geometry],
      });
    }
  }
  let newShape = {
    metadata: {}
  };
  for (const str of strings) {
    try {
      if (!str.trim()) {
        // end of shape
        if (newShape.geometry) {
          pushShape(newShape);
        }
        newShape = {
          metadata: {}
        };
        continue;
      }
      const properties = str.split(';');
      const type = properties[0];
      const shapePropertyIndexes = ShapeGeometryPropertyIndexes[type];
      if (shapePropertyIndexes) {
        // shape geometry
        const geometry = {
          type,
        };

        function parseValues (shapePropertyIndexes, target, targetKey) {
          for (const propKey in shapePropertyIndexes) {
            let propValue = shapePropertyIndexes[propKey];
            if (Array.isArray(propValue)) {
              propValue = upAxis === 'y' ? propValue[0]: propValue[1];
            }
            if (typeof propValue === 'object') {
              target[propKey] = {};
              parseValues(propValue, target[propKey], propKey);
            } else {
              let value = +properties[propValue];
              if (upAxis === 'z' && propKey === 'z') {
                if (targetKey === 'rotation' && type === 'Cylinder') {
                  value = value - 1.57; //90 deg
                } else if (targetKey === 'position') {
                  value = value * -1;
                }
              }
              target[propKey] = value;
            }
          }
        }

        parseValues(shapePropertyIndexes, geometry, '');
        newShape.geometry = geometry;
      } else {
        // shape metadata
        newShape.metadata[type] = str.slice(type.length + 1).trim();
      }
    } catch (err) {
      console.error(`CAV parsing error. Check ${strings.indexOf(str)} string:`);
      console.error(str);
      console.error(err);
      process.exit(1);
    }
  }
  if (newShape.geometry) {
    pushShape(newShape);
  }
  return resultShapes;
}

function main() {
  const { source, "up-axis": upAxis = "z", target, h, help } = getArgs();
  if (!source || h || help ) {
      showHelp();
      return 0;
  }
  const path = require('node:path');
  let fullSourcePath = source;
  if (!path.isAbsolute(source)) {
    fullSourcePath = path.normalize(path.join(process.cwd(), source));
  }
  const cavString = read(fullSourcePath);
  const shapesObject = convert(cavString, upAxis);
  const resultJson = JSON.stringify(shapesObject, null, 2);
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
