/*globals namespace console window $*/
/*jslint white: true, browser: true, devel: true, onevar: false
  debug: true, undef: true nomen: true, regexp: true
  newcap: true, immed: true, maxerr: 100, maxlen: 100 */

namespace.lookup('com.pageforest.lift').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client');
    var dom = namespace.lookup('org.startpad.dom');
    var format = namespace.lookup('org.startpad.format');
    var vector = namespace.lookup('org.startpad.vector');
    var util = namespace.util;

    var template = {
        collapsible: '<div data-role=collapsible data-collapsed=true id=c-e{i}>{c}</div>',
        header: '<h3>{name}</h3>',
        description: '<p>{desc}</p>',
        grid: '<div class=ui-grid-a id=e{i}>' +
              '<div class=ui-block-a id=e{i}-w><h4>Weight</h4>{w}</div>' +
              '<div class=ui-block-b id=e{i}-r><h4>Reps</h4>{r}</div></div>' +
              '<div data-role="controlgroup"><a data-role="button" data-icon="play" id=timer>Start Timer</a>' +
              '<a data-role="button" data-icon="refresh" id=reset>Reset Timer</a>' +
              '<a data-role="button" data-icon="plus" id=addSet>Add a Set</a>' +
              '<a data-role="button" data-icon="check" id=save>Save</a></div>',
        wInput: '<input type=number id=e{i}-w{j} value=""></input>',
        rInput: '<input type=number id=e{i}-r{j} value=""></input>',
        page: '<div data-role="page" id="#{id}"><div data-role="header">{header}</div>' +
                  '<div data-role="content" id={id}-c>{c}</div><div data-role="footer">{footer}</div></div>',
        buttonGroup: '<div data-role="controlgroup" id={id}>{c}</div>',
        button: '<a href={href} data-role="button" data-icon="{icon}" id={id}>{c}</a>',
        
    };
    /*
    <div data-role="page" id="chest-0">
    <div data-role="header">
        <h1>Bench Press</h1>
    </div>
    <div data-role="content">
        <a href="#chest-0-form" data-role="button">Proper Form</a>
        <div class=ui-grid-a id=>
            <div class=ui-block-a>
                <h4>Weight</h4>
                <input type=number></input>
                <input type=number></input>
                <input type=number></input>
            </div>
            <div class=ui-block-b>
                <h4>Reps</h4>
                <input type=number></input>
                <input type=number></input>
                <input type=number></input>
            </div>
        </div>
        <h1 class="timer">00:00</h1>
        <div data-role=controlgroup>
            <a data-role="button" data-icon="play">Start Timer</a>
            <a data-role="button" data-icon="refresh">Restart Timer</a>
            <a href="#chest-1" data-role="button" data-icon="check">Next Ex</a>
        </div>
        <a href="#chest" data-role="button" data-icon="back">Workout Home</a>
    </div>
    <div data-role="footer">
        <h4> </h4>
    </div>
</div>

<div data-role="page" id="chest-0-form">
    <div data-role="header">
        <h1>Bench Press Form</h1>
    </div>
    <div data-role="content">
        <a href="http://exrx.net/WeightExercises/PectoralSternal/BBBenchPress.html" data-role="button">Barbell Bench Press</a>
        <a href="http://exrx.net/WeightExercises/PectoralSternal/DBBenchPress.html" data-role="button">Dumbbell Bench Press</a>
    </div>
    <div data-role="footer">
        <h4> </h4>
    </div>
</div>
    */
    
    
    
    
    
    var t;
    /*  -e0
        collapsible div, exercise zero
        
        e0
        exercise zero
        
        e0-w0
        exercise zero, weight of first set
        
        e0-r0
        exercise zero, reps of first set
    */

    function Set(reps, weight)
    {
        this.reps = reps;
        this.weight = weight;
    }

    function Exercise(name, sets, info, links, linkNames)
    {
        if (sets){
            this.sets = sets;
        } else {
            this.sets = [];
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
            var i, j, w, r, obj;
            var c, content = '';
            for (i = 0; i < this.exs.length; i++) {
                c = format.replaceKeys(template.header, {name: this.exs[i].name});
                c += format.replaceKeys(template.description, {desc: this.exs[i].info});
                w = ''; r = '';
                for (j = 0; j < this.exs[i].sets; j++) {
                    obj = {i: i, j: j};
                    w += format.replaceKeys(template.wInput, obj);
                    r += format.replaceKeys(template.rInput, obj);
                }
                obj = {i: i, w: w, r: r};
                c += format.replaceKeys(template.grid, obj);
                obj = {i: i, c: c};
                content += format.replaceKeys(template.collapsible, obj);
            }
            console.log(content);
            return content;
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
        var id = $('#timer').find(".ui-btn-text");
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
            t.id.html(0);
            return;
        }
        t.id.html('Start Timer');
        t = undefined;
        return;
    }

    function buildPages() {
        
    }
    
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
        $("#homePageTemplate").tmpl(home).appendTo( '#home' ).page();
        
        
        var mmbChest = new Workout("Max Chest Day", 'mmbChest', "Build muscle mass fast.  Use only when eating an excess of calories");
        mmbChest.exs[0] = new Exercise("Bench Press", 3, "Explosive Power, 6 to 10 reps to failure", 
            ["http://exrx.net/WeightExercises/PectoralSternal/BBBenchPress.html", "http://exrx.net/WeightExercises/PectoralSternal/DBBenchPress.html"],
            ["Barbell Bench Press", "Dumbbell Bench Press"]);
        mmbChest.exs[1] = new Exercise("Incline Bench Press", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/PectoralClavicular/BBInclineBenchPress.html", "http://exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress.html"],
            ["Barbell Incline Bench Press", "Dumbbell Incline Bench Press"]);
        mmbChest.exs[2] = new Exercise("Decline Bench Press", 3, "Explosive Power, 6 to 10 reps to failure",
            ["http://exrx.net/WeightExercises/PectoralSternal/BBDeclineBenchPress.html", "http://exrx.net/WeightExercises/PectoralSternal/DBDeclineBenchPress.html"],
            ["Barbell Decline Bench Press", "Dumbbell Decline Bench Press"]);
        mmbChest.exs[3] = new Exercise("Flys", 3, "Constant speed, 8 to 12 reps to failure",
            ["http://exrx.net/WeightExercises/PectoralSternal/LVSeatedFly.html", "http://exrx.net/WeightExercises/PectoralSternal/LVPecDeckFly.html"],
            ["Lever Seated Fly", "Lever Pec Deck Fly"]);
        
        
        $("#workoutPagesTemplate").tmpl(mmbChest).appendTo( $.mobile.pageContainer ).page();
        
        
        
        
        /*
        var mmb = home.workoutGroups[0].workouts;
        
        mmb[1].exercises = ['Deadlifts', 'Pullups', 'Rows', 'Lat Pulldown', 'Rows'];
        mmb[2].exercises = ['Shoulder Press', 'Lateral Raise', 'Arnold Press', 'Side Raises', 'Front Raises', 'Rear Delts'];
        mmb[3].exercises = ['Dumbbell Curls', 'Dips', 'Hammer Curls', 'Skullcrushers', 'Concentrated Curls', 'Kickbacks'];
        mmb[4].exercises = ['Squats', 'Leg Press', 'Leg Curls', 'Leg Extensions', 'Calf Raises'];
        
        $("#workoutPageTemplate").tmpl(home.workoutGroups[0]).appendTo( $.mobile.pageContainer ).page();
        $("#exercisePagesTemplate").tmpl(home.workoutGroups[0].workouts[0].exercises).appendTo( $.mobile.pageContainer ).page();
        */
        /*
        for (var i = 0; i < home.workoutGroups.length; i++) {
            for (var j = 0; j < homeworkoutGroups[i].workouts.length; j++) {
                $('#' + home.workoutGroups[i].workouts[j].id).page("destroy").page();
            }
        }
        */
        
        
        //$("#clientTemplate").tmpl(clientData).appendTo($('#home'));
        
        
        
       /* var pageData = [
            { header: "home", workoutGroup: "Muscle Builders", 
                workoutGroupNames: [
                   { id: 'chest', name: "Chest Day" },
                   { id: 'back', name: "Back Day" },
                   { id: 'shoulder', name: "Shoulder Day" },
                   { id: 'arm', name: "Arm Day" },
                   { id: 'leg', name: "Leg Day" }
                ] }
        ];

        var workoutNames = [
            { id: 'chest', name: "Chest Day" },
            { id: 'back', name: "Back Day" },
            { id: 'shoulder', name: "Shoulder Day" },
            { id: 'arm', name: "Arm Day" },
            { id: 'leg', name: "Leg Day" }
        ];*/
        
        
        //$("#homeTemplate").tmpl(page).appendTo('div');
        
        
        
        $(window).resize( function(){
            var height = $(window).height();
            var width = $(window).width(); 
            var ob = $('html');
            if( width > height ) {
                if( ob.hasClass('portrait') ) {
                    ob.removeClass('portrait').addClass('landscape');
                }
            }else{
                if( ob.hasClass('landscape') ) {
                    ob.removeClass('landscape').addClass('portrait');
                }
            }
        });

        ns.client = new clientLib.Client(ns);
        ns.client.saveInterval = 60;
        ns.client.autoLoad = false;
    }

    function setDoc(json)
    {
        
    }

    function getDoc()
    {
        return {
            readers: ['public'],
            blob: {version: 1, data: 'woot'}
        };
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'Exercise': Exercise,
        'Workout': Workout,
        'changeIcon': changeIcon,
        't': t
    });
});


