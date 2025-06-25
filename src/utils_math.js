const PI2 = Math.PI * 2;
const PIH = Math.PI / 2;
const degToRad = Math.PI / 180;

function RandomBetweenInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function RandomBetweenFloat(min, max) {
    return (Math.random() * (max - min)) + min;
}

function GetRandomColor() {
    const r = 255 * Math.random() | 0,
          g = 255 * Math.random() | 0,
          b = 255 * Math.random() | 0;
    return `rgb(${r},${g},${b})`;
}

// #region Math helper functions

function SqrLength(v) {
    const x2 = v.x * v.x;
    const y2 = v.y * v.y;
    return x2 + y2;
}

function DistanceSquaredPointToPoint(p1x, p1y, p2x, p2y) {
    const dx = p2x - p1x;
    const dy = p2y - p1y;
    return dx * dx + dy * dy;
}

function DistancePointToSegment(A, B, px, py) {
    const difXAB = A.x - B.x;
    const difYAB = A.y - B.y;
    return (((B.x - A.x) * (A.y - py)) - ((A.x - px) * (B.y - A.y))) / (Math.sqrt(difXAB * difXAB + difYAB * difYAB));
}

function DistancePointToSegmentSign(A, B, px, py) {
    return ((B.x - A.x) * (A.y - py)) - ((A.x - px) * (B.y - A.y));
}

// Find the closest point on a line segment to a given point
function GetClosestPointOnSegment(A, B, P) {
    const APx = P.x - A.x;
    const APy = P.y - A.y;
    const ABx = B.x - A.x;
    const ABy = B.y - A.y;

    const magAB2 = ABx * ABx + ABy * ABy;
    let t = 0;
    if (magAB2 > 0) { // Avoid division by zero for zero-length segments
        t = (APx * ABx + APy * ABy) / magAB2;
        t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1] to stay within the segment
    }

    const closestX = A.x + t * ABx;
    const closestY = A.y + t * ABy;

    return { x: closestX, y: closestY };
}

// Squared distance from a point P to a line segment AB
function DistanceSquaredPointToSegment(A, B, P) {
    const closest = GetClosestPointOnSegment(A, B, P);
    return DistanceSquaredPointToPoint(P.x, P.y, closest.x, closest.y);
}

function RotatePointAroundPoint(point, origin, angle, transformedPoint) {
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const newX = (cosA * dx) - (sinA * dy) + origin.x;
    const newY = (sinA * dx) + (cosA * dy) + origin.y;

    if (transformedPoint) {
        transformedPoint.x = newX;
        transformedPoint.y = newY;
        
        return transformedPoint;
    }

    // For consistency, return a Vector2 instance
    return new Vector2(newX, newY);
}

function IntersectionBetweenLines(l1p1, l1p2, l2p1, l2p2) {
    let result = {
        det: 0,
        x: -1,
        y: -1,
        t: -1,
        u: -1
    }

    // simp
    /*const A1 = l1p2.y - l1p1.y;
    const B1 = l1p1.x - l1p2.x;
    const C1 = A1 * l1p1.x + B1 * l1p1.y;

    const A2 = l2p2.y - l2p1.y;
    const B2 = l2p1.x - l2p2.x;
    const C2 = A2 * l2p1.x + B2 * l2p1.y;

    result.det = A1 * B2 - A2 * B1;
    if (result.det !== 0) {
        result.x = (B2 * C1 - B1 * C2) / result.det;
        result.y = (A1 * C2 - A2 * C1) / result.det;
    }*/

    // http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
    const den = (l1p1.x - l1p2.x) * (l2p1.y - l2p2.y) - (l1p1.y - l1p2.y) * (l2p1.x - l2p2.x);
    if (den != 0) {
        const t = ((l1p1.x - l2p1.x) * (l2p1.y - l2p2.y) - (l1p1.y - l2p1.y) * (l2p1.x - l2p2.x)) / den;
        const u = -((l1p1.x - l1p2.x) * (l1p1.y - l2p1.y) - (l1p1.y - l1p2.y) * (l1p1.x - l2p1.x)) / den;

        if (t > 0 && t < 1 && u > 0 && u < 1) {
            result.x = l1p1.x + t * (l1p2.x - l1p1.x);
            result.y = l1p1.y + t * (l1p2.y - l1p1.y);
            result.det = den;
            result.t = t;
            result.u = u;
        }
    }
    return result;
}

