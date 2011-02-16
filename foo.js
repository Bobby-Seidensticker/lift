/*globals namespace console window $*/
/*jslint white: true, browser: true, devel: true, onevar: false
  debug: true, undef: true nomen: true, regexp: true
  newcap: true, immed: true, maxerr: 100, maxlen: 100 */

namespace.lookup('com.pageforest.lift').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client');
    var dom = namespace.lookup('org.startpad.dom');
    var format = namespace.lookup('org.startpad.format');
    var util = namespace.util;

    var t = [];
    var template = {
        collapsible: '<div data-role=collapsible data-collapsed=true id=c-e{i}>{c}</div>',
        header: '<h3>{name}</h3>',
        description: '<p>{desc}</p>',
        grid: '<div class=ui-grid-a id=e{i}>' +
              '<div class=ui-block-a id=e{i}-w><h4>Weight</h4>{w}<a data-role="button" id=timer-{i}>Timer</a></div>' +
              '<div class=ui-block-b id=e{i}-r><h4>Reps</h4>{r}<a data-role="button">Save</a></div>' +
              '</div>',
        wInput: '<input type=number id=e{i}-w{j} value=""></input>',
        rInput: '<input type=number id=e{i}-r{j} value=""></input>'
    };
    
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

    function Exercise(name, sets, info)
    {
        if (sets){
            this.sets = sets;
        } else {
            this.sets = [];
        }
        this.name = name;
        this.info = info;
    }

    //each workout has exercises
    //each exercise has an id (for the DOM), title, a number of sets to do, and a description
    function Workout(exs, name, desc)
    {
        this.exs = exs;
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

    function Timer(id) {
        this.id = $('#' + id).find(".ui-btn-text");
        this.date = new Date();
        this.init = this.date.getTime();
        this.timer = setInterval(this.adjust(), 1000);
    }
    
    Timer.methods({
        adjust: function () {
            this.id.html(Math.floor((this.date.getTime() - this.init) / 1000));
        }
    });
    
    function onReady()
    {
        var exs = [];
        exs[0] = new lift.Exercise("Bench Press", 4, "8 to 12 reps to failure");
        exs[1] = new lift.Exercise("Incline Bench Press", 4, "8 to 12 reps to failure");
        exs[2] = new lift.Exercise("Decline Bench Press", 3, "8 to 12 reps to failure");
        exs[3] = new lift.Exercise("Chest Flys", 3, "12 to 18 reps to failure");
        w = new lift.Workout(exs, "Beginner Chest Routine", "Good for building muscles and stuff");
        $('#content').append(w.toHTML());
        
        $('#content').page();
        
        var i, t = [];
        $("#timer-0").click(function () {
            t[0] = new Timer('timer-' + 0);
        });
        $("#timer-1").click(function () {
            t[1] = new Timer('timer-' + 1);
        });
        $("#timer-2").click(function () {
            t[2] = new Timer('timer-' + 2);
        });
        $("#timer-3").click(function () {
            t[3] = new Timer('timer-' + 3);
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
        't': t
    });
});


