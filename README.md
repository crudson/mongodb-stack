mongodb-stack
=============

A db stack for the mongo shell ala unix shell pushd, popd etc

Loading and Usage
-----------------

Load into your ~/.mongorc.js
```javascript
    load('path/to/mongodbstack.js');
```
The db stack will be enabled by default.  
To disable by default, add the following after *load()*ing it.
```javascript
    mongoStack.enabled = false;
```

When loaded, a number of top-level commands are added to the shell to provide a db stack
to maintain references to multiple dbs. Some commands are overridden (e.g. *use dbname*).
The stack will be printed after each command that can potentially modify it.

To disable, type:
```
    > stackoff
```
When disabled, *use dbname* will operate the same as usual, simply changing the current db.

To enable, type:
```
    > stackon
    [>test<]
```
The current stack will be printed when the stack is enabled, in this example we are in the
*test* db, which is the shell default.  When enabled, *use dbname* will change the current db as normal, but also change
the head of the db stack to point to *dbname*.
```
    > use foo
    [>foo<]
    > db
    foo
```

To push a db onto the stack and change to it:
```
    > pushdb people
    [>people<,foo]
```
Here we have pushed *people* onto the stack an changed to it.

To pop a db off the stack:
```
    > popdb
    [>foo<]
```
...and we are back at *foo*.

Let's push a few dbs:
```
    > pushdb bar
    [>bar<,foo]
    > pushdb people
    [>people<,bar,foo]
    > pushdb blog
    [>blog<,people,bar,foo]
```
Notice that the current db is highlighted with *>* and *<*.

At any time we can view the stack by typing:
```
    > dbs
    [>blog<,people,bar,foo]
```

To swap the current db with another at a certain position in the stack:
```
    > pushdb +2
    [>bar<,blog,people,foo]
```
Here we moved the db two deep in the stack, *bar*, to the head.

We can also do this with negative depth, which will count from the end of the stack.  
If we have the following db stack:
```
    > dbs
    [>long_db_i_am_fed_up_with_typing_all_the_time<,admin,blog,people,bar,foo]
    > pushdb -1
    [>foo<,long_db_i_am_fed_up_with_typing_all_the_time,admin,blog,people,bar]
```
Here we moved *foo* from the last position in the stack to the head.
```
    > pushdb -3
    [>blog<,foo,long_db_i_am_fed_up_with_typing_all_the_time,admin,people,bar]
```
Here we moved *blog* from 3 from the end to the head.

If we push a db onto the stack that already exists within it, it will not add it
again, but move it to the head:
```
    > dbs
    [>blog<,foo,people,bar]
    > pushdb people
    [>people<,blog,foo,bar]
```

Similarly, is we *use* a db that is already in the stack, it will be moved to the head:
```
    > dbs
    [>people<,blog,foo,bar]
    > use foo
    [>foo<,people,blog,bar]
```
We can therefore quickly type *use* like normal to change to a db without having to refer
to the stack.

We can also pop dbs from anywhere:
```
    > dbs
    [>people<,blog,foo,bar]
    > popdb +2
    [>people<,blog,bar]
```
The current db didn't change, but we removed *foo* from the stack.

```
    > popdb -1
    [>people<,blog]
```
*bar* was removed from the end of the stack.

To clear the stack, leaving just the current db:
```
    > cleardbs
    [>people<]
```


The current stack can be incorporated into the prompt (mongodb v1.9.1+) rather than being
printed only after modification. For this to be visually pleasing, the stack should be
put into *silent* mode first. *true* is then passed to *print* to override silent mode.  
e.g. in ~/.mongorc.js
```javascript
    mongoStack.silent = true;
    prompt = function() { mongoStack.print(true) }
```


Other
-----

I threw this together because:
- I am constantly changing dbs in the shell and get tired of typing db names.
- Long database names (and ones created programmatically by applications) can be a nuisance
to remember.
- There is no autocomplete for 'use dbname', and long db names can be a pain as described above
when changing between them often.
- Manually maintaining references to multiple dbs in a shell session is unwieldy for anything
other than the simplest cases, and commands such as 'show collections' are dependent on which
database *db* is currently pointing to.
- I use pushd and popd in my regular shell all the time, and applying it to a mongodb
session seems sensible.

This is completely as-is code. I banged it together as it's something I've wanted for
some time in the mongo shell. If you can use it then good. It's not complicated, clever, or
tested.
