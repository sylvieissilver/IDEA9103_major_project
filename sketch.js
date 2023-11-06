let song;
let fft;
let clickCount = 0;//set the clickcount, when click the sketch, the music will play or pause

function preload() {
//load my music
  song = loadSound('audio/Spindash.mp3') ;
  
  }

function setup() {

    createCanvas(windowWidth, windowHeight);

    fft = new p5.FFT();//set FFT
    song.connect(fft);
    
    colorPalette = [
      [5, 5, 5],       // Dark color
      [43, 103, 175],  // Blue color
      [239, 86, 47],   // Red color
      [242, 234, 193], // Light color
    ];
    mainColor = [249, 213, 49];//Yellow color

    unitWidth = width / 16;  // Calculate the unit width based on canvas width.
    unitHeight = unitWidth / 9; // Calculate the unit height as a quarter of the unit width.
    noStroke(); // Disable drawing strokes.
    createComposition(); // Call the function to create the composition.
    noLoop();
    }

let spacingMargin = 2 * 2; // Set the margin for the spacing.
let unitWidth, unitHeight; // Declare the unit width and height for rectangles.
let backgroundColor = [255, 252, 242]; // Define the background color.
let colorPalette; // Define the color palette.
let mainColor; // Define the main color used in the composition.

let rectanglesList = []; // Array to store the rectangle objects.

// Function to generate a random integer between 'a' and 'b'.
let randomInteger = (a, b) => floor(random(a, b));

//set mouseclicked to create interaction
function mouseClicked() {
  clickCount++; // Increment the counter on each click

  if (clickCount === 0) {
    song.stop();
    noLoop(); 
  } else if (clickCount % 2 === 0) {
    song.pause();
    noLoop(); 
  } else {
    song.play();
    loop(); 
  }
}

function draw() {

  // Give the audience a hint on how to interact with the sketch at the beginning
  if (getAudioContext().state !== 'running') {
    background(43, 103, 175);
    noStroke();
    fill(249, 213, 49);
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Click to Play or Pause', width/2, height/2 - 50);

    fill(249, 213, 49);//draw a triangle as 'play' button
    beginShape();
    vertex(width / 2 - 10, height / 2 - 20);
    vertex(width / 2 - 10, height / 2 + 20);
    vertex(width / 2 + 20, height / 2);
    endShape(CLOSE);
    
    return;
  }

  let spectrum = fft.analyze();

  background(backgroundColor); // Set the background color
  translate(-width / 2 - unitHeight / 2, -height / 2 - unitHeight / 2); // Center the composition
  
  for (let recta of rectanglesList) {
    recta.display(); // Display each rectangle
  }
}

//creates the overall composition of rectangles
function createComposition() {
  // Attempt to create up to 2000 rectangles
  for (let i = 0; i < 2000; i++) {
    let newRectangle = generateRectangle(); // Generate a new rectangle
    let canAdd = true; // Check if the rectangle can be added
    
    // Check for intersections with existing rectangles
    for (let rectangle of rectanglesList) {
      rectangle.display();
      if (rectangle.intersects(newRectangle)) {
        canAdd = false; // Set flag to false if there is an intersection
        break;
      }
    }
    if (canAdd) {
      rectanglesList.push(newRectangle); // Add the new rectangle if there is no intersection
    }
  }

  // fill the gaps with 1x1 rectangles
  for (let i = spacingMargin; i < 32 - spacingMargin; i++) {
    for (let j = spacingMargin; j < 32 - spacingMargin; j++) {
      let newRectangle = new RectangularBlock(i * unitWidth, j * unitWidth, unitWidth, unitWidth, null);
      let canAdd = true;
      // Check for intersections with existing rectangles
      for (let rectangle of rectanglesList) {
        if (rectangle.intersects(newRectangle)) {
          canAdd = false;
          break;
        }
      }
      if (canAdd) {
        rectanglesList.push(newRectangle); // Add the new rectangle if there is no intersection
      }
    }
  }

  // choose the rectangles with color rectangles inside
  let colorsCopy = colorPalette.slice(); // Copy the palette
  let index = 0;
  let remainingColors = colorsCopy.slice(); // Array to track remaining colors.
  // Loop until there are no colors left to assign
  while (remainingColors.length > 0) {
    if (rectanglesList[index].width > unitWidth && rectanglesList[index].height > unitWidth && (rectanglesList[index].width + rectanglesList[index].height) < 7 * unitWidth) {
      rectanglesList[index].insideColor = remainingColors.pop(); // Assign a color
    }
    index++;
    if (index >= rectanglesList.length) break; // Stop if all rectangles are processed
    
  }
}

