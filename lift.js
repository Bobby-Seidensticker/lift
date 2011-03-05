/*globals namespace console window $*/
/*jslint white: true, browser: true, devel: true, onevar: false
  debug: true, undef: true nomen: true, regexp: true
  newcap: true, immed: true, maxerr: 100, maxlen: 100 */

namespace.lookup('com.pageforest.lift').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client');
    var dom = namespace.lookup('org.startpad.dom');
    var format = namespace.lookup('org.startpad.format');
    var vector = namespace.lookup('org.startpad.vector');
    var base = namespace.lookup('org.startpad.base');
    var util = namespace.util;

    var workouts, parts;
    
    
    
    
    
    var t;
    function Set(reps, weight)
    {
        this.reps = reps;
        this.weight = weight;
    }

    function Exercise(name, sets, info, links, linkNames)
    {
        this.sets = [];
        for (var i = 0; i < sets; i++) {
            this.sets[i] = new Set();
        }
        this.name = name;
        this.info = info;
        var i;
        if (links == undefined || linkNames == undefined || 
            links[0] == undefined || linkNames[0] == undefined){
            return;
        }
        if (links.length !== linkNames.length) {
            throw new Error("Exercise given links and linkNames of unequal length");
        }
        this.links = [];
        for (i = 0; i < links.length; i++) {
            this.links[i] = {url: links[i], name: linkNames[i]};
        }
    }

    //each workout has exercises
    //each exercise has an id (for the DOM), title, a number of sets to do, and a description
    function Workout(name, id, desc, exs)
    {
        if (exs) {
            this.exs = exs;
        } else {
            this.exs = [];
        }
        this.id = id;
        this.name = name;
        this.desc = desc;
    }

    Workout.methods({
        toHTML: function () {
            
        }
    });
    
    
    function Session(workout)
    {
        this.workout = workout;
    }

    // takes a workout returns a session object
    function loadExercise ()
    {
        
    }

    function adjustTimer() {
        var s = Math.floor((new Date().getTime() - t.init) / 1000);
        if (s < 10) {
            t.id.html('00:0' + s);
            return;
        }
        if (s < 60) {
            t.id.html('00:' + s);
            return;
        }
        var m = Math.floor(s / 60);
        s -= m * 60;
        if (m < 10 && s < 10) {
            t.id.html('0' + m + ':0' + s);
            return;
        }
        if (m < 10){
            t.id.html('0' + m + ':' + s);
            return;
        }
        if (s < 10) {
            t.id.html(m + ':0' + s);
            return;
        }
        t.id.html(m + ':' + s);
    }
    
    function newTimer() {
        id = $('.ui-page-active').find('.timer');
        id.html('00:00');
        return {
            id: id,
            init: new Date().getTime(),
            timer: setInterval(adjustTimer, 1000),
            running: true
        };
    }

    function changeIcon(id, from, to) {
        var icon = $('#' + id).find('.ui-icon');
        icon.removeClass('ui-icon-' + from);
        icon.addClass('ui-icon-' + to);
    }

    function playPauseTimer() {
        if (t == undefined) {
            t = newTimer();
            changeIcon('timer', 'play', 'pause');
            return;
        }
        if (t.running == true) {
            changeIcon('timer', 'pause', 'play');
            t.difference = new Date().getTime() - t.init;
            clearInterval(t.timer);
            t.running = false;
            return;
        }
        changeIcon('timer', 'play', 'pause');
        t.date = new Date();
        t.init = t.date.getTime() - t.difference;
        t.timer = setInterval(adjustTimer, 500);
        t.running = true;
    }

    function resetTimer() {
        if (t == undefined) {
            return;
        }
        if (t.running) {
            t.date = new Date();
            t.init = t.date.getTime();
            t.id.html('00:00');
            return;
        }
        t.id.html('00:00');
        t = undefined;
        return;
    }

    function loadq() {
        this.store = [];
        this.iIn = 0;
        this.iOut = 0;
        this.t = null;
    }

    loadq.methods({
        push: function (item) {
            this.store[this.iIn++] = item;
        },

        pop: function () {
            if (this.iIn === this.iOut) {
                return null;
            }
            return this.store[this.iOut++];
        },

        fEmpty: function () {
            return this.iIn === this.iOut;
        },
        
        start: function (fnComplete) {
            var k = $("#workoutPagesTemplate").tmpl(this.pop());
            k.appendTo( $.mobile.pageContainer );
            if (this.fEmpty() === true) {
                $.mobile.page();
                fnComplete();
                return;
            }
            this.start(fnComplete);
            return;
            this.t = setTimeout(this.start.fnArgs(fnComplete).fnMethod(this), 200);
        }
    });
    
    function onReady()
    {
        /*
        var exs = [];
        exs[0] = new lift.Exercise("Bench Press", 4, "8 to 12 reps to failure");
        exs[1] = new lift.Exercise("Incline Bench Press", 4, "8 to 12 reps to failure");
        exs[2] = new lift.Exercise("Decline Bench Press", 3, "8 to 12 reps to failure");
        exs[3] = new lift.Exercise("Chest Flys", 3, "12 to 18 reps to failure");
        w = new lift.Workout(exs, "Beginner Chest Routine", "Good for building muscles and stuff");
        $('#content').append(w.toHTML());
        
        var i, t = [];
        $("#timer").click(playPauseTimer);
        $("#reset").click(resetTimer);
        */
        home = {};
        home.header = 'Lift';
        home.footer = 'footer';
        home.workoutGroups = [];
        home.workoutGroups[0] = { name: "Max Muscle Builders", workouts: [] };
        home.workoutGroups[0].workouts = [ 
                                          { id: 'mmbChest', name: "Chest Day" },
                                          { id: 'mmbBack', name: "Back Day" },
                                          { id: 'mmbShoulder', name: "Shoulder Day" },
                                          { id: 'mmbArm', name: "Arm Day" },
                                          { id: 'mmbLeg', name: "Leg Day" } ];
        home.workoutGroups[1] = { name: "Full Body Conditioning", workouts: [] };
        home.workoutGroups[1].workouts = [
                                          { id: 'fbPush', name: "Push Day" },
                                          { id: 'fbPull', name: "Pull Day" },
                                          { id: 'fbLeg', name: "Leg Day" } ];
        home.workoutGroups[2] = { name: "Ab Workouts", workouts: [] };
        home.workoutGroups[2].workouts = [
                                          { id: 'abDeath', name: "Deathzercise" },
                                          { id: 'abOnly', name: "Full Ab Day" },
                                          { id: 'abBasic', name: "Basic Daily Abs" } ];
        home.workoutGroups[3] = { name: "Daily No Equipment", workouts: [] };
        home.workoutGroups[3].workouts = [
                                          { id: 'dailyM', name: "Daily Man" },
                                          { id: 'dailyF', name: "Daily Woman" } ];
        $("#homePageTemplate").tmpl(home).appendTo( "#home" ).page();
        
        var initLoad = new loadq();
        
        var mmbChest = new Workout("Max Chest Day", 'mmbChest', "Build muscle mass fast.  Use only when eating an excess of calories");
        
        mmbChest.exs[0] = new Exercise("Bench Press", 4, "Explosive Power, 6 to 10 reps to failure", 
            ["http://exrx.net/WeightExercises/PectoralSternal/BBBenchPress.html", "http://exrx.net/WeightExercises/PectoralSternal/DBBenchPress.html"],
            ["Barbell Bench Press", "Dumbbell Bench Press"]);
        mmbChest.exs[1] = new Exercise("Incline Bench Press", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/PectoralClavicular/BBInclineBenchPress.html", "http://exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress.html"],
            ["Barbell Incline Bench Press", "Dumbbell Incline Bench Press"]);
        mmbChest.exs[2] = new Exercise("Decline Bench Press", 2, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/PectoralSternal/BBDeclineBenchPress.html", "http://exrx.net/WeightExercises/PectoralSternal/DBDeclineBenchPress.html"],
            ["Barbell Decline Bench Press", "Dumbbell Decline Bench Press"]);
        mmbChest.exs[3] = new Exercise("Chest Fly", 1, "Constant speed, 8 to 12 reps to failure",
            ["http://exrx.net/WeightExercises/PectoralSternal/LVSeatedFly.html", "http://exrx.net/WeightExercises/PectoralSternal/LVPecDeckFly.html", "http://exrx.net/WeightExercises/PectoralSternal/DBFly.html"],
            ["Lever Seated Fly", "Lever Pec Deck Fly", "Dumbbell Fly"]);

        initLoad.push(mmbChest);
        
        

        
        var mmbBack = new Workout("Max Back Day", 'mmbBack', "Build muscle mass fast.  Use only when eating an excess of calories");
        mmbBack.exs[0] = new Exercise("Chin Ups", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/LatissimusDorsi/BWChinup.html", "http://exrx.net/WeightExercises/LatissimusDorsi/WtChinup.html"],
            ["Bodyweight Chin Up", "Weighted Chin Up"]);
        mmbBack.exs[1] = new Exercise("Bent-over Row", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/BackGeneral/BBBentOverRow.html", "http://exrx.net/WeightExercises/BackGeneral/DBBentOverRow.html"],
            ["Barbell Row", "Dumbbell Row"]);
        mmbBack.exs[2] = new Exercise("Lat Pulldown", 3, "Constant speed, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/LatissimusDorsi/LVFrontPulldown.html"],
            ["Lever Front Pulldown"]);
        mmbBack.exs[3] = new Exercise("Seated Row", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/BackGeneral/CBSeatedRow.html"],
            ["Cable Seated Row"]);
        initLoad.push(mmbBack);
        
        var mmbShoulder = new Workout("Max Shoulder Day", 'mmbShoulder', "Build muscle mass fast.  Use only when eating an excess of calories");
        mmbShoulder.exs[0] = new Exercise("Shoulder Press", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/DeltoidAnterior/BBMilitaryPress.html", "http://exrx.net/WeightExercises/DeltoidAnterior/DBShoulderPress.html"],
            ["Barbell Shoulder Press", "Dumbbell Shoulder Press"]);
        mmbShoulder.exs[1] = new Exercise("Upright Row", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/DeltoidLateral/BBUprightRow.html"],
            ["Barbell Upright Row"]);
        mmbShoulder.exs[2] = new Exercise("Arnold Press", 3, "Constant speed, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/DeltoidAnterior/DBArnoldPress.html"],
            ["Arnold Press"]);
        mmbShoulder.exs[3] = new Exercise("Rear Lateral Fly", 3, "Constant speed, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/DeltoidPosterior/LVRearLateralRaise.html", "http://exrx.net/WeightExercises/DeltoidPosterior/DBRearLateralRaise.html"],
            ["Rear Lateral Fly", "Dumbbel Rear Lateral Raise"]);
        mmbShoulder.exs[4] = new Exercise("Shrugs", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/TrapeziusUpper/BBShrug.html", "http://exrx.net/WeightExercises/TrapeziusUpper/DBShrug.html"],
            ["Barbell Shrug", "Dumbbell Shrug"]);
        initLoad.push(mmbShoulder);

        var mmbArm = new Workout("Max Arm Day", 'mmbArm', "Build muscle mass fast.  Use only when eating an excess of calories");
        mmbArm.exs[0] = new Exercise("Dumbbell Curls", 3, "Constant speed, keep under control, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/Biceps/DBCurl.html"],
            ["Dumbbell Curl"]);
        mmbArm.exs[1] = new Exercise("Tricep Dips", 3, "Constant speed, keep under control, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/Triceps/ASTriDip.html"],
            ["Tricep Dip"]);
        mmbArm.exs[2] = new Exercise("Barbell Curls", 3, "Constant speed, keep under control, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/Biceps/BBCurl.html", "http://exrx.net/WeightExercises/Brachialis/BBProneInclineCurl.html"],
            ["Barbell Curl", "Barbell Prone Incline Curl"]);
        mmbArm.exs[3] = new Exercise("Skull Crushers", 3, "Constant speed, keep under control, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/Triceps/BBLyingTriExtSC.html"],
            ["Skull Crusher"]);
        mmbArm.exs[4] = new Exercise("Preacher Curl", 3, "Constant speed, keep under control, 8 to 12 reps to failure",
            ["http://exrx.net/WeightExercises/Brachialis/BBPreacherCurl.html"],
            ["Preacher Curl"]);
        mmbArm.exs[5] = new Exercise("Dumbbell Kickback", 3, "Constant speed, squeeze at the top, 8 to 12 reps to failure",
            ["http://exrx.net/WeightExercises/Triceps/DBKickback.html"],
            ["Dumbbell Kickback"]);
        initLoad.push(mmbArm);

        var mmbLeg = new Workout("Max Leg Day", 'mmbLeg', "Build muscle mass fast.  Use only when eating an excess of calories");
        mmbLeg.exs[0] = new Exercise("Squat", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/Quadriceps/BBSquat.html"],
            ["Squat"]);
        mmbLeg.exs[1] = new Exercise("Lunge", 3, "Explosive Power, 6 to 10 reps per leg to failure",
            ["http://exrx.net/WeightExercises/Quadriceps/DBLunge.html"],
            ["Dumbbell Lunge"]);
        mmbLeg.exs[2] = new Exercise("Leg Curl", 3, "Constant speed, 8 to 12 reps to failure",
            ["http://exrx.net/WeightExercises/Hamstrings/LVSeatedLegCurlH.html"],
            ["Seated Leg Curl"]);
        mmbLeg.exs[3] = new Exercise("Leg Extension", 3, "Constant speed, 8 to 12 reps to failure",
            ["http://exrx.net/WeightExercises/Quadriceps/LVLegExtension.html"],
            ["Seated Leg Extension"]);
        mmbLeg.exs[4] = new Exercise("Calf Raises", 3, "Constant speed, 8 to 12 reps to failure",
            ["http://exrx.net/WeightExercises/Gastrocnemius/BBStandingCalfRaise.html", "http://exrx.net/WeightExercises/Gastrocnemius/LVSeatedCalfPress.html"],
            ["Barbell Standing Calf Raise", "Seated Calf Press"]);
        initLoad.push(mmbLeg);
        
        var fbPush = new Workout("Push", "fbPush", "3 day a week split");
        fbPush.exs[0] = new Exercise("Bench Press", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/PectoralSternal/DBBenchPress.html"],
            ["Bench Press"]);
        fbPush.exs[1] = new Exercise("Shoulder Press", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/DeltoidAnterior/DBShoulderPress.html"],
            ["Shoulder Press"]);
        fbPush.exs[2] = new Exercise("Incline Bench Press", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress.html"],
            ["Incline Bench Press"]);
        fbPush.exs[3] = new Exercise("Upright Row", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/DeltoidLateral/BBUprightRow.html"],
            ["Upright Row"]);
        fbPush.exs[4] = new Exercise("Chest Fly", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/PectoralSternal/LVSeatedFly.html"],
            ["Chest Fly"]);
        fbPush.exs[5] = new Exercise("Tricep Pushdown", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/Triceps/CBPushdownRope.html"],
            ["Tricep Pushdown"]);
        initLoad.push(fbPush);
        
        var fbPull = new Workout("Pull", "fbPull", "3 day a week split");
        fbPull.exs[0] = new Exercise("Chin Up", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/LatissimusDorsi/AsPullup.html"],
            ["Chin Up"]);
        fbPull.exs[1] = new Exercise("Bent-over Row", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/BackGeneral/BBBentOverRow.html"],
            ["Bent-over Row"]);
        fbPull.exs[2] = new Exercise("Lat Pulldown", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/LatissimusDorsi/LVFrontPulldown.html"],
            ["Lat Pulldown"]);
        fbPull.exs[3] = new Exercise("Seated Row", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/BackGeneral/CBSeatedRow.html"],
            ["Seated Row"]);
        fbPull.exs[4] = new Exercise("Rear Delts", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/DeltoidPosterior/LVRearLateralRaise.html"],
            ["Rear Delt Fly"]);
        fbPull.exs[5] = new Exercise("Preacher Curls", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/Brachialis/BBPreacherCurl.html"],
            ["Preacher Curls"]);
        initLoad.push(fbPull);
        
        var fbLeg = new Workout("Leg", "fbLeg", "3 day a week split");
        fbLeg.exs[0] = new Exercise("Squatz", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/Quadriceps/BBSquat.html"],
            ["Squat"]);
        fbLeg.exs[1] = new Exercise("Deadliftz", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/ErectorSpinae/BBDeadlift.html"],
            ["Deadlift"]);
        fbLeg.exs[2] = new Exercise("Leg Curl", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/Hamstrings/LVSeatedLegCurl.html"],
            ["Leg Curl"]);
        fbLeg.exs[3] = new Exercise("Leg Extension", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/Quadriceps/LVLegExtension.html"],
            ["Upright Row"]);
        fbLeg.exs[4] = new Exercise("Calf Raise", 3, "1 warmup set of 10 reps at an easy weight.  2 sets to failure of 8 to 12 reps.  Each rep should be executed with good form until failure is achieved.",
            ["http://www.exrx.net/WeightExercises/Gastrocnemius/BWSingleLegCalfRaise.html"],
            ["Calf Raise"]);
        initLoad.push(fbLeg);
        
        var abDeath = new Workout("Deathzercise", "abDeath", "Start your workout with this quick floor routine");
        abDeath.exs[0] = new Exercise("Kickz", 1, "Lie on your back, fists under your butt.  Kick your legs like swimming (approx 6\" of movement) Count every time your left foot goes down.  " +
            "Beginner: 20, Novice: 50, Intermediate: 100, Advanced: 300");
        abDeath.exs[1] = new Exercise("Kneez", 1, "Lie on your back, hands flat under butt.  Flex abs and bring knees to chest and repeat.  Do not let feet touch ground.  " +
            "To make more difficult, put hands at side.  Beginner: 5, Novice: 10, Internediate: 25 , Advanced: 50");
        abDeath.exs[2] = new Exercise("Toez", 1, "Lie on your back, hands flat under butt.  Flex abs and bring toes to ceiling.  Do not let feet touch ground.  " +
            "To make more difficult, put hands at side.  Beginner: 5, Novice: 10, Intermediate: 25, Advanced: 50");
        initLoad.push(abDeath);

        var dailyM = new Workout("Daily Man", "dailyM", "Start your day like a man.  For extra ab work, do a Deathzercise upon completion.");
        dailyM.exs[0] = new Exercise("Slow Pushups", 3, "Do pushups with hands shoulder width apart and fingers pointed inwards.  " +
            "Count 3 Mississippi's on the way down and on the way up.  Keep your core tight and body straight throughout.  Rest 30 seconds.  Rest 1 to 2 minutes between exercises");
        dailyM.exs[1] = new Exercise("Table Pullups", 3, "Find a table, lie down under it face up.  Grab the edge of the table with a grip slightly wider than shoulder-width.  " +
            "Pull yourself off the ground until your collarbone is 6\" from the edge of the table.  On the way up, pull as hard as you can, then take 5 seconds to lower yourself.  Rest 30 seconds between sets");
        dailyM.exs[2] = new Exercise("Handstand Negatives", 3, "Find a wall free of obstructions.  Plant your hands shoulder width apart and kick your legs up in handstand position.  " +
            "Take 5 seconds to lower yourself.  Just before your head is about to touch the ground, kick off from the wall, stand up and repeat immediately.  Rest 30 seconds between sets");
        dailyM.exs[3] = new Exercise("Pullup Negatives", 3, "Find a tree branch, balcony, pullup bar to do pullups on.  Use a shoulder width grip.  Jump up, grab the bar so your chin is above your hands." +
            "  Take 5 seconds to lower yourself.  Keep your shoulders back and down the entire time.  Rest 30 seconds between sets");
        dailyM.exs[4] = new Exercise("Chair dips", 3, "Get two chairs, place them about 3 feet apart, facing each other.  Sit on one, put your heels on the other.  Grab the sides of the chair near the edge, and " +
            "raise yourself off the chair and forward.  Drop yo booty in front of the chair until your arms are at a 90 degree angle.  Take 3 mississippi's on the way down and on the way up.  Rest 30 seconds between sets");
        dailyM.exs[5] = new Exercise("Cross Holds", 3, "Lie face doww with feet shoulder width apart and arms straight out.  Flex your back and butt so your thighs, chest, and arms come off the ground.  " +
            "Try to look at the ceiling.  Hold this for 5 seconds then lower for 5 seconds.  Repeat.  Rest 30 seconds between sets");
        dailyM.exs[6] = new Exercise("Full Extension Crunches", 3, "Grab two towels, roll them up.  Lie on your back and put the towel under your lower back.  Put your fingertips next to your ears " +
            "and inhale, puff your chest out, then exhale and use your abs to pull your ribcage to your pelvis slowly over 5 seconds.  Hold for 1 second at a full crunch with no air in your lungs.  " +
            "Take 5 seconds to fully expand fully.  Keep your butt on the ground at all times.  To increase resistance, keep your hands like superman.  Rest 30 seconds between sets");
        dailyM.exs[7] = new Exercise("Squat Jump Tuck", 3, "Squat until your thighs are slightly below parallel with the ground, jump as high as you can, then tuck into a ball at the apex of your jump.  " + 
            "Rest 30 seconds between sets");
        dailyM.exs[8] = new Exercise("Stair Jumps", 3, "Stand and the base of a flight of stairs (preferrably carpeted, if not, don't wear only socks).  Pick a stair a few up (start with 3), and jump up to it in one.  " + 
            "Get back to the base of the stairs quickly and repeat.  Rest 30 seconds between sets");
        dailyM.exs[9] = new Exercise("The Vomiting Cat", 3, "Get on hands and knees.  Exhale completely, and suck your belly button to your spine as hard as possible.  Hold 5 seconds, release and take 3 quick breaths.  " + 
        "Repeat.  Rest 30 seconds between sets");
        dailyM.exs[10] = new Exercise("Runinupanddownstairs", 1, "Run up and down stairs.  Count how many flights you ran up");
        initLoad.push(dailyM);
        
        

        $(window).resize( function() {
            var height = $(window).height();
            var width = $(window).width(); 
            var ob = $('html');
            if ( width > height ) {
                if( ob.hasClass('portrait') ) {
                    ob.removeClass('portrait').addClass('landscape');
                }
            } else {
                if ( ob.hasClass('landscape') ) {
                    ob.removeClass('landscape').addClass('portrait');
                }
            }
        });
        
        
        workouts = {mmbChest: mmbChest, mmbBack: mmbBack, mmbShoulder: mmbShoulder, mmbArm: mmbArm, mmbLeg: mmbLeg, fbPush: fbPush, fbPull: fbPull, fbLeg: fbLeg, abDeath: abDeath, dailyM: dailyM};
        var temp = {};
        base.extendDeep(temp, workouts);
        workouts = temp;

        $.mobile.pageLoading();
        initLoad.start(onLoad);
    }
    
    function onLoad()
    {
        $.mobile.pageLoading( true );
        var loc = window.location.href;
        loc = loc.split('#').pop();
        ns.client = new clientLib.Client(ns);
        ns.client.saveInterval = 60;
        if (loc !== "home" && loc !== "http://" + ns.client.appHost + "/") {
            $.mobile.changePage(loc, 'pop', false, true);
        }
        parts = dom.bindIDs();
        
        $('.timersp').click(playPauseTimer);
        $('.timerrs').click(resetTimer);
        $('.save').click(function(){
            console.log('save button clicked');
            ns.client.save();
        });
        $('.sign-in').click(ns.client.signInOut.fnMethod(ns.client));
        ns.client.autoLoad = false;
    }
    

    function getDocid()
    {
        if (ns.client.username == undefined) {
            return;
        }
        return ns.client.username;
    }
    
    function setDocid()
    {
        console.log("setDoc")
        return;
    }
    
    function changeSignInOutText(rg, text)
    {
        var find;
        for (i = 0; i < rg.length; i++){
            find = $(rg[i]).find('.ui-btn-text');
            if ( find[0] == undefined ) {
                $(rg[i]).html(text);
            } else {
                find.html(text);
            }
        }
    }
    
    function onUserChange(username) {
        if (username == undefined) {
            changeSignInOutText($('.sign-in'), "Sign In");
            return;
        }
        changeSignInOutText($('.sign-in'), "Sign Out");
    }
    
    function setDoc(json)
    {
        if (json.blob.version == 1.1) {
            workouts = json.blob.data;
        } else if (json.blob.version == 1.0) {
            workouts = base.extendObject(workouts, json.blob.data);
        }
        var i, j, workout, w, r;
        for (var name in workouts) {
            if (!workouts.hasOwnProperty(name)) {
              continue;
            }
            workout = workouts[name];
            for (i = 0; i < workout.exs.length; i++) {
                for (j = 0; j < workout.exs[i].sets.length; j++) {
                    r = $(parts[workout.id + '-' + i + '-r' + j]);
                    w = $(parts[workout.id + '-' + i + '-w' + j]);
                    if (r && r[0]) {
                        r.attr('value', workout.exs[i].sets[j].reps);
                    }
                    if (w && w[0]){
                        w.attr('value', workout.exs[i].sets[j].weight);
                    }
                }
            }
        }
    }

    function getDoc()
    {
        var page = $('.ui-page-active');
        if (page[0] && page.attr('id') && page.attr('id').split('-')[1]) {
            var id = $('.ui-page-active').attr('id');
            var splitid = id.split('-');
            if (splitid.length !== 2) {
                break;
            }
            var exercise = workouts[splitid[0]].exs[splitid[1]];
            for (i = 0; i < exercise.sets.length; i++) {
                var w = $(parts[id + '-w' + i]);
                var r = $(parts[id + '-r' + i])
                if (w && w[0]) {
                    exercise.sets[i].weight = w.attr('value');
                }
                if (r && r[0]) {
                    exercise.sets[i].reps = r.attr('value');
                }
            }
        }
        return {
            readers: ['public'],
            blob: {version: 1.1, data: workouts}
        };
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'Exercise': Exercise,
        'Workout': Workout,
        'changeIcon': changeIcon,
        't': t,
        'getDocid': getDocid,
        'setDocid': setDocid,
        'onUserChange': onUserChange,
        'workouts': workouts
    });
});


