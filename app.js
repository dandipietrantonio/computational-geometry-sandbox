// function coinFlip() {
//     return Math.floor(Math.random() * 2);
// }

// function generateRandomPolyLineArray() {
//     const NUM_VERTICES = 10;
//     var ret = [[5,5]];

//     for (var i=1; i < NUM_VERTICES; i++) {
//         const x = Math.floor(Math.random() * 90 * i) + 10
//         const y = Math.floor(Math.random() * 90 * i) + 10
//         var negatingLeftOrRight = "neither";
//         ret.push([x,y])
//     }
//     return ret

// }

var EPSILON;

const timeUnit = 250;

FUNC_STACK = []; // represents the recursion stack
FUNC_QUEUE = []; // next function that should be called; when empty, pop from FUNC_STACK

var pointsArr = [];
var pointCircles = [];
var blackLines = [];

var distancePoints = [];
var distancePointCircles = [];
var distanceLine = [];

var distanceContainer = d3
  .select('#RDP')
  .append('svg')
  .attr('style', 'outline: thin solid blue; margin-bottom: 10px')
  .attr('width', '100%')
  .attr('height', '20%');

// This click handler is based on the handler from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
distanceContainer.on('click', (event) => {
  var coords = d3.pointer(event);

  // Normally we go from data to pixels, but here we're doing pixels to data
  var clickCoords = [
    Math.round(coords[0]), // Takes the pixel number to convert to number
    Math.round(coords[1]),
  ];

  if (distancePoints.length !== 2) {
    distancePoints.push([clickCoords[0], clickCoords[1]]);

    distancePointCircles.push({
      x_axis: clickCoords[0],
      y_axis: clickCoords[1],
      radius: 6,
      color: 'green',
    });

    if (distancePoints.length > 1) {
      const endIndex = distancePointCircles.length - 1;
      distanceLine.push({
        id:
          'a' +
          distancePoints[endIndex - 1].toString().replace(',', '') +
          distancePoints[endIndex].toString().replace(',', ''),
        x1: distancePoints[endIndex - 1][0],
        y1: distancePoints[endIndex - 1][1],
        x2: distancePoints[endIndex][0],
        y2: distancePoints[endIndex][1],
      });
    }

    var distanceCircles = distanceContainer
      .selectAll('circle') // For new circle, go through the update process
      .data(distancePointCircles)
      .enter()
      .append('circle');

    var circleAttributes = distanceCircles
      .attr('cx', (d) => d.x_axis)
      .attr('cy', (d) => d.y_axis)
      .attr('r', (d) => d.radius)
      .style('fill', (d) => d.color);

    var lines = distanceContainer.selectAll('line').data(distanceLine).enter().append('line');

    var lineAttributes = lines
      .attr('stroke-width', 2)
      .attr('stroke', 'green')
      .attr('id', (d) => d.id)
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2);
    if (distancePoints.length === 2) {
      a = Math.abs(distancePoints[0][0] - distancePoints[1][0]);
      b = Math.abs(distancePoints[0][1] - distancePoints[1][1]);
      EPSILON = Math.sqrt(a ** 2 + b ** 2);
      console.log('EPSILON: ', EPSILON);
    }
  }
});

var svgContainer = d3
  .select('#RDP')
  .append('svg')
  .attr('style', 'outline: thin solid red')
  .attr('width', '100%')
  .attr('height', '80%');

// This click handler is based on the handler from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
svgContainer.on('click', (event) => {
  var coords = d3.pointer(event);

  // Normally we go from data to pixels, but here we're doing pixels to data
  var clickCoords = [
    Math.round(coords[0]), // Takes the pixel number to convert to number
    Math.round(coords[1]),
  ];

  pointsArr.push([clickCoords[0], clickCoords[1]]);

  pointCircles.push({
    x_axis: clickCoords[0],
    y_axis: clickCoords[1],
    radius: 6,
    color: 'black',
  });

  if (pointsArr.length > 1) {
    const endIndex = pointCircles.length - 1;
    blackLines.push({
      id:
        'a' +
        pointsArr[endIndex - 1].toString().replace(',', '') +
        pointsArr[endIndex].toString().replace(',', ''),
      x1: pointsArr[endIndex - 1][0],
      y1: pointsArr[endIndex - 1][1],
      x2: pointsArr[endIndex][0],
      y2: pointsArr[endIndex][1],
    });
  }
  console.log('BLACK LINES: ', blackLines);

  var circles = svgContainer
    .selectAll('circle') // For new circle, go through the update process
    .data(pointCircles)
    .enter()
    .append('circle');

  var circleAttributes = circles
    .attr('cx', (d) => d.x_axis)
    .attr('cy', (d) => d.y_axis)
    .attr('r', (d) => d.radius)
    .style('fill', (d) => d.color);

  var lines = svgContainer.selectAll('line').data(blackLines).enter().append('line');

  var lineAttributes = lines
    .attr('stroke-width', 2)
    .attr('stroke', 'black')
    .attr('id', (d) => d.id)
    .attr('x1', (d) => d.x1)
    .attr('y1', (d) => d.y1)
    .attr('x2', (d) => d.x2)
    .attr('y2', (d) => d.y2);
});