function DotProduct(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
}

function AngleBetweenVectors(vec1, vec2) {
    // vec1 and vec2 should be normalized

    // a · b = |a| × |b| × cos(θ)
    // cos(θ) = (a · b) / |a| × |b|
    // θ = arccos[(a · b) / |a| × |b|]
    // si a y b son unitarios: θ = arccos(a · b)

    const dotProduct = DotProduct(vec1, vec2);
    return Math.acos(dotProduct);
}

// normalize an angle to the range -PI to PI
function NormalizeAngle(angle) {
    angle = angle % PI2;
    if (angle > Math.PI) {
        angle -= PI2;
    }
    else if (angle < -Math.PI) {
        angle += PI2;
    }
    return angle;
}

function SmoothRotation(currentRotation, targetRotation, speed) {
    let rotationDifference = targetRotation - currentRotation;
    rotationDifference = NormalizeAngle(rotationDifference);
  
    // calculate the rotation increment
    let rotationIncrement = Math.sign(rotationDifference) * Math.min(Math.abs(rotationDifference), speed);
  
    // check if the rotation is close enough to the target rotation
    const tolerance = 0.001;
    if (Math.abs(rotationIncrement) < tolerance) {
        rotationIncrement = 0; // Snap to the target to avoid floating point issues
    }

    return currentRotation + rotationIncrement;
}

function LerpRotation(currentRotation, targetRotation, interpolationFactor) {
    let rotationDifference = targetRotation - currentRotation;
    rotationDifference = NormalizeAngle(rotationDifference);

    return currentRotation + rotationDifference * interpolationFactor;
}

function Lerp(start, end, interpolationFactor) {
    return start + (end - start) * interpolationFactor;
}

// #endregion

// #region Point-inside-geometry-forms functions

function CheckPointInsideCircle(px, py, circlePosition, radius2) {
    // d^2 = (p.x - c.x)^2 + (p.y - c.y)^2
    // c = d < r
    const difX = px - circlePosition.x;
    const difY = py - circlePosition.y;
    const pointToCircleDistance2 = difX * difX + difY * difY;

    return pointToCircleDistance2 < radius2;
}

function CheckPointInsideRect(point, rectangle) {
    return CheckPointInsideRectangle(point.x, point.y, rectangle.position.x, rectangle.position.y, rectangle.width, rectangle.height);
}

function CheckPointInsideRectangle(px, py, rx, ry, rw, rh) {
    return px >= (rx) &&
           px <= (rx + rw) &&
           py >= (ry) &&
           py <= (ry + rh);
}

function CheckPointInsidePolygon(px, py, polygon) {
    let count = polygon.length;

    for (let i = 0; i < polygon.length; i++) {
        const d = DistancePointToSegmentSign(polygon[i], polygon[(i + 1) % polygon.length], px, py);
        if (d < 0)
            count--;
    }

    return (count == 0) || (count == polygon.length);
}


// #endregion

// #region Collisions between geometry forms functions

function CheckCollisionTwoCircles(positionA, radiusA, positionB, radiusB) {
    // d^2 = (p.x - c.x)^2 + (p.y - c.y)^2
    // c = d < (rA + rB) -> d^2 < (rA + rB)^2
    const difX = positionA.x - positionB.x;
    const difY = positionA.y - positionB.y;
    const distanceSquared = difX * difX + difY * difY;
    const sumofRadius = radiusA + radiusB;

    return distanceSquared < (sumofRadius * sumofRadius);
}

