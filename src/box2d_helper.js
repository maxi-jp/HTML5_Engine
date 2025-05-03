// Box2D lib shortcuts
var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,   b2AABB = Box2D.Collision.b2AABB
    ,   b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,   b2Body = Box2D.Dynamics.b2Body
    ,   b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,   b2Fixture = Box2D.Dynamics.b2Fixture
    ,   b2World = Box2D.Dynamics.b2World
    ,   b2Shape = Box2D.Collision.Shapes.b2Shape
    ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,   b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
    ,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    ,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    ,   b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
    ,   b2Joint = Box2D.Dynamics.Joints.b2Joint
    ,   b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
    ,   b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
    ,   b2PulleyJointDef = Box2D.Dynamics.Joints.b2PulleyJointDef
    ,   b2GearJointDef = Box2D.Dynamics.Joints.b2GearJointDef
    ;

const PhysicsObjectType = {
    Box: 0,
    Circle: 1,
    Edge: 2
}

function AsignDefaultValues(options) {
    // default values
    let defaultOptions = {
        density : 1.0,
        friction: 1.0,
        restitution : 0.5,
        isSensor: false,
 
        linearDamping : 0.0,
        angularDamping: 0.1,
        fixedRotation : false,
 
        type : b2Body.b2_dynamicBody
    }
    return Object.assign(defaultOptions, options);
}

function CreateFixtureDefinition(options) {
    // Fixture: defines physics properties (density, friction, restitution)
    const fixtDef = new b2FixtureDef();

    fixtDef.density = options.density;
    fixtDef.friction = options.friction;
    fixtDef.restitution = options.restitution;
    fixtDef.isSensor = options.isSensor;

    return fixtDef;
}

function CreateBodyDefinition(options, x, y) {
    // Body: linear & angular damping, type, userData & other flags
    const bodyDef = new b2BodyDef();
    bodyDef.position.Set(x, y);

    bodyDef.linearDamping = options.linearDamping;
    bodyDef.angularDamping = options.angularDamping;

    bodyDef.fixedRotation = options.fixedRotation;
    bodyDef.type = options.type;
    bodyDef.userData = options.userData;

    return bodyDef;
}

function CreateBody(world, options, x, y, fixDef) {
    // Body: position of the object and its type (dynamic, static o kinetic)
    const bodyDef = CreateBodyDefinition(options, x, y);
    const body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);

    return body;
}

function CreateBox(world, x, y, options) {
    options = AsignDefaultValues(options);

    // fixture
    const fixtDef = CreateFixtureDefinition(options);

    // set the box shape
    fixtDef.shape = new b2PolygonShape();
    fixtDef.shape.SetAsBox(options.width / 2, options.height / 2);

    const body = CreateBody(world, options, x, y, fixtDef);

    return body;
}

function CreateCircle(world, x, y, options) {
    options = AsignDefaultValues(options);

    // fixture
    const fixtDef = CreateFixtureDefinition(options);

    // set the box shape
    fixtDef.shape = new b2CircleShape(options.radius);

    const body = CreateBody(world, options, x, y, fixtDef);

    return body;
}

function CreateEdge(world, x, y, options) {
    options = AsignDefaultValues(options);

    // fixture
    const fixtDef = CreateFixtureDefinition(options);

    // Shape: 2d geometry
    fixtDef.shape = new b2PolygonShape();
    fixtDef.shape.SetAsEdge(new b2Vec2(options.p1x, options.p1y), new b2Vec2(options.p2x, options.p2y));

    const body = CreateBody(world, options, x, y, fixtDef);

    return body;
}

function CreatePhysicsObject(world, type, x, y, options) {
    switch (type) {
        case PhysicsObjectType.Box:
            return CreateBox(world, x, y, options);
        case PhysicsObjectType.Circle:
            return CreateCircle(world, x, y, options);
        case PhysicsObjectType.Edge:
            return CreateEdge(world, x, y, options);
        default:
            console.error("Unknown physics object type: " + type);
            return null;
    }
}

// Create a Box2D world object
function CreateBox2DWorld(ctx, gravity, doSleep, scale) {
    const grav = new b2Vec2(gravity.x, gravity.y);
    const world = new b2World(grav, doSleep);
    world.scale = scale;

    // DebugDraw is used to create the drawing with physics
    let debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(ctx);
    debugDraw.SetDrawScale(scale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

    world.SetDebugDraw(debugDraw);

    // prepare the collision event function
    Box2D.Dynamics.b2ContactListener.prototype.BeginContact = OnContactDetected;

    return world;
}

function DrawWorldDebug(ctx, world) {
    // Transform the canvas coordinates to cartesian coordinates
    ctx.save();
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    world.DrawDebugData();
    ctx.restore();
}

function OnContactDetected(contact) {
    let userDataA = contact.GetFixtureA().GetBody().GetUserData();
    let userDataB = contact.GetFixtureB().GetBody().GetUserData();

    if (userDataA != null && userDataB != null &&
        typeof(userDataA) !== 'undefined' &&
        typeof(userDataB) !== 'undefined') {
        console.log("collision between " + userDataA + " and " + userDataB);

        /*if ((userDataA === "ball" && userDataB === "basket") || (userDataA === "basket" && userDataB === "ball")) {
            if (ball.body.GetLinearVelocity().y < 0 && lastBallLaunchPosition.x < 5) {
                points++;
            }
        }*/
    }
}

function CanvasToBox2DPosition(canvas, canvasPos, scale) {
    return new b2Vec2(canvasPos.x / scale, (canvas.height - canvasPos.y) / scale);
}

function Box2DToCanvasPosition(canvas, box2DPos, scale) {
    return new Vector2(box2DPos.x * scale, canvas.height - (box2DPos.y * scale));
}