function RDP(curPoints, epsilon) {
  drawLine(curPoints[0], curPoints[curPoints.length - 1]);

  FUNC_QUEUE.push(() => {
    findFurthestPoint(curPoints, epsilon);
  });
}

function drawLine(startPoint, endPoint, endFunc = () => {}) {
  const id = 'a' + startPoint.toString().replace(',', 'l') + endPoint.toString().replace(',', 'l');
  svgContainer
    .append('line')
    .attr('stroke-width', 2)
    .attr('stroke', 'red')
    .attr('id', id)
    .attr('x1', startPoint[0])
    .attr('y1', startPoint[1])
    .attr('x2', startPoint[0])
    .attr('y2', startPoint[1]);
  svgContainer
    .select('#' + id)
    .transition()
    .duration(timeUnit)
    .attr('x2', endPoint[0])
    .attr('y2', endPoint[1])
    .on('end', endFunc);
}

function findFurthestPoint(curPoints, epsilon) {
  // based on code from Stack Overflow: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  // we have 3 cases:
  //    1. the point is closest to the start point
  //    2. the point is closest to the end point
  //    3. the point is closest to another point on the line (this is its perpindicular distance)
  // this implementation accounts for all three cases

  const startPoint = curPoints[0];
  const endPoint = curPoints[curPoints.length - 1];

  const xStart = startPoint[0];
  const yStart = startPoint[1];
  const xEnd = endPoint[0];
  const yEnd = endPoint[1];

  var curMaxPoint = null;
  var curMaxDistance = 0;
  var curMaxIndex;

  for (var i = 1; i < curPoints.length - 1; i++) {
    const curPoint = curPoints[i];
    const xCurPoint = curPoint[0];
    const yCurPoint = curPoint[1];

    const id =
      xCurPoint.toString() + yCurPoint.toString() + curPoints.toString().replaceAll(',', 'l'); // guaranteed to be unique since we'll never consider the same point twice with the same point array

    svgContainer
      .append('line')
      .attr('id', 'distanceLine' + id)
      .attr('class', 'distanceLine')
      .attr('stroke-width', 2)
      .attr('stroke', 'orange')
      .attr('x1', xCurPoint)
      .attr('y1', yCurPoint)
      .attr('x2', xCurPoint)
      .attr('y2', yCurPoint);

    var A = xCurPoint - xStart;
    var B = yCurPoint - yStart;
    var C = xEnd - xStart;
    var D = yEnd - yStart;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0)
      //in case of 0 length line
      param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
      // closest to start point
      xx = xStart;
      yy = yStart;
    } else if (param > 1) {
      // closest to end point
      xx = xEnd;
      yy = yEnd;
    } else {
      // closest to some other point on the line
      xx = xStart + param * C;
      yy = yStart + param * D;
    }

    svgContainer
      .select('#distanceLine' + id)
      .transition()
      .duration(timeUnit)
      .delay(function (d) {
        console.log('DELAY: ', i * timeUnit);
        return i * timeUnit;
      })
      .attr('x2', xx)
      .attr('y2', yy);

    var dx = xCurPoint - xx;
    var dy = yCurPoint - yy;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > curMaxDistance) {
      curMaxDistance = distance;
      curMaxPoint = curPoint;
      curMaxIndex = i;
      curMaxPointID = id;
    }
  }
  if (curMaxPoint) {
    FUNC_QUEUE.push(() => {
      highlight_furthest(curPoints, epsilon, {
        maxPoint: curMaxPoint,
        maxIndex: curMaxIndex,
        maxDistance: curMaxDistance,
        maxPointID: curMaxPointID,
      });
    });
  } else
    FUNC_QUEUE.push(() => {
      highlight_furthest(curPoints, epsilon, null);
    });
}