function CheckCollisionTwoRects(rectA, rectB) {
    return rectA.x < rectB.x + rectB.w &&
           rectA.x + rectA.w > rectB.x &&
           rectA.y < rectB.y + rectB.h &&
           rectA.y + rectA.h > rectB.y;
}

function CheckCollisionCircleRect(circle, rect) {
    // Find the closest point on the rectangle to the center of the circle
    let testX = circle.position.x;
    let testY = circle.position.y;

    // Clamp X to rectangle's X range
    if (circle.position.x < rect.x)
        testX = rect.x;
    else if (circle.position.x > rect.x + rect.w)
        testX = rect.x + rect.w;

    // Clamp Y to rectangle's Y range
    if (circle.position.y < rect.y)
        testY = rect.y;
    else if (circle.position.y > rect.y + rect.h)
        testY = rect.y + rect.h;

    // Calculate the distance between the closest point and the circle's center
    const distX = circle.position.x - testX;
    const distY = circle.position.y - testY;
    const distanceSquared = (distX * distX) + (distY * distY);

    // Check if the distance is less than the circle's radius squared
    const radius2 = circle.boundingRadius2 ? circle.boundingRadius2 : (circle.radius * circle.radius);
    return distanceSquared < radius2;
}

function CheckCollisionCirclePolygon(circlePosition, circleRadius, polygonPoints) {
    // Check if the circle's center is inside the polygon
    if (CheckPointInsidePolygon(circlePosition.x, circlePosition.y, polygonPoints)) {
        return true;
    }

    const radiusSq = circleRadius * circleRadius;

    // Check distance from circle center to each edge of the polygon
    for (let i = 0; i < polygonPoints.length; i++) {
        const p1 = polygonPoints[i];
        const p2 = polygonPoints[(i + 1) % polygonPoints.length];

        const distSq = DistanceSquaredPointToSegment(p1, p2, circlePosition);
        if (distSq < radiusSq) {
            return true;
        }
    }

    return false;
}

function CheckCollisionPolygonPolygon(polygon1Points, polygon2Points, accurate=false) {
    // This is a complex collision detection problem, typically solved using the
    // Separating Axis Theorem (SAT). A full SAT implementation is beyond the
    // scope of a simple helper function and would require more extensive
    // vector and projection utilities.

    // if accurate is false it only check vertex-in-polygon
    // if accurate is true it also checks edge-intersections

    // Vertex-in-polygon check:
    for (const p1 of polygon1Points) {
        if (CheckPointInsidePolygon(p1.x, p1.y, polygon2Points)) {
            return true;
        }
    }
    for (const p2 of polygon2Points) {
        if (CheckPointInsidePolygon(p2.x, p2.y, polygon1Points)) {
            return true;
        }
    }

    // Check if any edge of polygon1 intersects with any edge of polygon2.
    if (accurate) {
        for (let i = 0; i < polygon1Points.length; i++) {
            const p1_start = polygon1Points[i];
            const p1_end = polygon1Points[(i + 1) % polygon1Points.length];

            for (let j = 0; j < polygon2Points.length; j++) {
                const p2_start = polygon2Points[j];
                const p2_end = polygon2Points[(j + 1) % polygon2Points.length];

                if (IntersectionBetweenLines(p1_start, p1_end, p2_start, p2_end).det !== 0) {
                    return true;
                }
            }
        }
    }

    return false;
}

// #endregion

// #region Vector2 class

class Vector2 {
    _x = 0;
    _y = 0;
    _onChange = null;

    constructor(x, y, onChange=null) {
        this._x = x;
        this._y = y;
        this._onChange = onChange;
    }

    static Zero() {
        return new Vector2(0, 0);
    }

    static Copy(vector) {
        return new Vector2(vector.x, vector.y);
    }

    get x() {
        return this._x;
    }
    set x(val) {
        this._x = val;
        if (this._onChange)
            this._onChange(this);
    }
    set onChange(onChange) {
        this._onChange = onChange;
    }