// Function to generate a new rectangle with certain constraints
function generateRectangle() {
  let widthInUnits, heightInUnits;
  let attempts = 0;
  while (attempts < 100) {
    widthInUnits = randomInteger(4, 15) / 2;
    heightInUnits = randomInteger(4, 15) / 2;
    // Make sure the rectangle does not meet certain conditions that are not allowed
    if (!((widthInUnits == 2 && heightInUnits == 2) || (widthInUnits >= 4 && heightInUnits >= 4))) {
      let x0 = randomInteger(spacingMargin, 32 - spacingMargin - widthInUnits + 1) * unitWidth;
      let y0 = randomInteger(spacingMargin, 32 - spacingMargin - heightInUnits + 1) * unitWidth;
      let insideColor = null;
      // Draw the rectangle directly here
      if (insideColor) {
        fill(insideColor);
        rect(x0 + 2 * unitHeight, y0 + 2 * unitHeight, widthInUnits * unitWidth - 3 * unitHeight, heightInUnits * unitWidth - 3 * unitHeight);
        if ((widthInUnits * unitWidth - heightInUnits * unitWidth) < 2 * unitWidth) {
          fill(colorPalette[floor(random(colorPalette.length))]);
          if (widthInUnits * unitWidth < heightInUnits * unitWidth) {
            rect(x0 + 3 * unitHeight, y0 + (heightInUnits * unitWidth - (widthInUnits * unitWidth - 6 * unitHeight)) / 2, widthInUnits * unitWidth - 5 * unitHeight, widthInUnits * unitWidth - 5 * unitHeight);
          } else if (heightInUnits * unitWidth < widthInUnits * unitWidth) {
            rect(x0 + (widthInUnits * unitWidth - (heightInUnits * unitWidth - 6 * unitHeight)) / 2, y0 + 3 * unitHeight, heightInUnits * unitWidth - 5 * unitHeight, heightInUnits * unitWidth - 5 * unitHeight);
          }
        }
      }
      return new RectangularBlock(x0, y0, widthInUnits * unitWidth, heightInUnits * unitWidth, insideColor);
    }
    attempts++;
  }
  return null;
}

// Class definition for RectangularBlock
class RectangularBlock {
  constructor(x0, y0, width, height, insideColor) {
    this.x0 = x0;
    this.y0 = y0;
    this.width = width;
    this.height = height;
    this.insideColor = insideColor;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.color = color;
  }
  update() {
    this.x0 += this.xSpeed;
    this.y0 += this.ySpeed;
  }
  // Method to check if this rectangle intersects with another one
  intersects(otherRect) {
    return (
      (this.x0 <= otherRect.x0 && this.x0 + this.width > otherRect.x0) ||
      (otherRect.x0 <= this.x0 && otherRect.x0 + otherRect.width > this.x0)
    ) && (
      (this.y0 <= otherRect.y0 && this.y0 + this.height > otherRect.y0) ||
      (otherRect.y0 <= this.y0 && otherRect.y0 + otherRect.height > this.y0)
    );
  }


  // Method to display the rectangle
  display() {
    if (this.insideColor) {
      fill(this.insideColor);
      rect(this.x0 + 2 * unitHeight, this.y0 + 2 * unitHeight, this.width - 3 * unitHeight, this.height - 3 * unitHeight);
      if ((this.width - this.height) < 2 * unitWidth) {
        fill(colorPalette[floor(random(colorPalette.length))]);
        if (this.width < this.height) {
          rect(this.x0 + 3 * unitHeight, this.y0 + (this.height - (this.width - 6 * unitHeight)) / 2, this.width - 5 * unitHeight, this.width - 5 * unitHeight);
        } else if (this.height < this.width) {
          rect(this.x0 + (this.width - (this.height - 6 * unitHeight)) / 2, this.y0 + 3 * unitHeight, this.height - 5 * unitHeight, this.height - 5 * unitHeight);
        }
      }
    }

    let prevCol1, prevCol2, newCol;
    let x = this.x0;
    while (x < this.x0 + this.width + unitHeight / 2) {
      newCol = getRandomColor(prevCol1);
      if (random() < 2 / 3) newCol = mainColor;
      fill(newCol);
      prevCol1 = newCol;
      square(x, this.y0, unitHeight);
      x += unitHeight;
    }

    x = this.x0;
    while (x < this.x0 + this.width + unitHeight / 2) {
      newCol = getRandomColor(prevCol2);
      if (random() < 2 / 3) newCol = mainColor;
      fill(newCol);
      prevCol2 = newCol;
      square(x, this.y0 + this.height, unitHeight);
      x += unitHeight;
    }

    let y = this.y0 + unitHeight;
    while (y < this.y0 + this.height - unitHeight / 2) {
      newCol = getRandomColor(prevCol1);
      if (random() < 2 / 3) newCol = mainColor;
      fill(newCol);
      prevCol1 = newCol;
      square(this.x0, y, unitHeight);
      y += unitHeight;
    }
  }
}

// Function to get a random color that is different from the previous color
function getRandomColor(previousColor) {
  let newColor;
  while (true) {
    newColor = colorPalette[floor(random(colorPalette.length))];
    if (newColor !== previousColor) {
      return newColor;
    }
  }
}

// Function that adjusts the canvas size when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  unitWidth = width / 16; // Recalculate unitWidth based on new canvas width
  unitHeight = unitWidth / 4; // Recalculate unitHeight based on new unitWidth
  createComposition(); // Re-create the composition for the new size
  draw(); // Redraw the composition
}