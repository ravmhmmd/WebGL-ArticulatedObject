// selector html
const textureSelector = document.getElementById("texture-selector");
const imageSelector = document.getElementById("image-selector");
const bumpSelector = document.getElementById("bump-selector");
const xRotatorButton = document.querySelector("#x-rotation");
const yRotatorButton = document.querySelector("#y-rotation");
const zRotatorButton = document.querySelector("#z-rotation");
const cameraAngleSlider = document.querySelector("#camera-angle");
const cameraZoomSlider = document.querySelector("#camera-zoom");
const shadingToggler = document.querySelector("#shader-mode");
const animationToggler = document.querySelector("#animation-mode");
const saveButton = document.querySelector("#save-button");
const fileSelector = document.querySelector("#file-input");
const loadButton = document.querySelector("#load-button");
const helpBtn = document.getElementById("help-button");
const tableParts = document.getElementById("tableParts");

const setEventListener = (element, eventType, cb) => {
  element.addEventListener(eventType, cb);
};

const main = () => {
  var canvas = document.getElementById("canvas");

  var articulatedModel = robotDemo;

  loadButton.addEventListener("click", () => {
      const file = fileSelector.files[0];
      var setObject = (data) => {
        articulatedModel = data;
        glUnit.drawModel(articulatedModel);
      };
      load(file, setObject);
  });

  const glUnit = new GLUnit(canvas);
  glUnit.drawModel(articulatedModel);

  var then = 0;

  function render(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;

    glUnit.clearScreen();
    for (let i = 0; i < glUnit.num_objects; i++) {
      glUnit.initNodes(i, false);
    }
    glUnit.startTraverse(deltaTime);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  setEventListener(textureSelector, "change", (ev) => {
    glUnit.setTexture(parseInt(ev.target.value));
  });

  setEventListener(imageSelector, "change", (ev) => {
    glUnit.setImageSource(ev.target.value);
  });

  setEventListener(bumpSelector, "change", (ev) => {
    glUnit.setBumpSource(ev.target.value);
    });

    setEventListener(shadingToggler, "change", (ev) => {
        glUnit.setShading(ev.target.checked);
    });

  setEventListener(xRotatorButton, "input", () => {
    glUnit.setCameraRadian(xRotatorButton.value, 0);
  });

  setEventListener(yRotatorButton, "input", () => {
    glUnit.setCameraRadian(yRotatorButton.value, 1);
  });

    setEventListener(cameraZoomSlider, "input", () => {
        glUnit.setScale(cameraZoomSlider.value)
    });

    setEventListener(animationToggler, "change", () => {
        glUnit.animationFlag = !glUnit.animationFlag;
    });

  setEventListener(zRotatorButton, "input", () => {
    glUnit.setCameraRadian(zRotatorButton.value, 2);
  });

  setEventListener(cameraZoomSlider, "input", () => {
    glUnit.setScale(cameraZoomSlider.value);
  });

  setEventListener(cameraAngleSlider, "input", () => {
    glUnit.setEye(cameraAngleSlider.value, 0);
  });

  setEventListener(saveButton, "click", () => {
      save(articulatedModel)
});

  for (let i = 1; i <= articulatedModel.num_point/8; i++) {
      console.log((i-1) % 5);
      if (((i-1) % 5) === 0) {
          var tmpString = "";
          tmpString += "<tr>"
      }
      
      tmpString += "<td><label>Part " + i + "</label></td>";
      tmpString += `<td><input type="range" min="0" max="1" step="0.01" value="0" id="part${i}"/></td>`;

      if (((i-1) % 5) === 4) {
            tmpString += "</tr>"
            tableParts.innerHTML += tmpString;
        }
  }

  console.log(tableParts.innerHTML);

    const part1 = document.getElementById("part1");
    const part2 = document.getElementById("part2");
    const part3 = document.getElementById("part3");
    const part4 = document.getElementById("part4");
    const part5 = document.getElementById("part5");
    const part6 = document.getElementById("part6");
    const part7 = document.getElementById("part7");
    const part8 = document.getElementById("part8");
    const part9 = document.getElementById("part9");
    const part10 = document.getElementById("part10");
    const part11 = document.getElementById("part11");
    const part12 = document.getElementById("part12");
    const part13 = document.getElementById("part13");
    const part14 = document.getElementById("part14");
    const part15 = document.getElementById("part15");
    const part16 = document.getElementById("part16");
    const part17 = document.getElementById("part17");
    const part18 = document.getElementById("part18");
    const part19 = document.getElementById("part19");
    const part20 = document.getElementById("part20");

    try {
        setEventListener(part1, "input", () => {
            const newAngle = part1.value;
            glUnit.setPartAngle(newAngle, 0);
        });
        setEventListener(part2, "input", () => {
            const newAngle = part2.value;
            glUnit.setPartAngle(newAngle, 1);
        });
        setEventListener(part3, "input", () => {
            const newAngle = part3.value;
            glUnit.setPartAngle(newAngle, 2);
        });
        setEventListener(part4, "input", () => {
            const newAngle = part4.value;
            glUnit.setPartAngle(newAngle, 3);
        });
        setEventListener(part5, "input", () => {
            const newAngle = part5.value;
            glUnit.setPartAngle(newAngle, 4);
        });
        setEventListener(part6, "input", () => {
            const newAngle = part6.value;
            glUnit.setPartAngle(newAngle, 5);
        });
        setEventListener(part7, "input", () => {
            const newAngle = part7.value;
            glUnit.setPartAngle(newAngle, 6);
        });
        setEventListener(part8, "input", () => {
            const newAngle = part8.value;
            glUnit.setPartAngle(newAngle, 7);
        });
        setEventListener(part9, "input", () => {
            const newAngle = part9.value;
            glUnit.setPartAngle(newAngle, 8);
        });
        setEventListener(part10, "input", () => {
            const newAngle = part10.value;
            glUnit.setPartAngle(newAngle, 9);
        });
        setEventListener(part11, "input", () => {
            const newAngle = part11.value;
            glUnit.setPartAngle(newAngle, 10);
        });
        setEventListener(part12, "input", () => {
            const newAngle = part12.value;
            glUnit.setPartAngle(newAngle, 11);
        });
        setEventListener(part13, "input", () => {
            const newAngle = part13.value;
            glUnit.setPartAngle(newAngle, 12);
        });
        setEventListener(part14, "input", () => {
            const newAngle = part14.value;
            glUnit.setPartAngle(newAngle, 13);
        });
        setEventListener(part15, "input", () => {
            const newAngle = part15.value;
            glUnit.setPartAngle(newAngle, 14);
        });
        setEventListener(part16, "input", () => {
            const newAngle = part16.value;
            glUnit.setPartAngle(newAngle, 15);
        });
        setEventListener(part17, "input", () => {
            const newAngle = part17.value;
            glUnit.setPartAngle(newAngle, 16);
        });
        setEventListener(part18, "input", () => {
            const newAngle = part18.value;
            glUnit.setPartAngle(newAngle, 17);
        });
        setEventListener(part19, "input", () => {
            const newAngle = part19.value;
            glUnit.setPartAngle(newAngle, 18);
        });
        setEventListener(part20, "input", () => {
            const newAngle = part20.value;
            glUnit.setPartAngle(newAngle, 19);
        });
    } catch {
        console.log("Event Listener Initiated");
    }
};

main();
