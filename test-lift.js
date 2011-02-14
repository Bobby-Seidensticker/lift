/*globals namespace console window $ */
/*jslint white: true, browser: true, devel: true */ 
/*jslint debug: true, undef: true nomen: true, regexp: true */
/*jslint newcap: true, immed: true, maxerr: 100, maxlen: 80 */


namespace.lookup('com.pageforest.lift.test').defineOnce(function (ns) {
    var lift = namespace.lookup('com.pageforest.lift');
    var base = namespace.lookup('org.startpad.base');
    
    function addTests(ts) {
        ts.addTest("toHTML", function (ut) {
            var exs = [];
            exs[0] = new lift.Exercise("Bench Press", 3, "8 to 12 reps to failure");
            exs[1] = new lift.Exercise("Incline Bench Press", 3, "8 to 12 reps to failure");
            exs[2] = new lift.Exercise("Decline Bench Press", 3, "8 to 12 reps to failure");
            exs[3] = new lift.Exercise("Chest Flys", 3, "12 to 18 reps to failure");
            w = new lift.Workout(exs, "Beginner Chest Routine", "Good for building muscles and stuff");
            ut.assert(w.toHTML());
        });
    }

    ns.addTests = addTests;
});