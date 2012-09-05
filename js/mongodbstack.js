/*
  Database stack akin to shell dir stack (pushd, popd).

  All commands are registered with the shellHelper, so can be called in 'word form' in
  the shell, ala 'show collections'.
*/

/*
  usage: stackon

  Enable the stack.
  If enabled, 'use dbname' will use the db stack as well as changing db.
  Either way, pushdb, popdb etc will be available to use.
*/
shellHelper.stackon = function() {
    mongoStack.enabled = true;
    mongoStack.print();
}

/*
  usage: stackoff

  Disaable the stack.
  If disabled, 'use dbname' will just change db.
  Either way, pushdb, popdb etc will be available to use.
*/
shellHelper.stackoff = function() {
    mongoStack.enabled = false;
}

/*
  usage: use dbname

  Replacement for 'use dbname' that also changes the head of the db stack if the stack is enabled.
*/
shellHelper.use = function (dbname) {
    var s = "" + dbname;
    if (s == "") {
        print("bad use parameter");
        return;
    }
    if (mongoStack.enabled) {
        mongoStack.use(dbname);
    } else {
        db = db.getMongo().getDB(dbname);
        print("switched to db " + db.getName());
    }
}

/*
  usage: pushdb |dbname|+n|-n

  If called with zero arguments, swaps top two databases.

  If called with +n, where n is an integer, swaps the head with the nth db, starting at 0.
  If called with -n, where n is an integer, swaps the head with the db which is n from the end, -1 being the last.

  If called with a database name, pushes that database onto the stack.

  Regardless of arguments, db will be set to the new top of the stack.
*/
shellHelper.pushdb = function(d) {
    mongoStack.pushdb(d);
};

/*
  usage: popdb |+n|-n

  Removes the top of the db stack, and sets the new top as the current db.

  If called with +n, where n is a positive integer, removes the nth db, starting at 0.

  If called with -n, where n is a negative integer, removes the db which is n from the end, -1 being the last.
*/
shellHelper.popdb = function(depth) {
    mongoStack.popdb(depth);
};

/*
  usage: cleardbs

  Clears the db stack of all but the current head.
*/
shellHelper.cleardbs = function() {
    mongoStack.cleardbs();
};

/*
  usage: dbs

  Prints the db stack.
*/
shellHelper.dbs = function() {
    mongoStack.print(true);
};

var mongoStack = new function() {
    return {
        enabled: true,
        silent: false, // if silent, print() will only print if passed true

        // Start with whatever db mongo was started with (defaults to test)
        stack: [db],

        /*
          force=true overrides silent
         */
        print: function(force) {
            if (force || !this.silent)
                print('[' + this.stack.map(function(e,i) { return i == 0 ? ('>' + e + '<') : e }).join(',') + ']');
        },

        cleardbs: function() {
            this.stack.length = 1;
            this.print();
        },

        use: function(d) {
            var oldId = -1;
            for (var i=this.stack.length-1;i>=0;i--) {
                if (this.stack[i].getName() == d) {
                    oldId = i;
                    break;
                }
            }
            if (oldId == -1) {
                db = db.getMongo().getDB(d);
                this.stack[0] = db;
            } else {
                this.pushdbn(oldId);
            }
            this.print();
        },

        pushdb: function(d) {
            if (d == undefined || d == null || d == '') {
                this.pushdbn(1);
            } else {
                var m = d.match(/^([\-\+]\d+)/);
                if (m != null) {
                    this.pushdbn(parseInt(m[1]));
                } else {
                    var oldId = -1;
                    for (var i=this.stack.length-1;i>=0;i--) {
                        if (this.stack[i].getName() == d) {
                            oldId = i;
                            break;
                        }
                    }
                    if (oldId == -1) {
                        db = db.getMongo().getDB(d);
                        this.stack.unshift(db);
                    } else {
                        this.pushdbn(oldId);
                    }
                }
            }
            this.print();
        },

        popdb: function(depth) {
            if (this.stack.length > 1) {
                if (depth == undefined || depth == null || depth == '')
                    depth = 0;
                depth = parseInt(depth);
                if (! isNaN(depth)) {
                    var tail = this.stack.splice(depth);
                    tail.shift();
                    this.stack = this.stack.concat(tail);
                    db = this.stack[0];
                }
            }
            this.print();
        },

        // move db at given index to head
        pushdbn: function(n) {
            if (this.stack.length <= 1)
                return;
            if (Math.abs(n) >= this.stack.length) {
                n = this.stack.length - 1;
            } else if (n < 0) {
                n += this.stack.length;
            }
            var tail = this.stack.splice(n);
            this.stack.unshift(tail.shift());
            this.stack = this.stack.concat(tail);
            db = this.stack[0];
        }
    };
}();