function highlight_furthest(curPoints, epsilon, maxObj) {
  const maxLineID = 'distanceLine' + maxObj.maxPointID;
  console.log('highlighting furthest, arguments: ', arguments);

  // Removing all of the non-furthest lines and highlighting the furthest
  if (curPoints.length === 3) {
    svgContainer
      .select('#' + maxLineID)
      .transition()
      .attr('stroke', 'lime');
  } else {
    svgContainer
      .selectAll('.distanceLine')
      .filter(function (d, i, line) {
        return line[i].id !== maxLineID;
      })
      .transition()
      .duration(timeUnit)
      .style('stroke-opacity', 0)
      .style('fill-opacity', 0)
      .on('end', () => {
        svgContainer
          .selectAll('.distanceLine')
          .filter(function (d, i, line) {
            return line[i].id !== maxLineID;
          })
          .remove();
        svgContainer
          .select('#' + maxLineID)
          .transition()
          .attr('stroke', 'lime');
      });
  }

  FUNC_QUEUE.push(() => {
    breakLineIntoTwo(curPoints, epsilon, maxObj);
  });
}

function breakLineIntoTwo(curPoints, epsilon, maxObj) {
  const idOfDistanceLineToRemove = 'distanceLine' + maxObj.maxPointID;
  svgContainer
    .select('#' + idOfDistanceLineToRemove)
    .transition()
    .duration(timeUnit)
    .style('stroke-opacity', 0)
    .style('fill-opacity', 0)
    .on('end', () => {
      svgContainer.select('#' + idOfDistanceLineToRemove).remove();
    });

  console.log('MAX OBJ BEFORE RECURSING: ', maxObj);
  if (maxObj.maxDistance > epsilon) {
    const idOfSimplifiedLineToRemove =
      'a' +
      curPoints[0].toString().replace(',', 'l') +
      curPoints[curPoints.length - 1].toString().replace(',', 'l');
    svgContainer
      .select('#' + idOfSimplifiedLineToRemove)
      .transition()
      .delay(timeUnit) // so the distance line is removed first
      .duration(timeUnit)
      .style('stroke-opacity', 0)
      .style('fill-opacity', 0)
      .on('end', () => {
        console.log('hi');
        svgContainer.select('#' + idOfSimplifiedLineToRemove).remove();
        drawLine(curPoints[0], maxObj.maxPoint, () => {
          drawLine(maxObj.maxPoint, curPoints[curPoints.length - 1]);
        });
      });

    const firstHalfPoints = curPoints.slice(0, maxObj.maxIndex + 1);
    const secondHalfPoints = curPoints.slice(maxObj.maxIndex, curPoints.length);

    if (firstHalfPoints.length > 2) {
      FUNC_QUEUE.push(() => {
        findFurthestPoint(firstHalfPoints, epsilon);
      });
    }
    if (secondHalfPoints.length > 2) {
      FUNC_STACK.push(() => {
        findFurthestPoint(secondHalfPoints, epsilon);
      });
    }
  } else {
    console.log('this line is done!');
  }
}

function start() {
  svgContainer.selectAll('line').attr('stroke-dasharray', '10,10');
  RDP(pointsArr, EPSILON);
}

function reset() {
  pointsArr = [];
  pointCircles = [];
  blackLines = [];

  distancePoints = [];
  distancePointCircles = [];
  distanceLine = [];

  FUNC_STACK = [];
  FUNC_QUEUE = [];

  svgContainer.selectAll('*').remove();
  distanceContainer.selectAll('*').remove();
}

function next() {
  if (FUNC_QUEUE.length !== 0) FUNC_QUEUE.pop(0)();
  else if (FUNC_STACK.length !== 0) FUNC_STACK.pop()();
  else console.log('Pressed space with nothing left to do!');
  console.log('Func queue afetr space: ', FUNC_QUEUE);
}

// d3.select('body').on('keydown', (e) => {
//   if (e.code === 'Space') {
//     if (FUNC_QUEUE.length !== 0) FUNC_QUEUE.pop(0)();
//     else if (FUNC_STACK.length !== 0) FUNC_STACK.pop()();
//     else console.log('Pressed space with nothing left to do!');
//     console.log('Func queue afetr space: ', FUNC_QUEUE);
//   }
// });