    get y() {
        return this._y;
    }
    set y(val) {
        this._y = val;
        if (this._onChange)
            this._onChange(this);
    }

    Set(x, y) {
        this._x = x;
        this._y = y;
        if (this._onChange)
            this._onChange(this);
    }

    Length() {
        return Math.sqrt(this.SqrLength());
    }

    SqrLength() {
        const x2 = this._x * this._x;
        const y2 = this._y * this._y;
        return x2 + y2;
    }

    IsZero() {
        return this._x === 0 && this._y === 0;
    }

    static Magnitude(v1, v2) {
        return Math.sqrt(SqrMagnitude(v1, v2));
    }

    static SqrMagnitude(v1, v2) {
        const difX = v2.x - v1.x;
        const difY = v2.y - v1.y;
        const x2 = difX * difX;
        const y2 = difY * difY;
        return x2 + y2;
    }

    Normalize() {
        const length = this.Length();

        if (length > 0) {
            this._x = this._x / length;
            this._y = this._y / length;
        }
    }

    Add(otherVector) {
        this._x += otherVector.x;
        this._y += otherVector.y;
    }

    Sub(otherVector) {
        this._x -= otherVector.x;
        this._y -= otherVector.y;
    }

    DotProduct(otherVector) {
        return this._x * otherVector.x + this._y * otherVector.y;
    }

    MultiplyScalar(scalar) {
        this._x *= scalar;
        this._y *= scalar;

        return this;
    }

    AngleBetween(otherVector) {
        // vec1 and vec2 should be normalized

        // a · b = |a| × |b| × cos(θ)
        // cos(θ) = (a · b) / |a| × |b|
        // θ = arccos[(a · b) / |a| × |b|]
        // si a y b son unitarios: θ = arccos(a · b)
        const dotProduct = this.DotProduct(otherVector);
        return Math.acos(dotProduct);
    }

    Random() {
        this._x = (Math.random() * 2) - 1;
        this._y = (Math.random() * 2) - 1;
    }

    RandomNormalized() {
        this.Random();
        this.Normalize();
    }

    static Lerp(v1, v2, interpolationFactor) {
        return new Vector2(
            Lerp(v1.x, v2.x, interpolationFactor),
            Lerp(v1.y, v2.y, interpolationFactor)
        );
    }

    Interpolate(otherVector, interpolationFactor) {
        this._x = Lerp(this.x, otherVector.x, interpolationFactor);
        this._y = Lerp(this.y, otherVector.y, interpolationFactor);
    }
}

// #endregion

// #region Other geometry form classes

class Rect {
    _x = 0;
    _y = 0;
    _w = 0;
    _h = 0;

    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._w = width;
        this._h = height;

        this.halfWidth = width / 2;
        this.halfHeight = height / 2;

        this.points = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 }
        ];

        this._updatePoints();
    }

    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get w() {
        return this._w;
    }
    get h() {
        return this._h;
    }

    get width() {
        return this._w;
    }
    get height() {
        return this._h;
    }

    set x(value) {
        this._x = value;
        this._updatePoints();
    }
    set y(value) {
        this._y = value;
        this._updatePoints();
    }
    set w(value) {
        this._w = value;
        this.halfWidth = value / 2;
        this._updatePoints();
    }
    set h(value) {
        this._h = value;
        this.halfHeight = value / 2;
        this._updatePoints();
    }

    set width(value) {
        this.w = value;
    }
    set height(value) {
        this.h = value;
    }

    _updatePoints() {
        this.points[0].x = this._x;
        this.points[0].y = this._y;
        this.points[1].x = this._x + this._w;
        this.points[1].y = this._y;
        this.points[2].x = this._x + this._w;
        this.points[2].y = this._y + this._h;
        this.points[3].x = this._x;
        this.points[3].y = this._y + this._h;
    }
}

// #endregion
